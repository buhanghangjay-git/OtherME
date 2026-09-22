"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
  BarChart3,
  Bell,
  BookOpen,
  Brain,
  CheckSquare,
  ChevronRight,
  Home,
  Menu,
  MessageSquareText,
  NotebookPen,
  Plus,
  Search,
  Sparkles,
  X,
} from "lucide-react";

const navigation = [
  { name: "Home", href: "/", icon: Home },
  { name: "Ask AI", href: "/chat", icon: MessageSquareText },
  { name: "Knowledge", href: "/knowledge", icon: BookOpen },
  { name: "Study", href: "/study", icon: Brain },
  { name: "Notes", href: "/notes", icon: NotebookPen },
  { name: "Tasks", href: "/tasks", icon: CheckSquare },
  { name: "Insights", href: "/insights", icon: BarChart3 },
];

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const closeSidebar = () => setSidebarOpen(false);

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname === href || pathname.startsWith(href + "/");

  return (
    <div className="app-shell">
      {sidebarOpen && (
        <button
          type="button"
          className="sidebar-overlay"
          onClick={closeSidebar}
          aria-label="Close navigation"
        />
      )}

      <aside className={sidebarOpen ? "sidebar sidebar-open" : "sidebar"}>
        <div className="sidebar-top">
          <Link className="brand" href="/" onClick={closeSidebar}>
            <div className="brand-icon">
              <Sparkles size={20} />
            </div>
            <div>
              <div className="brand-name">NexusAI</div>
              <div className="brand-tagline">Personal Intelligence</div>
            </div>
          </Link>

          <button
            type="button"
            className="mobile-close"
            onClick={closeSidebar}
            aria-label="Close navigation"
          >
            <X size={20} />
          </button>
        </div>

        <nav className="navigation" aria-label="Main navigation">
          <div className="nav-label">Workspace</div>
          {navigation.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={active ? "nav-item nav-active" : "nav-item"}
                onClick={closeSidebar}
                aria-current={active ? "page" : undefined}
              >
                <Icon size={19} strokeWidth={2} />
                <span>{item.name}</span>
              </Link>
            );
          })}
        </nav>

        <div className="sidebar-bottom">
          <div className="storage-card">
            <div className="storage-header">
              <div className="storage-icon">
                <BookOpen size={17} />
              </div>
              <div>
                <strong>Knowledge base</strong>
                <p>26 documents indexed</p>
              </div>
            </div>
            <div className="storage-progress">
              <span />
            </div>
            <div className="storage-footer">
              <span>1.8 GB used</span>
              <span>5 GB</span>
            </div>
          </div>

          <button type="button" className="profile-card">
            <div className="avatar">J</div>
            <div className="profile-info">
              <strong>Jay</strong>
              <span>Personal workspace</span>
            </div>
            <ChevronRight size={17} />
          </button>
        </div>
      </aside>

      <section className="main-content">
        <header className="topbar">
          <div className="topbar-left">
            <button
              type="button"
              className="menu-button"
              onClick={() => setSidebarOpen(true)}
              aria-label="Open navigation"
            >
              <Menu size={21} />
            </button>

            <div className="search-box">
              <Search size={18} />
              <input
                type="search"
                placeholder="Search your knowledge..."
                aria-label="Search your knowledge"
              />
              <kbd>Ctrl K</kbd>
            </div>
          </div>

          <div className="topbar-actions">
            <button type="button" className="icon-button" aria-label="Notifications">
              <Bell size={20} />
              <span className="notification-dot" />
            </button>

            <Link className="new-button" href="/knowledge" onClick={closeSidebar}>
              <Plus size={18} />
              <span>Add knowledge</span>
            </Link>
          </div>
        </header>

        <div className="dashboard">{children}</div>
      </section>
    </div>
  );
}