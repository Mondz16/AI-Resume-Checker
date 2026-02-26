require("dotenv").config();
const { OpenAI } = require("openai");
const express = require("express");
const cors = require("cors");
const rateLimit = require("express-rate-limit");
const multer = require("multer");
const fs = require("fs");
const { PDFParse } = require("pdf-parse");
const PDFDocument = require("pdfkit");

const PORT = process.env.PORT || 3000;

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 50,
});

const app = express();
app.use(limiter);
app.use(cors({
  origin: "https://ai-resume-checker-woad.vercel.app"
}));
app.use(express.json());

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const upload = multer({
  dest: "uploads/",
});

app.post("/upload", upload.single("resume"), async (req, res) => {
  try {
    const filePath = req.file.path;

    // Extract text from PDF
    const dataBuffer = fs.readFileSync(filePath);
    const pdfData = new PDFParse({ url: filePath });

    const extractedText = await pdfData.getText();
    console.log("Extracted text: ", extractedText);

    // Send to OpenAI
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: `
You are a professional resume formatter.

Convert the resume into structured JSON format like this:

{
  "name": "",
  "email": "",
  "phone": "",
  "summary": "",
  "experience": [
    {
      "position": "",
      "company": "",
      "startDate": "",
      "endDate": "",
      "description": ""
    }
  ],
  "skills": [],
  "education": {
    "degree": "",
    "institution": "",
    "year": ""
  }
}

Rewrite content to be professional and impact-focused.
Return ONLY valid JSON.
`,
        },
        {
          role: "user",
          content: extractedText.text,
        },
      ],
      temperature: 0.4,
    });

    const data = JSON.parse(completion.choices[0].message.content);

    // Generate new PDF
    const doc = new PDFDocument({
      margin: 50,
    });

    const outputPath = `uploads/improved-${Date.now()}.pdf`;
    const writeStream = fs.createWriteStream(outputPath);
    doc.pipe(writeStream);

    // Name Section
    doc
      .fontSize(24)
      .font("Helvetica-Bold")
      .text(data.name, { align: "center" });

    doc.moveDown(0.5);

    // Contact Section
    doc
      .fontSize(10)
      .font("Helvetica")
      .text(`${data.email} | ${data.phone}`, { align: "center" });

    doc.moveDown(2);
    doc.moveTo(50, doc.y).lineTo(550, doc.y).stroke();

    doc.moveDown(1.5);

    // Summary Section
    doc.fontSize(14).font("Helvetica-Bold").text("SUMMARY");

    doc.moveDown(0.5);
    doc.fontSize(11).font("Helvetica").text(data.summary, {
      align: "left",
      lineGap: 2,
    });

    doc.moveDown(1.5);
    doc.moveTo(50, doc.y).lineTo(550, doc.y).stroke();

    doc.moveDown(1.5);
    // Experience Section
    doc.fontSize(14).font("Helvetica-Bold").text("CAREER HISTORY");

    doc.moveDown(0.5);

    data.experience.forEach((job) => {
      // Position + Company
      doc
        .fontSize(12)
        .font("Helvetica-Bold")
        .text(`${job.position} at ${job.company}`);

      // Dates aligned right
      doc
        .fontSize(10)
        .font("Helvetica-Oblique")
        .text(`${job.startDate} - ${job.endDate}`, {
          align: "right",
        });

      doc.moveDown(0.3);

      // Description
      doc.fontSize(11).font("Helvetica").text(job.description, {
        lineGap: 2,
      });

      doc.moveDown(1.2);
    });

    doc.moveDown(1.5);
    doc.moveTo(50, doc.y).lineTo(550, doc.y).stroke();

    doc.moveDown(1.5);

    // Skill section
    doc.fontSize(14).font("Helvetica-Bold").text("SKILLS");

    doc.moveDown(0.5);

    doc.fontSize(11).font("Helvetica").text(data.skills.join(", "), {
      lineGap: 2,
    });

    doc.moveDown(1.5);
    doc.moveTo(50, doc.y).lineTo(550, doc.y).stroke();

    doc.moveDown(1.5);

    // Education Section
    doc.fontSize(14).font("Helvetica-Bold").text("EDUCATION");

    doc.moveDown(0.5);

    doc.fontSize(12).font("Helvetica-Bold").text(data.education.degree);

    doc.fontSize(11).font("Helvetica").text(data.education.institution);

    doc.fontSize(10).font("Helvetica-Oblique").text(data.education.year);

    doc.end();

    writeStream.on("finish", () => {
      res.download(outputPath, () => {
        fs.unlinkSync(outputPath);
        fs.unlinkSync(filePath);
      });
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error });
  }
});

app.post("/ask-ai", async (req, res) => {
  try {
    const { prompt } = req.body;
    const completion = await openai.chat.completions.create({
      messages: [{ role: "user", content: prompt }],
      model: "gpt-4o", // Or gpt-3.5-turbo
    });
    res.json({ response: completion.choices[0].message.content });
  } catch (error) {
    res.status(500).send(error.message);
  }
});

app.post("/improve", async (req, res) => {
  console.log("BODY:", req.body);
  try {
    const { bullet } = req.body;

    console.log("improve is called!");
    if (!bullet) {
      return res.status(400).json({ error: "Bullet is required!" });
    }

    console.log("await the open ai chat completion");
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: `You are a professional resume writer.
Rewrite resume bullet points to be:
- Impact-focused
- Quantified if possible
- Concise
- Professional tone`,
        },
        {
          role: "user",
          content: bullet,
        },
      ],
      temperature: 0.7,
    });

    res.json({
      improved: completion.choices[0].message.content,
    });
  } catch (error) {
    console.error("OpenAI error:", error.response?.data || error.message);
    res.status(500).json({ error: error.response?.data || error.message });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
