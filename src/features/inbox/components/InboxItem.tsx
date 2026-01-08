import React from "react";
import Image from "next/image";
import { InboxMessage } from "../types/Inbox";
import { MdDeleteOutline } from "react-icons/md";

interface InboxItemProps {
  message: InboxMessage;
  onRead: (messageId: string) => void;
  onDelete: (messageId: string) => void;
  isMarking: boolean;
}

export const InboxItem: React.FC<InboxItemProps> = ({
  message,
  onRead,
  onDelete,
  isMarking,
}) => {
  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString("ja-JP", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const handleClick = () => {
    if (!message.isRead && !isMarking) {
      onRead(message.messageId);
    }
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm("このメッセージを削除してもよろしいですか？")) {
      onDelete(message.messageId);
    }
  };

  const senderName = message.message.sender?.name || "システム通知";
  const avatarUrl = message.message.sender?.avatar || "/default-user.png";

  return (
    <article
      onClick={handleClick}
      className={`p-4 border-b border-gray-100 hover:bg-gray-50 transition cursor-pointer group relative ${
        !message.isRead ? "bg-blue-50/30" : ""
      }`}
    >
      <div className="flex gap-4">
        {/* Avatar */}
        <div className="flex-shrink-0 pt-1">
          <Image
            src={avatarUrl}
            alt={senderName}
            width={40}
            height={40}
            className="rounded-full object-cover border border-gray-200 w-10 h-10"
            unoptimized
          />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex justify-between items-start mb-0.5">
            <h3
              className={`text-[15px] truncate pr-2 ${
                !message.isRead
                  ? "font-bold text-gray-900"
                  : "font-medium text-gray-900/80"
              }`}
            >
              {message.message.subject}
            </h3>
            <div className="flex items-center gap-3 flex-shrink-0 pt-0.5">
              <span className="text-sm text-gray-500 whitespace-nowrap">
                {formatDate(message.message.createdAt)}
              </span>
              <button
                onClick={handleDelete}
                className="text-gray-400 hover:text-red-500 transition-colors p-1 rounded-full hover:bg-red-50 opacity-0 group-hover:opacity-100 focus:opacity-100"
                aria-label="削除"
                title="削除"
              >
                <MdDeleteOutline size={18} />
              </button>
            </div>
          </div>

          <div className="text-sm text-gray-500 mb-1 font-medium">
            {senderName}
          </div>

          <p className="text-[15px] text-gray-900 leading-normal whitespace-pre-wrap line-clamp-2 break-all">
            {message.message.content}
            {/* Display messageId for debugging/confirmation if needed, normally hidden */}
            {/* <span className="text-xs text-gray-300 ml-2">#{message.messageId}</span> */}
          </p>
        </div>
        {!message.isRead && (
          <div className="flex items-center justify-center flex-shrink-0 ml-2 self-center">
            <div className="w-2.5 h-2.5 bg-blue-500 rounded-full shadow-sm" />
          </div>
        )}
      </div>
    </article>
  );
};
