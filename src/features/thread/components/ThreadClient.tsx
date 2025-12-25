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
  const { thread, childThreads, loading, error, submitReply, deleteThread } =
    useThread(initialThread, initialChildThreads);
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

  const handleSubmitReply = async (text: string, image: string | null) => {
    if (!replyTarget) return;
    await submitReply(replyTarget.threadId, text, image);
    setReplyModalOpen(false);
    setReplyTarget(null);
  };

  const toggleBookmark = (threadId: string) => {
    setBookmarkedThreads((prev) => {
      const set = new Set(prev);
      if (set.has(threadId)) {
        set.delete(threadId);
      } else {
        set.add(threadId);
      }
      return set;
    });
  };

  const handleDeleted = async (threadId: string) => {
    console.log("Thread deleted:", threadId);

    // メインスレッドが削除された場合は/timelineに戻る
    if (thread && thread.threadId === threadId) {
      router.push("/timeline");
    } else {
      // 子スレッドが削除された場合はローカルステートから削除
      await deleteThread(threadId);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-2xl mx-auto border-x border-gray-200 min-h-screen">
        {error && (
          <div className="m-4 p-3 bg-red-50 text-red-600 rounded-lg text-sm">
            {error}
          </div>
        )}

        {/* {loading && <ThreadSkeleton count={3} />} */}

        {!loading && thread && (
          <ThreadCard
            thread={thread}
            onReply={handleReply}
            onImageClick={setOpenImage}
            isBookmarked={bookmarkedThreads.has(thread.threadId)}
            onToggleBookmark={toggleBookmark}
            isCompact={true}
            currentUserId={ownUserId}
            onDeleted={handleDeleted}
            onReport={() => {
              console.log("Reported thread:", thread.threadId);
            }}
          />
        )}

        {!loading && thread && childThreads.length > 0 && (
          <div className="divide-y divide-gray-200">
            {childThreads.map((child) => (
              <div key={child.threadId} className="pl-10">
                <ThreadCard
                  thread={child}
                  onReply={handleReply}
                  onImageClick={setOpenImage}
                  isBookmarked={bookmarkedThreads.has(child.threadId)}
                  onToggleBookmark={toggleBookmark}
                  isCompact
                  currentUserId={ownUserId}
                  onReport={() => {
                    console.log("Reported thread:", child.threadId);
                  }}
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
