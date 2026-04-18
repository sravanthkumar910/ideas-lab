import {
  CheckSquare,
  FlaskConical,
  LayoutDashboard,
  Lightbulb,
  LogOut,
  Rocket,
  Settings,
} from "lucide-react";
import type { TabId } from "../types";

interface SidebarProps {
  activeTab: TabId;
  onTabChange: (tab: TabId) => void;
  onLogout: () => void;
}

const NAV_ITEMS: { id: TabId; label: string; icon: React.ReactNode }[] = [
  {
    id: "overview",
    label: "Dashboard",
    icon: <LayoutDashboard className="w-5 h-5" />,
  },
  { id: "ideas", label: "Ideas Lab", icon: <Lightbulb className="w-5 h-5" /> },
  {
    id: "incubator",
    label: "Incubator",
    icon: <FlaskConical className="w-5 h-5" />,
  },
  { id: "tasks", label: "Tasks", icon: <CheckSquare className="w-5 h-5" /> },
  {
    id: "uploads",
    label: "Deployment Hub",
    icon: <Rocket className="w-5 h-5" />,
  },
  { id: "settings", label: "Settings", icon: <Settings className="w-5 h-5" /> },
];

export function Sidebar({ activeTab, onTabChange, onLogout }: SidebarProps) {
  return (
    <aside
      className="w-72 glass border-r flex flex-col p-6 fixed h-full z-20"
      style={{ borderRight: "1px solid rgba(255,255,255,0.08)" }}
    >
      {/* Logo */}
      <div className="flex items-center gap-3 px-2 mb-10">
        <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center font-bold text-xl text-primary-foreground shadow-glass-glow">
          I
        </div>
        <span className="font-display font-bold text-xl tracking-tight uppercase text-foreground">
          Ideas Lab
        </span>
      </div>

      {/* Nav */}
      <nav className="flex-1 space-y-1" aria-label="Main navigation">
        {NAV_ITEMS.map((item) => {
          const isActive = activeTab === item.id;
          return (
            <button
              type="button"
              key={item.id}
              data-ocid={`nav.${item.id}.tab`}
              onClick={() => onTabChange(item.id)}
              className={`w-full flex items-center gap-4 px-4 py-3 rounded-xl transition-smooth text-sm font-semibold ${
                isActive
                  ? "active-nav"
                  : "text-foreground/60 hover:text-foreground glass-hover"
              }`}
              aria-current={isActive ? "page" : undefined}
            >
              {item.icon}
              {item.label}
            </button>
          );
        })}
      </nav>

      {/* Logout */}
      <div
        className="mt-auto border-t pt-6"
        style={{ borderColor: "rgba(255,255,255,0.06)" }}
      >
        <button
          type="button"
          data-ocid="nav.logout.button"
          onClick={onLogout}
          className="w-full flex items-center gap-4 px-4 py-3 rounded-xl text-destructive glass-hover transition-smooth text-sm font-bold"
        >
          <LogOut className="w-5 h-5" />
          Logout Session
        </button>
      </div>
    </aside>
  );
}
