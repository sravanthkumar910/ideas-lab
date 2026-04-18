import type { ReactNode } from "react";
import type { TabId, UserProfile } from "../types";
import { BlobBackground } from "./BlobBackground";
import { Header } from "./Header";
import { Sidebar } from "./Sidebar";
import { ToastProvider } from "./Toast";

interface LayoutProps {
  activeTab: TabId;
  onTabChange: (tab: TabId) => void;
  onLogout: () => void;
  profile: UserProfile;
  children: ReactNode;
}

export function Layout({
  activeTab,
  onTabChange,
  onLogout,
  profile,
  children,
}: LayoutProps) {
  return (
    <div className="min-h-screen relative bg-background overflow-x-hidden">
      <BlobBackground />
      <ToastProvider />

      <div
        className="flex min-h-screen"
        style={{ position: "relative", zIndex: 1 }}
      >
        <Sidebar
          activeTab={activeTab}
          onTabChange={onTabChange}
          onLogout={onLogout}
        />

        <main className="flex-1 ml-72 p-10 min-h-screen overflow-y-auto">
          <Header activeTab={activeTab} profile={profile} />
          {children}
        </main>
      </div>

      {/* Footer */}
      <footer
        className="ml-72 px-10 py-4 border-t text-center text-xs text-muted-foreground/40 font-body"
        style={{ borderColor: "rgba(255,255,255,0.04)" }}
      >
        © {new Date().getFullYear()}. Built with love using{" "}
        <a
          href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(typeof window !== "undefined" ? window.location.hostname : "")}`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-primary/60 hover:text-primary transition-colors"
        >
          caffeine.ai
        </a>
      </footer>
    </div>
  );
}
