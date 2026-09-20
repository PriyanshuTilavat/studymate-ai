import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "StudyMate AI — RAG-Powered Study Tool",
  description:
    "Upload a PDF and get an AI summary, chat using RAG, and take an auto-generated quiz. Built with FastAPI, Gemini, and ChromaDB.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
