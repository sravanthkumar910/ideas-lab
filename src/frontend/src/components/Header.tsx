import type { TabId, UserProfile } from "../types";

const TAB_META: Record<TabId, { title: string; subtitle: string }> = {
  overview: {
    title: "System Overview",
    subtitle: "Real-time status of your innovation ecosystem.",
  },
  ideas: {
    title: "Ideas Lab",
    subtitle: "Register and manage new project concepts.",
  },
  incubator: {
    title: "Incubator Hub",
    subtitle: "Repository for incubating projects.",
  },
  tasks: {
    title: "Mission Control",
    subtitle: "Track daily objectives sequentially.",
  },
  uploads: {
    title: "Deployment Hub",
    subtitle: "Live hosting and multi-project deployment logs.",
  },
  settings: {
    title: "System Settings",
    subtitle: "Configure identity, security, and web presence.",
  },
};

interface HeaderProps {
  activeTab: TabId;
  profile: UserProfile;
}

export function Header({ activeTab, profile }: HeaderProps) {
  const meta = TAB_META[activeTab];
  return (
    <header className="flex justify-between items-center mb-10">
      <div>
        <h2 className="text-3xl font-display font-bold tracking-tight text-foreground">
          {meta.title}
        </h2>
        <p className="text-muted-foreground mt-1 text-sm">{meta.subtitle}</p>
      </div>
      <div className="flex items-center gap-4 glass px-4 py-2 rounded-2xl">
        <div className="text-right">
          <p className="text-sm font-bold text-foreground leading-tight">
            {profile.name}
          </p>
          <p className="text-xs text-primary/80 font-semibold">
            Project Architect
          </p>
        </div>
        <img
          src={profile.photo}
          alt={profile.name}
          className="w-10 h-10 rounded-xl object-cover"
          style={{ border: "1px solid rgba(255,255,255,0.1)" }}
        />
      </div>
    </header>
  );
}
