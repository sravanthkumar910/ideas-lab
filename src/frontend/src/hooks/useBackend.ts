import { useCallback, useEffect, useState } from "react";
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

// Stable mappers outside hook — no dependency issues
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

  // Load everything when actor becomes ready
  useEffect(() => {
    if (!actorReady || !actor) return;
    loadIdeas();
    loadProjects();
    loadDeployments();
    loadTasks();
    loadWebLinks();
    loadDashboardStats();
  }, [
    actorReady,
    actor,
    loadIdeas,
    loadProjects,
    loadDeployments,
    loadTasks,
    loadWebLinks,
    loadDashboardStats,
  ]);

  // ── Ideas CRUD ─────────────────────────────────────────────────────────────
  const addIdea = useCallback(
    async (idea: Omit<Idea, "id">) => {
      if (!actor) return;
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
    },
    [actor, loadDashboardStats],
  );

  const removeIdea = useCallback(
    async (id: bigint) => {
      if (!actor) return;
      await actor.deleteIdea(id);
      setIdeas((prev) => prev.filter((i) => i.id !== id));
      void loadDashboardStats();
    },
    [actor, loadDashboardStats],
  );

  // ── Incubator CRUD ─────────────────────────────────────────────────────────
  const addIncubatorProject = useCallback(
    async (project: Omit<IncubatorProject, "id">) => {
      if (!actor) return;
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
    },
    [actor, loadDashboardStats],
  );

  const removeIncubatorProject = useCallback(
    async (id: bigint) => {
      if (!actor) return;
      await actor.deleteIncubatorProject(id);
      setIncubatorProjects((prev) => prev.filter((p) => p.id !== id));
      void loadDashboardStats();
    },
    [actor, loadDashboardStats],
  );

  // ── Tasks CRUD ─────────────────────────────────────────────────────────────
  const addTask = useCallback(
    async (task: Omit<Task, "id">) => {
      if (!actor) return;
      const created = await actor.createTask({
        description: task.description,
        taskDate: task.taskDate,
        taskTime: task.taskTime,
      });
      setTasks((prev) => [...prev, mapTask(created)]);
    },
    [actor],
  );

  const removeTask = useCallback(
    async (id: bigint) => {
      if (!actor) return;
      await actor.deleteTask(id);
      setTasks((prev) => prev.filter((t) => t.id !== id));
    },
    [actor],
  );

  // ── Deployments CRUD ───────────────────────────────────────────────────────
  const addDeployment = useCallback(
    async (dep: Omit<Deployment, "id">) => {
      if (!actor) return;
      const created = await actor.createDeployment({
        name: dep.name,
        deployedUrl: dep.deployedUrl,
        githubUrl: dep.githubUrl,
        engineType: dep.engineType,
        architecture: dep.architecture,
      });
      setDeployments((prev) => [...prev, mapDeployment(created)]);
      void loadDashboardStats();
    },
    [actor, loadDashboardStats],
  );

  const removeDeployment = useCallback(
    async (id: bigint) => {
      if (!actor) return;
      await actor.deleteDeployment(id);
      setDeployments((prev) => prev.filter((d) => d.id !== id));
      void loadDashboardStats();
    },
    [actor, loadDashboardStats],
  );

  // ── WebLinks CRUD ──────────────────────────────────────────────────────────
  const addWebLink = useCallback(
    async (link: Omit<WebLink, "id">) => {
      if (!actor) return;
      const created = await actor.addWebLink(link.title, link.url);
      setWebLinks((prev) => [...prev, mapWebLink(created)]);
    },
    [actor],
  );

  const removeWebLink = useCallback(
    async (id: bigint) => {
      if (!actor) return;
      await actor.deleteWebLink(id);
      setWebLinks((prev) => prev.filter((l) => l.id !== id));
    },
    [actor],
  );

  return {
    ideas,
    incubatorProjects,
    deployments,
    tasks,
    webLinks,
    dashboardStats,
    ideasLoading,
    projectsLoading,
    deploymentsLoading,
    tasksLoading,
    settingsLoading,
    statsLoading,
    addIdea,
    removeIdea,
    addIncubatorProject,
    removeIncubatorProject,
    addTask,
    removeTask,
    addDeployment,
    removeDeployment,
    addWebLink,
    removeWebLink,
    loadDashboardStats,
  };
}
