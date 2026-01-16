"use client";

import { useState, useCallback } from "react";
import { useProfileContext, UserProfile } from "@/src/contexts/ProfileContext";

export function useProfile(userId?: string) {
  const context = useProfileContext();

  /* -------------------------------------------------------------
   * Local state for fetching other user's profile
   * If userId is provided, we fetch data locally to avoid updating
   * the global ProfileContext (which affects Header, etc.)
   * ------------------------------------------------------------- */
  const [localData, setLocalData] = useState<UserProfile | null>(null);
  const [localLoading, setLocalLoading] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  const fetchLocalProfile = useCallback(async () => {
    if (!userId) return;
    try {
      setLocalLoading(true);
      setLocalError(null);

      // Handle @self explicitly if passed in dynamic route
      const endpoint =
        userId === "@self"
          ? `/api/user/profile/@self`
          : `/api/user/profile/${userId}`;

      const res = await fetch(endpoint);
      if (!res.ok) throw new Error(`プロフィール取得に失敗 (${res.status})`);

      const profile = (await res.json()) as UserProfile;
      setLocalData(profile);
    } catch (e) {
      setLocalError(
        e instanceof Error ? e.message : "プロフィールの取得に失敗しました"
      );
    } finally {
      setLocalLoading(false);
    }
  }, [userId]);

  // Derived state for own profile check
  const isOwnProfileLocal =
    context.data?.profileId && localData?.profileId
      ? context.data.profileId === localData.profileId
      : userId === "@self"; // fallback

  // If userId is NOT provided (or undefined/null), use Context (Global/My Profile)
  if (!userId) {
    return {
      data: context.data,
      isFetching: context.isFetching,
      isOwnProfile: context.isOwnProfile,
      error: context.error,
      fetchProfile: context.fetchProfile,
      updateProfile: context.updateProfile,
      clearProfile: context.clearProfile,
    };
  }

  // If userId IS provided, use Local State
  return {
    data: localData,
    isFetching: localLoading,
    isOwnProfile: isOwnProfileLocal,
    error: localError,
    // Provide a signature matching context.fetchProfile but using local logic
    fetchProfile: async (_?: string) => {
      await fetchLocalProfile();
    },
    // For update, if it's own profile we can use context.updateProfile
    // otherwise we probably shouldn't allow updating others?
    updateProfile: context.updateProfile,
    clearProfile: () => setLocalData(null),
  };
}
