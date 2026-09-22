import Link from "next/link";
import {
  Brain,
  ChevronRight,
  Clock3,
  Cloud,
  Code2,
  Database,
  FileText,
  Lightbulb,
  MessageSquareText,
  Plus,
  Sparkles,
  Upload,
} from "lucide-react";

const quickActions = [
  {
    title: "Ask your knowledge",
    description: "Get answers grounded in your documents.",
    icon: MessageSquareText,
    color: "violet",
    href: "/chat",
  },
  {
    title: "Summarize",
    description: "Turn long documents into clear key points.",
    icon: FileText,
    color: "blue",
    href: "/study",
  },
  {
    title: "Study Mode",
    description: "Learn with quizzes, explanations, and flashcards.",
    icon: Brain,
    color: "orange",
    href: "/study",
  },
  {
    title: "Add Knowledge",
    description: "Upload documents to your personal knowledge base.",
    icon: Upload,
    color: "green",
    href: "/knowledge",
  },
];

const recentKnowledge = [
  {
    title: "Azure Fundamentals",
    description: "Cloud concepts, services and architectures.",
    docs: 12,
    icon: Cloud,
    color: "blue",
    href: "/knowledge",
  },
  {
    title: "SQL & Databases",
    description: "Queries, stored procedures and database concepts.",
    docs: 8,
    icon: Database,
    color: "violet",
    href: "/knowledge",
  },
  {
    title: "Programming",
    description: "Development notes and technical references.",
    docs: 6,
    icon: Code2,
    color: "orange",
    href: "/knowledge",
  },
];

const todayStats = [
  { value: "3", label: "Flashcards", detail: "Ready for review" },
  { value: "1", label: "Quiz", detail: "Waiting to finish" },
  { value: "2", label: "Tasks", detail: "Remaining today" },
];

// Placeholder/demo data only. Real analytics arrive with persistent storage.
export default function HomePage() {
  return (
    <>
      <section className="hero">
        <div>
          <div className="eyebrow">
            <Sparkles size={15} />
            YOUR PERSONAL AI WORKSPACE
          </div>

          <h1>
            Good afternoon, <span>Jay.</span>
          </h1>

          <p>
            Your knowledge is ready. What would you like to accomplish today?
          </p>
        </div>

        <div className="hero-decoration">
          <Sparkles size={25} />
        </div>
      </section>

      <section>
        <div className="section-heading">
          <div>
            <h2>Quick actions</h2>
            <p>Start with what you need right now.</p>
          </div>
        </div>

        <div className="quick-grid">
          {quickActions.map((item) => {
            const Icon = item.icon;

            return (
              <Link className="action-card" key={item.title} href={item.href}>
                <div className={`action-icon icon-${item.color}`}>
                  <Icon size={22} />
                </div>

                <div className="action-content">
                  <strong>{item.title}</strong>
                  <p>{item.description}</p>
                </div>

                <ChevronRight className="action-arrow" size={19} />
              </Link>
            );
          })}
        </div>
      </section>

      <div className="dashboard-grid">
        <section className="daily-focus">
          <div className="section-heading">
            <div>
              <div className="heading-with-icon">
                <Lightbulb size={18} />
                <h2>Daily focus</h2>
              </div>

              <p>Pick up where you left off.</p>
            </div>

            <Link className="text-button" href="/study">
              View plan
              <ChevronRight size={16} />
            </Link>
          </div>

          <article className="focus-card">
            <div className="focus-card-top">
              <div className="focus-icon">
                <Cloud size={25} />
              </div>

              <div className="focus-information">
                <span className="category-badge">AZ-900</span>
                <h3>Azure Fundamentals</h3>
                <p>Continue learning Azure Storage services.</p>
              </div>
            </div>

            <div className="progress-heading">
              <span>Learning progress</span>
              <strong>72%</strong>
            </div>

            <div className="progress-bar">
              <span />
            </div>

            <div className="focus-bottom">
              <div className="focus-meta">
                <Clock3 size={15} />
                <span>Continue from Azure Storage</span>
              </div>

              <Link className="continue-button" href="/study">
                Continue studying
                <ChevronRight size={17} />
              </Link>
            </div>
          </article>
        </section>

        <aside className="today-card">
          <div className="today-title">
            <Sparkles size={18} />
            <h2>Today</h2>
          </div>

          <div className="today-stats">
            {todayStats.map((stat) => (
              <div className="today-stat" key={stat.label}>
                <span className="stat-number">{stat.value}</span>

                <div>
                  <strong>{stat.label}</strong>
                  <p>{stat.detail}</p>
                </div>
              </div>
            ))}
          </div>

          <Link className="today-button" href="/tasks">
            Open daily plan
            <ChevronRight size={17} />
          </Link>
        </aside>
      </div>

      <section className="knowledge-section">
        <div className="section-heading">
          <div>
            <h2>Recent knowledge</h2>
            <p>Jump back into your most recent collections.</p>
          </div>

          <Link className="text-button" href="/knowledge">
            View all
            <ChevronRight size={16} />
          </Link>
        </div>

        <div className="knowledge-grid">
          {recentKnowledge.map((item) => {
            const Icon = item.icon;

            return (
              <Link
                className="knowledge-card"
                key={item.title}
                href={item.href}
              >
                <div className="knowledge-top">
                  <div className={`knowledge-icon icon-${item.color}`}>
                    <Icon size={21} />
                  </div>

                  <ChevronRight size={18} />
                </div>

                <h3>{item.title}</h3>
                <p>{item.description}</p>

                <div className="document-count">
                  <FileText size={15} />
                  {item.docs} documents
                </div>
              </Link>
            );
          })}

          <Link className="knowledge-card add-collection" href="/knowledge">
            <div className="add-circle">
              <Plus size={22} />
            </div>

            <h3>New collection</h3>
            <p>Organize related documents and knowledge.</p>
          </Link>
        </div>
      </section>
    </>
  );
}