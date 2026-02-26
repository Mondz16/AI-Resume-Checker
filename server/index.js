require("dotenv").config();

const { OpenAI } = require("openai");
const express = require("express");
const cors = require("cors");
const rateLimit = require("express-rate-limit");
const multer = require("multer");
const fs = require("fs");
const path = require("path");
const { PDFParse } = require('pdf-parse');
const PDFDocument = require("pdfkit");

const PORT = process.env.PORT || 3000;
const UPLOADS_DIR = path.join(__dirname, "uploads");
const MAX_FILE_SIZE_MB = 10;
const ALLOWED_ORIGIN = "https://ai-resume-checker-woad.vercel.app";

if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

const app = express();

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || ALLOWED_ORIGINS.includes(origin)) return callback(null, true);
      callback(new Error(`CORS: origin ${origin} not allowed`));
    },
  })
);

app.use(cors());

app.use(express.json());

app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000, 
    max: 50,
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: "Too many requests. Please try again later." },
  })
);

const heavyLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Too many upload requests. Please wait before trying again." },
});


if (!process.env.OPENAI_API_KEY) {
  console.error("FATAL: OPENAI_API_KEY is not set in environment.");
  process.exit(1);
}

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });


const upload = multer({
  dest: UPLOADS_DIR,
  limits: { fileSize: MAX_FILE_SIZE_MB * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (file.mimetype !== "application/pdf") {
      return cb(new Error("Only PDF files are accepted."));
    }
    cb(null, true);
  },
});

function cleanupFile(filePath) {
  try {
    if (filePath && fs.existsSync(filePath)) fs.unlinkSync(filePath);
  } catch {
    // Intentionally swallowed
  }
}

function stripJsonFences(raw) {
  return raw.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/, "").trim();
}

function drawRule(doc) {
  doc.moveDown(0.5);
  doc.moveTo(50, doc.y).lineTo(550, doc.y).strokeColor("#cccccc").lineWidth(0.5).stroke();
  doc.moveDown(1);
}

function drawSectionHeading(doc, title) {
  doc.fontSize(12).font("Helvetica-Bold").fillColor("#1a1a2e").text(title.toUpperCase());
  doc.moveDown(0.4);
}

const RESUME_JSON_SCHEMA = `{
  "name": "string",
  "email": "string",
  "phone": "string",
  "location": "string",
  "linkedin": "string (optional)",
  "summary": "string (2-4 impactful sentences)",
  "experience": [
    {
      "position": "string",
      "company": "string",
      "startDate": "string",
      "endDate": "string",
      "bullets": ["string", "string"]
    }
  ],
  "skills": ["string"],
  "education": [
    {
      "degree": "string",
      "institution": "string",
      "year": "string"
    }
  ],
  "certifications": ["string (optional)"]
}`;

// PDF Generator
function buildResumePDF(data) {
  return new Promise((resolve, reject) => {
    const outputPath = path.join(UPLOADS_DIR, `improved-${Date.now()}.pdf`);
    const doc = new PDFDocument({ margin: 50, size: "A4" });
    const writeStream = fs.createWriteStream(outputPath);

    doc.pipe(writeStream);

    // ── Name ──
    doc
      .fontSize(22)
      .font("Helvetica-Bold")
      .fillColor("#1a1a2e")
      .text(data.name || "Name Not Found", { align: "center" });

    doc.moveDown(0.3);

    // ── Contact line ──
    const contactParts = [data.email, data.phone, data.location].filter(Boolean);
    if (data.linkedin) contactParts.push(data.linkedin);

    doc
      .fontSize(9)
      .font("Helvetica")
      .fillColor("#555555")
      .text(contactParts.join("  ·  "), { align: "center" });

    drawRule(doc);

    // ── Summary ──
    if (data.summary) {
      drawSectionHeading(doc, "Professional Summary");
      doc.fontSize(10).font("Helvetica").fillColor("#333333").text(data.summary, { lineGap: 3 });
      drawRule(doc);
    }

    // ── Experience ──
    if (Array.isArray(data.experience) && data.experience.length) {
      drawSectionHeading(doc, "Career History");

      data.experience.forEach((job) => {
        // Title row: position + company on left, dates on right
        const titleY = doc.y;
        doc
          .fontSize(11)
          .font("Helvetica-Bold")
          .fillColor("#1a1a2e")
          .text(`${job.position}`, { continued: true })
          .font("Helvetica")
          .fillColor("#444444")
          .text(`  ·  ${job.company}`);

        doc
          .fontSize(9)
          .font("Helvetica-Oblique")
          .fillColor("#888888")
          .text(`${job.startDate || ""} – ${job.endDate || "Present"}`, { align: "right" });

        // Snap Y back so bullets are not double-spaced after the right-aligned date
        doc.moveDown(0.3);

        // Bullet points (array preferred, fallback to plain description string)
        const bullets = Array.isArray(job.bullets) && job.bullets.length
          ? job.bullets
          : [job.description].filter(Boolean);

        bullets.forEach((point) => {
          doc
            .fontSize(10)
            .font("Helvetica")
            .fillColor("#333333")
            .text(`• ${point}`, { indent: 10, lineGap: 2 });
        });

        doc.moveDown(0.8);
      });

      drawRule(doc);
    }

    // ── Skills ──
    if (Array.isArray(data.skills) && data.skills.length) {
      drawSectionHeading(doc, "Skills");
      doc
        .fontSize(10)
        .font("Helvetica")
        .fillColor("#333333")
        .text(data.skills.join("   ·   "), { lineGap: 3 });
      drawRule(doc);
    }

    // ── Education ──
    const educationList = Array.isArray(data.education)
      ? data.education
      : data.education
      ? [data.education]
      : [];

    if (educationList.length) {
      drawSectionHeading(doc, "Education");

      educationList.forEach((edu) => {
        doc.fontSize(11).font("Helvetica-Bold").fillColor("#1a1a2e").text(edu.degree || "");
        doc.fontSize(10).font("Helvetica").fillColor("#444444").text(edu.institution || "");
        doc.fontSize(9).font("Helvetica-Oblique").fillColor("#888888").text(edu.year || "");
        doc.moveDown(0.6);
      });
    }

    // ── Certifications ──
    if (Array.isArray(data.certifications) && data.certifications.length) {
      drawRule(doc);
      drawSectionHeading(doc, "Certifications");
      data.certifications.forEach((cert) => {
        doc.fontSize(10).font("Helvetica").fillColor("#333333").text(`• ${cert}`, { indent: 10, lineGap: 2 });
      });
    }

    doc.end();

    writeStream.on("finish", () => resolve(outputPath));
    writeStream.on("error", reject);
  });
}

// Routes
app.post("/upload", heavyLimiter, upload.single("resume"), async (req, res) => {
  const filePath = req.file?.path;
  let outputPath;

  try {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded. Please attach a PDF." });
    }

    const dataBuffer = fs.readFileSync(filePath); // 
    const pdfData = new PDFParse({url: filePath});   // 
    const result = await pdfData.getText();

    const extractedText = result.text?.trim();
    if (!extractedText || extractedText.length < 50) {
      return res.status(422).json({ error: "Could not extract readable text from the PDF. Ensure it is not scanned/image-based." });
    }

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      response_format: { type: "json_object" }, 
      messages: [
        {
          role: "system",
          content: `You are an expert resume writer and career coach.

Analyse the resume text and return ONLY a JSON object that strictly matches this schema:
${RESUME_JSON_SCHEMA}

Rules:
- Rewrite the summary to be punchy and results-oriented (2–4 sentences).
- Convert experience descriptions into 3–5 concise bullet points each (store as the "bullets" array).
- Quantify achievements wherever the source material contains any numbers, dates, or metrics.
- Extract all skills as a flat array of short strings.
- If the education field contains multiple degrees, return them as an array.
- Preserve all contact details exactly as found.
- If a field is missing from the source, omit it from the JSON rather than guessing.`,
        },
        {
          role: "user",
          content: extractedText,
        },
      ],
      temperature: 0.3,
      max_tokens: 2000,
    });

    // ── 3. Parse AI response ──
    let data;
    try {
      const raw = completion.choices[0].message.content;
      data = JSON.parse(stripJsonFences(raw)); // ✅ Defensive: handles fences if they slip through
    } catch {
      console.error("AI returned non-JSON:", completion.choices[0].message.content);
      return res.status(502).json({ error: "AI returned an unexpected response. Please try again." });
    }

    // ── 4. Build PDF ──
    outputPath = await buildResumePDF(data);

    // ── 5. Send & clean up ──
    res.download(outputPath, "improved-resume.pdf", (err) => {
      if (err) console.error("Download error:", err.message);
      cleanupFile(outputPath);
      cleanupFile(filePath);
    });
  } catch (error) {
    console.error("POST /upload error:", error);
    cleanupFile(filePath);
    cleanupFile(outputPath);

    if (error.code === "LIMIT_FILE_SIZE") {
      return res.status(413).json({ error: `File too large. Maximum size is ${MAX_FILE_SIZE_MB} MB.` });
    }
    if (error.status === 429) {
      return res.status(429).json({ error: "OpenAI rate limit reached. Please try again shortly." });
    }

    res.status(500).json({ error: "Something went wrong processing your resume. Please try again." });
  }
});

// Error Handlers
app.use((_req, res) => {
  res.status(404).json({ error: "Route not found." });
});

app.use((err, _req, res, _next) => {
  console.error("Unhandled error:", err.message);

  if (err.code === "LIMIT_FILE_SIZE") {
    return res.status(413).json({ error: `File too large. Maximum size is ${MAX_FILE_SIZE_MB} MB.` });
  }
  if (err.message === "Only PDF files are accepted.") {
    return res.status(415).json({ error: err.message });
  }

  res.status(500).json({ error: err.message || "Internal server error." });
});

app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
});