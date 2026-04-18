import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export type Timestamp = bigint;
export interface Deployment {
    id: bigint;
    name: string;
    createdAt: Timestamp;
    architecture: string;
    githubUrl: string;
    deployedUrl: string;
    callerId: UserId;
    engineType: string;
}
export interface CreateIdeaParams {
    status: string;
    ideaType: string;
    name: string;
    googleUrl: string;
    instaUrl: string;
    description: string;
    photoUrl?: string;
    deadline: string;
    place: string;
    youtubeUrl: string;
    problem: string;
}
export interface UpdateTaskParams {
    description: string;
    taskDate: string;
    taskTime: string;
}
export interface Task {
    id: bigint;
    createdAt: Timestamp;
    description: string;
    taskDate: string;
    taskTime: string;
    callerId: UserId;
}
export interface WebLink {
    id: bigint;
    url: string;
    title: string;
    callerId: UserId;
}
export interface IncubatorProject {
    id: bigint;
    name: string;
    createdAt: Timestamp;
    pptFileName?: string;
    srcFileName?: string;
    googleUrl: string;
    instaUrl: string;
    callerId: UserId;
    imageUrl?: string;
    docFileName?: string;
    youtubeUrl: string;
}
export interface Idea {
    id: bigint;
    status: string;
    ideaType: string;
    name: string;
    createdAt: Timestamp;
    googleUrl: string;
    instaUrl: string;
    description: string;
    photoUrl?: string;
    deadline: string;
    callerId: UserId;
    place: string;
    youtubeUrl: string;
    problem: string;
}
export interface CreateTaskParams {
    description: string;
    taskDate: string;
    taskTime: string;
}
export interface UpdateIdeaParams {
    status: string;
    ideaType: string;
    name: string;
    googleUrl: string;
    instaUrl: string;
    description: string;
    photoUrl?: string;
    deadline: string;
    place: string;
    youtubeUrl: string;
    problem: string;
}
export interface DashboardStats {
    pendingIdeas: bigint;
    liveProjects: bigint;
    completedProjects: bigint;
}
export interface CreateIncubatorParams {
    name: string;
    pptFileName?: string;
    srcFileName?: string;
    googleUrl: string;
    instaUrl: string;
    imageUrl?: string;
    docFileName?: string;
    youtubeUrl: string;
}
export type UserId = Principal;
export interface UpdateDeploymentParams {
    name: string;
    architecture: string;
    githubUrl: string;
    deployedUrl: string;
    engineType: string;
}
export interface UpdateIncubatorParams {
    name: string;
    pptFileName?: string;
    srcFileName?: string;
    googleUrl: string;
    instaUrl: string;
    imageUrl?: string;
    docFileName?: string;
    youtubeUrl: string;
}
export interface CreateDeploymentParams {
    name: string;
    architecture: string;
    githubUrl: string;
    deployedUrl: string;
    engineType: string;
}
export interface UserProfile {
    principal: UserId;
    displayName: string;
    email: string;
    profilePhotoUrl?: string;
}
export interface backendInterface {
    addWebLink(title: string, url: string): Promise<WebLink>;
    createDeployment(params: CreateDeploymentParams): Promise<Deployment>;
    createIdea(params: CreateIdeaParams): Promise<Idea>;
    createIncubatorProject(params: CreateIncubatorParams): Promise<IncubatorProject>;
    createTask(params: CreateTaskParams): Promise<Task>;
    deleteDeployment(id: bigint): Promise<boolean>;
    deleteIdea(id: bigint): Promise<boolean>;
    deleteIncubatorProject(id: bigint): Promise<boolean>;
    deleteTask(id: bigint): Promise<boolean>;
    deleteWebLink(id: bigint): Promise<boolean>;
    getDashboardStats(): Promise<DashboardStats>;
    getDeployments(): Promise<Array<Deployment>>;
    getIdeas(): Promise<Array<Idea>>;
    getIncubatorProjects(): Promise<Array<IncubatorProject>>;
    getTasks(): Promise<Array<Task>>;
    getUserProfile(): Promise<UserProfile | null>;
    getWebLinks(): Promise<Array<WebLink>>;
    saveUserProfile(displayName: string, email: string, profilePhotoUrl: string | null): Promise<UserProfile>;
    updateDeployment(id: bigint, params: UpdateDeploymentParams): Promise<{
        __kind__: "ok";
        ok: null;
    } | {
        __kind__: "err";
        err: string;
    }>;
    updateIdea(id: bigint, params: UpdateIdeaParams): Promise<{
        __kind__: "ok";
        ok: null;
    } | {
        __kind__: "err";
        err: string;
    }>;
    updateIncubatorProject(id: bigint, params: UpdateIncubatorParams): Promise<{
        __kind__: "ok";
        ok: null;
    } | {
        __kind__: "err";
        err: string;
    }>;
    updateTask(id: bigint, params: UpdateTaskParams): Promise<{
        __kind__: "ok";
        ok: null;
    } | {
        __kind__: "err";
        err: string;
    }>;
}
