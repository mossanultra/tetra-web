"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  FaRegComment,
  FaRegBookmark,
  FaBookmark,
  FaTimes,
  FaImage,
} from "react-icons/fa";
import { ThreadDTO } from "@/src/features/thread/components/ThreadCard";
import { useTimeline } from "@/src/features/timeline/hooks/useTimeline";

type Props = {
  initialItems: ThreadDTO[];
};

export default function TimelineClient({ initialItems }: Props) {
  const router = useRouter();
  const { items, loading, error, refetch } = useTimeline(initialItems);
  const [openImage, setOpenImage] = useState<string | null>(null);
  const [bookmarkedThreads, setBookmarkedThreads] = useState<Set<string>>(
    new Set()
  );

  const [replyModalOpen, setReplyModalOpen] = useState(false);
  const [replyTarget, setReplyTarget] = useState<ThreadDTO | null>(null);
  const [replyText, setReplyText] = useState("");
  const [replyImage, setReplyImage] = useState<string | null>(null);
  const [replyImageFile, setReplyImageFile] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const formatDate = (iso: string) => {
    const d = new Date(iso);
    const now = new Date();
    const diff = Math.floor((now.getTime() - d.getTime()) / 1000);

    if (diff < 60) return `${diff}秒前`;
    if (diff < 3600) return `${Math.floor(diff / 60)}分前`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}時間前`;
    if (diff < 86400 * 7) return `${Math.floor(diff / 86400)}日前`;

    return d.toLocaleDateString("ja-JP", { month: "short", day: "numeric" });
  };

  const formatSelectDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString("ja-JP", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const handleReply = (thread: ThreadDTO) => {
    setReplyTarget(thread);
    setReplyModalOpen(true);
    setReplyText("");
    setReplyImage(null);
    setReplyImageFile(null);
  };

  const closeReplyModal = () => {
    setReplyModalOpen(false);
    setReplyTarget(null);
    setReplyText("");
    setReplyImage(null);
    setReplyImageFile(null);
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setReplyImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setReplyImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setReplyImage(null);
    setReplyImageFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const submitReply = async () => {
    if (!replyText.trim() || !replyTarget) return;

    setSubmitting(true);
    try {
      const body = {
        threadName: replyText,
        parentThreadId: replyTarget.threadId,
        imageBase64: replyImage || null,
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
      closeReplyModal();
      await refetch();
    } catch (err) {
      console.error(err);
      alert(err instanceof Error ? err.message : "返信の投稿に失敗しました");
    } finally {
      setSubmitting(false);
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

  const navigateToProfile = (userId: string) => {
    router.push(`/profile/${userId}`);
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
          {items.map((t) => (
            <article
              key={t.threadId}
              className="px-4 py-3 hover:bg-gray-50 transition cursor-pointer"
              onClick={() => router.push(`/timeline/${t.threadId}`)}
            >
              <div className="flex gap-3">
                {/* アイコン */}
                <img
                  src={t.ownerUserProfile.imageUrl ?? "/default-user.png"}
                  alt={t.ownerUserProfile.userName}
                  onClick={(e) => {
                    e.stopPropagation();
                    navigateToProfile(t.ownerUserId);
                  }}
                  className="w-12 h-12 rounded-full object-cover cursor-pointer hover:opacity-80 transition flex-shrink-0"
                />

                {/* コンテンツ */}
                <div className="flex-1 min-w-0">
                  {/* ユーザー情報 */}
                  <div className="flex items-center gap-2 mb-1">
                    <span
                      onClick={(e) => {
                        e.stopPropagation();
                        navigateToProfile(t.ownerUserId);
                      }}
                      className="font-bold text-gray-900 hover:underline cursor-pointer"
                    >
                      {t.ownerUserProfile.userName}
                    </span>
                    <span className="text-gray-500 text-sm">
                      · {formatDate(t.createdAt)}
                    </span>
                  </div>

                  {/* 本文 */}
                  <div className="text-gray-900 text-[15px] leading-normal whitespace-pre-wrap break-words mb-2">
                    {t.threadName}
                  </div>

                  {/* 選択日付の表示 */}
                  {t.selectDate && (
                    <div className="mb-2 inline-flex items-center gap-2 px-3 py-1.5 bg-blue-50 text-blue-700 rounded-full text-sm font-medium border border-blue-200">
                      <span>📅</span>
                      <span>{formatSelectDate(t.selectDate)}</span>
                    </div>
                  )}

                  {/* 画像 */}
                  {t.imageUrl && (
                    <div className="mt-3 mb-2">
                      <img
                        src={t.imageUrl}
                        alt="投稿画像"
                        onClick={(e) => {
                          e.stopPropagation();
                          setOpenImage(t.imageUrl!);
                        }}
                        className="rounded-2xl w-9/12 object-cover max-h-96 border border-gray-200 cursor-pointer hover:opacity-95 transition"
                      />
                    </div>
                  )}

                  {/* アクションボタン */}
                  <div className="flex items-center gap-6 mt-3 text-gray-500">
                    {/* リプライボタン */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleReply(t);
                      }}
                      className="flex items-center gap-2 group hover:text-blue-500 transition"
                    >
                      <div className="p-2 rounded-full group-hover:bg-blue-50 transition">
                        <FaRegComment className="w-[18px] h-[18px]" />
                      </div>
                      {t.childThreadCount > 0 && (
                        <span className="text-sm">{t.childThreadCount}</span>
                      )}
                    </button>

                    {/* ブックマークボタン */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleBookmark(t.threadId);
                      }}
                      className={`flex items-center gap-2 group transition ${
                        bookmarkedThreads.has(t.threadId)
                          ? "text-blue-500"
                          : "hover:text-blue-500"
                      }`}
                    >
                      <div className="p-2 rounded-full group-hover:bg-blue-50 transition">
                        {bookmarkedThreads.has(t.threadId) ? (
                          <FaBookmark className="w-[18px] h-[18px]" />
                        ) : (
                          <FaRegBookmark className="w-[18px] h-[18px]" />
                        )}
                      </div>
                    </button>
                  </div>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>

      {/* 画像モーダル */}
      {openImage && (
        <div
          className="fixed inset-0 bg-black/90 flex items-center justify-center z-50 p-4"
          onClick={() => setOpenImage(null)}
        >
          <button
            onClick={() => setOpenImage(null)}
            className="absolute top-4 right-4 text-white text-3xl font-bold hover:opacity-70 transition"
          >
            ×
          </button>
          <img
            src={openImage}
            alt="拡大画像"
            className="max-w-full max-h-full object-contain rounded-lg"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}

      {/* 返信モーダル */}
      {replyModalOpen && replyTarget && (
        <div
          className="fixed inset-0 bg-black/50 flex items-start justify-center z-50 p-4 pt-12 overflow-y-auto"
          onClick={closeReplyModal}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl w-full max-w-xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* モーダルヘッダー */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <button
                onClick={closeReplyModal}
                className="p-2 hover:bg-gray-100 rounded-full transition"
              >
                <FaTimes className="w-5 h-5 text-gray-700" />
              </button>
              <h3 className="text-lg font-bold text-gray-900">返信</h3>
              <div className="w-9"></div>
            </div>

            {/* 元の投稿 */}
            <div className="p-4 border-b border-gray-200">
              <div className="flex gap-3">
                <img
                  src={
                    replyTarget.ownerUserProfile.imageUrl ?? "/default-user.png"
                  }
                  alt={replyTarget.ownerUserProfile.userName}
                  className="w-10 h-10 rounded-full object-cover flex-shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-bold text-gray-900">
                      {replyTarget.ownerUserProfile.userName}
                    </span>
                    <span className="text-gray-500 text-sm">
                      · {formatDate(replyTarget.createdAt)}
                    </span>
                  </div>
                  <div className="text-gray-900 text-sm">
                    {replyTarget.threadName}
                  </div>
                  {replyTarget.imageUrl && (
                    <img
                      src={replyTarget.imageUrl}
                      alt="元の投稿画像"
                      className="mt-2 rounded-xl max-h-40 object-cover"
                    />
                  )}
                </div>
              </div>
              <div className="ml-[52px] mt-2 text-sm text-gray-500">
                返信先:{" "}
                <span className="text-blue-500">
                  @{replyTarget.ownerUserProfile.userName}
                </span>
              </div>
            </div>

            {/* 返信入力エリア */}
            <div className="p-4">
              <textarea
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                placeholder="返信を入力"
                className="w-full min-h-[120px] text-gray-900 text-lg resize-none outline-none placeholder-gray-400"
                autoFocus
              />

              {/* プレビュー画像 */}
              {replyImage && (
                <div className="relative mt-3 inline-block">
                  <img
                    src={replyImage}
                    alt="プレビュー"
                    className="rounded-xl max-h-60 object-cover"
                  />
                  <button
                    onClick={removeImage}
                    className="absolute top-2 right-2 p-1.5 bg-gray-900/70 hover:bg-gray-900 rounded-full transition"
                  >
                    <FaTimes className="w-4 h-4 text-white" />
                  </button>
                </div>
              )}
            </div>

            {/* モーダルフッター */}
            <div className="flex items-center justify-between p-4 border-t border-gray-200">
              <div className="flex items-center gap-2">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageSelect}
                  className="hidden"
                />
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="p-2 hover:bg-blue-50 rounded-full transition text-blue-500"
                >
                  <FaImage className="w-5 h-5" />
                </button>
              </div>

              <button
                onClick={submitReply}
                disabled={!replyText.trim() || submitting}
                className={`px-6 py-2 text-sm font-semibold text-white rounded-full transition ${
                  !replyText.trim() || submitting
                    ? "bg-blue-300 cursor-not-allowed"
                    : "bg-blue-500 hover:bg-blue-600"
                }`}
              >
                {submitting ? "投稿中..." : "返信"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
