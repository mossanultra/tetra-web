"use client";

import React, { useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useProfile } from "@/src/features/user/hooks/useProfile";
import Image from "next/image";
import { FaUser, FaLink, FaSignInAlt } from "react-icons/fa";
import {
  useLoginMode,
  LoginMode,
} from "@/src/features/user/hooks/useLoginMode";
import Link from "next/link";

const ProfilePage: React.FC = () => {
  const params = useParams();
  const router = useRouter();
  const userId = (params as { userId?: string })?.userId;

  const { getLoginMode } = useLoginMode();
  const [isGuest, setIsGuest] = React.useState<boolean | null>(null);

  useEffect(() => {
    const checkMode = async () => {
      const mode = await getLoginMode();
      setIsGuest(mode === LoginMode.GUEST);
    };
    checkMode();
  }, [getLoginMode]);

  const {
    data,
    isFetching,
    isOwnProfile,
    error: profileError,
    fetchProfile,
  } = useProfile(userId, { enabled: isGuest === false });

  // デバッグ用のログ追加
  useEffect(() => {
    if (data) {
      console.log("[ProfilePage DEBUG] Route userId:", userId);
      console.log("[ProfilePage DEBUG] Profile profileId:", data.profileId);
      console.log("[ProfilePage DEBUG] isOwnProfile:", isOwnProfile);
    }
  }, [userId, data, isOwnProfile]);

  useEffect(() => {
    if (isGuest === false) {
      fetchProfile();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId, isGuest]);

  if (isGuest === null) {
    return (
      <div className="max-w-3xl mx-auto py-10 px-4 sm:px-6 lg:px-8 animate-pulse">
        <div className="mb-8 text-center">
          <div className="h-10 bg-gray-200 rounded w-48 mx-auto mb-2"></div>
        </div>
      </div>
    );
  }

  if (isGuest === true) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] px-4 text-center">
        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-6">
          <FaSignInAlt className="text-2xl text-gray-400" />
        </div>
        <h2 className="text-xl font-bold text-gray-900 mb-2">
          ログインが必要です
        </h2>
        <p className="text-gray-500 mb-8 max-w-sm">
          プロフィールを閲覧するには、アカウントへのログインが必要です。
        </p>
        <Link
          href="/login-prompt"
          className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-full transition-colors shadow-lg shadow-blue-200"
        >
          <FaSignInAlt />
          <span>ログインする</span>
        </Link>
      </div>
    );
  }

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
    <div className="absolute inset-0 flex flex-col bg-gray-50 md:max-w-2xl md:mx-auto md:w-full md:border-x md:border-gray-200 md:bg-white md:shadow-sm">
      
      {isOwnProfile ? (
        <>
          <div className="flex-shrink-0 bg-white px-4 py-3 flex items-center justify-between border-b border-gray-100 sticky top-0 z-10">
            <h1 className="text-base font-black">マイページ</h1>
            <button className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
              <svg width="15" height="15" viewBox="0 0 16 16" fill="none"><circle cx="8" cy="4" r="1.3" fill="#374151"/><circle cx="8" cy="8" r="1.3" fill="#374151"/><circle cx="8" cy="12" r="1.3" fill="#374151"/></svg>
            </button>
          </div>
          <div className="flex-1 overflow-y-auto">
            <div className="bg-white px-4 pt-7 pb-5 flex flex-col items-center border-b-4 border-gray-50">
              <div className="w-20 h-20 rounded-full bg-gray-200 border-4 border-white shadow-md flex items-center justify-center mb-5 overflow-hidden relative">
                {data.imageUrl ? (
                  <Image src={data.imageUrl} alt={data.userName} fill className="object-cover" unoptimized />
                ) : (
                  <svg width="36" height="36" viewBox="0 0 48 48" fill="none"><circle cx="24" cy="18" r="10" fill="#9CA3AF"/><path d="M6 44c0-10 8-17 18-17s18 7 18 17" fill="#9CA3AF"/></svg>
                )}
              </div>
              <div className="w-full space-y-2.5 mb-5">
                <div className="bg-gray-50 rounded-xl px-4 py-3">
                  <p className="text-xs text-gray-400 mb-0.5">ニックネーム</p>
                  <p className="text-sm font-bold">{data.userName || "未設定"}</p>
                </div>
                {/* Note: Belonging/Affiliation is not in the data model yet, so skipping or mocking */}
                <div className="bg-gray-50 rounded-xl px-4 py-3">
                  <p className="text-xs text-gray-400 mb-0.5">マイリンク</p>
                  {data.url ? (
                    <a href={data.url} target="_blank" rel="noopener noreferrer" className="text-sm font-medium break-all text-brand">{data.url}</a>
                  ) : (
                    <p className="text-sm text-gray-400">未設定</p>
                  )}
                </div>
                <div className="bg-gray-50 rounded-xl px-4 py-3">
                  <p className="text-xs text-gray-400 mb-0.5">自己紹介</p>
                  <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-wrap">{data.introduction || "未設定"}</p>
                </div>
              </div>
              <button onClick={() => router.push("/profile/edit")} className="w-full h-11 bg-gray-900 text-white rounded-xl text-sm font-bold">プロフィールを編集</button>
            </div>
            
            <div className="bg-white mt-2">
              <div className="flex border-b border-gray-100">
                <button className="flex-1 py-3 text-xs font-bold border-b-2 text-brand border-brand">過去の投稿</button>
                <button className="flex-1 py-3 text-xs font-bold border-b-2 border-transparent text-gray-400">保存した投稿</button>
                <button className="flex-1 py-3 text-xs font-bold border-b-2 border-transparent text-gray-400">フォロー中</button>
              </div>
              {/* Dummy List to match layout since we don't have user's posts yet */}
              <div className="px-4 pt-4 pb-3 space-y-2.5">
                <div className="flex flex-col items-center justify-center py-10 text-gray-400 gap-2">
                  <span className="text-3xl">📭</span>
                  <p className="text-sm">まだ投稿がありません</p>
                </div>
              </div>
            </div>
            <div className="h-4"></div>
          </div>
        </>
      ) : (
        <>
          <div className="flex-shrink-0 bg-white px-4 py-3 flex items-center gap-3 border-b border-gray-100 sticky top-0 z-10">
            <button onClick={() => router.back()} className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M10 4L6 8l4 4" stroke="#374151" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </button>
            <h1 className="text-sm font-black flex-1">投稿者プロフィール</h1>
          </div>
          <div className="flex-1 overflow-y-auto">
            <div className="bg-white px-4 pt-7 pb-6 flex flex-col items-center border-b-4 border-gray-50">
              <div className="w-20 h-20 rounded-full flex items-center justify-center text-white text-2xl font-black mb-3 shadow-md overflow-hidden relative bg-brand">
                {data.imageUrl ? (
                  <Image src={data.imageUrl} alt={data.userName} fill className="object-cover" unoptimized />
                ) : (
                  <span>{data.userName?.[0] || "👤"}</span>
                )}
              </div>
              <p className="text-base font-black mb-1">{data.userName}</p>
              <p className="text-xs text-gray-400 mb-4">ユーザー</p>
              <p className="text-sm text-gray-600 text-center leading-relaxed px-2 whitespace-pre-wrap">{data.introduction}</p>
              <button className="mt-4 px-8 py-2 rounded-full text-sm font-bold bg-brand text-white">フォローする</button>
            </div>
            <div className="bg-white mt-2 px-4 py-1">
              <div className="flex gap-3 items-center py-3.5 border-b border-gray-50">
                <span className="text-xs text-gray-400 w-20 flex-shrink-0">マイリンク</span>
                {data.url ? (
                  <a href={data.url} target="_blank" rel="noopener noreferrer" className="text-sm flex-1 truncate text-brand">{data.url}</a>
                ) : (
                  <span className="text-sm flex-1 text-gray-400">未設定</span>
                )}
              </div>
            </div>
            <div className="bg-white mt-2 px-4 pt-3 pb-3">
              <p className="text-xs font-black text-gray-400 mb-3">この投稿者の投稿</p>
              <div className="flex flex-col items-center justify-center py-8 text-gray-400 gap-2 bg-gray-50 rounded-xl">
                <span className="text-2xl">📭</span>
                <p className="text-xs">投稿はありません</p>
              </div>
            </div>
            <div className="h-4"></div>
          </div>
        </>
      )}
    </div>
  );
};

export default ProfilePage;
