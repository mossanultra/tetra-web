"use client";
import { AlertMessage } from "@/src/features/user/components/AlertMessage";
import { FormInput } from "@/src/features/user/components/FormInput";
import { FormTextarea } from "@/src/features/user/components/FormTextarea";
import { ProfileImageUpload } from "@/src/features/user/components/ProfileImageUpload";
import { SuccessToast } from "@/src/features/user/components/SuccessToast";
import { useImageUpload } from "@/src/features/user/hooks/useImageUpload";
import { getAuthToken } from "@/src/services/actions";
import { useState, useEffect } from "react";
import { useParams } from "next/navigation";

interface UserProfile {
  profileId: string;
  userName: string;
  imageUrl: string;
  introduction: string;
}

const ProfilePage = () => {
  const params = useParams();
  const userId = params?.userId as string | undefined;
  
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [isOwnProfile, setIsOwnProfile] = useState(false);

  const {
    imagePreview,
    handleImageChange,
    handleImageRemove,
    setInitialPreview,
    getImageBase64,
  } = useImageUpload();

  const [originalData, setOriginalData] = useState<UserProfile>({
    profileId: "",
    userName: "",
    imageUrl: "",
    introduction: "",
  });

  const [userData, setUserData] = useState({
    nickname: "",
    bio: "",
  });

  useEffect(() => {
    fetchProfile();
  }, [userId]);

  const fetchProfile = async () => {
    setIsFetching(true);
    setError(null);

    try {
      const token = await getAuthToken();
      if (!token) {
        throw new Error("認証情報が見つかりません");
      }

      // userIdがない場合は自分自身のプロフィール、ある場合は指定されたユーザー
      const endpoint = userId 
        ? `/api/user/profile/${userId}`
        : `/api/user/profile/@self`;

      const response = await fetch(endpoint, {
        method: "GET",
      });

      if (!response.ok) {
        throw new Error(`プロフィール取得に失敗しました (${response.status})`);
      }

      const data: UserProfile = await response.json();
      
      // 自分自身のプロフィールかどうかを判定
      // userIdがないか、取得したprofileIdが自分のものと一致する場合
      const selfResponse = await fetch(`/api/user/profile/@self`, {
        method: "GET",
      });
      
      if (selfResponse.ok) {
        const selfData: UserProfile = await selfResponse.json();
        setIsOwnProfile(!userId || data.profileId === selfData.profileId);
      }
      
      setOriginalData(data);
      setUserData({
        nickname: data.userName,
        bio: data.introduction,
      });

      if (data.imageUrl) {
        setInitialPreview(data.imageUrl);
      }
    } catch (err) {
      console.error("プロフィール取得エラー:", err);
      setError(
        err instanceof Error ? err.message : "プロフィールの取得に失敗しました"
      );
    } finally {
      setIsFetching(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setUserData({
      ...userData,
      [name]: value,
    });
  };

  const handleEdit = () => {
    setIsEditing(true);
    setError(null);
  };

  const handleCancel = () => {
    setIsEditing(false);
    setError(null);
    setUserData({
      nickname: originalData.userName,
      bio: originalData.introduction,
    });
    if (originalData.imageUrl) {
      setInitialPreview(originalData.imageUrl);
    } else {
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

      const token = await getAuthToken();
      if (!token) {
        throw new Error("認証情報が見つかりません。再度ログインしてください。");
      }

      const imageBase64 = await getImageBase64();

      const endpoint = `/api/user/profile`;

      const response = await fetch(endpoint, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userName: userData.nickname,
          imageBase64: imageBase64,
          introduction: userData.bio,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.message || `エラーが発生しました (${response.status})`
        );
      }

      const result = await response.json();
      console.log("API レスポンス:", result);

      await fetchProfile();

      setShowSuccess(true);
      setIsEditing(false);

      setTimeout(() => {
        setShowSuccess(false);
      }, 3000);
    } catch (err) {
      console.error("エラー詳細:", err);
      setError(
        err instanceof Error ? err.message : "予期せぬエラーが発生しました"
      );
    } finally {
      setIsLoading(false);
    }
  };

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
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-600 via-purple-700 to-pink-500 p-4 relative">
      <div className="max-w-[480px] w-full bg-white rounded-xl shadow-[0_10px_25px_rgba(0,0,0,0.2)] overflow-hidden relative z-10">
        <div className="p-8 sm:p-6">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-extrabold text-gray-800 mb-2 tracking-tight">
              {isEditing ? "プロフィール編集" : "プロフィール"}
            </h2>
          </div>

          {error && <AlertMessage message={error} type="error" />}

          <div className="block">
            <div className="flex flex-col gap-5">
              <ProfileImageUpload
                imagePreview={imagePreview}
                onImageChange={handleImageChange}
                onImageRemove={handleImageRemove}
                disabled={!isEditing}
                onError={setError}
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