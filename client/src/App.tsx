import { useState } from "react";
import axios from "axios";
import "./App.css";

const steps = [
  {
    number: "Step 01",
    icon: "📄",
    title: "Upload your PDF",
    desc: "Drop in your existing resume — any format, any industry. We accept files up to 10 MB.",
  },
  {
    number: "Step 02",
    icon: "🧠",
    title: "AI rewrites it",
    desc: "GPT-4o analyses every section and rewrites for impact, clarity, and ATS compatibility.",
  },
  {
    number: "Step 03",
    icon: "⬇️",
    title: "Download & apply",
    desc: "Receive a polished, formatted PDF — ready to send to recruiters in seconds.",
  },
];

const features = [
  {
    icon: "✦",
    title: "ATS Keyword Optimisation",
    desc: "Automatically surfaces the right industry keywords so your resume clears automated screening systems.",
  },
  {
    icon: "📊",
    title: "Impact-Focused Bullets",
    desc: "Vague duties become quantified, action-driven achievements that hiring managers remember.",
  },
  {
    icon: "🎯",
    title: "Professional Summary",
    desc: "A punchy 2–4 sentence opener tailored to your career level and target role.",
  },
  {
    icon: "🔒",
    title: "Private by Design",
    desc: "Your file is processed in memory and permanently deleted after download. Nothing is stored.",
  },
  {
    icon: "⚡",
    title: "Under 30 Seconds",
    desc: "From upload to improved PDF in the time it takes to refill your coffee.",
  },
  {
    icon: "📑",
    title: "Clean PDF Output",
    desc: "A consistently formatted, recruiter-friendly PDF — no design skills needed.",
  },
];

export default function App() {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [isLoginMode, setIsLoginMode] = useState(true);
  const [authName, setAuthName] = useState("");
  const [authEmail, setAuthEmail] = useState("");
  const [authPassword, setAuthPassword] = useState("");
  const [authLoading, setAuthLoading] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [user, setUser] = useState<any>( typeof window !== 'undefined' ? JSON.parse(localStorage.getItem("user") || 'null') :  null);

  const API_BASE = "https://ai-resume-checker-bhj7.onrender.com";

  const handleUpload = async () => {
    if (!file) return;

    const formData = new FormData();
    formData.append("resume", file);

    try {
      setLoading(true);

      const response = await axios.post(`
        ${API_BASE}/api/upload`, 
        formData, 
        { responseType: "blob",}
      );

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "improved-resume.pdf");
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error(error);
      alert("Upload failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleAuthSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setAuthError(null);

    if (!authEmail || !authPassword || (!isLoginMode && !authName)) {
      setAuthError("Please fill in all required fields.");
      return;
    }

    try {
      setAuthLoading(true);
      const endpoint = isLoginMode ? "/auth/login" : "/auth/register";
      const payload = isLoginMode
        ? { email: authEmail, password: authPassword }
        : { name: authName, email: authEmail, password: authPassword };

      const { data } = await axios.post(`${API_BASE}${endpoint}`, payload);

      if (data?.token) {
        localStorage.setItem("user", JSON.stringify(data));
      }

      setUser(data);
      setShowAuthModal(false);
      setAuthName("");
      setAuthEmail("");
      setAuthPassword("");
    } catch (error: any) {
      const message =
        error?.response?.data?.message ||
        error?.response?.data?.error ||
        "Something went wrong. Please try again.";
      setAuthError(message);
    } finally {
      setAuthLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("user");
    setUser(null);
  };

  return (
    <>
      <nav className="navbar" role="navigation" aria-label="Main navigation">
        <a className="nav-logo" href="/" aria-label="Resume Improver home">
          <span className="nav-logo-text">
            Resume<span>AI</span>
          </span>
        </a>

        <ul className="nav-links" role="list">
          <li>
            <a href="#how-it-works">How it works</a>
          </li>
          <li>
            <a href="#features">Features</a>
          </li>
          <li>
            <a
              href="#upload"
              className="nav-cta"
              aria-label="Try the resume improver"
            >
              Try it free
            </a>
          </li>
        </ul>

        <div className="nav-auth">
          {user ? (
            <>
              <span className="nav-user">Hi, {user.name}</span>
              <button
                type="button"
                className="nav-auth-button"
                onClick={handleLogout}
              >
                Logout
              </button>
            </>
          ) : (
            <button
              type="button"
              className="nav-auth-button"
              onClick={() => {
                setIsLoginMode(true);
                setShowAuthModal(true);
              }}
            >
              Login / Register
            </button>
          )}
        </div>
      </nav>

      <section className="hero" aria-labelledby="hero-heading">
        <div className="hero-glow" aria-hidden="true" />

        <div className="hero-badge" role="status" aria-label="AI-powered tool">
          <span className="badge-dot" aria-hidden="true" />
          AI-Powered · Free to Try
        </div>

        <h1 id="hero-heading" className="hero-title">
          Your resume,<br />
          <span className="accent">rewritten by AI</span>
        </h1>

        <p className="hero-subtitle">
          Upload your existing resume and get back a professionally rewritten,
          ATS-optimised PDF — in under 30 seconds.
        </p>

        <div className="hero-actions">
          <a href="#upload" className="btn-primary" aria-label="Start improving your resume">
            <span aria-hidden="true">✦</span> Improve My Resume
          </a>
          <a href="#how-it-works" className="btn-ghost" aria-label="Learn how it works">
            See how it works
          </a>
        </div>

        <div className="scroll-cue" aria-hidden="true">
          <span>Scroll</span>
          <span className="scroll-arrow" />
        </div>
      </section>

      <div className="stats-strip" role="region" aria-label="Key statistics">
        <dl className="stats-inner">
          <div className="stat-item">
            <dt className="stat-label">Resumes improved</dt>
            <dd className="stat-value">12<span>k+</span></dd>
          </div>
          <div className="stat-item">
            <dt className="stat-label">Average processing time</dt>
            <dd className="stat-value">&lt;<span>30s</span></dd>
          </div>
          <div className="stat-item">
            <dt className="stat-label">User satisfaction</dt>
            <dd className="stat-value">98<span>%</span></dd>
          </div>
        </dl>
      </div>

      <section
        id="how-it-works"
        className="section"
        aria-labelledby="steps-heading"
      >
        <span className="section-eyebrow" aria-hidden="true">How it works</span>
        <h2 id="steps-heading" className="section-title">
          Three steps to a better resume
        </h2>
        <p className="section-body">
          No account required. No templates to fill in. Just upload and download.
        </p>

        <ol className="steps-grid" role="list" aria-label="Process steps">
          {steps.map((step) => (
            <li key={step.number} className="step-card">
              <p className="step-number" aria-label={step.number}>{step.number}</p>
              <span className="step-icon" aria-hidden="true">{step.icon}</span>
              <h3 className="step-title">{step.title}</h3>
              <p className="step-desc">{step.desc}</p>
            </li>
          ))}
        </ol>
      </section>

      <section
        id="features"
        className="features-section"
        aria-labelledby="features-heading"
      >
        <div className="features-inner">
          <span className="section-eyebrow" aria-hidden="true">Features</span>
          <h2 id="features-heading" className="section-title">
            Everything your resume needs
          </h2>
          <p className="section-body">
            Built for job seekers at every level — from first-job applicants to
            senior professionals changing industries.
          </p>

          <ul className="features-grid" role="list">
            {features.map((feat) => (
              <li key={feat.title} className="feature-card">
                <div className="feature-card-icon" aria-hidden="true">
                  {feat.icon}
                </div>
                <h3 className="feature-card-title">{feat.title}</h3>
                <p className="feature-card-desc">{feat.desc}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section
        id="upload"
        className="upload-section"
        aria-labelledby="upload-heading"
      >
        <header className="upload-section-header">
          <span className="section-eyebrow" aria-hidden="true">Get started</span>
          <h2 id="upload-heading" className="section-title">
            Ready to stand out?
          </h2>
          <p className="section-body">
            Upload your PDF below. Our AI will rewrite it and return a polished,
            download-ready version in seconds.
          </p>
        </header>

        <div className="upload-panel" role="region" aria-label="Resume upload">
          <label className="file-label" htmlFor="resume-upload">
            <span className="file-label-text">Your resume (PDF)</span>

            <div
              className={`file-drop-zone${file ? " has-file" : ""}`}
              role="button"
              tabIndex={0}
              aria-label={
                file
                  ? `Selected: ${file.name}. Click to replace.`
                  : "Click to select a PDF resume"
              }
            >
              {file ? (
                <>
                  <span className="file-drop-icon" aria-hidden="true">📄</span>
                  <span className="file-drop-selected">{file.name}</span>
                  <span className="file-drop-secondary">
                    {(file.size / 1024).toFixed(0)} KB · Click to replace
                  </span>
                </>
              ) : (
                <>
                  <span className="file-drop-icon" aria-hidden="true">⬆️</span>
                  <span className="file-drop-primary">Click to upload your PDF</span>
                  <span className="file-drop-secondary">PDF only · max 10 MB</span>
                </>
              )}

              <input
                id="resume-upload"
                type="file"
                accept=".pdf"
                aria-label="Upload PDF resume"
                onChange={(e) => setFile(e.target.files?.[0] ?? null)}
              />
            </div>
          </label>

          <button
            className="upload-button"
            type="button"
            onClick={user ? () => handleUpload() : () => {
                setIsLoginMode(true);
                setShowAuthModal(true);
            }}
            disabled={!file || loading}
            aria-busy={loading}
            aria-label={
              loading ? "Processing your resume…" : "Upload and improve resume"
            }
          >
            {loading ? (
              <>
                <span className="spinner" aria-hidden="true" />
              </>
            ) : (
              <>
                Improve My Resume
              </>
            )}
          </button>

          <p className="upload-reassurance" role="note">
            Your file is processed securely and never stored.
          </p>
        </div>
      </section>

      <footer className="site-footer" role="contentinfo">
        <div className="footer-inner">
          <span className="footer-logo">
            Resume<span>AI</span>
          </span>

          <ul className="footer-links" role="list">
            <li><a href="#how-it-works">How it works</a></li>
            <li><a href="#features">Features</a></li>
          </ul>

          <p className="footer-copy">
            © {new Date().getFullYear()} ResumeAI. All rights reserved.
          </p>
        </div>
      </footer>

      {showAuthModal && (
        <div
          className="auth-modal-backdrop"
          role="dialog"
          aria-modal="true"
          aria-labelledby="auth-modal-title"
        >
          <div className="auth-modal">
            <header className="auth-modal-header">
              <button
                type="button"
                className="auth-modal-close"
                onClick={() => setShowAuthModal(false)}
                aria-label="Close authentication dialog"
              >
                ×
              </button>
            </header>

            <div className="auth-modal-toggle">
              <button
                type="button"
                className={`auth-toggle-button${
                  isLoginMode ? " active" : ""
                }`}
                onClick={() => setIsLoginMode(true)}
              >
                Login
              </button>
              <button
                type="button"
                className={`auth-toggle-button${
                  !isLoginMode ? " active" : ""
                }`}
                onClick={() => setIsLoginMode(false)}
              >
                Register
              </button>
              
            </div>

            <form className="auth-form" onSubmit={handleAuthSubmit}>
              {!isLoginMode && (
                <div className="auth-field">
                  <label htmlFor="auth-name">Name</label>
                  <input
                    id="auth-name"
                    type="text"
                    value={authName}
                    onChange={(e) => setAuthName(e.target.value)}
                    placeholder="Your name"
                    required={!isLoginMode}
                  />
                </div>
              )}

              <div className="auth-field">
                <label htmlFor="auth-email">Email</label>
                <input
                  id="auth-email"
                  type="email"
                  value={authEmail}
                  onChange={(e) => setAuthEmail(e.target.value)}
                  placeholder="you@example.com"
                  required
                />
              </div>

              <div className="auth-field">
                <label htmlFor="auth-password">Password</label>
                <input
                  id="auth-password"
                  type="password"
                  value={authPassword}
                  onChange={(e) => setAuthPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                />
              </div>

              {authError && (
                <p className="auth-error" role="alert">
                  {authError}
                </p>
              )}

              <button
                type="submit"
                className="auth-submit"
                disabled={authLoading}
              >
                {authLoading
                  ? isLoginMode
                    ? "Logging in..."
                    : "Creating account..."
                  : isLoginMode
                  ? "Login"
                  : "Register"}
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}