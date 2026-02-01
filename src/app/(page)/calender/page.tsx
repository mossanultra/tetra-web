"use client";
import { useState, useEffect } from "react";
import { CalendarWidget } from "@/src/features/calendar/components/CalendarWidget";
import { getMyself } from "@/src/features/user/api/getMyself";
import { FaCalendarAlt } from "react-icons/fa";
import { ImageModal } from "@/src/features/thread/components/ImageModal";
import { ReplyModal } from "@/src/features/thread/components/ReplyModal";
import { ThreadCard } from "@/src/features/thread/components/ThreadCard";
import { ThreadSkeleton } from "@/src/features/thread/components/ThreadSkeleton";
import { Thread } from "@/src/features/thread/types/Thread";
import { useThread } from "@/src/features/thread/hooks/useThread";
import {
  LoginMode,
  useLoginMode,
} from "@/src/features/user/hooks/useLoginMode";

type ValuePiece = Date | null;
type Value = ValuePiece | [ValuePiece, ValuePiece];

const CalendarTimelinePage = () => {
  const [dateRange, setDateRange] = useState<Value>(null);
  const { submitReply: submitReplyApi, fetchThreadsByDate } = useThread();
  const [threads, setThreads] = useState<Thread[]>([]);
  const [loading, setLoading] = useState(false);
  const [userId, serUserId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [bookmarkedThreads, setBookmarkedThreads] = useState<Set<string>>(
    new Set(),
  );

  // モーダル関連
  const [replyModalOpen, setReplyModalOpen] = useState(false);
  const [replyTarget, setReplyTarget] = useState<Thread | null>(null);
  const [openImage, setOpenImage] = useState<string | null>(null);
  const { getLoginMode } = useLoginMode();

  const handleDateChange = (value: Value) => {
    setDateRange(value);
  };

  const loadThreads = async () => {
    if (!dateRange) return;
    setError(null);
    try {
      let startDate: Date;
      let endDate: Date;

      if (Array.isArray(dateRange)) {
        startDate = dateRange[0] || new Date();
        endDate = dateRange[1] || dateRange[0] || new Date();
      } else {
        startDate = dateRange;
        endDate = dateRange;
      }

      const threadsData = await fetchThreadsByDate(startDate, endDate);
      setThreads(threadsData);
    } catch (err) {
      console.error(err);
      setError(
        err instanceof Error ? err.message : "不明なエラーが発生しました",
      );
    }
  };

  const fetchUserId = async () => {
    try {
      const data = await getMyself();
      serUserId(data.userId || null);
    } catch (err) {
      console.error(err);
      setError(
        err instanceof Error ? err.message : "不明なエラーが発生しました",
      );
    }
  };

  useEffect(() => {
    const init = async () => {
      setLoading(true);
      const loginMode = await getLoginMode();
      if (loginMode === LoginMode.LOGIN) {
        await fetchUserId();
      }
      if (dateRange) {
        await loadThreads();
      }
      setLoading(false);
    };
    init();
  }, [dateRange]);

  const getSelectedDateRange = () => {
    if (!dateRange) return null;

    if (Array.isArray(dateRange)) {
      const start = dateRange[0];
      const end = dateRange[1];
      if (start && end) {
        return `${start.toLocaleDateString(
          "ja-JP",
        )} 〜 ${end.toLocaleDateString("ja-JP")}`;
      } else if (start) {
        return start.toLocaleDateString("ja-JP");
      }
    } else {
      return dateRange.toLocaleDateString("ja-JP");
    }
    return null;
  };

  const resetSelection = () => {
    setDateRange(null);
    setThreads([]);
  };

  const handleReply = (thread: Thread) => {
    setReplyTarget(thread);
    setReplyModalOpen(true);
  };

  const closeReplyModal = () => {
    setReplyModalOpen(false);
    setReplyTarget(null);
  };

  const submitReply = async (text: string, imageUrl: string | null) => {
    if (!replyTarget) return;

    try {
      await submitReplyApi(replyTarget.threadId, text, imageUrl);
      closeReplyModal();
      await loadThreads();
    } catch (err) {
      console.error(err);
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

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto p-4">
        {/* ヘッダー */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-2 flex items-center gap-2">
            <FaCalendarAlt className="text-blue-500" />
            カレンダー検索
          </h1>
          <p className="text-gray-600 text-sm">
            期間を選択してスレッドを検索できます
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* カレンダーセクション */}
          <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-200">
            {/* 選択期間表示 */}
            {dateRange && (
              <div className="mb-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
                <div className="text-sm text-blue-700 font-medium mb-1">
                  選択期間
                </div>
                <div className="text-gray-900">{getSelectedDateRange()}</div>
                <button
                  onClick={resetSelection}
                  className="mt-2 text-sm text-blue-600 hover:text-blue-700 font-medium"
                >
                  選択をクリア
                </button>
              </div>
            )}

            {/* カレンダー */}
            <CalendarWidget value={dateRange} onChange={handleDateChange} />
          </div>

          {/* スレッド一覧セクション */}
          <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
            <div className="p-4 border-b border-gray-200">
              <h2 className="text-lg font-bold text-gray-900">検索結果</h2>
              {threads.length > 0 && (
                <p className="text-sm text-gray-600 mt-1">
                  {threads.length}件のスレッドが見つかりました
                </p>
              )}
            </div>

            <div className="overflow-y-auto max-h-[600px]">
              {/* エラー */}
              {error && (
                <div className="m-4 p-3 bg-red-50 text-red-600 rounded-lg text-sm border border-red-200">
                  {error}
                </div>
              )}

              {/* ローディング */}
              {loading && <ThreadSkeleton count={3} />}

              {/* 選択前メッセージ */}
              {!loading && !dateRange && (
                <div className="text-center text-gray-500 py-20 px-4">
                  <FaCalendarAlt className="mx-auto text-4xl mb-4 text-gray-300" />
                  <p>カレンダーから期間を選択してください</p>
                </div>
              )}

              {/* 結果なし */}
              {!loading && dateRange && threads.length === 0 && (
                <div className="text-center text-gray-500 py-20 px-4">
                  <p>選択期間にスレッドが見つかりませんでした</p>
                </div>
              )}

              {/* スレッド一覧 */}
              <div className="divide-y divide-gray-200">
                {threads.map((thread) => (
                  <ThreadCard
                    key={thread.threadId}
                    thread={thread}
                    onReply={handleReply}
                    onImageClick={setOpenImage}
                    isBookmarked={bookmarkedThreads.has(thread.threadId)}
                    onToggleBookmark={toggleBookmark}
                    isCompact={true}
                    currentUserId={userId}
                    onDeleted={() => {
                      console.log("delete");
                    }}
                    onReport={() => {
                      console.log("Reported thread:", thread.threadId);
                    }}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 返信モーダル */}
      <ReplyModal
        isOpen={replyModalOpen}
        replyTarget={replyTarget}
        onClose={closeReplyModal}
        onSubmit={submitReply}
      />

      {/* 画像モーダル */}
      <ImageModal imageUrl={openImage} onClose={() => setOpenImage(null)} />
    </div>
  );
};

export default CalendarTimelinePage;
