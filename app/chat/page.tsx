import type { Metadata } from "next";
import { MessageSquareText } from "lucide-react";
import FeaturePage from "../components/FeaturePage";

export const metadata: Metadata = {
  title: "Ask AI | NexusAI",
  description: "Ask questions across your personal knowledge base.",
};

export default function ChatPage() {
  return (
    <FeaturePage
      title="Ask AI"
      icon={<MessageSquareText size={28} />}
      description="Ask questions across your personal knowledge base. Grounded answers with source citations will appear here once the RAG pipeline (upload, chunking, embeddings, retrieval) is connected."
      actionLabel="Go to Knowledge"
      actionHref="/knowledge"
    />
  );
}