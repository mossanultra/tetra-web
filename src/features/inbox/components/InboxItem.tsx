import React from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import {
  InboxMessage,
  ReplyMessageContent,
  NewEventMessageContent,
} from "../types/Inbox";
import { MdDeleteOutline } from "react-icons/md";
import { parseMessageContent } from "../utils/messageParser";

interface InboxItemProps {
  message: InboxMessage;
  onDelete: (messageId: string) => void;
}

export const InboxItem: React.FC<InboxItemProps> = ({ message, onDelete }) => {
  const router = useRouter();
  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString("ja-JP", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm("このメッセージを削除してもよろしいですか？")) {
      onDelete(message.messageId);
    }
  };

  const senderName = message.message.sender?.name || "システム通知";
  const avatarUrl = message.message.sender?.avatar || "/default-user.png";

  // Parse message content
  const { displayContent, parsedContent } = parseMessageContent(
    message.message,
  );
  const isReplyMessage = message.message.type === "reply" && parsedContent;
  const isNewEventMessage =
    message.message.type === "newEvent" && parsedContent;

  return (
    <div
      onClick={() => router.push(`/inbox/${message.messageId}`)}
      className={`flex items-start gap-3 px-4 py-4 border-b border-gray-50 cursor-pointer active:opacity-80 transition group relative ${
        !message.isRead ? "bg-brand-pale" : ""
      }`}
    >
      {/* Avatar */}
      <div className="flex-shrink-0">
        <Image
          src={avatarUrl}
          alt={senderName}
          width={48}
          height={48}
          className="rounded-full object-cover w-12 h-12"
          unoptimized
        />
      </div>

      <div className="flex-1 min-w-0 pr-2">
        <p className="text-sm text-gray-800 leading-snug mb-1">
          <span className="font-bold">{senderName}</span>{" "}
          {message.message.type === "reply" && "さんがコメントしました"}
          {message.message.type === "like" && "さんがいいねしました"}
          {message.message.type === "follow" && "さんがフォローしました"}
          {message.message.type === "newEvent" && "から新しいイベントが登録されました"}
          {!["reply", "like", "follow", "newEvent"].includes(message.message.type) && "から通知がありました"}
        </p>

        <p className="text-xs text-gray-500 line-clamp-1">
          {displayContent}
        </p>
      </div>

      <div className="flex flex-col items-end gap-2 flex-shrink-0 ml-1 mt-0.5">
        <span className="text-xs text-gray-400">
          {formatDate(message.message.createdAt)}
        </span>
        {!message.isRead && (
          <div className="w-2.5 h-2.5 rounded-full bg-brand"></div>
        )}
        <button
          onClick={handleDelete}
          className="text-gray-400 hover:text-red-500 transition-colors p-1 rounded-full opacity-0 group-hover:opacity-100"
          aria-label="削除"
          title="削除"
        >
          <MdDeleteOutline size={16} />
        </button>
      </div>
    </div>
  );
};
