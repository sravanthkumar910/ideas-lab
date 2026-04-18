import { useState } from "react";
import { BlobBackground } from "./components/BlobBackground";
import { Layout } from "./components/Layout";
import { useAuth } from "./hooks/useAuth";
import { useBackend } from "./hooks/useBackend";
import { DashboardPage } from "./pages/DashboardPage";
import { DeploymentPage } from "./pages/DeploymentPage";
import { IdeasPage } from "./pages/IdeasPage";
import { IncubatorPage } from "./pages/IncubatorPage";
import { LoginPage } from "./pages/LoginPage";
import { SettingsPage } from "./pages/SettingsPage";
import { TasksPage } from "./pages/TasksPage";
import type { TabId } from "./types";

export default function App() {
  const {
    loggedIn,
    isInitializing,
    profile,
    actor,
    actorReady,
    login,
    logout,
    updateProfile,
  } = useAuth();
  const backend = useBackend({ actor, actorReady });
  const [activeTab, setActiveTab] = useState<TabId>("overview");

  // While Internet Identity is initializing, show loading
  if (isInitializing) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center relative overflow-hidden">
        <BlobBackground />
        <div className="relative z-10 text-center">
          <div className="w-16 h-16 rounded-full border-2 border-primary/30 border-t-primary animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground text-sm font-semibold uppercase tracking-widest">
            Initializing Identity...
          </p>
        </div>
      </div>
    );
  }

  if (!loggedIn) {
    return (
      <div className="min-h-screen bg-background relative overflow-hidden">
        <BlobBackground />
        <div style={{ position: "relative", zIndex: 1 }}>
          <LoginPage onLogin={login} />
        </div>
      </div>
    );
  }

  const renderTab = () => {
    switch (activeTab) {
      case "overview":
        return (
          <DashboardPage
            liveCount={backend.dashboardStats.liveProjects}
            completedCount={backend.dashboardStats.completedProjects}
            pendingCount={backend.dashboardStats.pendingIdeas}
            isLoading={backend.statsLoading}
          />
        );
      case "ideas":
        return (
          <IdeasPage
            ideas={backend.ideas}
            onAdd={backend.addIdea}
            onRemove={backend.removeIdea}
            isLoading={backend.ideasLoading}
          />
        );
      case "incubator":
        return (
          <IncubatorPage
            projects={backend.incubatorProjects}
            onAdd={backend.addIncubatorProject}
            onRemove={backend.removeIncubatorProject}
            isLoading={backend.projectsLoading}
          />
        );
      case "tasks":
        return (
          <TasksPage
            tasks={backend.tasks}
            createTask={backend.addTask}
            deleteTask={backend.removeTask}
            isLoading={backend.tasksLoading}
          />
        );
      case "uploads":
        return (
          <DeploymentPage
            deployments={backend.deployments}
            onAdd={backend.addDeployment}
            onRemove={backend.removeDeployment}
            isLoading={backend.deploymentsLoading}
          />
        );
      case "settings":
        return (
          <SettingsPage
            profile={profile}
            webLinks={backend.webLinks}
            onUpdateProfile={updateProfile}
            onAddLink={backend.addWebLink}
            onRemoveLink={backend.removeWebLink}
            isLoading={backend.settingsLoading}
          />
        );
      default:
        return null;
    }
  };

  return (
    <Layout
      activeTab={activeTab}
      onTabChange={setActiveTab}
      onLogout={logout}
      profile={profile}
    >
      {renderTab()}
    </Layout>
  );
}
