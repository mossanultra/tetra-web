// components/thread/ThreadCard.tsx
"use client";
import { FaRegComment, FaRegBookmark, FaBookmark } from "react-icons/fa";
import { useRouter } from "next/navigation";

export interface ThreadDTO {
  threadId: string;
  threadName: string;
  createdAt: string;
  ownerUserId: string;
  ownerUserProfile: {
    userId: string;
    userName: string;
    imageUrl: string | null;
  };
  parentThreadId: string | null;
  childThreadIds: string[];
  mapPointInfoId: string | null;
  imageUrl: string | null;
  selectDate: string | null;
  childThreadCount: number;
}

interface ThreadCardProps {
  thread: ThreadDTO;
  onReply?: (thread: ThreadDTO) => void;
  onImageClick?: (imageUrl: string) => void;
  isBookmarked?: boolean;
  onToggleBookmark?: (threadId: string) => void;
  isCompact?: boolean;
  isChild?: boolean;
  showActions?: boolean;
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
    day: "numeric" 
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
}) => {
  const router = useRouter();

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

  const avatarSize = isCompact ? "w-10 h-10" : "w-12 h-12";
  const textSize = isCompact ? "text-sm" : "text-[15px]";
  const nameSize = isCompact ? "text-sm" : "";

  return (
    <article
      onClick={navigateToThread}
      className={`px-4 py-3 hover:bg-gray-50 transition cursor-pointer ${
        isChild ? "ml-10 border-l border-gray-300" : ""
      }`}
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
          {/* ユーザー情報 */}
          <div className="flex items-center gap-2 mb-1">
            <span
              onClick={(e) => navigateToProfile(thread.ownerUserId, e)}
              className={`font-bold text-gray-900 hover:underline cursor-pointer ${nameSize}`}
            >
              {thread.ownerUserProfile.userName}
            </span>
            <span className={`text-gray-500 ${isCompact ? "text-xs" : "text-sm"}`}>
              · {formatDate(thread.createdAt)}
            </span>
          </div>

          {/* 本文 */}
          <div className={`text-gray-900 ${textSize} leading-normal ${isCompact ? "line-clamp-2" : "whitespace-pre-wrap break-words"} mb-2`}>
            {thread.threadName}
          </div>

          {/* 選択日付の表示 */}
          {thread.selectDate && (
            <div className={`mb-2 inline-flex items-center gap-2 px-3 py-1.5 bg-blue-50 text-blue-700 rounded-full ${isCompact ? "text-xs" : "text-sm"} font-medium border border-blue-200`}>
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
                className={`rounded-2xl w-full object-cover border border-gray-200 ${
                  onImageClick ? "cursor-pointer hover:opacity-95" : ""
                } ${isCompact ? "max-h-32 rounded-lg" : "max-h-96"} transition`}
              />
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

              {/* リプライ数のみ表示（ボタンなし） */}
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
