import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import type {
  Deployment as BDeployment,
  Idea as BIdea,
  IncubatorProject as BIncubatorProject,
  Task as BTask,
  WebLink as BWebLink,
  backendInterface,
} from "../backend";
import type {
  DashboardStats,
  Deployment,
  Idea,
  IncubatorProject,
  Task,
  WebLink,
} from "../types";

// ── Stable mappers ────────────────────────────────────────────────────────────
function mapIdea(b: BIdea): Idea {
  return {
    id: b.id,
    name: b.name,
    place: b.place,
    problem: b.problem,
    description: b.description,
    deadline: b.deadline,
    ideaType: b.ideaType,
    status: b.status,
    youtubeUrl: b.youtubeUrl,
    instaUrl: b.instaUrl,
    googleUrl: b.googleUrl,
    photoUrl: b.photoUrl,
  };
}

function mapProject(b: BIncubatorProject): IncubatorProject {
  return {
    id: b.id,
    name: b.name,
    youtubeUrl: b.youtubeUrl,
    instaUrl: b.instaUrl,
    googleUrl: b.googleUrl,
    imageUrl: b.imageUrl,
    pptFileName: b.pptFileName,
    docFileName: b.docFileName,
    srcFileName: b.srcFileName,
    createdAt: b.createdAt,
  };
}

function mapDeployment(b: BDeployment): Deployment {
  return {
    id: b.id,
    name: b.name,
    deployedUrl: b.deployedUrl,
    githubUrl: b.githubUrl,
    engineType: b.engineType,
    architecture: b.architecture,
  };
}

function mapTask(b: BTask): Task {
  return {
    id: b.id,
    description: b.description,
    taskDate: b.taskDate,
    taskTime: b.taskTime,
  };
}

function mapWebLink(b: BWebLink): WebLink {
  return { id: b.id, title: b.title, url: b.url };
}

async function fileToUint8Array(file: File): Promise<Uint8Array> {
  const buffer = await file.arrayBuffer();
  return new Uint8Array(buffer);
}

interface UseBackendOptions {
  actor: backendInterface | null;
  actorReady: boolean;
}

export function useBackend({ actor, actorReady }: UseBackendOptions) {
  const [ideas, setIdeas] = useState<Idea[]>([]);
  const [incubatorProjects, setIncubatorProjects] = useState<
    IncubatorProject[]
  >([]);
  const [deployments, setDeployments] = useState<Deployment[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [webLinks, setWebLinks] = useState<WebLink[]>([]);
  const [dashboardStats, setDashboardStats] = useState<DashboardStats>({
    liveProjects: 0,
    completedProjects: 0,
    pendingIdeas: 0,
  });

  const [ideasLoading, setIdeasLoading] = useState(false);
  const [projectsLoading, setProjectsLoading] = useState(false);
  const [deploymentsLoading, setDeploymentsLoading] = useState(false);
  const [tasksLoading, setTasksLoading] = useState(false);
  const [settingsLoading, setSettingsLoading] = useState(false);
  const [statsLoading, setStatsLoading] = useState(false);

  // ── Loaders ──────────────────────────────────────────────────────────────────

  const loadDashboardStats = useCallback(async () => {
    if (!actor) return;
    setStatsLoading(true);
    try {
      const stats = await actor.getDashboardStats();
      setDashboardStats({
        liveProjects: Number(stats.liveProjects),
        completedProjects: Number(stats.completedProjects),
        pendingIdeas: Number(stats.pendingIdeas),
      });
    } catch {
      // silently skip
    } finally {
      setStatsLoading(false);
    }
  }, [actor]);

  const loadIdeas = useCallback(async () => {
    if (!actor) return;
    setIdeasLoading(true);
    try {
      const list = await actor.getIdeas();
      setIdeas(list.map(mapIdea));
    } finally {
      setIdeasLoading(false);
    }
  }, [actor]);

  const loadProjects = useCallback(async () => {
    if (!actor) return;
    setProjectsLoading(true);
    try {
      const list = await actor.getIncubatorProjects();
      setIncubatorProjects(list.map(mapProject));
    } finally {
      setProjectsLoading(false);
    }
  }, [actor]);

  const loadDeployments = useCallback(async () => {
    if (!actor) return;
    setDeploymentsLoading(true);
    try {
      const list = await actor.getDeployments();
      setDeployments(list.map(mapDeployment));
    } finally {
      setDeploymentsLoading(false);
    }
  }, [actor]);

  const loadTasks = useCallback(async () => {
    if (!actor) return;
    setTasksLoading(true);
    try {
      const list = await actor.getTasks();
      setTasks(list.map(mapTask));
    } finally {
      setTasksLoading(false);
    }
  }, [actor]);

  const loadWebLinks = useCallback(async () => {
    if (!actor) return;
    setSettingsLoading(true);
    try {
      const list = await actor.getWebLinks();
      setWebLinks(list.map(mapWebLink));
    } finally {
      setSettingsLoading(false);
    }
  }, [actor]);

  const refreshAll = useCallback(async () => {
    await Promise.all([
      loadIdeas(),
      loadProjects(),
      loadDeployments(),
      loadTasks(),
      loadWebLinks(),
      loadDashboardStats(),
    ]);
  }, [
    loadIdeas,
    loadProjects,
    loadDeployments,
    loadTasks,
    loadWebLinks,
    loadDashboardStats,
  ]);

  // Load everything when actor becomes ready
  useEffect(() => {
    if (!actorReady || !actor) return;
    void refreshAll();
  }, [actorReady, actor, refreshAll]);

  // ── File Upload Helpers ───────────────────────────────────────────────────────

  const uploadIdeaPhoto = useCallback(
    async (file: File): Promise<string> => {
      if (!actor) throw new Error("Not connected");
      const data = await fileToUint8Array(file);
      const result = await actor.uploadIdeaPhoto(file.name, file.type, data);
      if (result.__kind__ === "err") throw new Error(result.err);
      return result.ok.objectId;
    },
    [actor],
  );

  const uploadIncubatorImage = useCallback(
    async (file: File): Promise<string> => {
      if (!actor) throw new Error("Not connected");
      const data = await fileToUint8Array(file);
      const result = await actor.uploadIncubatorImage(
        file.name,
        file.type,
        data,
      );
      if (result.__kind__ === "err") throw new Error(result.err);
      return result.ok.objectId;
    },
    [actor],
  );

  const uploadIncubatorPpt = useCallback(
    async (file: File): Promise<string> => {
      if (!actor) throw new Error("Not connected");
      const data = await fileToUint8Array(file);
      const result = await actor.uploadIncubatorPpt(file.name, file.type, data);
      if (result.__kind__ === "err") throw new Error(result.err);
      return result.ok.objectId;
    },
    [actor],
  );

  const uploadIncubatorDoc = useCallback(
    async (file: File): Promise<string> => {
      if (!actor) throw new Error("Not connected");
      const data = await fileToUint8Array(file);
      const result = await actor.uploadIncubatorDoc(file.name, file.type, data);
      if (result.__kind__ === "err") throw new Error(result.err);
      return result.ok.objectId;
    },
    [actor],
  );

  const uploadIncubatorSrc = useCallback(
    async (file: File): Promise<string> => {
      if (!actor) throw new Error("Not connected");
      const data = await fileToUint8Array(file);
      const result = await actor.uploadIncubatorSrc(file.name, file.type, data);
      if (result.__kind__ === "err") throw new Error(result.err);
      return result.ok.objectId;
    },
    [actor],
  );

  const uploadProfilePhoto = useCallback(
    async (file: File): Promise<string> => {
      if (!actor) throw new Error("Not connected");
      const data = await fileToUint8Array(file);
      const result = await actor.uploadProfilePhoto(file.name, file.type, data);
      if (result.__kind__ === "err") throw new Error(result.err);
      return result.ok.objectId;
    },
    [actor],
  );

  const downloadFile = useCallback(
    async (objectId: string): Promise<string | null> => {
      if (!actor) return null;
      const result = await actor.downloadFile(objectId);
      if (!result) return null;
      const blob = new Blob([result.data.buffer as ArrayBuffer], {
        type: result.contentType,
      });
      return URL.createObjectURL(blob);
    },
    [actor],
  );

  const deleteFile = useCallback(
    async (objectId: string): Promise<void> => {
      if (!actor) return;
      await actor.deleteFile(objectId);
    },
    [actor],
  );

  // ── Ideas CRUD ───────────────────────────────────────────────────────────────

  const addIdea = useCallback(
    async (idea: Omit<Idea, "id">) => {
      if (!actor) return;
      try {
        const created = await actor.createIdea({
          name: idea.name,
          place: idea.place,
          problem: idea.problem,
          description: idea.description,
          deadline: idea.deadline,
          ideaType: idea.ideaType,
          status: idea.status,
          youtubeUrl: idea.youtubeUrl,
          instaUrl: idea.instaUrl,
          googleUrl: idea.googleUrl,
          photoUrl: idea.photoUrl,
        });
        setIdeas((prev) => [...prev, mapIdea(created)]);
        void loadDashboardStats();
        toast.success("Idea created successfully");
      } catch (err) {
        toast.error(
          `Failed to create idea: ${err instanceof Error ? err.message : "Unknown error"}`,
        );
      }
    },
    [actor, loadDashboardStats],
  );

  const updateIdea = useCallback(
    async (id: bigint, updates: Omit<Idea, "id">) => {
      if (!actor) return;
      try {
        const result = await actor.updateIdea(id, {
          name: updates.name,
          place: updates.place,
          problem: updates.problem,
          description: updates.description,
          deadline: updates.deadline,
          ideaType: updates.ideaType,
          status: updates.status,
          youtubeUrl: updates.youtubeUrl,
          instaUrl: updates.instaUrl,
          googleUrl: updates.googleUrl,
          photoUrl: updates.photoUrl,
        });
        if (result.__kind__ === "err") throw new Error(result.err);
        setIdeas((prev) =>
          prev.map((i) => (i.id === id ? { ...i, ...updates, id } : i)),
        );
        void loadDashboardStats();
        toast.success("Idea updated successfully");
      } catch (err) {
        toast.error(
          `Failed to update idea: ${err instanceof Error ? err.message : "Unknown error"}`,
        );
      }
    },
    [actor, loadDashboardStats],
  );

  const removeIdea = useCallback(
    async (id: bigint) => {
      if (!actor) return;
      try {
        await actor.deleteIdea(id);
        setIdeas((prev) => prev.filter((i) => i.id !== id));
        void loadDashboardStats();
        toast.success("Idea deleted");
      } catch (err) {
        toast.error(
          `Failed to delete idea: ${err instanceof Error ? err.message : "Unknown error"}`,
        );
      }
    },
    [actor, loadDashboardStats],
  );

  // ── Incubator CRUD ───────────────────────────────────────────────────────────

  const addIncubatorProject = useCallback(
    async (project: Omit<IncubatorProject, "id">) => {
      if (!actor) return;
      try {
        const created = await actor.createIncubatorProject({
          name: project.name,
          youtubeUrl: project.youtubeUrl,
          instaUrl: project.instaUrl,
          googleUrl: project.googleUrl,
          imageUrl: project.imageUrl,
          pptFileName: project.pptFileName,
          docFileName: project.docFileName,
          srcFileName: project.srcFileName,
        });
        setIncubatorProjects((prev) => [...prev, mapProject(created)]);
        void loadDashboardStats();
        toast.success("Project registered in incubator");
      } catch (err) {
        toast.error(
          `Failed to register project: ${err instanceof Error ? err.message : "Unknown error"}`,
        );
      }
    },
    [actor, loadDashboardStats],
  );

  const updateIncubatorProject = useCallback(
    async (id: bigint, updates: Omit<IncubatorProject, "id">) => {
      if (!actor) return;
      try {
        const result = await actor.updateIncubatorProject(id, {
          name: updates.name,
          youtubeUrl: updates.youtubeUrl,
          instaUrl: updates.instaUrl,
          googleUrl: updates.googleUrl,
          imageUrl: updates.imageUrl,
          pptFileName: updates.pptFileName,
          docFileName: updates.docFileName,
          srcFileName: updates.srcFileName,
        });
        if (result.__kind__ === "err") throw new Error(result.err);
        setIncubatorProjects((prev) =>
          prev.map((p) => (p.id === id ? { ...p, ...updates, id } : p)),
        );
        void loadDashboardStats();
        toast.success("Project updated successfully");
      } catch (err) {
        toast.error(
          `Failed to update project: ${err instanceof Error ? err.message : "Unknown error"}`,
        );
      }
    },
    [actor, loadDashboardStats],
  );

  const removeIncubatorProject = useCallback(
    async (id: bigint) => {
      if (!actor) return;
      try {
        await actor.deleteIncubatorProject(id);
        setIncubatorProjects((prev) => prev.filter((p) => p.id !== id));
        void loadDashboardStats();
        toast.success("Project removed");
      } catch (err) {
        toast.error(
          `Failed to remove project: ${err instanceof Error ? err.message : "Unknown error"}`,
        );
      }
    },
    [actor, loadDashboardStats],
  );

  // ── Tasks CRUD ───────────────────────────────────────────────────────────────

  const addTask = useCallback(
    async (task: Omit<Task, "id">) => {
      if (!actor) return;
      try {
        const created = await actor.createTask({
          description: task.description,
          taskDate: task.taskDate,
          taskTime: task.taskTime,
        });
        setTasks((prev) => [...prev, mapTask(created)]);
        toast.success("Task added to mission log");
      } catch (err) {
        toast.error(
          `Failed to add task: ${err instanceof Error ? err.message : "Unknown error"}`,
        );
      }
    },
    [actor],
  );

  const updateTask = useCallback(
    async (id: bigint, updates: Omit<Task, "id">) => {
      if (!actor) return;
      try {
        const result = await actor.updateTask(id, {
          description: updates.description,
          taskDate: updates.taskDate,
          taskTime: updates.taskTime,
        });
        if (result.__kind__ === "err") throw new Error(result.err);
        setTasks((prev) =>
          prev.map((t) => (t.id === id ? { ...t, ...updates, id } : t)),
        );
        toast.success("Task updated");
      } catch (err) {
        toast.error(
          `Failed to update task: ${err instanceof Error ? err.message : "Unknown error"}`,
        );
      }
    },
    [actor],
  );

  const removeTask = useCallback(
    async (id: bigint) => {
      if (!actor) return;
      try {
        await actor.deleteTask(id);
        setTasks((prev) => prev.filter((t) => t.id !== id));
        toast.success("Task removed");
      } catch (err) {
        toast.error(
          `Failed to remove task: ${err instanceof Error ? err.message : "Unknown error"}`,
        );
      }
    },
    [actor],
  );

  // ── Deployments CRUD ─────────────────────────────────────────────────────────

  const addDeployment = useCallback(
    async (dep: Omit<Deployment, "id">) => {
      if (!actor) return;
      try {
        const created = await actor.createDeployment({
          name: dep.name,
          deployedUrl: dep.deployedUrl,
          githubUrl: dep.githubUrl,
          engineType: dep.engineType,
          architecture: dep.architecture,
        });
        setDeployments((prev) => [...prev, mapDeployment(created)]);
        void loadDashboardStats();
        toast.success("Deployment logged successfully");
      } catch (err) {
        toast.error(
          `Failed to log deployment: ${err instanceof Error ? err.message : "Unknown error"}`,
        );
      }
    },
    [actor, loadDashboardStats],
  );

  const updateDeployment = useCallback(
    async (id: bigint, updates: Omit<Deployment, "id">) => {
      if (!actor) return;
      try {
        const result = await actor.updateDeployment(id, {
          name: updates.name,
          deployedUrl: updates.deployedUrl,
          githubUrl: updates.githubUrl,
          engineType: updates.engineType,
          architecture: updates.architecture,
        });
        if (result.__kind__ === "err") throw new Error(result.err);
        setDeployments((prev) =>
          prev.map((d) => (d.id === id ? { ...d, ...updates, id } : d)),
        );
        void loadDashboardStats();
        toast.success("Deployment updated");
      } catch (err) {
        toast.error(
          `Failed to update deployment: ${err instanceof Error ? err.message : "Unknown error"}`,
        );
      }
    },
    [actor, loadDashboardStats],
  );

  const removeDeployment = useCallback(
    async (id: bigint) => {
      if (!actor) return;
      try {
        await actor.deleteDeployment(id);
        setDeployments((prev) => prev.filter((d) => d.id !== id));
        void loadDashboardStats();
        toast.success("Deployment removed");
      } catch (err) {
        toast.error(
          `Failed to remove deployment: ${err instanceof Error ? err.message : "Unknown error"}`,
        );
      }
    },
    [actor, loadDashboardStats],
  );

  // ── WebLinks CRUD ────────────────────────────────────────────────────────────

  const addWebLink = useCallback(
    async (link: Omit<WebLink, "id">) => {
      if (!actor) return;
      try {
        const created = await actor.addWebLink(link.title, link.url);
        setWebLinks((prev) => [...prev, mapWebLink(created)]);
        toast.success("Web link added");
      } catch (err) {
        toast.error(
          `Failed to add link: ${err instanceof Error ? err.message : "Unknown error"}`,
        );
      }
    },
    [actor],
  );

  const removeWebLink = useCallback(
    async (id: bigint) => {
      if (!actor) return;
      try {
        await actor.deleteWebLink(id);
        setWebLinks((prev) => prev.filter((l) => l.id !== id));
        toast.success("Link removed");
      } catch (err) {
        toast.error(
          `Failed to remove link: ${err instanceof Error ? err.message : "Unknown error"}`,
        );
      }
    },
    [actor],
  );

  return {
    // Data
    ideas,
    incubatorProjects,
    deployments,
    tasks,
    webLinks,
    dashboardStats,
    // Loading states
    ideasLoading,
    projectsLoading,
    deploymentsLoading,
    tasksLoading,
    settingsLoading,
    statsLoading,
    // Refresh
    refreshAll,
    loadDashboardStats,
    // Ideas
    addIdea,
    updateIdea,
    removeIdea,
    // Incubator
    addIncubatorProject,
    updateIncubatorProject,
    removeIncubatorProject,
    // Tasks
    addTask,
    updateTask,
    removeTask,
    // Deployments
    addDeployment,
    updateDeployment,
    removeDeployment,
    // WebLinks
    addWebLink,
    removeWebLink,
    // File ops
    uploadIdeaPhoto,
    uploadIncubatorImage,
    uploadIncubatorPpt,
    uploadIncubatorDoc,
    uploadIncubatorSrc,
    uploadProfilePhoto,
    downloadFile,
    deleteFile,
  };
}
