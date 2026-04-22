import os
from dotenv import load_dotenv
load_dotenv()

from flask import Flask, request, jsonify
from flask_cors import CORS
from pdf_processor import PDFProcessor
from qa_engine import QAEngine

app = Flask(__name__)
CORS(app)

pdf_processor = PDFProcessor()
qa_engine = QAEngine()

@app.route("/upload_pdf", methods=["POST"])
def upload_pdf():
    file = request.files.get("file")
    if not file:
        return jsonify({"error": "No file uploaded"}), 400
    if not file.filename.endswith(".pdf"):
        return jsonify({"error": "File must be a PDF"}), 400

    try:
        chunks = pdf_processor.process_pdf(file)
        qa_engine.build_index(chunks)
        return jsonify({"message": "PDF processed successfully", "chunks": len(chunks)})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/ask_question", methods=["POST"])
def ask_question_route():
    data = request.json
    question = data.get("question")
    if not question:
        return jsonify({"error": "No question provided"}), 400

    try:
        answer = qa_engine.ask(question)
        return jsonify({"answer": answer})
    except ValueError as e:
        return jsonify({"error": str(e)}), 400
    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5000))
    app.run(host="0.0.0.0", port=port, debug=False)