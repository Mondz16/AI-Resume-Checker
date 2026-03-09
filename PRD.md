# Product Requirements Document (PRD)
## AI Resume Improver

**Version:** 1.0  
**Last Updated:** March 8, 2025  
**Status:** Production

---

## 1. Executive Summary

**AI Resume Improver** is a full-stack web application that enables job seekers to upload their existing resume (PDF), enhance its content using AI, and instantly download a professionally formatted, ATS-optimized version. The product delivers value through a simple three-step flow: **Upload → AI Rewrite → Download** — typically completing in under 30 seconds.

### 1.1 Product Vision

To democratize professional resume quality by providing instant, AI-powered enhancement that transforms generic resumes into impact-focused, recruiter-ready documents — without requiring design skills or expensive career services.

### 1.2 Target Users

- **Primary:** Job seekers at any career level (entry-level to executive)
- **Secondary:** Career coaches, university career centers, recruitment agencies (bulk use cases)

---

## 2. Product Overview

### 2.1 Core Value Proposition

| Benefit | Description |
|---------|-------------|
| **Speed** | From upload to improved PDF in under 30 seconds |
| **Quality** | AI rewrites for impact, clarity, and ATS compatibility |
| **Privacy** | Files processed in memory; nothing stored after download |
| **Simplicity** | No design skills required; clean PDF output every time |

### 2.2 High-Level User Flow

```
Landing Page → Auth (Login/Register) → Upload PDF → AI Processing → Download Improved PDF
```

---

## 3. Functional Requirements

### 3.1 User Authentication

| ID | Requirement | Priority | Status |
|----|-------------|----------|--------|
| AUTH-01 | Users can register with name, email, and password | P0 | ✅ Implemented |
| AUTH-02 | Users can log in with email and password | P0 | ✅ Implemented |
| AUTH-03 | Passwords are hashed (bcrypt) before storage | P0 | ✅ Implemented |
| AUTH-04 | Successful auth returns JWT (7-day expiry) | P0 | ✅ Implemented |
| AUTH-05 | User state persisted in localStorage | P1 | ✅ Implemented |
| AUTH-06 | Logout clears session and redirects to landing | P1 | ✅ Implemented |
| AUTH-07 | Auth modal supports toggle between Login/Register | P1 | ✅ Implemented |

**Note:** The upload endpoint (`/api/upload`) does not currently require authentication. The frontend gates the upload UI behind login, but the API is publicly accessible. Consider enforcing `protect` middleware for consistency.

### 3.2 Resume Upload & Processing

| ID | Requirement | Priority | Status |
|----|-------------|----------|--------|
| RES-01 | Accept PDF files only | P0 | ✅ Implemented |
| RES-02 | Maximum file size: 10 MB | P0 | ✅ Implemented |
| RES-03 | Drag-and-drop and click-to-select upload UI | P0 | ✅ Implemented |
| RES-04 | Extract text from PDF using pdf-parse | P0 | ✅ Implemented |
| RES-05 | Reject PDFs with &lt; 50 characters of extractable text (e.g., scanned/image-based) | P0 | ✅ Implemented |
| RES-06 | AI enhancement via OpenAI GPT-4o-mini | P0 | ✅ Implemented |
| RES-07 | AI returns structured JSON per defined schema | P0 | ✅ Implemented |
| RES-08 | Generate formatted PDF via PDFKit | P0 | ✅ Implemented |
| RES-09 | Stream improved PDF as download | P0 | ✅ Implemented |
| RES-10 | Delete temporary files after processing | P0 | ✅ Implemented |
| RES-11 | Loading state and error handling in UI | P1 | ✅ Implemented |

### 3.3 AI Enhancement Rules

The AI must:

- Rewrite the professional summary to be punchy and results-oriented (2–4 sentences)
- Convert experience descriptions into 3–5 concise bullet points per role
- Quantify achievements wherever source material contains numbers, dates, or metrics
- Extract all skills as a flat array of short strings
- Preserve contact details exactly as found
- Omit fields missing from source rather than guessing
- Use `response_format: { type: "json_object" }` for consistent JSON output
- Use temperature 0.3 for professional tone

### 3.4 Landing & Marketing

| ID | Requirement | Priority | Status |
|----|-------------|----------|--------|
| LAND-01 | Hero section with value proposition | P1 | ✅ Implemented |
| LAND-02 | "How it works" section (3 steps) | P1 | ✅ Implemented |
| LAND-03 | Feature grid (ATS, impact bullets, summary, privacy, speed, PDF output) | P1 | ✅ Implemented |
| LAND-04 | Stats strip (optional social proof) | P2 | ✅ Implemented |
| LAND-05 | Responsive layout (mobile hamburger menu) | P0 | ✅ Implemented |
| LAND-06 | Footer with branding | P2 | ✅ Implemented |

### 3.5 Notifications & Feedback

| ID | Requirement | Priority | Status |
|----|-------------|----------|--------|
| UX-01 | Success toast on download | P1 | ✅ Implemented |
| UX-02 | Error toast on upload failure | P1 | ✅ Implemented |
| UX-03 | Auth success/error feedback | P1 | ✅ Implemented |
| UX-04 | Inline validation errors in auth form | P1 | ✅ Implemented |

---

## 4. Non-Functional Requirements

### 4.1 Security

| ID | Requirement | Implementation |
|----|-------------|----------------|
| SEC-01 | API keys never exposed to client | OpenAI calls server-side only |
| SEC-02 | Global rate limit | 50 requests / 15 min |
| SEC-03 | Upload route rate limit | 10 requests / 15 min |
| SEC-04 | CORS origin whitelist | Single allowed origin |
| SEC-05 | JWT for auth | 7-day expiry |
| SEC-06 | File type validation | Multer: PDF mimetype only |
| SEC-07 | File size validation | Multer: 10 MB limit |

### 4.2 Performance

| ID | Requirement | Target |
|----|-------------|--------|
| PERF-01 | End-to-end processing time | &lt; 30 seconds |
| PERF-02 | Temp file cleanup | Immediate after response |
| PERF-03 | Frontend bundle size | Optimized via Vite |

### 4.3 Reliability

| ID | Requirement | Implementation |
|----|-------------|----------------|
| REL-01 | Graceful handling of AI non-JSON response | JSON fence stripping + fallback error |
| REL-02 | Cleanup on error paths | `cleanupFile` in catch/finally |
| REL-03 | OpenAI 429 handling | Return user-friendly message |

### 4.4 Accessibility & UX

| ID | Requirement | Status |
|----|-------------|--------|
| A11Y-01 | Semantic HTML and ARIA labels | ✅ Nav, buttons, modals |
| A11Y-02 | Keyboard-navigable | ✅ Standard form/button behavior |
| A11Y-03 | Responsive design | ✅ Mobile-first, breakpoint 768px |

---

## 5. Data Models

### 5.1 User (MongoDB)

```javascript
{
  name: String (required),
  email: String (required, unique),
  password: String (required, hashed via bcrypt)
}
```

### 5.2 Resume JSON (AI Output Schema)

```json
{
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
}
```

### 5.3 Auth Response

```json
{
  "_id": "ObjectId",
  "name": "string",
  "email": "string",
  "token": "JWT string"
}
```

---

## 6. API Specification

### 6.1 Endpoints

| Method | Route | Auth | Description |
|--------|------|------|-------------|
| POST | `/api/upload` | No* | Upload PDF, extract text, enhance with AI, return PDF |
| POST | `/auth/register` | No | Create user (name, email, password) |
| POST | `/auth/login` | No | Validate credentials, return JWT |

*Upload is not protected by JWT; frontend gates access via login state.

### 6.2 Request/Response Examples

**POST /api/upload**
- **Request:** `multipart/form-data`, field `resume` (PDF file)
- **Response:** `application/pdf` (binary download)
- **Errors:** 400 (no file), 413 (file too large), 415 (wrong type), 422 (unreadable PDF), 429 (rate limit), 502 (AI error), 500 (server error)

**POST /auth/register**
- **Request:** `{ "name": "string", "email": "string", "password": "string" }`
- **Response:** `{ "_id", "name", "email", "token" }`

**POST /auth/login**
- **Request:** `{ "email": "string", "password": "string" }`
- **Response:** `{ "_id", "name", "email", "token" }`

---

## 7. System Architecture

### 7.1 Component Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                        CLIENT (Vercel)                           │
│  React 19 + Vite 7 + TypeScript + Tailwind CSS + Axios + Sileo   │
└────────────────────────────┬────────────────────────────────────┘
                             │ HTTPS
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                     SERVER (Render)                              │
│  Express 5 + Multer + rate-limit + CORS + auth middleware       │
├─────────────────────────────────────────────────────────────────┤
│  Routes: /api/upload, /auth/register, /auth/login               │
│  Controllers: resumeController, authController                  │
└──────┬──────────────────────┬──────────────────────┬───────────┘
       │                      │                      │
       ▼                      ▼                      ▼
┌──────────────┐    ┌─────────────────┐    ┌──────────────────┐
│   MongoDB    │    │   OpenAI API     │    │  pdf-parse +     │
│   (Users)    │    │  (gpt-4o-mini)   │    │  PDFKit (PDF)    │
└──────────────┘    └─────────────────┘    └──────────────────┘
```

### 7.2 Resume Processing Pipeline

1. **Upload** → Multer validates and saves to temp `uploads/` dir
2. **Extract** → pdf-parse extracts text from PDF
3. **Validate** → Reject if text &lt; 50 chars
4. **Enhance** → OpenAI returns structured JSON
5. **Parse** → Strip JSON fences, parse, validate structure
6. **Build** → PDFKit generates formatted PDF
7. **Stream** → `res.download()` sends file to client
8. **Cleanup** → Delete temp files (input + output)

---

## 8. Technology Stack

### 8.1 Frontend

| Technology | Version | Purpose |
|------------|---------|---------|
| React | 19 | UI framework |
| Vite | 7 | Build tool, dev server |
| TypeScript | - | Type safety |
| Tailwind CSS | 4 | Styling |
| Axios | - | HTTP client |
| Lucide React | - | Icons |
| Sileo | - | Toast notifications |

### 8.2 Backend

| Technology | Purpose |
|------------|---------|
| Node.js + Express 5 | API server |
| Mongoose | MongoDB ODM |
| Multer | File uploads |
| pdf-parse | PDF text extraction |
| OpenAI API (gpt-4o-mini) | AI enhancement |
| PDFKit | PDF generation |
| bcrypt | Password hashing |
| jsonwebtoken | JWT auth |
| express-rate-limit | Rate limiting |
| cors | CORS handling |
| dotenv | Environment config |

### 8.3 Deployment

| Component | Platform |
|-----------|----------|
| Frontend | Vercel |
| Backend | Render |
| Database | MongoDB (MONGODB_URI) |

### 8.4 Environment Variables (Server)

| Variable | Required | Description |
|----------|----------|-------------|
| MONGODB_URI | Yes | MongoDB connection string |
| OPENAI_API_KEY | Yes | OpenAI API key |
| JWT_SECRET | Yes | JWT signing secret |
| PORT | No | Server port (default: 3000) |

---

## 9. Known Issues & Technical Debt

| ID | Issue | Severity | Recommendation |
|----|-------|----------|----------------|
| K1 | `MAX_FILE_SIZE_MB` referenced in `resumeController.js` and `index.js` but not imported/defined | Medium | Export from `resumeRoutes.js` and import where needed, or define in shared config |
| K2 | CORS origin in `index.js` is `https://resume-ai-mondz16.vercel.app`; README references `https://ai-resume-checker-woad.vercel.app` | Low | Align CORS with actual frontend URL; consider env var |
| K3 | Upload route does not use `protect` middleware; auth is frontend-only | Low | Add `protect` to upload route if auth is required |
| K4 | `protect` middleware imported in `resumeRoutes.js` but unused | Low | Remove unused import or apply to routes |

---

## 10. Future Roadmap

| Phase | Feature | Priority |
|-------|---------|----------|
| 1 | Resume template selection (Modern / Minimal / Corporate) | High |
| 2 | Resume scoring + tailored improvement suggestions | High |
| 3 | Saved resume history (requires auth on upload) | High |
| 4 | HTML-to-PDF rendering for advanced layouts | Medium |
| 5 | Stripe integration for premium features | Medium |
| 6 | Background job queue for heavy load | Medium |
| 7 | Multi-language support | Low |

---

## 11. Success Metrics

| Metric | Target | Measurement |
|--------|--------|-------------|
| Processing time | &lt; 30 sec p95 | Server logs / APM |
| Upload success rate | &gt; 95% | Error rate monitoring |
| User registration → first upload | &gt; 50% | Analytics funnel |
| API availability | &gt; 99% | Uptime monitoring |

---

## 12. Appendix

### A. File Structure

```
AI-Resume-Checker/
├── client/
│   ├── src/
│   │   ├── App.tsx          # Main SPA
│   │   ├── App.css
│   │   ├── main.tsx
│   │   └── index.css
│   ├── index.html
│   ├── vite.config.ts
│   └── package.json
├── server/
│   ├── controller/
│   │   ├── resumeController.js
│   │   └── authController.js
│   ├── routes/
│   │   ├── resumeRoutes.js
│   │   └── authRoutes.js
│   ├── middleware/
│   │   └── authMiddleware.js
│   ├── models/
│   │   └── User.js
│   ├── helper/
│   │   └── resumeHelpers.js
│   ├── uploads/             # Temp dir (gitignored)
│   └── index.js
├── README.md
└── PRD.md
```

### B. References

- [Live Demo (Frontend)](https://ai-resume-checker-woad.vercel.app)
- [API (Backend)](https://ai-resume-checker-bhj7.onrender.com)
- [OpenAI API Documentation](https://platform.openai.com/docs)
- [PDFKit Documentation](https://pdfkit.org/)

---

*Document maintained by the AI Resume Improver team.*
