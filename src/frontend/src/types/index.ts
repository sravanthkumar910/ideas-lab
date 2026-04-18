export type IdeaStatus = "Drafting" | "Researching" | "Reviewing";
export type IdeaType = "Software" | "Hardware" | "Hybrid";

export interface Idea {
  id: number;
  name: string;
  place: string;
  problem: string;
  description: string;
  deadline: string;
  type: IdeaType;
  status: IdeaStatus;
  youtube: string;
  insta: string;
  google: string;
  photo: string | null;
}

export interface IncubatorProject {
  id: number;
  name: string;
  youtube: string;
  insta: string;
  google: string;
  photo: string | null;
  ppt: { url: string; name: string } | null;
  doc: { url: string; name: string } | null;
  src: { url: string; name: string } | null;
}

export type EngineType = "Frontend" | "Backend" | "Full-Stack" | "Mobile App";
export type Architecture = "Dynamic" | "Static" | "Serverless";

export interface Deployment {
  id: number;
  name: string;
  url: string;
  github: string;
  engine: EngineType;
  arch: Architecture;
}

export interface Task {
  id: number;
  name: string;
  time: string;
  date: string;
  done: boolean;
}

export interface WebLink {
  id: number;
  title: string;
  url: string;
}

export interface UserProfile {
  name: string;
  email: string;
  photo: string;
}

export type TabId =
  | "overview"
  | "ideas"
  | "incubator"
  | "tasks"
  | "uploads"
  | "settings";

export interface DashboardStats {
  live: number;
  completed: number;
  pending: number;
}
