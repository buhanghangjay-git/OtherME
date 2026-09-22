import type { Metadata } from "next";
import { CheckSquare } from "lucide-react";
import FeaturePage from "../components/FeaturePage";

export const metadata: Metadata = {
  title: "Tasks | NexusAI",
  description: "Turn your knowledge into actionable tasks.",
};

export default function TasksPage() {
  return (
    <FeaturePage
      title="Tasks"
      icon={<CheckSquare size={28} />}
      description="Turn knowledge into action. Track items like reviewing Azure Networking or completing SQL exercises, and convert action items found in your notes and documents into tasks."
      actionLabel="Back to dashboard"
      actionHref="/"
    />
  );
}