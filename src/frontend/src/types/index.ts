// Frontend types aligned with backend field names from backend.d.ts

export type IdeaStatus = "Drafting" | "Researching" | "Reviewing";
export type IdeaType = "Software" | "Hardware" | "Hybrid";

export interface Idea {
  id: bigint;
  name: string;
  place: string;
  problem: string;
  description: string;
  deadline: string;
  ideaType: string;
  status: string;
  youtubeUrl: string;
  instaUrl: string;
  googleUrl: string;
  photoUrl?: string;
}

export interface IncubatorProject {
  id: bigint;
  name: string;
  youtubeUrl: string;
  instaUrl: string;
  googleUrl: string;
  imageUrl?: string;
  pptFileName?: string;
  docFileName?: string;
  srcFileName?: string;
  createdAt?: bigint;
}

export type EngineType =
  | "ICP"
  | "AWS"
  | "GCP"
  | "Azure"
  | "Vercel"
  | "Netlify"
  | "Other";
export type Architecture =
  | "Motoko"
  | "Rust"
  | "TypeScript"
  | "Python"
  | "Go"
  | "Other";

export interface Deployment {
  id: bigint;
  name: string;
  deployedUrl: string;
  githubUrl: string;
  engineType: string;
  architecture: string;
  createdAt?: bigint;
}

export interface Task {
  id: bigint;
  description: string;
  taskTime: string;
  taskDate: string;
}

export interface WebLink {
  id: bigint;
  title: string;
  url: string;
}

export interface UserProfile {
  displayName: string;
  email: string;
  profilePhotoUrl?: string;
}

export type TabId =
  | "overview"
  | "ideas"
  | "incubator"
  | "tasks"
  | "uploads"
  | "settings";

export interface DashboardStats {
  liveProjects: number;
  completedProjects: number;
  pendingIdeas: number;
}
