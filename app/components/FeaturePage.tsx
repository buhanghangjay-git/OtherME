import Link from "next/link";
import { ChevronRight } from "lucide-react";
import type { ReactNode } from "react";

type FeaturePageProps = {
  title: string;
  description: string;
  icon: ReactNode;
  actionLabel: string;
  actionHref: string;
};

export default function FeaturePage({
  title,
  description,
  icon,
  actionLabel,
  actionHref,
}: FeaturePageProps) {
  return (
    <section className="feature-page">
      <div className="feature-page-icon">{icon}</div>

      <h1>{title}</h1>
      <p>{description}</p>

      <Link className="feature-action" href={actionHref}>
        {actionLabel}
        <ChevronRight size={16} />
      </Link>
    </section>
  );
}