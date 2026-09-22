import type { Metadata } from "next";
import { NotebookPen } from "lucide-react";
import FeaturePage from "../components/FeaturePage";

export const metadata: Metadata = {
  title: "Notes | OtherME",
  description: "Create personal notes and turn them into knowledge.",
};

export default function NotesPage() {
  return (
    <FeaturePage
      title="Notes"
      icon={<NotebookPen size={28} />}
      description="Create personal notes and use AI actions to summarize, explain, improve, and turn them into flashcards, quizzes, or key points. Notes will join your searchable knowledge base."
      actionLabel="Open Study Mode"
      actionHref="/study"
    />
  );
}