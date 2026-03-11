import {
	cleanupFile,
	stripJsonFences,
	RESUME_JSON_SCHEMA,
	buildResumePDF,
} from "../helper/resumeHelpers.js";
import { PDFParse } from "pdf-parse";
import { OpenAI } from "openai/client.js";

export const uploadFile = async (req, res) => {
	const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
	const filePath = req.file?.path;
	let outputPath;

	try {
		if (!req.file) {
			return res
				.status(400)
				.json({ error: "No file uploaded. Please attach a PDF." });
		}

		const pdfData = new PDFParse({ url: filePath }); //
		const result = await pdfData.getText();

		const extractedText = result.text?.trim();
		if (!extractedText || extractedText.length < 50) {
			return res
				.status(422)
				.json({
					error:
						"Could not extract readable text from the PDF. Ensure it is not scanned/image-based.",
				});
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
			console.error(
				"AI returned non-JSON:",
				completion.choices[0].message.content,
			);
			return res
				.status(502)
				.json({
					error: "AI returned an unexpected response. Please try again.",
				});
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
			return res
				.status(413)
				.json({
					error: `File too large. Maximum size is ${MAX_FILE_SIZE_MB} MB.`,
				});
		}
		if (error.status === 429) {
			return res
				.status(429)
				.json({
					error: "OpenAI rate limit reached. Please try again shortly.",
				});
		}

		res
			.status(500)
			.json({
				error: "Something went wrong processing your resume. Please try again.",
			});
	}
};
