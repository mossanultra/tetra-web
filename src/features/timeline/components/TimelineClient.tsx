"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ThreadCard } from "@/src/features/thread/components/ThreadCard";
import { ReplyModal } from "@/src/features/thread/components/ReplyModal";
import { ImageModal } from "@/src/features/thread/components/ImageModal";
import { useTimeline } from "@/src/features/timeline/hooks/useTimeline";
import { Thread } from "../../thread/types/Thread";

type Props = {
  initialItems: Thread[];
  ownUserId: string | null;
};

export default function TimelineClient({ initialItems, ownUserId }: Props) {
  const router = useRouter();
  const { items, loading, error, refetch } = useTimeline(initialItems);
  const [openImage, setOpenImage] = useState<string | null>(null);
  const [bookmarkedThreads, setBookmarkedThreads] = useState<Set<string>>(
    new Set()
  );

  const [replyModalOpen, setReplyModalOpen] = useState(false);
  const [replyTarget, setReplyTarget] = useState<Thread | null>(null);

  const handleReply = (thread: Thread) => {
    setReplyTarget(thread);
    setReplyModalOpen(true);
  };

  const handleSubmitReply = async (text: string, image: string | null) => {
    if (!replyTarget) return;

    try {
      const body = {
        threadName: text,
        parentThreadId: replyTarget.threadId,
        imageBase64: image,
      };

      const res = await fetch("/api/timeline/thread/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        throw new Error(`返信の投稿に失敗しました (${res.status})`);
      }

      // 成功したらモーダルを閉じてタイムラインを更新
      setReplyModalOpen(false);
      setReplyTarget(null);
      await refetch();
    } catch (err) {
      console.error(err);
      alert(err instanceof Error ? err.message : "返信の投稿に失敗しました");
      throw err;
    }
  };

  const toggleBookmark = (threadId: string) => {
    setBookmarkedThreads((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(threadId)) {
        newSet.delete(threadId);
      } else {
        newSet.add(threadId);
      }
      return newSet;
    });
  };

  const handleThreadClick = (threadId: string) => {
    router.push(`/timeline/${threadId}`);
  };

  const handleDelete = (threadId: string) => {
    console.log("Delete thread:", threadId);
    // 削除処理の実装
  };

  const handleReport = (threadId: string) => {
    console.log("Report thread:", threadId);
    // 通報処理の実装
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-2xl mx-auto border-x border-gray-200 min-h-screen">
        {/* エラー */}
        {error && (
          <div className="mx-4 mt-4 p-3 bg-red-50 text-red-600 rounded-lg text-sm border border-red-200">
            {error}
          </div>
        )}

        {/* 投稿なし */}
        {!loading && items.length === 0 && (
          <div className="text-center text-gray-500 py-20">
            投稿がありません
          </div>
        )}

        {/* タイムライン */}
        <div className="divide-y divide-gray-200">
          {items.map((thread) => (
            <ThreadCard
              key={thread.threadId}
              thread={thread}
              onReply={handleReply}
              onImageClick={setOpenImage}
              isBookmarked={bookmarkedThreads.has(thread.threadId)}
              onToggleBookmark={toggleBookmark}
              isCompact={false}
              currentUserId={ownUserId}
              onDelete={() => handleDelete(thread.threadId)}
              onReport={() => handleReport(thread.threadId)}
            />
          ))}
        </div>
      </div>

      {/* 返信モーダル */}
      <ReplyModal
        isOpen={replyModalOpen}
        replyTarget={replyTarget}
        onClose={() => {
          setReplyModalOpen(false);
          setReplyTarget(null);
        }}
        onSubmit={handleSubmitReply}
      />

      {/* 画像モーダル */}
      <ImageModal imageUrl={openImage} onClose={() => setOpenImage(null)} />
    </div>
  );
}
