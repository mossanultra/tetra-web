"use client";

import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  ReactNode,
} from "react";

import { UserProfile } from "@/src/features/user/types/UserProfile";
import { getProfile } from "@/src/features/user/api/getProfile";
import { updateProfile as apiUpdateProfile } from "@/src/features/user/api/updateProfile";

interface UpdateProfileParams {
  nickname: string;
  bio: string;
  imageUrl: string | null;
  url: string;
}

interface ProfileContextType {
  data: UserProfile | null;
  isFetching: boolean;
  isOwnProfile: boolean;
  error: string | null;
  fetchProfile: (userId?: string) => Promise<void>;
  updateProfile: (params: UpdateProfileParams) => Promise<boolean>;
  clearProfile: () => void;
}

const ProfileContext = createContext<ProfileContextType | undefined>(undefined);

export function ProfileProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<UserProfile | null>(null);
  const [isFetching, setIsFetching] = useState(false);
  const [isOwnProfile, setIsOwnProfile] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchProfile = useCallback(async (userId?: string) => {
    try {
      setIsFetching(true);
      setError(null);

      const targetUserId = userId || "@self";
      const profile = await getProfile(targetUserId);
      setData(profile);

      // 自分自身かどうか判定
      const selfData = await getProfile("@self");
      setIsOwnProfile(!userId || selfData.profileId === profile.profileId);
    } catch (e) {
      setError(
        e instanceof Error ? e.message : "プロフィールの取得に失敗しました",
      );
    } finally {
      setIsFetching(false);
    }
  }, []);

  const updateProfile = useCallback(
    async (params: UpdateProfileParams): Promise<boolean> => {
      try {
        setError(null);
        const { nickname, bio, imageUrl, url } = params;

        await apiUpdateProfile({
          nickname,
          bio,
          imageUrl,
          url,
        });

        // Update local state immediately
        await fetchProfile();
        return true;
      } catch (e) {
        setError(e instanceof Error ? e.message : "更新に失敗しました");
        return false;
      }
    },
    [fetchProfile],
  );

  const clearProfile = useCallback(() => {
    setData(null);
    setIsFetching(false);
    setIsOwnProfile(false);
    setError(null);
  }, []);

  return (
    <ProfileContext.Provider
      value={{
        data,
        isFetching,
        isOwnProfile,
        error,
        fetchProfile,
        updateProfile,
        clearProfile,
      }}
    >
      {children}
    </ProfileContext.Provider>
  );
}

export function useProfileContext() {
  const context = useContext(ProfileContext);
  if (context === undefined) {
    throw new Error("useProfileContext must be used within a ProfileProvider");
  }
  return context;
}
