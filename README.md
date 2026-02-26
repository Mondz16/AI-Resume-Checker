<div align="center">

# 🧠 AI Resume Improver

**Full-Stack AI Web Application that enhances resumes and regenerates professionally formatted PDFs.**

[![Live Demo](https://img.shields.io/badge/Frontend-Live%20Demo-4f8ef7?style=for-the-badge&logo=vercel)](https://ai-resume-checker-woad.vercel.app)
[![API](https://img.shields.io/badge/Backend-API-36c97e?style=for-the-badge&logo=render)](https://ai-resume-checker-bhj7.onrender.com)

</div>

---

## 📖 Overview

**AI Resume Improver** allows users to upload their existing resume (PDF), enhance its content using AI, and instantly download a newly structured, professionally formatted version — ready to send to employers.

> This project was built as a **production-ready AI system** — not just a simple API demo.

---

## 📌 Features

| Feature | Description |
|---|---|
| 📄 PDF Upload | Upload any existing resume as a PDF |
| 🔍 Text Extraction | Automatically extracts all resume content |
| 🤖 AI Enhancement | Rewrites content to be impact-focused and professional |
| 🧩 Structured JSON Output | AI returns structured JSON for precise layout control |
| 🖨 PDF Regeneration | Generates a polished, formatted resume using PDFKit |
| 🔐 Security | Rate limiting, CORS config & secured API keys |
| ☁️ Cloud Deployed | Hosted on Vercel (frontend) + Render (backend) |
| 🧹 Auto Cleanup | Temporary files are deleted immediately after processing |

---

## 🏗 System Architecture

```
React (Frontend)
       ↓  Upload PDF
Express (Backend API)
       ↓  Extract text via pdf-parse
OpenAI API (Structured JSON Prompting)
       ↓  Returns enhanced resume as JSON
PDFKit (Server-side PDF Generation)
       ↓
Downloadable Improved Resume
```

> The backend handles all AI processing and file operations securely, ensuring the OpenAI API key is never exposed to the client.

---

## 🛠 Tech Stack

### Frontend
- **React** (Vite)
- **Axios** for HTTP requests
- Modern responsive UI

### Backend
- **Node.js** + **Express.js**
- **Multer** — file upload handling
- **pdf-parse** — PDF text extraction
- **PDFKit** — server-side PDF generation
- **express-rate-limit** — API abuse protection
- **dotenv** — environment configuration

### AI Integration
- **OpenAI API** (`gpt-4o-mini`)
- Structured JSON prompting for consistent output
- Temperature-controlled responses for professional tone

### Deployment
- **Frontend** → [Vercel](https://vercel.com)
- **Backend** → [Render](https://render.com)
- Environment variables managed securely via cloud dashboards

---

## 🎯 Technical Highlights

### 1. Structured AI Output

Rather than returning plain rewritten text, the system prompts the AI to respond with structured JSON, giving full control over PDF layout and formatting:

```json
{
  "name": "Jane Doe",
  "email": "jane@example.com",
  "phone": "+1 555 000 0000",
  "summary": "Results-driven engineer with 5+ years...",
  "experience": [
    {
      "position": "Software Engineer",
      "company": "Acme Corp",
      "startDate": "Jan 2021",
      "endDate": "Present",
      "bullets": ["Led migration that reduced latency by 40%", "..."]
    }
  ],
  "skills": ["TypeScript", "Node.js", "PostgreSQL"],
  "education": [{ "degree": "B.Sc. Computer Science", "institution": "MIT", "year": "2019" }]
}
```

### 2. Dynamic PDF Layout Engine

Using **PDFKit**, the server generates a structured resume with:
- Typography hierarchy (headings, subheadings, body text)
- Clean experience entry grouping with bullet points
- Centred contact details block
- Consistent spacing, margins, and horizontal rules

### 3. Production-Ready Backend

- API keys secured exclusively in environment variables
- Per-route rate limiting (stricter limits on expensive AI + upload routes)
- File type and size validation via Multer
- Automatic temp file deletion after every request — even on errors
- Proper CORS origin whitelisting
- Dynamic port configuration for cloud hosting compatibility

---

## 🧠 Challenges & Solutions

| Challenge | Solution |
|---|---|
| AI occasionally returns invalid JSON | Added JSON fence stripping + `response_format: { type: "json_object" }` to force valid output |
| Raw extracted text had poor structure | Switched to structured JSON prompting to regain full layout control |
| Temp files leaking on errors | Wrapped cleanup in a `finally`-style helper called on both success and failure paths |
| API key exposure risk | All AI calls are server-side only; key never touches the frontend |
| Cloud storage limitations on Render | Files are deleted immediately after the download response is sent |

---

## 📚 What I Learned

- Designing reliable, structured AI prompts for consistent outputs
- Handling file uploads and binary (blob) responses in Express
- Server-side PDF layout logic with PDFKit
- Full-stack cloud deployment workflows (Vercel + Render)
- Production API security — rate limiting, CORS, and key management
- Building scalable AI-powered systems end-to-end

---

## 🔮 Future Improvements

- [ ] Resume template selection (Modern / Minimal / Corporate)
- [ ] Resume scoring + tailored improvement suggestions
- [ ] User authentication & saved resume history
- [ ] HTML-to-PDF rendering for advanced visual layouts
- [ ] Stripe integration for premium features
- [ ] Background job queue for processing under heavy load

---

<div align="center">
  Built with ❤️ using React, Node.js, and OpenAI
</div>
