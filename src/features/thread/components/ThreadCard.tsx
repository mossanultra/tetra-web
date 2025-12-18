// components/thread/ThreadCard.tsx
"use client";
import { useState, useRef, useEffect } from "react";
import {
  FaRegComment,
  FaRegBookmark,
  FaBookmark,
  FaEllipsisH,
} from "react-icons/fa";
import { useRouter } from "next/navigation";
import { Thread } from "../types/Thread";

interface ThreadCardProps {
  thread: Thread;
  onReply?: (thread: Thread) => void;
  onImageClick?: (imageUrl: string) => void;
  isBookmarked?: boolean;
  onToggleBookmark?: (threadId: string) => void;
  isCompact?: boolean;
  isChild?: boolean;
  showActions?: boolean;
  onDeleted?: (threadId: string) => void; // 削除完了通知用
  onReport: (threadId: string) => void;
  currentUserId: string | null; // 現在のユーザーID
}

export const formatDate = (iso: string) => {
  const d = new Date(iso);
  const now = new Date();
  const diff = Math.floor((now.getTime() - d.getTime()) / 1000);

  if (diff < 60) return `${diff}秒前`;
  if (diff < 3600) return `${Math.floor(diff / 60)}分前`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}時間前`;
  if (diff < 86400 * 7) return `${Math.floor(diff / 86400)}日前`;

  return d.toLocaleDateString("ja-JP", { month: "short", day: "numeric" });
};

export const formatSelectDate = (dateStr: string) => {
  const d = new Date(dateStr);
  return d.toLocaleDateString("ja-JP", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

export const ThreadCard: React.FC<ThreadCardProps> = ({
  thread,
  onReply,
  onImageClick,
  isBookmarked = false,
  onToggleBookmark,
  isCompact = false,
  isChild = false,
  showActions = true,
  onDeleted,
  onReport,
  currentUserId,
}) => {
  const router = useRouter();
  const [showMenu, setShowMenu] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const isOwnThread = currentUserId === thread.ownerUserId;
  // メニュー外クリックで閉じる
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowMenu(false);
      }
    };

    if (showMenu) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showMenu]);

  const navigateToProfile = (userId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    router.push(`/profile/${userId}`);
  };

  const navigateToThread = () => {
    router.push(`/timeline/${thread.threadId}`);
  };

  const handleReply = (e: React.MouseEvent) => {
    e.stopPropagation();
    onReply?.(thread);
  };

  const handleBookmark = (e: React.MouseEvent) => {
    e.stopPropagation();
    onToggleBookmark?.(thread.threadId);
  };

  const handleImageClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onImageClick?.(thread.imageUrl!);
  };

  const handleMenuToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowMenu(!showMenu);
  };

  const handleDelete = async (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowMenu(false);

    if (!window.confirm("この投稿を削除しますか?")) {
      return;
    }

    setIsDeleting(true);

    try {
      const res = await fetch(
        `/api/timeline/thread?threadId=${thread.threadId}`,
        {
          method: "DELETE",
        }
      );

      if (!res.ok) {
        throw new Error("削除に失敗しました");
      }

      // 親コンポーネントに削除完了を通知
      onDeleted?.(thread.threadId);
    } catch (error) {
      console.error("Delete error:", error);
      alert("削除に失敗しました。もう一度お試しください。");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleReport = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowMenu(false);
    onReport?.(thread.threadId);
  };

  const avatarSize = isCompact ? "w-10 h-10" : "w-12 h-12";
  const textSize = isCompact ? "text-sm" : "text-[15px]";
  const nameSize = isCompact ? "text-sm" : "";

  // 削除中の場合は透明度を下げる
  const cardOpacity = isDeleting ? "opacity-50 pointer-events-none" : "";

  return (
    <article
      onClick={navigateToThread}
      className={`relative px-4 py-3 hover:bg-gray-50 transition cursor-pointer ${
        isChild ? "ml-10 border-l border-gray-300" : ""
      } ${cardOpacity}`}
    >
      <div className="flex gap-3">
        {/* アイコン */}
        <img
          src={thread.ownerUserProfile.imageUrl ?? "/default-user.png"}
          alt={thread.ownerUserProfile.userName}
          onClick={(e) => navigateToProfile(thread.ownerUserId, e)}
          className={`${avatarSize} rounded-full object-cover cursor-pointer hover:opacity-80 transition flex-shrink-0`}
        />

        {/* コンテンツ */}
        <div className="flex-1 min-w-0">
          {/* ユーザー情報と三点リーダー */}
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center gap-2">
              <span
                onClick={(e) => navigateToProfile(thread.ownerUserId, e)}
                className={`font-bold text-gray-900 hover:underline cursor-pointer ${nameSize}`}
              >
                {thread.ownerUserProfile.userName}
              </span>
              <span
                className={`text-gray-500 ${isCompact ? "text-xs" : "text-sm"}`}
              >
                · {formatDate(thread.createdAt)}
              </span>
            </div>

            {/* 三点リーダーメニュー */}
            <div className="relative" ref={menuRef}>
              <button
                onClick={handleMenuToggle}
                disabled={isDeleting}
                className="p-2 rounded-full hover:bg-gray-200 transition text-gray-500 hover:text-gray-700 disabled:opacity-50"
              >
                <FaEllipsisH className="w-4 h-4" />
              </button>

              {showMenu && (
                <div className="absolute right-0 mt-1 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50">
                  {isOwnThread && (
                    <button
                      onClick={handleDelete}
                      disabled={isDeleting}
                      className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 transition disabled:opacity-50"
                    >
                      {isDeleting ? "削除中..." : "削除"}
                    </button>
                  )}
                  <button
                    onClick={handleReport}
                    className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 transition"
                  >
                    通報
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* 本文 */}
          <div
            className={`text-gray-900 ${textSize} leading-normal ${
              isCompact ? "line-clamp-2" : "whitespace-pre-wrap break-words"
            } mb-2`}
          >
            {thread.threadName}
          </div>

          {/* 選択日付の表示 */}
          {thread.selectDate && (
            <div
              className={`mb-2 inline-flex items-center gap-2 px-3 py-1.5 bg-blue-50 text-blue-700 rounded-full ${
                isCompact ? "text-xs" : "text-sm"
              } font-medium border border-blue-200`}
            >
              <span>📅</span>
              <span>{formatSelectDate(thread.selectDate)}</span>
            </div>
          )}

          {/* 画像 */}
          {thread.imageUrl && (
            <div className="mt-3 mb-2">
              <img
                src={thread.imageUrl}
                alt="投稿画像"
                onClick={onImageClick ? handleImageClick : undefined}
                className={`rounded-2xl w-9/12 object-cover border border-gray-200 ${
                  onImageClick ? "cursor-pointer hover:opacity-95" : ""
                } ${isCompact ? "max-h-32 rounded-lg" : "max-h-96"} transition`}
              />
            </div>
          )}
          {/* 📍 アドレス表示 */}
          {thread.address && (
            <div
              className={`flex items-center gap-1 mb-2 text-gray-500 ${
                isCompact ? "text-xs" : "text-sm"
              }`}
            >
              <span>📍</span>
              <span className="truncate">{thread.address}</span>
            </div>
          )}

          {/* アクションボタン */}
          {showActions && (
            <div className="flex items-center gap-6 mt-3 text-gray-500">
              {/* リプライボタン */}
              {onReply && (
                <button
                  onClick={handleReply}
                  className="flex items-center gap-2 group hover:text-blue-500 transition"
                >
                  <div className="p-2 rounded-full group-hover:bg-blue-50 transition">
                    <FaRegComment className="w-[18px] h-[18px]" />
                  </div>
                  {thread.childThreadCount > 0 && (
                    <span className="text-sm">{thread.childThreadCount}</span>
                  )}
                </button>
              )}

              {/* リプライ数のみ表示(ボタンなし) */}
              {!onReply && thread.childThreadCount > 0 && (
                <div className="flex items-center gap-2 text-gray-500">
                  <div className="p-2">
                    <FaRegComment className="w-[18px] h-[18px]" />
                  </div>
                  <span className="text-sm">{thread.childThreadCount}</span>
                </div>
              )}

              {/* ブックマークボタン */}
              {onToggleBookmark && (
                <button
                  onClick={handleBookmark}
                  className={`flex items-center gap-2 group transition ${
                    isBookmarked ? "text-blue-500" : "hover:text-blue-500"
                  }`}
                >
                  <div className="p-2 rounded-full group-hover:bg-blue-50 transition">
                    {isBookmarked ? (
                      <FaBookmark className="w-[18px] h-[18px]" />
                    ) : (
                      <FaRegBookmark className="w-[18px] h-[18px]" />
                    )}
                  </div>
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </article>
  );
};
