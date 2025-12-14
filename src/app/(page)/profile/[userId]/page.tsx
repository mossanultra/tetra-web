"use client";

import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { AlertMessage } from "@/src/features/user/components/AlertMessage";
import { FormInput } from "@/src/features/user/components/FormInput";
import { FormTextarea } from "@/src/features/user/components/FormTextarea";
import { ProfileImageUpload } from "@/src/features/user/components/ProfileImageUpload";
import { SuccessToast } from "@/src/features/user/components/SuccessToast";
import { useImageUpload } from "@/src/features/user/hooks/useImageUpload";
import { useProfile } from "@/src/features/user/hooks/useProfile";

const ProfilePage: React.FC = () => {
  const params = useParams();
  const userId = (params as { userId?: string })?.userId;

  // useProfile の戻り値名に合わせる
  const {
    data, // UserProfile | null
    isFetching,
    isOwnProfile,
    error: profileError,
    fetchProfile,
    updateProfile,
    setError,
  } = useProfile(userId);

  const {
    imagePreview,
    handleImageChange,
    handleImageRemove,
    setInitialPreview,
    getImageBase64,
  } = useImageUpload();

  // ローカル UI state
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  // form のコントロール値（編集中に使う）
  const [userData, setUserData] = useState({
    nickname: "",
    bio: "",
  });

  // プロフィール取得: 初回 & userId変更時
  useEffect(() => {
    fetchProfile();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]); // fetchProfile depends on userId internally; trigger when userId changes

  // original data が入ったらフォーム初期化
  useEffect(() => {
    if (data) {
      setUserData({
        nickname: data.userName,
        bio: data.introduction,
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

  const handleEdit = () => {
    setIsEditing(true);
    setError(null);
  };

  const handleCancel = () => {
    setIsEditing(false);
    setError(null);
    if (data) {
      setUserData({
        nickname: data.userName,
        bio: data.introduction,
      });
      if (data.imageUrl) setInitialPreview(data.imageUrl);
      else setInitialPreview(null);
    } else {
      setUserData({ nickname: "", bio: "" });
      setInitialPreview(null);
    }
  };

  const handleSubmit = async () => {
    setIsLoading(true);
    setError(null);

    try {
      if (!userData.nickname.trim()) {
        throw new Error("ニックネームを入力してください");
      }

      // useImageUpload のユーティリティで Base64 を取得
      const imageBase64 = await getImageBase64();

      const success = await updateProfile({
        nickname: userData.nickname,
        bio: userData.bio,
        imageBase64,
      });

      if (!success) {
        throw new Error("更新に失敗しました");
      }

      // fetchProfile は updateProfile 内で呼ばれる想定ですが、万が一のため再取得
      await fetchProfile();

      setShowSuccess(true);
      setIsEditing(false);
      setTimeout(() => setShowSuccess(false), 3000);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "予期せぬエラーが発生しました"
      );
    } finally {
      setIsLoading(false);
    }
  };

  // 表示中のエラーは hook の error を優先して表示
  const displayError = profileError ?? null;

  if (isFetching) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-600 via-purple-700 to-pink-500">
        <div className="text-center">
          <div className="inline-block w-12 h-12 border-4 border-white/30 rounded-full border-t-white animate-spin"></div>
          <p className="mt-4 text-white text-sm">読み込み中...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br">
      <div className="max-w-[480px] w-full bg-white rounded-xl shadow-[0_10px_25px_rgba(0,0,0,0.2)] overflow-hidden relative z-10">
        <div className="p-8 sm:p-6">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-extrabold text-gray-800 mb-2 tracking-tight">
              {isEditing ? "プロフィール編集" : "プロフィール"}
            </h2>
          </div>

          {displayError && <AlertMessage message={displayError} type="error" />}

          <div className="block">
            <div className="flex flex-col gap-5">
              <ProfileImageUpload
                imagePreview={imagePreview}
                onImageChange={handleImageChange}
                onImageRemove={handleImageRemove}
                disabled={!isEditing}
                onError={(msg) => setError(msg)}
              />

              <FormInput
                label="ニックネーム"
                name="nickname"
                value={userData.nickname}
                onChange={handleChange}
                placeholder="あなたのニックネーム"
                disabled={!isEditing}
                icon={
                  isEditing ? (
                    <svg
                      className="h-5 w-5 text-gray-400"
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
                        clipRule="evenodd"
                      />
                    </svg>
                  ) : undefined
                }
              />

              <FormTextarea
                label="自己紹介"
                name="bio"
                value={userData.bio}
                onChange={handleChange}
                placeholder="あなたについて簡単に教えてください..."
                disabled={!isEditing}
              />

              {isOwnProfile && (
                <div className="pt-4">
                  {isEditing ? (
                    <div className="flex gap-3">
                      <button
                        type="button"
                        onClick={handleCancel}
                        disabled={isLoading}
                        className="flex-1 px-4 py-3 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-3 focus:ring-gray-300/40 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        キャンセル
                      </button>
                      <button
                        type="button"
                        onClick={handleSubmit}
                        disabled={isLoading}
                        className={`flex-1 flex justify-center items-center px-4 py-3 text-sm font-medium text-white bg-gradient-to-r from-indigo-600 to-purple-700 border-0 rounded-lg shadow-md cursor-pointer transition-[background,transform] duration-200 hover:from-indigo-700 hover:to-purple-800 hover:-translate-y-0.5 focus:outline-none focus:ring-3 focus:ring-indigo-600/40 active:translate-y-0.5 ${
                          isLoading ? "opacity-70 cursor-not-allowed" : ""
                        }`}
                      >
                        {isLoading ? (
                          <>
                            <span className="inline-block w-5 h-5 mr-3 border-2 border-white/30 rounded-full border-t-white animate-spin"></span>
                            保存中...
                          </>
                        ) : (
                          <>保存する</>
                        )}
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={handleEdit}
                      className="w-full flex justify-center items-center px-4 py-3 text-sm font-medium text-white bg-gradient-to-r from-indigo-600 to-purple-700 border-0 rounded-lg shadow-md cursor-pointer transition-[background,transform] duration-200 hover:from-indigo-700 hover:to-purple-800 hover:-translate-y-0.5 focus:outline-none focus:ring-3 focus:ring-indigo-600/40 active:translate-y-0.5"
                    >
                      編集する
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {showSuccess && (
        <SuccessToast
          title="更新完了"
          message="プロフィールを更新しました"
          position="top-right"
        />
      )}

      <style>{`
        @keyframes slideIn {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
      `}</style>
    </div>
  );
};

export default ProfilePage;
