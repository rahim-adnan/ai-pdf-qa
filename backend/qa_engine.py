# backend/qa_engine.py
import os
from langchain_groq import ChatGroq
from langchain_community.vectorstores import FAISS
from langchain_openai import OpenAIEmbeddings
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import StrOutputParser
from langchain_core.runnables import RunnablePassthrough

class QAEngine:
    def __init__(self):
        self.llm = ChatGroq(
            model="llama-3.1-8b-instant",
            api_key=os.environ["GROQ_API_KEY"]
        )
        self.embeddings = OpenAIEmbeddings(
            api_key=os.environ["OPENAI_API_KEY"]
        )
        self.chain = None

    def build_index(self, chunks):
        vectorstore = FAISS.from_texts(chunks, self.embeddings)
        retriever = vectorstore.as_retriever()

        prompt = ChatPromptTemplate.from_template("""
You are a helpful assistant. Answer the question based only on the context below.
If you don't know the answer from the context, say "I don't know".

Context: {context}

Question: {question}
""")
        self.chain = (
            {"context": retriever, "question": RunnablePassthrough()}
            | prompt
            | self.llm
            | StrOutputParser()
        )

    def ask(self, question):
        if not self.chain:
            raise ValueError("Upload a PDF first.")
        return self.chain.invoke(question)