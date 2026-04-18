import { useState } from "react";
import type {
  Deployment,
  Idea,
  IncubatorProject,
  Task,
  WebLink,
} from "../types";

export function useBackend() {
  const [ideas, setIdeas] = useState<Idea[]>([]);
  const [incubatorProjects, setIncubatorProjects] = useState<
    IncubatorProject[]
  >([]);
  const [deployments, setDeployments] = useState<Deployment[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [webLinks, setWebLinks] = useState<WebLink[]>([
    {
      id: 1,
      title: "Personal Portfolio",
      url: "https://portfolio.example.com",
    },
  ]);

  const addIdea = (idea: Omit<Idea, "id">) => {
    setIdeas((prev) => [...prev, { ...idea, id: Date.now() }]);
  };

  const removeIdea = (id: number) => {
    setIdeas((prev) => {
      const idea = prev.find((i) => i.id === id);
      if (idea?.photo) URL.revokeObjectURL(idea.photo);
      return prev.filter((i) => i.id !== id);
    });
  };

  const addIncubatorProject = (project: Omit<IncubatorProject, "id">) => {
    setIncubatorProjects((prev) => [...prev, { ...project, id: Date.now() }]);
  };

  const removeIncubatorProject = (id: number) => {
    setIncubatorProjects((prev) => {
      const p = prev.find((x) => x.id === id);
      if (p) {
        if (p.photo) URL.revokeObjectURL(p.photo);
        if (p.ppt) URL.revokeObjectURL(p.ppt.url);
        if (p.doc) URL.revokeObjectURL(p.doc.url);
        if (p.src) URL.revokeObjectURL(p.src.url);
      }
      return prev.filter((x) => x.id !== id);
    });
  };

  const addDeployment = (deployment: Omit<Deployment, "id">) => {
    setDeployments((prev) => [...prev, { ...deployment, id: Date.now() }]);
  };

  const removeDeployment = (id: number) => {
    setDeployments((prev) => prev.filter((d) => d.id !== id));
  };

  const addTask = (task: Omit<Task, "id">) => {
    setTasks((prev) => [...prev, { ...task, id: Date.now() }]);
  };

  const toggleTask = (id: number) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, done: !t.done } : t)),
    );
  };

  const removeTask = (id: number) => {
    setTasks((prev) => prev.filter((t) => t.id !== id));
  };

  const addWebLink = (link: Omit<WebLink, "id">) => {
    setWebLinks((prev) => [...prev, { ...link, id: Date.now() }]);
  };

  const removeWebLink = (id: number) => {
    setWebLinks((prev) => prev.filter((l) => l.id !== id));
  };

  return {
    ideas,
    incubatorProjects,
    deployments,
    tasks,
    webLinks,
    addIdea,
    removeIdea,
    addIncubatorProject,
    removeIncubatorProject,
    addDeployment,
    removeDeployment,
    addTask,
    toggleTask,
    removeTask,
    addWebLink,
    removeWebLink,
  };
}
