"use client";

import { useState } from "react";
import InfiniteScroll from "react-infinite-scroll-component";
import { ThreadCard } from "@/src/features/thread/components/ThreadCard";
import { ReplyModal } from "@/src/features/thread/components/ReplyModal";
import { ImageModal } from "@/src/features/thread/components/ImageModal";
import { CreateThreadModal } from "./CreateThreadModal";
import { FaPlus } from "react-icons/fa";
import { useTimeline } from "@/src/features/timeline/hooks/useTimeline";
import { useThread } from "@/src/features/thread/hooks/useThread";
import { Thread } from "../../thread/types/Thread";

type Props = {
  initialItems: Thread[];
  ownUserId: string | null;
};

export default function TimelineClient({ initialItems, ownUserId }: Props) {
  // useTimeline now accepts an object
  const { items, loading, error, refetch, loadMore, hasMore } = useTimeline({
    initialItems,
    ownerUserId: null, // Global timeline
  });
  const { createThread, submitReply } = useThread();
  const [openImage, setOpenImage] = useState<string | null>(null);
  const [bookmarkedThreads, setBookmarkedThreads] = useState<Set<string>>(
    new Set()
  );

  const [replyModalOpen, setReplyModalOpen] = useState(false);
  const [replyTarget, setReplyTarget] = useState<Thread | null>(null);
  const [createModalOpen, setCreateModalOpen] = useState(false);

  const handleReply = (thread: Thread) => {
    setReplyTarget(thread);
    setReplyModalOpen(true);
  };

  const handleSubmitReply = async (text: string, imageUrl: string | null) => {
    if (!replyTarget) return;

    try {
      await submitReply(replyTarget.threadId, text, imageUrl);

      // 成功したらモーダルを閉じてタイムラインを更新
      setReplyModalOpen(false);
      setReplyTarget(null);
      await refetch();
    } catch (err) {
      console.error(err);
      alert(err instanceof Error ? err.message : "返信の投稿に失敗しました");
    }
  };

  const handleSubmitThread = async (text: string, imageUrl: string | null) => {
    try {
      await createThread(text, imageUrl);
      setCreateModalOpen(false);
      await refetch();
    } catch (err) {
      console.error(err);
      alert(err instanceof Error ? err.message : "投稿に失敗しました");
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

  const handleDeleted = async (threadId: string) => {
    // 削除完了後にタイムラインをリフレッシュ
    await refetch();
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

        {/* タイムライン */}
        <InfiniteScroll
          dataLength={items.length}
          next={loadMore}
          hasMore={hasMore}
          scrollableTarget="scrollableDiv"
          loader={
            <div className="flex justify-center items-center py-6">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500" />
            </div>
          }
          endMessage={
            !loading &&
            items.length > 0 && (
              <div className="p-8 text-center text-gray-500 text-sm">
                すべての投稿を表示しました
              </div>
            )
          }
        >
          <div className="divide-y divide-gray-200">
            {items.map((thread) => (
              <ThreadCard
                key={thread.threadId}
                thread={thread}
                onReply={handleReply}
                onImageClick={setOpenImage}
                isBookmarked={bookmarkedThreads.has(thread.threadId)}
                onToggleBookmark={toggleBookmark}
                isCompact={true}
                currentUserId={ownUserId}
                onDeleted={handleDeleted}
                onReport={() => handleReport(thread.threadId)}
              />
            ))}
          </div>
        </InfiniteScroll>

        {/* 投稿なし */}
        {!loading && items.length === 0 && (
          <div className="text-center text-gray-500 py-20">
            投稿がありません
          </div>
        )}
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

      {/* 新規投稿モーダル */}
      <CreateThreadModal
        isOpen={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        onSubmit={handleSubmitThread}
      />

      {/* 新規投稿ボタン (FAB) */}
      <button
        onClick={() => setCreateModalOpen(true)}
        className="fixed bottom-24 md:bottom-8 right-8 p-4 bg-blue-500 hover:bg-blue-600 text-white rounded-full shadow-lg transition-transform hover:scale-110 z-40"
        aria-label="新規投稿"
      >
        <FaPlus className="w-6 h-6" />
      </button>
    </div>
  );
}
