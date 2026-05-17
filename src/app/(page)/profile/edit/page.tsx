"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AlertMessage } from "@/src/features/user/components/AlertMessage";
import { FormInput } from "@/src/features/user/components/FormInput";
import { FormTextarea } from "@/src/features/user/components/FormTextarea";
import { ProfileImageUpload } from "@/src/features/user/components/ProfileImageUpload";
import { SuccessToast } from "@/src/features/user/components/SuccessToast";
import { useImageUpload } from "@/src/features/user/hooks/useImageUpload";
import { useProfile } from "@/src/features/user/hooks/useProfile";
import { useS3Upload } from "@/src/features/upload/hooks/useS3Upload";

const ProfileEditPage: React.FC = () => {
  const router = useRouter();

  const {
    data,
    isFetching,
    error: profileError,
    fetchProfile,
    updateProfile,
  } = useProfile("@self");

  const {
    imagePreview,
    handleImageChange,
    handleImageRemove,
    setInitialPreview,
    getImageFile,
  } = useImageUpload();
  const { uploadToS3 } = useS3Upload();

  const [isLoading, setIsLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [userData, setUserData] = useState({
    nickname: "",
    bio: "",
    url: "",
  });

  useEffect(() => {
    fetchProfile();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (data) {
      setUserData({
        nickname: data.userName,
        bio: data.introduction,
        url: data.url,
      });
      if (data.imageUrl) setInitialPreview(data.imageUrl);
      else setInitialPreview(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setUserData((prev) => ({ ...prev, [name]: value }));
  };

  const handleCancel = () => {
    router.push("/profile/@self");
  };

  const handleSubmit = async () => {
    setIsLoading(true);
    setError(null);

    try {
      if (!userData.nickname.trim()) {
        throw new Error("ニックネームを入力してください");
      }

      let imageUrl: string | null = null;
      const imageFile = getImageFile();

      // Upload image to S3 if present
      if (imageFile) {
        imageUrl = await uploadToS3(imageFile);
        if (!imageUrl) {
          throw new Error("画像のアップロードに失敗しました");
        }
      }

      const success = await updateProfile({
        nickname: userData.nickname,
        bio: userData.bio,
        imageUrl,
        url: userData.url,
      });

      if (!success) {
        throw new Error("更新に失敗しました");
      }

      await fetchProfile();

      setShowSuccess(true);
      setTimeout(() => {
        router.push("/profile/@self");
      }, 1500);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "予期せぬエラーが発生しました"
      );
    } finally {
      setIsLoading(false);
    }
  };

  const displayError = profileError ?? null;

  if (isFetching) {
    return (
      <div className="max-w-3xl mx-auto py-10 px-4 sm:px-6 lg:px-8 animate-pulse">
        <div className="mb-8 text-center">
          <div className="h-10 bg-gray-200 rounded w-48 mx-auto mb-2"></div>
        </div>

        <div className="flex flex-col gap-8 max-w-xl mx-auto">
          <div className="flex flex-col items-center gap-4">
            <div className="w-32 h-32 bg-gray-200 rounded-full"></div>
            <div className="h-4 bg-gray-200 rounded w-24"></div>
          </div>

          <div className="space-y-6">
            <div>
              <div className="h-4 bg-gray-200 rounded w-20 mb-2"></div>
              <div className="h-12 bg-gray-200 rounded w-full"></div>
            </div>
            <div>
              <div className="h-4 bg-gray-200 rounded w-16 mb-2"></div>
              <div className="h-12 bg-gray-200 rounded w-full"></div>
            </div>
            <div>
              <div className="h-4 bg-gray-200 rounded w-24 mb-2"></div>
              <div className="h-32 bg-gray-200 rounded w-full"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="absolute inset-0 flex flex-col bg-gray-50 md:max-w-2xl md:mx-auto md:w-full md:border-x md:border-gray-200 md:bg-white md:shadow-sm">
      <div className="flex-shrink-0 bg-white px-4 py-3 flex items-center gap-3 border-b border-gray-100 sticky top-0 z-10">
        <button onClick={handleCancel} className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M10 4L6 8l4 4" stroke="#374151" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
        </button>
        <h1 className="text-sm font-black flex-1">プロフィールを編集</h1>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-5 bg-white">
        {displayError && (
          <div className="mb-6">
            <AlertMessage message={displayError} type="error" />
          </div>
        )}

        <div className="flex flex-col gap-6">
          <div className="flex justify-center mb-2">
            <ProfileImageUpload
              imagePreview={imagePreview}
              onImageChange={handleImageChange}
              onImageRemove={handleImageRemove}
              disabled={false}
              onError={(msg) => setError(msg)}
            />
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">ニックネーム</label>
              <input 
                type="text" 
                name="nickname"
                className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-gray-400 transition" 
                value={userData.nickname}
                onChange={handleChange}
                placeholder="ニックネーム"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">マイリンク</label>
              <input 
                type="text" 
                name="url"
                className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-gray-400 transition" 
                value={userData.url}
                onChange={handleChange}
                placeholder="https://..."
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">自己紹介</label>
              <textarea 
                name="bio"
                className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-gray-400 h-24 resize-none transition"
                value={userData.bio}
                onChange={handleChange}
                placeholder="よろしくお願いします"
              />
            </div>
          </div>

          <button 
            type="button"
            onClick={handleSubmit}
            disabled={isLoading}
            className="w-full h-11 text-white rounded-xl text-sm font-bold mt-2 shadow-md bg-brand disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2" 
          >
            {isLoading && <span className="w-4 h-4 border-2 border-white/30 rounded-full border-t-white animate-spin"></span>}
            保存して戻る
          </button>
        </div>
      </div>

      {showSuccess && (
        <SuccessToast
          title="更新完了"
          message="プロフィールを更新しました"
          position="top-right"
        />
      )}
    </div>
  );
};

export default ProfileEditPage;
