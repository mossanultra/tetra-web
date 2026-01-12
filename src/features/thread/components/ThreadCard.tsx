// components/thread/ThreadCard.tsx
"use client";

import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import {
  FaRegComment,
  FaRegBookmark,
  FaBookmark,
  FaEllipsisH,
} from "react-icons/fa";
import { useRouter } from "next/navigation";
import { Thread } from "../types/Thread";
import { SignUpPromptDialog } from "@/src/features/user/components/SignUpPromptDialog";
import { useSignUpPrompt } from "@/src/features/user/hooks/useSignUpPrompt";
import {
  useLoginMode,
  LoginMode,
} from "@/src/features/user/hooks/useLoginMode";

interface ThreadCardProps {
  thread: Thread;
  onReply?: (thread: Thread) => void;
  onImageClick?: (imageUrl: string) => void;
  isBookmarked?: boolean;
  onToggleBookmark?: (threadId: string) => void;
  isCompact?: boolean;
  isChild?: boolean;
  showActions?: boolean;
  onDeleted?: (threadId: string) => void;
  onReport: (threadId: string) => void;
  currentUserId: string | null;
}

/* ---------------- utils ---------------- */

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

export const formatEventDateRange = (startDate: string, endDate: string) => {
  const start = new Date(startDate);
  const end = new Date(endDate);

  const formatDate = (d: Date) =>
    d.toLocaleDateString("ja-JP", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

  return `${formatDate(start)} 〜 ${formatDate(end)}`;
};

/* ---------------- component ---------------- */

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

  // Sign-up prompt dialog
  const { isOpen, openDialog, closeDialog } = useSignUpPrompt();
  const { getLoginMode } = useLoginMode();

  const isOwnThread = currentUserId === thread.ownerUserId;

  /* メニュー外クリックで閉じる */
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

  /* handlers */

  const navigateToProfile = (userId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    router.push(`/profile/${userId}`);
  };

  const navigateToThread = () => {
    router.push(`/timeline/${thread.threadId}`);
  };

  const handleReply = async (e: React.MouseEvent) => {
    e.stopPropagation();

    // Check if user is logged in
    const mode = await getLoginMode();
    if (mode === LoginMode.GUEST) {
      // Show sign-up prompt for guest users
      openDialog();
      return;
    }

    // Proceed with reply for logged-in users
    onReply?.(thread);
  };

  const handleBookmark = (e: React.MouseEvent) => {
    e.stopPropagation();
    onToggleBookmark?.(thread.threadId);
  };

  const handleMenuToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowMenu((v) => !v);
  };

  const handleDelete = async (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowMenu(false);

    if (!window.confirm("この投稿を削除しますか?")) return;

    setIsDeleting(true);

    try {
      const res = await fetch(
        `/api/timeline/thread?threadId=${thread.threadId}`,
        { method: "DELETE" }
      );

      if (!res.ok) throw new Error("削除に失敗しました");

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
    onReport(thread.threadId);
  };

  /* styles */

  const isEvent = thread.category === "event";
  const avatarSize = isCompact ? "w-10 h-10" : "w-12 h-12";
  const textSize = isCompact ? "text-sm" : "text-[15px]";
  const nameSize = isCompact ? "text-sm" : "";
  const cardOpacity = isDeleting ? "opacity-50 pointer-events-none" : "";

  return (
    <article
      onClick={navigateToThread}
      className={`relative px-4 py-3 transition cursor-pointer ${
        isChild ? "ml-10 border-l border-gray-300" : ""
      } ${
        isEvent
          ? "bg-amber-50/40 hover:bg-amber-50 border-1 border-l-4 border-l-amber-400 border-amber-100" // イベント用スタイル
          : "hover:bg-gray-50 bg-white" // 通常スタイル
      } ${cardOpacity}`}
    >
      {/* Event Badge */}
      {isEvent && (
        <div className="absolute top-0 right-0 px-2 py-0.5 bg-amber-400 text-white text-[10px] font-bold tracking-wider rounded-bl-lg shadow-sm z-10">
          EVENT
        </div>
      )}
      <div className="flex gap-3">
        {/* -------- Avatar -------- */}
        <Image
          src={thread.ownerUserProfile.imageUrl ?? "/default-user.png"}
          alt="Description of the image" // Required
          width={isCompact ? 40 : 48}
          height={isCompact ? 40 : 48}
          priority
          unoptimized
          onClick={(e) => navigateToProfile(thread.ownerUserId, e)}
          className={`${avatarSize} rounded-full object-cover cursor-pointer hover:opacity-80 transition flex-shrink-0`}
        />

        {/* -------- Content -------- */}
        <div className="flex-1 min-w-0">
          {/* header */}
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

            {/* menu */}
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

          {/* body */}
          <div
            className={`text-gray-900 ${textSize} leading-normal ${
              isCompact ? "line-clamp-2" : "whitespace-pre-wrap break-words"
            } mb-2`}
          >
            {thread.threadName}
          </div>

          {/* event date range */}
          {thread.category === "event" && (
            <>
              {/* event date range */}
              <div
                className={`mb-2 inline-flex items-center gap-2 px-3 py-1.5 bg-blue-50 text-blue-700 rounded-full ${
                  isCompact ? "text-xs" : "text-sm"
                } font-medium border border-blue-200`}
              >
                <span>📅</span>
                <span>
                  {formatEventDateRange(
                    thread.categoryContent.startDate,
                    thread.categoryContent.endDate
                  )}
                </span>
              </div>

              {/* detail */}
              {thread.categoryContent.detail && (
                <div
                  className={`text-gray-600 mb-2 ${
                    isCompact
                      ? "text-xs line-clamp-4 whitespace-pre-wrap"
                      : "text-sm whitespace-pre-wrap"
                  }`}
                >
                  {thread.categoryContent.detail}
                </div>
              )}

              {/* url */}
              {thread.categoryContent.url && (
                <div className="mb-2">
                  <a
                    href={thread.categoryContent.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    className={`text-blue-500 hover:underline flex items-center gap-1 truncate ${
                      isCompact ? "text-xs" : "text-sm"
                    }`}
                  >
                    🔗 {thread.categoryContent.url}
                  </a>
                </div>
              )}
            </>
          )}

          {/* image */}
          {thread.categoryContent.imageUrl && (
            <div className="relative mt-3 mb-2 w-9/12">
              <Image
                src={thread.categoryContent.imageUrl}
                alt="投稿画像"
                width={800}
                height={600}
                unoptimized
                onClick={
                  onImageClick
                    ? (e) => {
                        e.stopPropagation();
                        onImageClick(thread.categoryContent.imageUrl!);
                      }
                    : undefined
                }
                className={`rounded-2xl object-cover border border-gray-200 ${
                  onImageClick ? "cursor-pointer hover:opacity-95" : ""
                } ${isCompact ? "max-h-32 rounded-lg" : "max-h-96"} transition`}
              />
            </div>
          )}

          {/* actions */}
          {showActions && (
            <div className="flex items-center gap-6 mt-3 text-gray-500">
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

              {!onReply && thread.childThreadCount > 0 && (
                <div className="flex items-center gap-2 text-gray-500">
                  <div className="p-2">
                    <FaRegComment className="w-[18px] h-[18px]" />
                  </div>
                  <span className="text-sm">{thread.childThreadCount}</span>
                </div>
              )}

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

      {/* Sign-up prompt dialog for guest users */}
      <SignUpPromptDialog
        isOpen={isOpen}
        onClose={closeDialog}
        title="リプライするにはアカウントが必要です"
        message="アカウントを作成すると、投稿へのリプライやコメントができるようになります。"
      />
    </article>
  );
};
