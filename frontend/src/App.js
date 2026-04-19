import React, { useState } from "react";
import axios from "axios";

const API_BASE = process.env.REACT_APP_API_URL || "http://127.0.0.1:5000";

function App() {
  const [file, setFile] = useState(null);
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const uploadPDF = async () => {
    if (!file) return setError("Please select a PDF file first.");
    if (!file.name.endsWith(".pdf")) return setError("Only PDF files are supported.");

    const formData = new FormData();
    formData.append("file", file);
    setLoading(true);
    setError("");
    setMessage("");

    try {
      const res = await axios.post(`${API_BASE}/upload_pdf`, formData);
      setMessage(`${res.data.message} (${res.data.chunks} chunks)`);
    } catch (err) {
      setError(err.response?.data?.error || "Error uploading PDF.");
    } finally {
      setLoading(false);
    }
  };

  const askQuestion = async () => {
    if (!question.trim()) return setError("Please type a question.");
    if (!message) return setError("Please upload a PDF first.");
    setLoading(true);
    setError("");
    setAnswer("");

    try {
      const res = await axios.post(`${API_BASE}/ask_question`, { question });
      setAnswer(res.data.answer);
    } catch (err) {
      setError(err.response?.data?.error || "Error asking question.");
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") askQuestion();
  };

  return (
    <div style={{ maxWidth: "700px", margin: "40px auto", fontFamily: "sans-serif", padding: "0 20px" }}>
      <h1 style={{ borderBottom: "2px solid #eee", paddingBottom: "10px" }}>AI PDF Q&A</h1>

      <div style={{ marginBottom: "24px" }}>
        <h2 style={{ fontSize: "16px", marginBottom: "8px" }}>Step 1: Upload a PDF</h2>
        <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
          <input
            type="file"
            accept=".pdf"
            onChange={(e) => { setFile(e.target.files[0]); setMessage(""); setAnswer(""); setError(""); }}
          />
          <button onClick={uploadPDF} disabled={loading} style={btnStyle("#2563eb")}>
            {loading ? "Uploading..." : "Upload PDF"}
          </button>
        </div>
        {message && <p style={{ color: "green", marginTop: "8px" }}>✅ {message}</p>}
      </div>

      <div style={{ marginBottom: "24px" }}>
        <h2 style={{ fontSize: "16px", marginBottom: "8px" }}>Step 2: Ask a Question</h2>
        <div style={{ display: "flex", gap: "10px" }}>
          <input
            type="text"
            placeholder="Ask something about the PDF..."
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            onKeyDown={handleKeyDown}
            style={{ flex: 1, padding: "8px 12px", fontSize: "14px", border: "1px solid #ccc", borderRadius: "6px" }}
          />
          <button onClick={askQuestion} disabled={loading} style={btnStyle("#16a34a")}>
            {loading ? "Thinking..." : "Ask"}
          </button>
        </div>
      </div>

      {error && (
        <p style={{ color: "red", background: "#fff0f0", padding: "10px", borderRadius: "6px" }}>
          {error}
        </p>
      )}

      {answer && (
        <div style={{ background: "#f0f9ff", border: "1px solid #bae6fd", borderRadius: "8px", padding: "16px" }}>
          <strong>Answer:</strong>
          <p style={{ marginTop: "8px", lineHeight: "1.6" }}>{answer}</p>
        </div>
      )}
    </div>
  );
}

const btnStyle = (bg) => ({
  backgroundColor: bg,
  color: "white",
  border: "none",
  padding: "8px 16px",
  borderRadius: "6px",
  cursor: "pointer",
  fontSize: "14px",
  whiteSpace: "nowrap",
});

export default App;