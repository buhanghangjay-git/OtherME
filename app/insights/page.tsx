import type { Metadata } from "next";
import { BarChart3 } from "lucide-react";
import FeaturePage from "../components/FeaturePage";

export const metadata: Metadata = {
  title: "Insights | OtherME",
  description: "Learning and knowledge analytics for your workspace.",
};

export default function InsightsPage() {
  return (
    <FeaturePage
      title="Insights"
      icon={<BarChart3 size={28} />}
      description="Documents indexed, questions asked, flashcards reviewed, quiz accuracy, strongest topics, and topics that need review. Values shown are demo placeholders until a real database is connected."
      actionLabel="Back to dashboard"
      actionHref="/"
    />
  );
}