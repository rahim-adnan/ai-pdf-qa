import React, { useState, useEffect } from "react";
import axios from "axios";

const API_BASE = "https://ai-pdf-qa-backend.onrender.com";

// ── Wakeup Screen ────────────────────────────────────────────
function WakeupScreen({ onReady }) {
  const [status, setStatus] = useState("Pinging server...");
  const [progress, setProgress] = useState(0);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    // Slowly fill progress bar
    const ticker = setInterval(() => {
      setProgress(p => Math.min(p + 1, 90));
    }, 600);

    const tryPing = async (attempt) => {
      try {
        setStatus(attempt > 1 ? `Still waking up... (attempt ${attempt})` : "Pinging server...");
        await axios.get(`${API_BASE}/health`, { timeout: 15000 });
        clearInterval(ticker);
        setProgress(100);
        setStatus("✅ Backend is ready!");
        setTimeout(onReady, 800);
        return true;
      } catch (e) {}
      return false;
    };

    (async () => {
      for (let i = 1; i <= 10; i++) {
        const ok = await tryPing(i);
        if (ok) return;
        await new Promise(r => setTimeout(r, 5000));
      }
      clearInterval(ticker);
      setProgress(100);
      setFailed(true);
      setStatus("⚠️ Taking too long. Try refreshing.");
    })();

    return () => clearInterval(ticker);
  }, [onReady]);

  return (
    <div style={styles.overlay}>
      <div style={styles.box}>
        <div style={styles.icon}>📄</div>
        <h2 style={styles.title}>Waking up the backend...</h2>
        <p style={styles.sub}>
          Hosted on Render's free tier — takes about 30–60 seconds on first load.
        </p>
        <div style={styles.barBg}>
          <div style={{ ...styles.bar, width: `${progress}%`, background: failed ? "#e05555" : "#2563eb" }} />
        </div>
        <p style={{ ...styles.status, color: failed ? "#e05555" : progress === 100 ? "#16a34a" : "#888" }}>
          {status}
        </p>
        <a
          href="YOUR_YOUTUBE_LINK_HERE"
          target="_blank"
          rel="noreferrer"
          style={styles.ytBtn}
        >
          ▶ Watch demo video while you wait
        </a>
      </div>
    </div>
  );
}

const styles = {
  overlay: {
    position: "fixed", inset: 0, background: "#f8fafc",
    display: "flex", alignItems: "center", justifyContent: "center",
    fontFamily: "sans-serif", zIndex: 9999,
  },
  box: {
    textAlign: "center", maxWidth: "420px", width: "90%",
    padding: "40px 32px", background: "#fff",
    border: "1px solid #e2e8f0", borderRadius: "16px",
    boxShadow: "0 4px 24px rgba(0,0,0,0.08)",
  },
  icon: { fontSize: "3.5rem", marginBottom: "16px" },
  title: { fontSize: "1.5rem", fontWeight: 700, color: "#1e293b", marginBottom: "10px" },
  sub: { fontSize: "0.95rem", color: "#64748b", marginBottom: "28px", lineHeight: 1.6 },
  barBg: { background: "#e2e8f0", borderRadius: "10px", height: "10px", overflow: "hidden", marginBottom: "16px" },
  bar: { height: "100%", borderRadius: "10px", transition: "width 0.5s ease" },
  status: { fontSize: "0.9rem", marginBottom: "20px" },
  ytBtn: {
    display: "inline-block", padding: "10px 22px",
    background: "#fff0f0", border: "1px solid #fca5a5",
    color: "#dc2626", borderRadius: "10px",
    textDecoration: "none", fontSize: "0.95rem", fontWeight: 600,
  },
};
// ── End Wakeup Screen ────────────────────────────────────────

function App() {
  const [ready, setReady] = useState(false);
  const [file, setFile] = useState(null);
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  if (!ready) return <WakeupScreen onReady={() => setReady(true)} />;

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