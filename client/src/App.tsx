import { useState, useEffect } from "react";
import axios from "axios";
import "./App.css";
import { sileo, Toaster } from "sileo";

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

const showSucessToast = (title: string, duration: number) => {
  sileo.success({
    title: title,
    duration: duration,
    fill: "#171717",
  });
};

export default function App() {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(() => window.innerWidth < 768);

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      if (!mobile) setMobileMenuOpen(false);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);
  const [isLoginMode, setIsLoginMode] = useState(true);
  const [authName, setAuthName] = useState("");
  const [authEmail, setAuthEmail] = useState("");
  const [authPassword, setAuthPassword] = useState("");
  const [authLoading, setAuthLoading] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [user, setUser] = useState<any>(
    typeof window !== "undefined"
      ? JSON.parse(localStorage.getItem("user") || "null")
      : null
  );

  const API_BASE = "https://ai-resume-checker-bhj7.onrender.com";

  const handleUpload = async () => {
    if (!file) return;
    const formData = new FormData();
    formData.append("resume", file);
    try {
      setLoading(true);
      const response = await axios.post(`${API_BASE}/api/upload`, formData, {
        responseType: "blob",
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "improved-resume.pdf");
      document.body.appendChild(link);
      link.click();
      link.remove();
      showSucessToast("Your file will be downloaded shortly.", 3000);
    } catch (error) {
      console.error(error);
      sileo.error({ title: "Upload failed. Please try again." });
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
      if (isLoginMode) {
        showSucessToast(`Welcome back, ${data.name}!`, 3000);
      } else {
        showSucessToast("Account Created Successfully.", 3000);
      }
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
    sileo.success({ title: "You have been logged out.", fill: "#171717", duration: 3000 });
    localStorage.removeItem("user");
    setUser(null);
  };

  return (
    <>
      <Toaster position="top-right" />

      {/* ── Navbar ── */}
      <nav
        className="fixed top-0 left-0 right-0 z-10 bg-[#08090b]/80 backdrop-blur-[18px] border-b border-[#22262f]"
        role="navigation"
        aria-label="Main navigation"
      >
        <div className="h-16 flex items-center justify-between px-6">
          <a className="flex items-center gap-2.5 no-underline" href="/" aria-label="Resume Improver home">
            <span className="font-sora text-base font-bold text-[#edf0f7] tracking-tight">
              Resume<span className="text-[#4f8ef7]">AI</span>
            </span>
          </a>

          {/* Desktop nav links */}
          {!isMobile && (
            <ul className="flex items-center gap-8 list-none m-0 p-0" role="list">
              <li>
                <a href="#how-it-works" className="text-sm text-[#7c8399] no-underline transition-colors duration-200 hover:text-[#edf0f7]">
                  How it works
                </a>
              </li>
              <li>
                <a href="#features" className="text-sm text-[#7c8399] no-underline transition-colors duration-200 hover:text-[#edf0f7]">
                  Features
                </a>
              </li>
              <li>
                <a href="#upload" className="font-sora text-[0.85rem] font-semibold text-white no-underline bg-[#4f8ef7] px-[18px] py-[7px] rounded-lg transition-all duration-200 hover:bg-[#3570d4] hover:-translate-y-px" aria-label="Try the resume improver">
                  Try it free
                </a>
              </li>
            </ul>
          )}

          {/* Desktop auth */}
          {!isMobile && (
            <div className="flex items-center gap-3">
              {user ? (
                <>
                  <span className="text-[0.8rem] text-[#7c8399]">Hi, {user.name}</span>
                  <button type="button" className="font-sora text-[0.8rem] font-medium text-white bg-transparent rounded-full border border-[#2e3340] px-[14px] py-[6px] cursor-pointer transition-all duration-200 hover:bg-[rgba(79,142,247,0.1)] hover:border-[#4f8ef7] hover:-translate-y-px" onClick={handleLogout}>
                    Logout
                  </button>
                </>
              ) : (
                <button type="button" className="font-sora text-[0.8rem] font-medium text-white bg-transparent rounded-full border border-[#2e3340] px-[14px] py-[6px] cursor-pointer transition-all duration-200 hover:bg-[rgba(79,142,247,0.1)] hover:border-[#4f8ef7] hover:-translate-y-px" onClick={() => { setIsLoginMode(true); setShowAuthModal(true); }}>
                  Login / Register
                </button>
              )}
            </div>
          )}

          {/* Hamburger button — mobile only */}
          {isMobile && (
            <button
              type="button"
              className="flex flex-col justify-center items-center gap-[5px] w-9 h-9 bg-transparent border border-[#2e3340] rounded-lg cursor-pointer transition-colors duration-200 hover:border-[#4f8ef7]"
              onClick={() => setMobileMenuOpen((prev) => !prev)}
              aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
              aria-expanded={mobileMenuOpen}
            >
              <span className={`block w-4 h-[1.5px] bg-[#7c8399] transition-all duration-200 origin-center ${mobileMenuOpen ? "rotate-45 translate-y-[6.5px]" : ""}`} />
              <span className={`block w-4 h-[1.5px] bg-[#7c8399] transition-all duration-200 ${mobileMenuOpen ? "opacity-0" : ""}`} />
              <span className={`block w-4 h-[1.5px] bg-[#7c8399] transition-all duration-200 origin-center ${mobileMenuOpen ? "-rotate-45 -translate-y-[6.5px]" : ""}`} />
            </button>
          )}
        </div>

        {/* Mobile dropdown menu */}
        {isMobile && mobileMenuOpen && (
          <div className="border-t border-[#22262f] bg-[#08090b]/95 px-6 py-4 flex flex-col gap-3">
            <ul className="list-none m-0 p-0 flex flex-col gap-3" role="list">
              <li>
                <a href="#how-it-works" className="text-sm text-[#7c8399] no-underline transition-colors duration-200 hover:text-[#edf0f7]" onClick={() => setMobileMenuOpen(false)}>
                  How it works
                </a>
              </li>
              <li>
                <a href="#features" className="text-sm text-[#7c8399] no-underline transition-colors duration-200 hover:text-[#edf0f7]" onClick={() => setMobileMenuOpen(false)}>
                  Features
                </a>
              </li>
              <li>
                <a href="#upload" className="inline-block font-sora text-[0.85rem] font-semibold text-white no-underline bg-[#4f8ef7] px-[18px] py-[7px] rounded-lg transition-all duration-200 hover:bg-[#3570d4]" onClick={() => setMobileMenuOpen(false)}>
                  Try it free
                </a>
              </li>
            </ul>
            <div className="border-t border-[#22262f] pt-3">
              {user ? (
                <div className="flex items-center justify-between">
                  <span className="text-[0.8rem] text-[#7c8399]">Hi, {user.name}</span>
                  <button type="button" className="font-sora text-[0.8rem] font-medium text-white bg-transparent rounded-full border border-[#2e3340] px-[14px] py-[6px] cursor-pointer transition-all duration-200 hover:bg-[rgba(79,142,247,0.1)] hover:border-[#4f8ef7]" onClick={() => { handleLogout(); setMobileMenuOpen(false); }}>
                    Logout
                  </button>
                </div>
              ) : (
                <button type="button" className="w-full font-sora text-[0.8rem] font-medium text-white bg-transparent rounded-full border border-[#2e3340] px-[14px] py-[6px] cursor-pointer transition-all duration-200 hover:bg-[rgba(79,142,247,0.1)] hover:border-[#4f8ef7]" onClick={() => { setIsLoginMode(true); setShowAuthModal(true); setMobileMenuOpen(false); }}>
                  Login / Register
                </button>
              )}
            </div>
          </div>
        )}
      </nav>

      {/* ── Hero ── */}
      <section
        className="relative min-h-screen flex flex-col items-center justify-center text-center px-8 pt-[calc(4rem+5rem)] pb-24 overflow-hidden bg-[#08090b]"
        aria-labelledby="hero-heading"
      >
        {/* glow */}
        <div
          className="absolute top-[30%] left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[500px] pointer-events-none"
          style={{ background: "radial-gradient(ellipse, rgba(79,142,247,0.09) 0%, transparent 68%)" }}
          aria-hidden="true"
        />

        <div
          className="inline-flex items-center gap-[7px] bg-[rgba(79,142,247,0.1)] border border-[rgba(79,142,247,0.25)] text-[#4f8ef7] font-sora text-[0.68rem] font-semibold tracking-[0.12em] uppercase px-[14px] py-[6px] rounded-full mb-7 animate-fade-up"
          role="status"
          aria-label="AI-powered tool"
        >
          <span className="w-1.5 h-1.5 bg-[#4f8ef7] rounded-full animate-pulse-dot" aria-hidden="true" />
          AI-Powered · Free to Try
        </div>

        <h1
          id="hero-heading"
          className="font-sora text-[clamp(2.5rem,6vw,4.25rem)] font-extrabold tracking-[-0.04em] leading-[1.08] text-[#edf0f7] max-w-[800px] mb-6 animate-fade-up-1"
        >
          Your résumé,<br />
          <span className="text-[#4f8ef7]">rewritten by AI</span>
        </h1>

        <p className="text-[clamp(0.95rem,2vw,1.1rem)] text-[#7c8399] max-w-[500px] leading-[1.75] font-light mb-11 animate-fade-up-2">
          Upload your existing résumé and get back a professionally rewritten,
          ATS-optimised PDF — in under 30 seconds.
        </p>

        <div className="flex items-center gap-3.5 flex-wrap justify-center animate-fade-up-3">
          <a
            href="#upload"
            className="inline-flex items-center gap-2 px-8 py-[0.85rem] font-sora text-[0.9rem] font-semibold text-white no-underline bg-[#4f8ef7] rounded-[10px] transition-all duration-200 shadow-[0_4px_24px_rgba(79,142,247,0.3)] hover:bg-[#3570d4] hover:-translate-y-0.5 hover:shadow-[0_8px_32px_rgba(79,142,247,0.42)]"
            aria-label="Start improving your resume"
          >
            <span aria-hidden="true">✦</span> Improve My Résumé
          </a>
          <a
            href="#how-it-works"
            className="inline-flex items-center gap-1.5 px-7 py-[0.85rem] font-sora text-[0.9rem] font-medium text-[#7c8399] no-underline bg-transparent border border-[#2e3340] rounded-[10px] transition-all duration-200 hover:text-[#edf0f7] hover:border-[#454d62] hover:bg-[#13161c]"
            aria-label="Learn how it works"
          >
            See how it works
          </a>
        </div>

        <div
          className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1.5 text-[#454d62] text-[0.68rem] tracking-[0.1em] uppercase animate-fade-up-slow"
          aria-hidden="true"
        >
          <span>Scroll</span>
          <span className="w-[18px] h-[18px] border-r-[1.5px] border-b-[1.5px] border-[#454d62] animate-arrow-bounce" style={{ transform: "rotate(45deg)" }} />
        </div>
      </section>

      {/* ── Stats strip ── */}
      <div className="border-t border-b border-[#22262f] bg-[#0e1014] py-10 px-8" role="region" aria-label="Key statistics">
        <dl className="max-w-[860px] mx-auto grid grid-cols-3 gap-4 text-center">
          {[
            { label: "Resumes improved",       value: "12", suffix: "k+" },
            { label: "Average processing time", value: "<",  suffix: "30s" },
            { label: "User satisfaction",       value: "98", suffix: "%" },
          ].map(({ label, value, suffix }) => (
            <div key={label} className="py-2">
              <dt className="text-[0.78rem] text-[#454d62] mt-[5px] tracking-[0.04em]">{label}</dt>
              <dd className="font-sora text-[1.9rem] font-extrabold text-[#edf0f7] tracking-[-0.04em]">
                {value}<span className="text-[#4f8ef7]">{suffix}</span>
              </dd>
            </div>
          ))}
        </dl>
      </div>

      {/* ── How it works ── */}
      <section
        id="how-it-works"
        className="bg-[#08090b] py-[6.5rem] px-8 text-center"
        aria-labelledby="steps-heading"
      >
        <div className="max-w-[1080px] mx-auto">
        <span className="inline-block font-sora text-[0.68rem] font-semibold tracking-[0.14em] uppercase text-[#4f8ef7] mb-3.5" aria-hidden="true">
          How it works
        </span>
        <h2 id="steps-heading" className="font-sora text-[clamp(1.55rem,3.5vw,2.25rem)] font-bold tracking-[-0.03em] text-[#edf0f7] mb-3.5">
          Three steps to a better resume
        </h2>
        <p className="text-[0.975rem] text-[#7c8399] leading-[1.75] font-light max-w-[480px] mx-auto">
          No account required. No templates to fill in. Just upload and download.
        </p>

        <ol
          className="grid grid-cols-[repeat(auto-fit,minmax(220px,1fr))] mt-14 bg-[#22262f] border border-[#22262f] rounded-2xl overflow-hidden gap-px list-none"
          role="list"
          aria-label="Process steps"
        >
          {steps.map((step) => (
            <li
              key={step.number}
              className="bg-[#0e1014] px-7 py-8 transition-colors duration-200 hover:bg-[#13161c] list-none"
            >
              <p className="font-sora text-[0.65rem] font-bold tracking-[0.1em] text-[#4f8ef7] uppercase mb-4">
                {step.number}
              </p>
              <span className="block text-2xl mb-3.5" aria-hidden="true">{step.icon}</span>
              <h3 className="font-sora text-[0.95rem] font-semibold text-[#edf0f7] mb-[0.45rem]">{step.title}</h3>
              <p className="text-[0.855rem] text-[#7c8399] leading-[1.65] font-light">{step.desc}</p>
            </li>
          ))}
        </ol>
        </div>
      </section>

      {/* ── Features ── */}
      <section
        id="features"
        className="bg-[#0e1014] border-t border-b border-[#22262f]"
        aria-labelledby="features-heading"
      >
        <div className="max-w-[1080px] mx-auto px-8 py-[6.5rem] text-center">
          <span className="inline-block font-sora text-[0.68rem] font-semibold tracking-[0.14em] uppercase text-[#4f8ef7] mb-3.5" aria-hidden="true">
            Features
          </span>
          <h2 id="features-heading" className="font-sora text-[clamp(1.55rem,3.5vw,2.25rem)] font-bold tracking-[-0.03em] text-[#edf0f7] mb-3.5">
            Everything your resume needs
          </h2>
          <p className="text-[0.975rem] text-[#7c8399] leading-[1.75] font-light max-w-[480px] mx-auto">
            Built for job seekers at every level — from first-job applicants to senior professionals changing industries.
          </p>

          <ul className="grid grid-cols-[repeat(auto-fit,minmax(270px,1fr))] gap-4 mt-12 list-none" role="list">
            {features.map((feat) => (
              <li
                key={feat.title}
                className="bg-[#13161c] border border-[#22262f] rounded-2xl p-7 text-left list-none transition-all duration-200 hover:border-[#2e3340] hover:-translate-y-0.5"
              >
                <div
                  className="w-10 h-10 bg-[rgba(79,142,247,0.1)] border border-[rgba(79,142,247,0.18)] rounded-[10px] flex items-center justify-center text-lg mb-4"
                  aria-hidden="true"
                >
                  {feat.icon}
                </div>
                <h3 className="font-sora text-[0.93rem] font-semibold text-[#edf0f7] mb-[0.45rem]">{feat.title}</h3>
                <p className="text-[0.845rem] text-[#7c8399] leading-[1.65] font-light">{feat.desc}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* ── Upload ── */}
      <section
        id="upload"
        className="py-28 px-8 flex flex-col items-center bg-[#08090b]"
        aria-labelledby="upload-heading"
      >
        <header className="flex flex-col items-center text-center mb-10">
          <span className="inline-block font-sora text-[0.68rem] font-semibold tracking-[0.14em] uppercase text-[#4f8ef7] mb-3.5" aria-hidden="true">
            Get started
          </span>
          <h2 id="upload-heading" className="font-sora text-[clamp(1.55rem,3.5vw,2.25rem)] font-bold tracking-[-0.03em] text-[#edf0f7] mb-3.5">
            Ready to stand out?
          </h2>
          <p className="text-[0.975rem] text-[#7c8399] leading-[1.75] font-light max-w-[480px]">
            Upload your PDF below. Our AI will rewrite it and return a polished, download-ready version in seconds.
          </p>
        </header>

        <div
          className="w-full max-w-[560px] bg-[#13161c] border border-[#22262f] rounded-[20px] p-10 shadow-[0_40px_80px_rgba(0,0,0,0.5),inset_0_0_0_1px_rgba(255,255,255,0.03)]"
          role="region"
          aria-label="Resume upload"
        >
          <label className="block mb-5" htmlFor="resume-upload">
            <span className="block text-[0.75rem] font-medium text-[#454d62] tracking-[0.07em] uppercase mb-2.5">
              Your resume (PDF)
            </span>

            <div
              className={`relative flex flex-col items-center justify-center gap-2 py-10 px-6 rounded-xl cursor-pointer overflow-hidden transition-all duration-200
                ${file
                  ? "border border-solid border-[#34c77b] bg-[rgba(52,199,123,0.08)]"
                  : "border-[1.5px] border-dashed border-[#2e3340] bg-[#1a1e27] hover:border-[#4f8ef7] hover:bg-[rgba(79,142,247,0.1)] hover:shadow-[0_0_0_4px_rgba(79,142,247,0.2)] focus-within:border-[#4f8ef7] focus-within:bg-[rgba(79,142,247,0.1)]"
                }`}
              role="button"
              tabIndex={0}
              aria-label={file ? `Selected: ${file.name}. Click to replace.` : "Click to select a PDF resume"}
            >
              {file ? (
                <>
                  <span className="text-[2rem] leading-none" aria-hidden="true">📄</span>
                  <span className="text-[0.88rem] font-medium text-[#34c77b]">{file.name}</span>
                  <span className="text-[0.78rem] text-[#454d62]">
                    {(file.size / 1024).toFixed(0)} KB · Click to replace
                  </span>
                </>
              ) : (
                <>
                  <span className="text-[2rem] leading-none" aria-hidden="true">⬆️</span>
                  <span className="text-[0.9rem] font-medium text-[#edf0f7]">Click to upload your PDF</span>
                  <span className="text-[0.78rem] text-[#454d62]">PDF only · max 10 MB</span>
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
            className="flex items-center justify-center gap-2 w-full py-[0.95rem] px-8 font-sora text-[0.9rem] font-semibold tracking-[0.02em] text-white bg-[#4f8ef7] border-none rounded-[10px] cursor-pointer transition-all duration-200 shadow-[0_4px_20px_rgba(79,142,247,0.3)] disabled:opacity-40 disabled:cursor-not-allowed disabled:shadow-none hover:not(:disabled):bg-[#3570d4] hover:not(:disabled):-translate-y-px hover:not(:disabled):shadow-[0_8px_28px_rgba(79,142,247,0.42)] active:not(:disabled):translate-y-0"
            type="button"
            onClick={
              user
                ? () => handleUpload()
                : () => { setIsLoginMode(true); setShowAuthModal(true); }
            }
            disabled={!file || loading}
            aria-busy={loading}
            aria-label={loading ? "Processing your resume…" : "Upload and improve resume"}
          >
            {loading ? (
              <span
                className="w-4 h-4 rounded-full border-2 border-white/25 border-t-white flex-shrink-0 animate-spin-fast"
                aria-hidden="true"
              />
            ) : (
              "Improve My Resume"
            )}
          </button>

          <p className="mt-4 flex items-center justify-center gap-1.5 text-[0.74rem] text-[#454d62]" role="note">
            Your file is processed securely and never stored.
          </p>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="border-t border-[#22262f] bg-[#0e1014] py-10 px-10" role="contentinfo">
        <div className="max-w-[1080px] mx-auto flex items-center justify-between flex-wrap gap-4">
          <span className="font-sora text-[0.9rem] font-bold text-[#edf0f7] tracking-tight">
            Resume<span className="text-[#4f8ef7]">AI</span>
          </span>

          <ul className="flex gap-7 list-none" role="list">
            <li>
              <a href="#how-it-works" className="text-[0.78rem] text-[#454d62] no-underline transition-colors duration-200 hover:text-[#7c8399]">
                How it works
              </a>
            </li>
            <li>
              <a href="#features" className="text-[0.78rem] text-[#454d62] no-underline transition-colors duration-200 hover:text-[#7c8399]">
                Features
              </a>
            </li>
          </ul>

          <p className="text-[0.75rem] text-[#454d62]">
            © {new Date().getFullYear()} ResumeAI. All rights reserved.
          </p>
        </div>
      </footer>

      {/* ── Auth modal ── */}
      {showAuthModal && (
        <div
          className="fixed inset-0 bg-black/65 flex items-center justify-center z-[120] p-6"
          role="dialog"
          aria-modal="true"
          aria-labelledby="auth-modal-title"
        >
          <div className="w-full max-w-[420px] bg-[#13161c] rounded-[18px] border border-[#22262f] shadow-[0_30px_80px_rgba(0,0,0,0.6),inset_0_0_0_1px_rgba(255,255,255,0.02)] px-7 pt-7 pb-[1.9rem]">
            <header className="flex justify-end mb-[-1.75rem]">
              <button
                type="button"
                className="border-none bg-transparent text-[#7c8399] cursor-pointer text-[1.1rem] leading-none px-1 py-0.5 rounded-full transition-all duration-200 hover:bg-[#1a1e27] hover:text-[#edf0f7] hover:-translate-y-px"
                onClick={() => setShowAuthModal(false)}
                aria-label="Close authentication dialog"
              >
                ×
              </button>
            </header>

            <div className="flex bg-[#0e1014] rounded-full border border-[#22262f] p-[3px] mx-auto mb-6 w-[156px] justify-center">
              <button
                type="button"
                className={`border-none font-sora text-[0.8rem] font-medium px-[14px] py-[6px] rounded-full cursor-pointer transition-all duration-200 ${
                  isLoginMode ? "bg-[#4f8ef7] text-white -translate-y-px" : "bg-transparent text-[#7c8399]"
                }`}
                onClick={() => setIsLoginMode(true)}
              >
                Login
              </button>
              <button
                type="button"
                className={`border-none font-sora text-[0.8rem] font-medium px-[14px] py-[6px] rounded-full cursor-pointer transition-all duration-200 ${
                  !isLoginMode ? "bg-[#4f8ef7] text-white -translate-y-px" : "bg-transparent text-[#7c8399]"
                }`}
                onClick={() => setIsLoginMode(false)}
              >
                Register
              </button>
            </div>

            <form className="flex flex-col gap-[0.9rem]" onSubmit={handleAuthSubmit}>
              {!isLoginMode && (
                <div className="flex flex-col gap-[0.3rem]">
                  <label className="text-[0.78rem] text-[#454d62] tracking-[0.04em] uppercase" htmlFor="auth-name">
                    Name
                  </label>
                  <input
                    id="auth-name"
                    type="text"
                    value={authName}
                    onChange={(e) => setAuthName(e.target.value)}
                    placeholder="Your name"
                    required={!isLoginMode}
                    className="px-3 py-[0.6rem] rounded-[9px] border border-[#2e3340] bg-[#1a1e27] text-[#edf0f7] text-[0.85rem] outline-none transition-all duration-200 placeholder:text-[#454d62] focus:border-[#4f8ef7] focus:shadow-[0_0_0_2px_rgba(79,142,247,0.2)] focus:bg-[#131722]"
                  />
                </div>
              )}

              <div className="flex flex-col gap-[0.3rem]">
                <label className="text-[0.78rem] text-[#454d62] tracking-[0.04em] uppercase" htmlFor="auth-email">
                  Email
                </label>
                <input
                  id="auth-email"
                  type="email"
                  value={authEmail}
                  onChange={(e) => setAuthEmail(e.target.value)}
                  placeholder="you@example.com"
                  required
                  className="px-3 py-[0.6rem] rounded-[9px] border border-[#2e3340] bg-[#1a1e27] text-[#edf0f7] text-[0.85rem] outline-none transition-all duration-200 placeholder:text-[#454d62] focus:border-[#4f8ef7] focus:shadow-[0_0_0_2px_rgba(79,142,247,0.2)] focus:bg-[#131722]"
                />
              </div>

              <div className="flex flex-col gap-[0.3rem]">
                <label className="text-[0.78rem] text-[#454d62] tracking-[0.04em] uppercase" htmlFor="auth-password">
                  Password
                </label>
                <input
                  id="auth-password"
                  type="password"
                  value={authPassword}
                  onChange={(e) => setAuthPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="px-3 py-[0.6rem] rounded-[9px] border border-[#2e3340] bg-[#1a1e27] text-[#edf0f7] text-[0.85rem] outline-none transition-all duration-200 placeholder:text-[#454d62] focus:border-[#4f8ef7] focus:shadow-[0_0_0_2px_rgba(79,142,247,0.2)] focus:bg-[#131722]"
                />
              </div>

              {authError && (
                <p className="text-[0.8rem] text-[#ff6b6b] bg-[rgba(255,107,107,0.08)] rounded-[10px] px-3 py-2" role="alert">
                  {authError}
                </p>
              )}

              <button
                type="submit"
                className="mt-1 w-full py-[0.8rem] px-[1.4rem] rounded-[10px] border-none bg-[#4f8ef7] text-white font-sora text-[0.9rem] font-semibold cursor-pointer transition-all duration-200 shadow-[0_4px_22px_rgba(79,142,247,0.35)] disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none hover:not(:disabled):bg-[#3570d4] hover:not(:disabled):-translate-y-px hover:not(:disabled):shadow-[0_8px_30px_rgba(79,142,247,0.5)]"
                disabled={authLoading}
              >
                {authLoading
                  ? isLoginMode ? "Logging in..." : "Creating account..."
                  : isLoginMode ? "Login" : "Register"}
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}