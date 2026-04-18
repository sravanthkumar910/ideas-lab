import { useActor, useInternetIdentity } from "@caffeineai/core-infrastructure";
import { useCallback, useEffect, useState } from "react";
import { createActor } from "../backend";
import type { UserProfile } from "../types";

export function useAuth() {
  const { isAuthenticated, isInitializing, identity, login, clear } =
    useInternetIdentity();
  const { actor, isFetching } = useActor(createActor);

  const [profile, setProfile] = useState<UserProfile>({
    displayName: "Innovator",
    email: "",
    profilePhotoUrl: undefined,
  });
  const [profileLoaded, setProfileLoaded] = useState(false);

  // Load profile from backend once actor is ready and user is authenticated
  useEffect(() => {
    if (!actor || isFetching || !isAuthenticated || profileLoaded) return;

    actor
      .getUserProfile()
      .then((p) => {
        if (p) {
          setProfile({
            displayName: p.displayName || "Innovator",
            email: p.email || "",
            profilePhotoUrl: p.profilePhotoUrl,
          });
        }
        setProfileLoaded(true);
      })
      .catch(() => {
        setProfileLoaded(true);
      });
  }, [actor, isFetching, isAuthenticated, profileLoaded]);

  // Reset on logout
  useEffect(() => {
    if (!isAuthenticated) {
      setProfileLoaded(false);
      setProfile({
        displayName: "Innovator",
        email: "",
        profilePhotoUrl: undefined,
      });
    }
  }, [isAuthenticated]);

  const updateProfile = useCallback(
    async (updates: Partial<UserProfile>) => {
      const merged = { ...profile, ...updates };
      setProfile(merged);

      if (!actor) return;
      try {
        const saved = await actor.saveUserProfile(
          merged.displayName,
          merged.email,
          merged.profilePhotoUrl ?? null,
        );
        setProfile({
          displayName: saved.displayName,
          email: saved.email,
          profilePhotoUrl: saved.profilePhotoUrl,
        });
      } catch {
        // profile state is already updated locally
      }
    },
    [actor, profile],
  );

  const logout = useCallback(() => {
    clear();
  }, [clear]);

  return {
    loggedIn: isAuthenticated && !isInitializing,
    isInitializing,
    profile,
    identity,
    actor,
    actorReady: !!actor && !isFetching,
    login,
    logout,
    updateProfile,
  };
}
