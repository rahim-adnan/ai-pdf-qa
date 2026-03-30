# AI PDF Q&A — RAG Application

A full-stack AI application that lets you upload any PDF and ask questions about it in natural language. Built with Flask, React, LangChain, FAISS, and Groq (LLaMA 3).

![Python](https://img.shields.io/badge/Python-3.11-blue)
![React](https://img.shields.io/badge/React-18-61DAFB)
![LangChain](https://img.shields.io/badge/LangChain-0.3-green)
![License](https://img.shields.io/badge/License-MIT-yellow)

---

## What it does

1. Upload a PDF document
2. The app splits it into chunks and stores them in a vector database (FAISS)
3. Ask any question about the document in plain English
4. The app finds the most relevant chunks and sends them to an LLM (LLaMA 3 via Groq)
5. Get an accurate, context-aware answer instantly

---

## How it works — RAG (Retrieval Augmented Generation)

This project implements the **RAG** pattern, one of the most widely used techniques in production AI systems today.

```
PDF → Split into chunks → Convert to embeddings → Store in FAISS vector DB
                                                          ↓
User question → Convert to embedding → Find similar chunks → Send to LLM → Answer
```

- **Embeddings** — text is converted to numbers that represent meaning (using `all-MiniLM-L6-v2`)
- **FAISS** — a vector database that finds the most semantically similar chunks to your question
- **Groq + LLaMA 3** — a free, fast LLM that generates the final answer using the retrieved context

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18, Axios |
| Backend | Python, Flask, Flask-CORS |
| AI / LLM | Groq API (LLaMA 3.1 8B) |
| Embeddings | HuggingFace `all-MiniLM-L6-v2` |
| Vector DB | FAISS (Facebook AI Similarity Search) |
| PDF parsing | pypdf |
| LLM framework | LangChain, LangChain-Groq |

---

## Project Structure

```
ai_pdf_qa/
├── backend/
│   ├── app.py              # Flask API — two routes: upload_pdf, ask_question
│   ├── pdf_processor.py    # Reads PDF and splits into chunks
│   └── qa_engine.py        # FAISS index + LLM chain
├── frontend/
│   ├── src/
│   │   ├── App.js          # React UI
│   │   └── index.js        # Entry point
│   └── public/
│       └── index.html
├── .env                    # API keys (not committed to Git)
├── .gitignore
├── requirements.txt
└── README.md
```

---

## Getting Started

### Prerequisites

- Python 3.11+
- Node.js 18+
- A free [Groq API key](https://console.groq.com)

### 1 — Clone the repository

```bash
git clone https://github.com/rahim-adnan/ai-pdf-qa.git
cd ai-pdf-qa
```

### 2 — Set up the backend

```bash
python -m venv .venv
.venv\Scripts\activate        # Windows
source .venv/bin/activate     # Mac/Linux

pip install -r requirements.txt
```

### 3 — Set up environment variables

Create a `.env` file in the project root:

```
GROQ_API_KEY=your_groq_api_key_here
```

Get your free key at [console.groq.com](https://console.groq.com).

### 4 — Run the backend

```bash
python backend/app.py
```

You should see `Running on http://127.0.0.1:5000`.

### 5 — Run the frontend

Open a second terminal:

```bash
cd frontend
npm install
npm start
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| POST | `/upload_pdf` | Upload a PDF file, builds the FAISS index |
| POST | `/ask_question` | Ask a question, returns an LLM-generated answer |

### Example request — ask a question

```bash
curl -X POST http://127.0.0.1:5000/ask_question \
  -H "Content-Type: application/json" \
  -d '{"question": "What is the main topic of this document?"}'
```

---

## Requirements

```
flask
flask-cors
pypdf
langchain
langchain-core
langchain-groq
langchain-community
langchain-huggingface
langchain-text-splitters
faiss-cpu
sentence-transformers
python-dotenv
```

---

## Key Concepts Demonstrated

- **RAG (Retrieval Augmented Generation)** — the core AI pattern used in production systems
- **Vector embeddings** — converting text to numerical representations of meaning
- **Semantic search** — finding relevant content by meaning, not just keywords
- **LLM integration** — connecting to a large language model via API
- **REST API design** — clean Flask endpoints with proper error handling
- **React frontend** — stateful UI with loading states and error handling

---

## License

MIT
