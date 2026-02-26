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
        {
          responseType: "blob"
        }
      );

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "improved-resume.pdf");
      document.body.appendChild(link);
      link.click();

    } catch (error) {
      console.error(error);
      alert("Upload failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container">
      <h1 className="header">AI Resume Improver</h1>
      <p className="description"></p>
      <input
        className="file-input"
        type="file"
        accept=".pdf"
        onChange={(e) => setFile(e.target.files?.[0] || null)}
      />

      <button className="upload-button" onClick={handleUpload} disabled={loading}>
        {loading ? "Processing..." : "Upload & Improve"}
      </button>
    </div>
  );
}

export default App;