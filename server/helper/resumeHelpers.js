import fs from "fs";
import path from "path";
import PDFDocument from "pdfkit";

export const UPLOADS_DIR = path.join(import.meta.dirname, "uploads");

export function cleanupFile(filePath) {
	try {
		if (filePath && fs.existsSync(filePath)) fs.unlinkSync(filePath);
	} catch {
		// Intentionally swallowed
	}
}

export function stripJsonFences(raw) {
	return raw
		.replace(/^```(?:json)?\s*/i, "")
		.replace(/\s*```$/, "")
		.trim();
}

function drawRule(doc) {
	doc.moveDown(0.5);
	doc
		.moveTo(50, doc.y)
		.lineTo(550, doc.y)
		.strokeColor("#cccccc")
		.lineWidth(0.5)
		.stroke();
	doc.moveDown(1);
}

function drawSectionHeading(doc, title) {
	doc
		.fontSize(12)
		.font("Helvetica-Bold")
		.fillColor("#1a1a2e")
		.text(title.toUpperCase());
	doc.moveDown(0.4);
}

export const RESUME_JSON_SCHEMA = `{
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
export function buildResumePDF(data) {
	return new Promise((resolve, reject) => {
		const outputPath = path.join(UPLOADS_DIR, `improved-${Date.now()}.pdf`);
		const doc = new PDFDocument({ margin: 50, size: "A4" });
		const writeStream = fs.createWriteStream(outputPath);

		doc.pipe(writeStream);

		doc
			.fontSize(22)
			.font("Helvetica-Bold")
			.fillColor("#1a1a2e")
			.text(data.name || "Name Not Found", { align: "center" });

		doc.moveDown(0.3);

		const contactParts = [data.email, data.phone, data.location].filter(
			Boolean,
		);
		if (data.linkedin) contactParts.push(data.linkedin);

		doc
			.fontSize(9)
			.font("Helvetica")
			.fillColor("#555555")
			.text(contactParts.join("  ·  "), { align: "center" });

		drawRule(doc);

		if (data.summary) {
			drawSectionHeading(doc, "Professional Summary");
			doc
				.fontSize(10)
				.font("Helvetica")
				.fillColor("#333333")
				.text(data.summary, { lineGap: 3 });
			drawRule(doc);
		}

		if (Array.isArray(data.experience) && data.experience.length) {
			drawSectionHeading(doc, "Career History");

			data.experience.forEach((job) => {
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
					.text(`${job.startDate || ""} – ${job.endDate || "Present"}`, {
						align: "right",
					});

				doc.moveDown(0.3);

				const bullets =
					Array.isArray(job.bullets) && job.bullets.length
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

		if (Array.isArray(data.skills) && data.skills.length) {
			drawSectionHeading(doc, "Skills");
			doc
				.fontSize(10)
				.font("Helvetica")
				.fillColor("#333333")
				.text(data.skills.join("   ·   "), { lineGap: 3 });
			drawRule(doc);
		}

		const educationList = Array.isArray(data.education)
			? data.education
			: data.education
				? [data.education]
				: [];

		if (educationList.length) {
			drawSectionHeading(doc, "Education");

			educationList.forEach((edu) => {
				doc
					.fontSize(11)
					.font("Helvetica-Bold")
					.fillColor("#1a1a2e")
					.text(edu.degree || "");
				doc
					.fontSize(10)
					.font("Helvetica")
					.fillColor("#444444")
					.text(edu.institution || "");
				doc
					.fontSize(9)
					.font("Helvetica-Oblique")
					.fillColor("#888888")
					.text(edu.year || "");
				doc.moveDown(0.6);
			});
		}

		if (Array.isArray(data.certifications) && data.certifications.length) {
			drawRule(doc);
			drawSectionHeading(doc, "Certifications");
			data.certifications.forEach((cert) => {
				doc
					.fontSize(10)
					.font("Helvetica")
					.fillColor("#333333")
					.text(`• ${cert}`, { indent: 10, lineGap: 2 });
			});
		}

		doc.end();

		writeStream.on("finish", () => resolve(outputPath));
		writeStream.on("error", reject);
	});
}
