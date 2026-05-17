"use client";

import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Thread } from "../types/Thread";
import { SignUpPromptDialog } from "@/src/features/user/components/SignUpPromptDialog";
import { useSignUpPrompt } from "@/src/features/user/hooks/useSignUpPrompt";
import {
  useLoginMode,
  LoginMode,
} from "@/src/features/user/hooks/useLoginMode";
import { FaEllipsisH } from "react-icons/fa";

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

  const { isOpen, openDialog, closeDialog } = useSignUpPrompt();
  const { getLoginMode } = useLoginMode();

  const isOwnThread = currentUserId === thread.ownerUserId;

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowMenu(false);
      }
    };
    if (showMenu) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showMenu]);

  const navigateToProfile = (userId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    router.push(`/profile/${userId}`);
  };

  const navigateToThread = () => {
    router.push(`/timeline/${thread.threadId}`);
  };

  const handleReply = async (e: React.MouseEvent) => {
    e.stopPropagation();
    const mode = await getLoginMode();
    if (mode === LoginMode.GUEST) {
      openDialog();
      return;
    }
    onReply?.(thread);
  };

  const handleBookmark = (e: React.MouseEvent) => {
    e.stopPropagation();
    onToggleBookmark?.(thread.threadId);
  };

  const handleDelete = async (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowMenu(false);
    if (!window.confirm("この投稿を削除しますか?")) return;
    setIsDeleting(true);
    try {
      const res = await fetch(`/api/timeline/thread?threadId=${thread.threadId}`, { method: "DELETE" });
      if (!res.ok) throw new Error("削除に失敗しました");
      onDeleted?.(thread.threadId);
    } catch (error) {
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

  const cardOpacity = isDeleting ? "opacity-50 pointer-events-none" : "";

  // Temporary mock data mapping since API doesn't have exact fields yet
  const emoji = thread.category === "event" ? "🔥" : "💬";
  const grad = thread.category === "event" 
    ? "linear-gradient(135deg,#f83600,#f9d423)" 
    : "linear-gradient(135deg,#d4fc79,#96e6a1)";
  const tagBg = thread.category === "event" ? "#E8F5F2" : "#FFFBEB";
  const tagCol = thread.category === "event" ? "#1A6B5A" : "#B45309";
  const tagLabel = thread.category === "event" ? "イベント・出店" : thread.category || "その他";

  return (
    <div className={`bg-white rounded-2xl overflow-hidden shadow-sm ${cardOpacity}`}>
      {/* Banner Area (Mocked colors/emoji for now) */}
      <div 
        className="h-44 relative overflow-hidden cursor-pointer" 
        onClick={navigateToThread} 
        style={{ background: thread.categoryContent?.imageUrl ? `url(${thread.categoryContent.imageUrl}) center/cover` : grad }}
      >
        {!thread.categoryContent?.imageUrl && (
          <div className="absolute inset-0 flex items-center justify-center text-7xl opacity-40">{emoji}</div>
        )}
        <div className="absolute inset-0 flex items-end p-3">
          <span className="text-white text-xs font-bold bg-black/30 px-2 py-0.5 rounded-full">
            📍 {thread.category === "event" && thread.categoryContent.url ? "リンクあり" : "場所未設定"}
          </span>
        </div>
      </div>

      <div className="p-4">
        {/* User Info & Menu */}
        <div className="flex items-center gap-2.5 mb-2 cursor-pointer active:opacity-70">
          <Image
            src={thread.ownerUserProfile.imageUrl ?? "/default-user.png"}
            alt="user"
            width={32}
            height={32}
            unoptimized
            onClick={(e) => navigateToProfile(thread.ownerUserId, e)}
            className="w-8 h-8 rounded-full object-cover bg-gray-200"
          />
          <div className="flex-1 min-w-0" onClick={(e) => navigateToProfile(thread.ownerUserId, e)}>
            <p className="text-sm font-bold">{thread.ownerUserProfile.userName}</p>
            <p className="text-xs text-gray-400">{formatDate(thread.createdAt)}</p>
          </div>
          <span 
            className="text-[10px] font-bold px-2 py-0.5 rounded-full"
            style={{ background: tagBg, color: tagCol }}
          >
            {tagLabel}
          </span>
          <div className="relative" ref={menuRef}>
            <button onClick={(e) => { e.stopPropagation(); setShowMenu(!showMenu); }} className="p-1 text-gray-400">
              <FaEllipsisH />
            </button>
            {showMenu && (
              <div className="absolute right-0 mt-1 w-32 bg-white rounded-lg shadow border py-1 z-10">
                {isOwnThread && (
                  <button onClick={handleDelete} className="w-full text-left px-3 py-1.5 text-xs text-red-600">削除</button>
                )}
                <button onClick={handleReport} className="w-full text-left px-3 py-1.5 text-xs text-gray-700">通報</button>
              </div>
            )}
          </div>
        </div>

        {/* Content */}
        <p className="text-sm font-semibold mb-1 cursor-pointer" onClick={navigateToThread}>
          {thread.threadName}
        </p>
        
        {thread.category === "event" && thread.categoryContent.detail && (
          <p className="text-xs text-gray-500 leading-relaxed line-clamp-2 mb-1.5">
            {thread.categoryContent.detail}
          </p>
        )}

        {thread.category === "event" && thread.categoryContent.url && (
          <a href={thread.categoryContent.url} target="_blank" rel="noreferrer" onClick={e => e.stopPropagation()} className="text-xs block mb-1.5 truncate text-brand">
            🔗 {thread.categoryContent.url}
          </a>
        )}

        {/* Actions */}
        {showActions && (
          <div className="flex items-center pt-3 mt-2 border-t border-gray-50">
            <div className="flex items-center gap-4">
              <button onClick={handleReply} className="flex items-center gap-1.5 text-xs text-gray-400 active:text-gray-600">
                <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                  <path d="M2 11V4a1 1 0 011-1h10a1 1 0 011 1v7a1 1 0 01-1 1H5l-3 1.5z" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round"/>
                </svg>
                <span>{thread.childThreadCount || 0}</span>
              </button>
              <button className="flex items-center gap-1.5 text-xs text-gray-400">
                <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                  <path d="M8 13s-5.5-3.5-5.5-7A3.5 3.5 0 018 4.5 3.5 3.5 0 0113.5 6c0 3.5-5.5 7-5.5 7z" stroke="currentColor" strokeWidth="1.2" fill="none"/>
                </svg>
                <span>0</span>
              </button>
            </div>
            <button onClick={handleBookmark} className={`ml-auto ${isBookmarked ? 'text-brand' : 'text-gray-400'}`}>
              <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                <path d="M4 2h8a1 1 0 011 1v11l-5-3-5 3V3a1 1 0 011-1z" stroke="currentColor" strokeWidth="1.3" fill={isBookmarked ? 'currentColor' : 'none'}/>
              </svg>
            </button>
          </div>
        )}
      </div>

      <SignUpPromptDialog isOpen={isOpen} onClose={closeDialog} title="リプライするにはアカウントが必要です" message="アカウントを作成すると、投稿へのリプライやコメントができるようになります。" />
    </div>
  );
};
