"use client";

import React from "react";
import InfiniteScroll from "react-infinite-scroll-component";
import { useInbox } from "../hooks/useInbox";
import { InboxItem } from "./InboxItem";

import Link from "next/link";
import { FaSignInAlt } from "react-icons/fa";
import {
  useLoginMode,
  LoginMode,
} from "@/src/features/user/hooks/useLoginMode";

export const InboxList: React.FC = () => {
  const { getLoginMode } = useLoginMode();
  const [isGuest, setIsGuest] = React.useState<boolean | null>(null);

  React.useEffect(() => {
    const checkMode = async () => {
      const mode = await getLoginMode();
      setIsGuest(mode === LoginMode.GUEST);
    };
    checkMode();
  }, [getLoginMode]);

  const {
    messages,
    isLoading,
    error,
    markAsRead,
    markAllAsRead,
    isMarking,
    deleteMessage,
    loadMore,
    hasMore,
  } = useInbox({ enabled: isGuest === false }); // isGuestがfalse(ログイン済み)の時だけfetch

  // Guest Mode UI
  if (isGuest === null) {
    return null; // or a spinner
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
          受信トレイを利用するには、アカウントへのログインが必要です。
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

  // Initial load only
  if (isLoading && messages.length === 0) {
    return (
      <div className="flex justify-center items-center py-20">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 text-center text-red-500">
        メッセージの取得に失敗しました。
      </div>
    );
  }

  if (messages.length === 0 && !isLoading) {
    return (
      <div className="p-8 text-center text-gray-500">
        メッセージはありません。
      </div>
    );
  }

  return (
    <div className="absolute inset-0 flex flex-col bg-white md:max-w-2xl md:mx-auto md:w-full md:border-x md:border-gray-200 md:shadow-sm">
      <div className="flex-shrink-0 px-4 py-3 flex items-center gap-3 border-b border-gray-100">
        <h1 className="text-xl font-black flex-1">通知</h1>
        <button
          onClick={markAllAsRead}
          disabled={isMarking || messages.length === 0}
          className="text-xs font-bold rounded-full px-3 py-1 border transition-colors disabled:opacity-50"
          style={{ color: "#1A6B5A", borderColor: "#1A6B5A" }}
        >
          すべて既読
        </button>
      </div>

      <div className="flex-1 overflow-y-auto" id="scrollableDiv">
        <InfiniteScroll
          dataLength={messages.length}
          next={loadMore}
          hasMore={hasMore}
          scrollableTarget="scrollableDiv"
          loader={
            <div className="flex justify-center items-center py-6">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-brand" />
            </div>
          }
          endMessage={
            <div className="p-8 text-center text-gray-500 text-sm">
              すべての通知を表示しました
            </div>
          }
        >
          <div className="divide-y divide-gray-50">
            {messages.map((message) => (
              <InboxItem
                key={message.messageId}
                message={message}
                onDelete={deleteMessage}
              />
            ))}
          </div>
        </InfiniteScroll>
      </div>
    </div>
  );
};
