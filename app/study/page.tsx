import type { Metadata } from "next";
import { Brain } from "lucide-react";
import FeaturePage from "../components/FeaturePage";

export const metadata: Metadata = {
  title: "Study | NexusAI",
  description:
    "Learn your material with explanations, summaries, quizzes, and flashcards.",
};

export default function StudyPage() {
  return (
    <FeaturePage
      title="Study Mode"
      icon={<Brain size={28} />}
      description="Learn from your own documents with Explain Simply, Key Points, summaries, quizzes, flashcards, and study sessions. Learning progress tracking arrives with persistent storage."
      actionLabel="Go to Knowledge"
      actionHref="/knowledge"
    />
  );
}