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
  const { loggedIn, profile, login, logout, updateProfile } = useAuth();
  const backend = useBackend();
  const [activeTab, setActiveTab] = useState<TabId>("overview");

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
            liveCount={backend.deployments.length}
            completedCount={backend.incubatorProjects.length}
            pendingCount={backend.ideas.length}
          />
        );
      case "ideas":
        return (
          <IdeasPage
            ideas={backend.ideas}
            onAdd={backend.addIdea}
            onRemove={backend.removeIdea}
          />
        );
      case "incubator":
        return (
          <IncubatorPage
            projects={backend.incubatorProjects}
            onAdd={backend.addIncubatorProject}
            onRemove={backend.removeIncubatorProject}
          />
        );
      case "tasks":
        return (
          <TasksPage
            tasks={backend.tasks}
            createTask={backend.addTask}
            deleteTask={backend.removeTask}
          />
        );
      case "uploads":
        return (
          <DeploymentPage
            deployments={backend.deployments}
            onAdd={backend.addDeployment}
            onRemove={backend.removeDeployment}
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
