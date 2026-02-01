import { UserProfile } from "../types/UserProfile";

export const getProfile = async (userId: string): Promise<UserProfile> => {
  const endpoint =
    userId === "@self"
      ? `/api/user/profile/@self`
      : `/api/user/profile/${userId}`;

  const res = await fetch(endpoint);

  if (!res.ok) throw new Error(`プロフィール取得に失敗 (${res.status})`);

  return res.json();
};
