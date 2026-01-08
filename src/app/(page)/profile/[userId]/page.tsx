"use client";

import React, { useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useProfile } from "@/src/features/user/hooks/useProfile";
import Image from "next/image";
import { FaUser, FaLink } from "react-icons/fa";

const ProfilePage: React.FC = () => {
  const params = useParams();
  const router = useRouter();
  const userId = (params as { userId?: string })?.userId;

  const {
    data,
    isFetching,
    isOwnProfile,
    error: profileError,
    fetchProfile,
  } = useProfile(userId);

  useEffect(() => {
    fetchProfile();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  if (isFetching) {
    return (
      <div className="max-w-3xl mx-auto py-10 px-4 sm:px-6 lg:px-8 animate-pulse">
        <div className="mb-8 text-center">
          <div className="h-10 bg-gray-200 rounded w-48 mx-auto mb-2"></div>
        </div>

        <div className="flex flex-col gap-8 max-w-xl mx-auto">
          <div className="flex flex-col items-center gap-4">
            <div className="w-32 h-32 bg-gray-200 rounded-full"></div>
            <div className="h-6 bg-gray-200 rounded w-32 mt-2"></div>
          </div>

          <div className="space-y-6">
            <div>
              <div className="h-4 bg-gray-200 rounded w-20 mb-2"></div>
              <div className="h-6 bg-gray-200 rounded w-full"></div>
            </div>
            <div>
              <div className="h-4 bg-gray-200 rounded w-24 mb-2"></div>
              <div className="h-24 bg-gray-200 rounded w-full"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (profileError) {
    return (
      <div className="max-w-3xl mx-auto py-10 px-4 sm:px-6 lg:px-8">
        <div className="max-w-xl mx-auto text-center">
          <div className="bg-red-50 border border-red-200 rounded-xl p-6">
            <p className="text-red-600 font-medium">{profileError}</p>
          </div>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="max-w-3xl mx-auto py-10 px-4 sm:px-6 lg:px-8">
        <div className="max-w-xl mx-auto text-center">
          <p className="text-gray-500">プロフィールが見つかりません</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-xl mx-auto">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-extrabold tracking-tight">
            プロフィール
          </h2>
        </div>

        <div className="flex flex-col gap-8">
          {/* Profile Image */}
          <div className="flex flex-col items-center gap-4">
            <div className="relative w-32 h-32 rounded-full overflow-hidden border-4 border-gray-200 bg-gray-100 flex items-center justify-center">
              {data.imageUrl ? (
                <Image
                  src={data.imageUrl}
                  alt={data.userName}
                  fill
                  className="object-cover"
                  unoptimized
                />
              ) : (
                <FaUser className="text-gray-400 text-5xl" />
              )}
            </div>
          </div>

          {/* Profile Info */}
          <div className="space-y-6">
            {/* Nickname */}
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                ニックネーム
              </label>
              <div className="px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900">
                {data.userName || "未設定"}
              </div>
            </div>

            {/* URL */}
            {data.url && (
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  URL
                </label>
                <div className="px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl">
                  <a
                    href={data.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-700 hover:underline flex items-center gap-2"
                  >
                    <FaLink className="text-sm" />
                    {data.url}
                  </a>
                </div>
              </div>
            )}

            {/* Bio */}
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                自己紹介
              </label>
              <div className="px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 whitespace-pre-wrap min-h-[100px]">
                {data.introduction || "未設定"}
              </div>
            </div>

            {/* Edit Button (only for own profile) */}
            {isOwnProfile && (
              <div className="pt-6">
                <button
                  type="button"
                  onClick={() => router.push("/profile/edit")}
                  className="w-full flex justify-center items-center px-4 py-3 text-sm font-bold text-white bg-neutral-900 rounded-xl hover:bg-neutral-800 transition-all shadow-md hover:shadow-lg focus:outline-none focus:ring-4 focus:ring-gray-100"
                >
                  プロフィールを編集
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
