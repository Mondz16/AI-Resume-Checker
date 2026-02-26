import { useState } from "react";
import axios from "axios";
import './App.css';

function App() {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

  const handleUpload = async () => {
    if (!file) return;

    const formData = new FormData();
    formData.append("resume", file);

    try {
      setLoading(true);
      const response = await axios.post(
        "https://ai-resume-checker-bhj7.onrender.com/upload",
        formData,
        { responseType: "blob" }
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

  const features = [
    "Rewrites bullet points for stronger impact",
    "Optimises keywords for ATS screening",
    "Improves clarity, tone, and formatting",
    "Returns a polished, download-ready PDF",
  ];

  return (
    <main id="root" role="main">
      <div className="card">

        {/* ── Header ── */}
        <header className="header-group">
          <div className="badge" aria-label="AI-powered tool">
            <span className="badge-dot" aria-hidden="true" />
            AI-Powered
          </div>

          <h1 className="header">
            Resume <span>Improver</span>
          </h1>

          <p className="description">
            Upload your existing resume and let AI rewrite it — sharper bullet
            points, better keywords, and cleaner formatting — all exported as a
            ready-to-send PDF in seconds.
          </p>
        </header>

        {/* ── Feature list ── */}
        <ul className="features" aria-label="What we improve">
          {features.map((feat) => (
            <li key={feat} className="feature-item">
              <span className="feature-icon" aria-hidden="true">✓</span>
              {feat}
            </li>
          ))}
        </ul>

        <div className="divider" role="separator" />

        {/* ── File upload ── */}
        <label className="file-label" htmlFor="resume-upload">
          <span className="file-label-text">Your resume</span>

          <div
            className={`file-drop-zone${file ? " has-file" : ""}`}
            role="button"
            aria-label={file ? `Selected file: ${file.name}` : "Click or drag to upload a PDF resume"}
            tabIndex={0}
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
              aria-label="Upload resume PDF"
              onChange={(e) => setFile(e.target.files?.[0] ?? null)}
            />
          </div>
        </label>

        {/* ── Submit ── */}
        <button
          className="upload-button"
          onClick={handleUpload}
          disabled={!file || loading}
          aria-busy={loading}
          aria-label={loading ? "Processing your resume…" : "Upload and improve resume"}
          type="button"
        >
          {loading ? (
            <>
              <span className="spinner" aria-hidden="true" />
              Processing…
            </>
          ) : (
            <>
              <span aria-hidden="true">✦</span>
              Improve My Resume
            </>
          )}
        </button>

        {/* ── Footer ── */}
        <p className="footer-note">
          Your file is processed securely and never stored.{" "}
          <a href="/privacy" aria-label="Read our privacy policy">Privacy policy ↗</a>
        </p>
      </div>
    </main>
  );
}

export default App;