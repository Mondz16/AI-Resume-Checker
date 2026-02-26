# AI-Resume-Checker

🧠 AI Resume Improver
Full-Stack AI Web Application that enhances resumes and regenerates professionally formatted PDFs.
AI Resume Improver allows users to upload their resume (PDF), enhance its content using AI, and download a newly structured, professionally formatted version.
This project was built as a production-ready AI system — not just a simple API demo.

🚀 Live Demo
🔗 Frontend: https://ai-resume-checker-woad.vercel.app
🔗 Backend API: https://ai-resume-checker-bhj7.onrender.com

📌 Features
📄 PDF resume upload
🔍 Automatic text extraction
🤖 AI-powered resume enhancement
🧩 Structured JSON transformation for layout control
🖨 Dynamic PDF regeneration with professional formatting
🔐 API rate limiting & secure environment variables
☁️ Cloud deployment (Vercel + Render)
🧹 Automatic temporary file cleanup

🏗 System Architecture
React (Frontend)
        ↓
Express (Backend API)
        ↓
OpenAI API (Structured JSON Prompting)
        ↓
PDFKit (Server-side PDF Generation)
        ↓
Downloadable Improved Resume
The backend handles AI processing and file operations securely to prevent API key exposure.

🛠 Tech Stack
Frontend
React (Vite)
Axios
Modern responsive UI
Backend
Node.js
Express.js
Multer (file uploads)
pdf-parse (PDF text extraction)
PDFKit (PDF generation)
express-rate-limit (API protection)
dotenv (environment config)

AI Integration
OpenAI API
Structured JSON prompting
Temperature control for consistent professional tone

Deployment
Frontend → Vercel
Backend → Render
Environment variables managed securely in cloud dashboard

🎯 Technical Highlights
1️⃣ Structured AI Output
Instead of returning plain rewritten text, the system prompts AI to output structured JSON:
{
  "name": "",
  "email": "",
  "phone": "",
  "summary": "",
  "experience": [],
  "skills": [],
  "education": {}
}
This enables full control over formatting and layout in the generated PDF.

2️⃣ Dynamic PDF Layout Engine
Using PDFKit, the system:
Applies typography hierarchy
Groups experience entries cleanly
Aligns contact details
Controls spacing and margins
Generates structured, professional resumes

3️⃣ Production-Ready Backend
API key secured in environment variables
Rate limiting to prevent abuse
File size restrictions
Automatic file deletion after processing
Proper CORS configuration
Dynamic port configuration for cloud hosting

🧠 Challenges & Solutions
Challenge	Solution
AI returns invalid JSON	Implemented content cleaning and safe parsing
Raw text formatting looked unprofessional	Switched to structured JSON prompting
Cloud storage limitations	Automatic file cleanup after download
API security	Rate limiting + backend-only AI calls

📚 What I Learned
Designing predictable structured AI prompts
Handling file uploads and binary responses in Express
Server-side PDF layout logic
Cloud deployment workflows
Production API security considerations
Building scalable AI-powered systems

🔮 Future Improvements
Resume template selection (Modern / Minimal / Corporate)
Resume scoring + improvement suggestions
User authentication & resume history
HTML-to-PDF rendering for advanced layouts
Stripe integration for premium features
Background job queue for heavy processing
