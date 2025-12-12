"use client";

import { useState, useCallback } from "react";

export interface UserProfile {
  profileId: string;
  userName: string;
  imageUrl: string;
  introduction: string;
}

export function useProfile(userId?: string) {
  const [data, setData] = useState<UserProfile | null>(null);
  const [isFetching, setIsFetching] = useState(true);
  const [isOwnProfile, setIsOwnProfile] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * プロフィール取得
   */
  const fetchProfile = useCallback(async () => {
    try {
      setIsFetching(true);
      setError(null);

      const endpoint = userId
        ? `/api/user/profile/${userId}`
        : `/api/user/profile/@self`;

      const res = await fetch(endpoint);

      if (!res.ok) throw new Error(`プロフィール取得に失敗 (${res.status})`);

      const profile = (await res.json()) as UserProfile;
      setData(profile);

      // 自分自身かどうか判定
      const selfRes = await fetch(`/api/user/profile/@self`);
      if (selfRes.ok) {
        const selfData = (await selfRes.json()) as UserProfile;
        setIsOwnProfile(!userId || selfData.profileId === profile.profileId);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "プロフィールの取得に失敗しました");
    } finally {
      setIsFetching(false);
    }
  }, [userId]);

  /**
   * プロフィール更新
   */
  const updateProfile = useCallback(
    async (params: { nickname: string; bio: string; imageBase64: string | null }) => {
      try {
        const { nickname, bio, imageBase64 } = params;

        if (!nickname.trim()) {
          throw new Error("ニックネームを入力してください");
        }

        const res = await fetch(`/api/user/profile`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            userName: nickname,
            introduction: bio,
            imageBase64,
          }),
        });

        if (!res.ok) {
          const err = await res.json().catch(() => ({}));
          throw new Error(err.message ?? `更新エラー (${res.status})`);
        }

        await fetchProfile();
        return true;
      } catch (e) {
        setError(e instanceof Error ? e.message : "更新中にエラーが発生しました");
        return false;
      }
    },
    [fetchProfile]
  );

  return {
    data,
    isFetching,
    isOwnProfile,
    error,
    fetchProfile,
    updateProfile,
    setError,
  };
}
