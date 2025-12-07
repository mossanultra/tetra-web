"use client";
import { useState, useEffect } from "react";
import { getAuthToken } from "../../../services/actions";
import { AlertMessage } from "@/src/features/user/components/AlertMessage";
import { FormInput } from "@/src/features/user/components/FormInput";
import { FormTextarea } from "@/src/features/user/components/FormTextarea";
import { ProfileImageUpload } from "@/src/features/user/components/ProfileImageUpload";
import { SuccessToast } from "@/src/features/user/components/SuccessToast";
import { useImageUpload } from "@/src/features/user/hooks/useImageUpload";

const NewUserPage = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isMounted, setIsMounted] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const {
    imagePreview,
    handleImageChange,
    handleImageRemove,
    getImageBase64,
  } = useImageUpload();

  const [userData, setUserData] = useState({
    nickname: "",
    bio: "",
  });

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setUserData({
      ...userData,
      [name]: value,
    });
  };

  const handleSubmit = async () => {
    if (!isMounted) return;

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

      const userCreateEndpoint = `/api/user`;
      const endpoint = `/api/user/profile`;

      await fetch(userCreateEndpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: token,
        },
      });

      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: token,
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

      setShowSuccess(true);

      setTimeout(() => {
        window.location.href = "/home";
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

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-600 via-purple-700 to-pink-500 p-4 relative">
      <div className="max-w-[480px] w-full bg-white rounded-xl shadow-[0_10px_25px_rgba(0,0,0,0.2)] overflow-hidden relative z-10">
        <div className="p-8 sm:p-6">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-extrabold text-gray-800 mb-2 tracking-tight">
              アカウント作成
            </h2>
            <p className="text-sm text-gray-500 mt-2">
              あなたのプロフィールを設定しましょう
            </p>
          </div>

          {error && <AlertMessage message={error} type="error" />}

          <div className="block">
            <div className="flex flex-col gap-5">
              <ProfileImageUpload
                imagePreview={imagePreview}
                onImageChange={handleImageChange}
                onImageRemove={handleImageRemove}
                onError={setError}
              />

              <FormInput
                label="ニックネーム"
                name="nickname"
                value={userData.nickname}
                onChange={handleChange}
                placeholder="あなたのニックネーム"
                required
                icon={
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
                }
              />

              <FormTextarea
                label="自己紹介"
                name="bio"
                value={userData.bio}
                onChange={handleChange}
                placeholder="あなたについて簡単に教えてください..."
              />

              <div className="pt-4">
                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={isLoading}
                  className={`w-full flex justify-center items-center px-4 py-3 text-sm font-medium text-white bg-gradient-to-r from-indigo-600 to-purple-700 border-0 rounded-lg shadow-md cursor-pointer transition-[background,transform] duration-200 hover:from-indigo-700 hover:to-purple-800 hover:-translate-y-0.5 focus:outline-none focus:ring-3 focus:ring-indigo-600/40 active:translate-y-0.5 ${
                    isLoading ? "opacity-70 cursor-not-allowed" : ""
                  }`}
                >
                  {isLoading ? (
                    <>
                      <span className="inline-block w-5 h-5 mr-3 border-2 border-white/30 rounded-full border-t-white animate-spin"></span>
                      作成中...
                    </>
                  ) : (
                    <>アカウントを作成</>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {showSuccess && (
        <SuccessToast
          title="アカウント作成完了!"
          message="ようこそ!まもなくホーム画面に移動します。"
          position="center"
          showProgress
        />
      )}

      <style>{`
        @keyframes progress {
          from {
            width: 0%;
          }
          to {
            width: 100%;
          }
        }
      `}</style>
    </div>
  );
};

export default NewUserPage;