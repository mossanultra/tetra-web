"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { FiArrowLeft, FiTrash2 } from "react-icons/fi";
import {
  InboxMessage,
  ReplyMessageContent,
  NewEventMessageContent,
} from "../types/Inbox";
import { parseMessageContent } from "../utils/messageParser";
import { markMessageAsRead } from "../api/markMessageAsRead";
import { deleteMessage } from "../api/deleteMessage";

interface InboxMessageDetailProps {
  message: InboxMessage;
  onDelete?: () => void;
}

export const InboxMessageDetail: React.FC<InboxMessageDetailProps> = ({
  message,
  onDelete,
}) => {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    if (!message.isRead) {
      markMessageAsRead(message.messageId).catch((err) =>
        console.error("Failed to mark as read:", err),
      );
    }
  }, [message.messageId, message.isRead]);

  const handleDelete = async () => {
    if (!window.confirm("このメッセージを削除してもよろしいですか？")) return;

    try {
      setIsDeleting(true);
      await deleteMessage(message.messageId);
      if (onDelete) {
        onDelete();
      } else {
        router.push("/inbox");
      }
    } catch (error) {
      console.error("Failed to delete message:", error);
      alert("メッセージの削除に失敗しました。");
      setIsDeleting(false);
    }
  };

  const senderName = message.message.sender?.name || "システム通知";
  const avatarUrl = message.message.sender?.avatar || "/default-user.png";
  const { displayContent, parsedContent } = parseMessageContent(
    message.message,
  );

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleString("ja-JP", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const isReplyMessage = message.message.type === "reply" && parsedContent;
  const isNewEventMessage =
    message.message.type === "newEvent" && parsedContent;

  return (
    <div className="bg-white min-h-screen pb-20">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-white/80 backdrop-blur-md border-b border-gray-100">
        <div className="max-w-2xl mx-auto px-4 h-14 flex items-center justify-between">
          <button
            onClick={() => router.back()}
            className="p-2 -ml-2 text-gray-600 hover:text-gray-900 rounded-full hover:bg-gray-100 transition-colors"
          >
            <FiArrowLeft size={20} />
          </button>
          <h1 className="text-base font-bold text-gray-900">メッセージ詳細</h1>
          <div className="w-9" /> {/* Spacer for centering */}
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-6">
        {/* Sender Info */}
        <div className="flex items-center gap-3 mb-6">
          <Image
            src={avatarUrl}
            alt={senderName}
            width={48}
            height={48}
            className="rounded-full object-cover border border-gray-100"
            unoptimized
          />
          <div>
            <div className="font-bold text-gray-900">{senderName}</div>
            <div className="text-xs text-gray-500">
              {formatDate(message.message.createdAt)}
            </div>
          </div>
        </div>

        {/* Content */}
        <article className="prose prose-blue prose-sm max-w-none">
          <h2 className="text-xl font-bold text-gray-900 mb-4 leading-tight">
            {message.message.subject}
          </h2>

          <div className="whitespace-pre-wrap text-[15px] leading-relaxed text-gray-800 break-words">
            {displayContent}
          </div>

          {/* Reply additional link */}
          {isReplyMessage && (
            <div className="mt-8 p-4 bg-blue-50 rounded-xl border border-blue-100">
              <Link
                href={`/timeline/${
                  (parsedContent as ReplyMessageContent).ownerThreadId
                }`}
                className="flex items-center justify-center w-full py-2.5 bg-blue-600 text-white rounded-lg font-bold text-sm hover:bg-blue-700 transition-colors shadow-sm"
              >
                スレッドを確認する
              </Link>
            </div>
          )}

          {/* Event additional link */}
          {isNewEventMessage && (
            <div className="mt-8 p-4 bg-blue-50 rounded-xl border border-blue-100">
              <div className="mb-3 text-sm text-gray-600 font-medium text-center">
                開催日:{" "}
                {new Date(
                  (parsedContent as NewEventMessageContent).date,
                ).toLocaleDateString("ja-JP", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                  weekday: "short",
                })}
              </div>
              <Link
                href={`/timeline/${
                  (parsedContent as NewEventMessageContent).pointInfoId
                }`}
                className="flex items-center justify-center w-full py-2.5 bg-blue-600 text-white rounded-lg font-bold text-sm hover:bg-blue-700 transition-colors shadow-sm"
              >
                イベント詳細を見る
              </Link>
            </div>
          )}
        </article>

        {/* Debug: display parsedContent */}
        <div className="mt-8 p-4 bg-gray-50 rounded-xl border border-gray-200">
          <h3 className="text-sm font-bold text-gray-700 mb-2">
            Debug: parsedContent
          </h3>
          <pre className="text-xs text-gray-600 whitespace-pre-wrap break-all">
            {JSON.stringify(parsedContent, null, 2)}
          </pre>
        </div>

        {/* Actions */}
        <div className="mt-12 pt-6 border-t border-gray-100">
          <button
            onClick={handleDelete}
            disabled={isDeleting}
            className="flex items-center justify-center gap-2 w-full py-3 text-red-600 bg-red-50 hover:bg-red-100 rounded-xl font-medium transition-colors disabled:opacity-50"
          >
            <FiTrash2 size={18} />
            {isDeleting ? "削除中..." : "このメッセージを削除"}
          </button>
        </div>
      </div>
    </div>
  );
};
