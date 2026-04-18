import { useState } from "react";
import type { UserProfile } from "../types";

const DEFAULT_PROFILE: UserProfile = {
  name: "Dr. Jane Doe",
  email: "jane.doe@innovation.lab",
  photo:
    "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?ixlib=rb-1.2.1&auto=format&fit=crop&w=250&q=80",
};

export function useAuth() {
  const [loggedIn, setLoggedIn] = useState(false);
  const [profile, setProfile] = useState<UserProfile>(DEFAULT_PROFILE);

  const login = (username: string) => {
    setProfile((prev) => ({ ...prev, name: username }));
    setLoggedIn(true);
  };

  const logout = () => {
    setLoggedIn(false);
  };

  const updateProfile = (updates: Partial<UserProfile>) => {
    setProfile((prev) => ({ ...prev, ...updates }));
  };

  return { loggedIn, profile, login, logout, updateProfile };
}
