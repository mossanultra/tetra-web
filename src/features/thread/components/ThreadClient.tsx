"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ThreadCard } from "@/src/features/thread/components/ThreadCard";
import { ReplyModal } from "@/src/features/thread/components/ReplyModal";
import { ImageModal } from "@/src/features/thread/components/ImageModal";
import { useThread } from "@/src/features/thread/hooks/useThread";
import { Thread } from "../types/Thread";

type Props = {
  initialThread: Thread | null;
  initialChildThreads: Thread[];
  ownUserId: string | null;
};

export default function ThreadClient({
  initialThread,
  initialChildThreads,
  ownUserId,
}: Props) {
  const router = useRouter();
  const {
    thread,
    childThreads,
    loading,
    error,
    submitReply,
    deleteThread,
    removeLocalThread,
  } = useThread(initialThread, initialChildThreads);
  const [bookmarkedThreads, setBookmarkedThreads] = useState<Set<string>>(
    new Set()
  );

  const [replyModalOpen, setReplyModalOpen] = useState(false);
  const [replyTarget, setReplyTarget] = useState<Thread | null>(null);
  const [openImage, setOpenImage] = useState<string | null>(null);

  const handleReply = (thread: Thread) => {
    setReplyTarget(thread);
    setReplyModalOpen(true);
  };

  const handleSubmitReply = async (text: string, imageUrl: string | null) => {
    if (!replyTarget) return;

    try {
      await submitReply(replyTarget.threadId, text, imageUrl);

      setReplyModalOpen(false);
      setReplyTarget(null);
    } catch (err) {
      console.error(err);
      alert(err instanceof Error ? err.message : "返信の投稿に失敗しました");
    }
  };

  const toggleBookmark = (threadId: string) => {
    setBookmarkedThreads((prev) => {
      const set = new Set(prev);
      set.has(threadId) ? set.delete(threadId) : set.add(threadId);
      return set;
    });
  };

  const handleDeleted = async (threadId: string) => {
    // メインスレッドが削除された場合は/timelineに戻る
    if (thread && thread.threadId === threadId) {
      router.push("/timeline");
    } else {
      // 子スレッドが削除された場合はローカルステートから削除
      // ThreadCard内でAPIが呼ばれるため、ここではステート更新のみを行う
      removeLocalThread(threadId);
    }
  };

  return (
    <div className="absolute inset-0 flex flex-col bg-gray-50 md:max-w-2xl md:mx-auto md:w-full md:border-x md:border-gray-200 md:bg-white md:shadow-sm">
      <div className="flex-shrink-0 bg-white px-4 py-3 flex items-center gap-3 border-b border-gray-100 sticky top-0 z-20">
        <button onClick={() => router.back()} className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0 transition-colors hover:bg-gray-200">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M10 4L6 8l4 4" stroke="#374151" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
        <h1 className="text-sm font-black flex-1">スレッド詳細</h1>
      </div>

      <div className="flex-1 overflow-y-auto">
        {error && (
          <div className="m-4 p-3 bg-red-50 text-red-600 rounded-lg text-sm">
            {error}
          </div>
        )}

        {!loading && thread && (
          <div className="mb-2">
            <ThreadCard
              thread={thread}
              onReply={handleReply}
              onImageClick={setOpenImage}
              isBookmarked={bookmarkedThreads.has(thread.threadId)}
              onToggleBookmark={toggleBookmark}
              isCompact={false}
              currentUserId={ownUserId}
              onDeleted={handleDeleted}
              onReport={() => console.log("Reported thread:", thread.threadId)}
            />
          </div>
        )}

        {!loading && thread && childThreads.length > 0 && (
          <div className="bg-white pb-6 pt-2 space-y-4">
            <div className="px-4 text-xs font-bold text-gray-400 mb-2">返信 ({childThreads.length})</div>
            {childThreads.map((child) => (
              <div key={child.threadId} className="px-4">
                <ThreadCard
                  thread={child}
                  onReply={handleReply}
                  onImageClick={setOpenImage}
                  isBookmarked={bookmarkedThreads.has(child.threadId)}
                  onToggleBookmark={toggleBookmark}
                  isCompact
                  isChild
                  currentUserId={ownUserId}
                  onReport={() => console.log("Reported thread:", child.threadId)}
                  onDeleted={handleDeleted}
                />
              </div>
            ))}
          </div>
        )}

        {!loading && !thread && (
          <div className="p-6 text-center text-gray-500">
            スレッドが見つかりませんでした
          </div>
        )}
      </div>

      <ReplyModal
        isOpen={replyModalOpen}
        replyTarget={replyTarget}
        onClose={() => setReplyModalOpen(false)}
        onSubmit={handleSubmitReply}
      />

      <ImageModal imageUrl={openImage} onClose={() => setOpenImage(null)} />
    </div>
  );
}
