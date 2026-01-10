"use client";

import React from "react";
import ReactPaginate from "react-paginate";
import { useInbox } from "../hooks/useInbox";
import { InboxItem } from "./InboxItem";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";

export const InboxList: React.FC = () => {
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
  } = useInbox();

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
    <div className="bg-white min-h-screen pb-10">
      <div className="sticky top-0 z-10 bg-white/95 backdrop-blur-sm border-b border-gray-200 px-4 py-3 flex justify-between items-center">
        <div className="flex items-center gap-4">
          <h1 className="text-xl font-bold text-gray-900">受信トレイ</h1>
          <span className="text-sm text-gray-500">{messages.length}件</span>
        </div>
        <button
          onClick={markAllAsRead}
          disabled={isMarking || messages.length === 0}
          className="text-sm text-blue-600 hover:text-blue-700 disabled:opacity-50 font-medium px-3 py-1.5 rounded-full hover:bg-blue-50 transition"
        >
          すべて既読にする
        </button>
      </div>

      <div className="divide-y divide-gray-100">
        {messages.map((message) => (
          <InboxItem
            key={message.messageId}
            message={message}
            onRead={markAsRead}
            onDelete={deleteMessage}
            isMarking={isMarking}
          />
        ))}
      </div>

      {hasMore && (
        <div className="flex justify-center py-8">
          <button
            onClick={loadMore}
            disabled={isLoading}
            className="px-6 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-full font-medium transition disabled:opacity-50 flex items-center gap-2"
          >
            {isLoading && (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-700" />
            )}
            もっと見る
          </button>
        </div>
      )}
    </div>
  );
};
