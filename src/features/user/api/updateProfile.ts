type UpdateProfileParams = {
  nickname: string;
  bio: string;
  imageUrl: string | null;
  url: string;
};

export const updateProfile = async ({
  nickname,
  bio,
  imageUrl,
  url,
}: UpdateProfileParams): Promise<void> => {
  const res = await fetch("/api/user/profile", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      userName: nickname,
      introduction: bio,
      imageUrl,
      url,
    }),
  });

  if (!res.ok) {
    const errorData = await res.json();
    throw new Error(errorData.error || "更新に失敗しました");
  }
};
