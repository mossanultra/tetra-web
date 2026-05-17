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
import { useSignUpPrompt } from "@/src/features/user/hooks/useSignUpPrompt";
import {
  useLoginMode,
  LoginMode,
} from "@/src/features/user/hooks/useLoginMode";
import { SignUpPromptDialog } from "@/src/features/user/components/SignUpPromptDialog";

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
    new Set(),
  );

  const [replyModalOpen, setReplyModalOpen] = useState(false);
  const [replyTarget, setReplyTarget] = useState<Thread | null>(null);
  const [createModalOpen, setCreateModalOpen] = useState(false);

  const { isOpen, openDialog, closeDialog } = useSignUpPrompt();
  const { getLoginMode } = useLoginMode();

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

  const [selectedGenre, setSelectedGenre] = useState<string>("");

  return (
    <div className="absolute inset-0 flex flex-col bg-gray-50 md:max-w-2xl md:mx-auto md:w-full md:border-x md:border-gray-200 md:bg-white md:shadow-sm">
      {/* タイムライン用ヘッダー */}
      <div className="flex-shrink-0 bg-white px-4 py-3 flex items-center justify-between border-b border-gray-100">
        <h1 className="text-base font-black">掲示板</h1>
        <div className="flex gap-2">
          {/* Notification button on mobile timeline */}
          <button className="md:hidden relative w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
            <svg width="17" height="17" viewBox="0 0 22 22" fill="none">
              <path d="M11 2C7.7 2 5 4.7 5 8V14L3.5 15.5V16H18.5V15.5L17 14V8C17 4.7 14.3 2 11 2Z" stroke="#374151" strokeWidth="1.5" />
              <path d="M9 16C9 17.1 9.9 18 11 18S13 17.1 13 16" stroke="#374151" strokeWidth="1.5" />
            </svg>
          </button>
        </div>
      </div>

      {/* フィルターチップ */}
      <div className="flex-shrink-0 bg-white border-b border-gray-100 px-4 py-2 flex gap-2 overflow-x-auto no-scrollbar">
        {["すべて", "イベント・出店", "お店", "コミュニティ", "AIニュース"].map(genre => (
          <button
            key={genre}
            onClick={() => setSelectedGenre(genre === "すべて" ? "" : genre)}
            className={`flex-shrink-0 px-4 py-1.5 rounded-full text-xs font-bold transition-colors ${
              (selectedGenre === genre || (genre === "すべて" && !selectedGenre))
                ? "bg-brand text-white"
                : "bg-gray-100 text-gray-500 hover:bg-gray-200"
            }`}
          >
            {genre}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto" id="scrollableDiv">
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
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-brand" />
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
          <div className="px-4 py-3 space-y-3">
            {items
              .filter(item => !selectedGenre || item.category === selectedGenre) // NOTE: category filtering is basic for now
              .map((thread) => (
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

      {/* 新規投稿モーダル (FAB click) */}
      <CreateThreadModal
        isOpen={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        onSubmit={handleSubmitThread}
      />

      {/* Sign-up prompt dialog for guest users */}
      <SignUpPromptDialog
        isOpen={isOpen}
        onClose={closeDialog}
        title="投稿するにはアカウントが必要です"
        message="アカウントを作成すると、新しいスレッドを作成して、イベントや話題を共有できるようになります。"
      />
    </div>
  );
}
