"use client";
import { useState, useEffect } from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import { FaCalendarAlt } from "react-icons/fa";
import { ImageModal } from "@/src/features/thread/components/ImageModal";
import { ReplyModal } from "@/src/features/thread/components/ReplyModal";
import { ThreadCard } from "@/src/features/thread/components/ThreadCard";
import { ThreadSkeleton } from "@/src/features/thread/components/ThreadSkeleton";
import { Thread } from "@/src/features/thread/types/Thread";

type ValuePiece = Date | null;
type Value = ValuePiece | [ValuePiece, ValuePiece];

const CalendarTimelinePage = () => {
  const [dateRange, setDateRange] = useState<Value>(null);
  const [threads, setThreads] = useState<Thread[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [bookmarkedThreads, setBookmarkedThreads] = useState<Set<string>>(
    new Set()
  );

  // モーダル関連
  const [replyModalOpen, setReplyModalOpen] = useState(false);
  const [replyTarget, setReplyTarget] = useState<Thread | null>(null);
  const [openImage, setOpenImage] = useState<string | null>(null);

  const handleDateChange = (value: Value) => {
    setDateRange(value);
  };

  const fetchThreads = async () => {
    if (!dateRange) return;

    setLoading(true);
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

      const startDateStr = startDate.toISOString().split("T")[0];
      const endDateStr = endDate.toISOString().split("T")[0];

      const res = await fetch(
        `/api/timeline/query?startDate=${startDateStr}&endDate=${endDateStr}&limit=20`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (!res.ok) {
        throw new Error(`データ取得に失敗しました (${res.status})`);
      }

      const data = await res.json();
      setThreads(data.threads || []);
    } catch (err) {
      console.error(err);
      setError(
        err instanceof Error ? err.message : "不明なエラーが発生しました"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (dateRange) {
      fetchThreads();
    }
  }, [dateRange]);

  const getSelectedDateRange = () => {
    if (!dateRange) return null;

    if (Array.isArray(dateRange)) {
      const start = dateRange[0];
      const end = dateRange[1];
      if (start && end) {
        return `${start.toLocaleDateString(
          "ja-JP"
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

  const submitReply = async (text: string, image: string | null) => {
    if (!replyTarget) return;

    const body = {
      threadName: text,
      parentThreadId: replyTarget.threadId,
      imageBase64: image || null,
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

    closeReplyModal();
    await fetchThreads();
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
            <div className="calendar-container">
              <Calendar
                onChange={handleDateChange}
                value={dateRange}
                selectRange={true}
                locale="ja-JP"
                className="w-full border-none"
              />
            </div>

            <style jsx global>{`
              .calendar-container .react-calendar {
                width: 100%;
                border: none;
                font-family: inherit;
              }
              .react-calendar__navigation {
                display: flex;
                margin-bottom: 1rem;
              }
              .react-calendar__navigation button {
                min-width: 44px;
                background: none;
                font-size: 1rem;
                font-weight: 600;
                color: #1f2937;
                padding: 0.5rem;
                border-radius: 0.5rem;
              }
              .react-calendar__navigation button:enabled:hover,
              .react-calendar__navigation button:enabled:focus {
                background-color: #f3f4f6;
              }
              .react-calendar__navigation button:disabled {
                background-color: transparent;
                color: #9ca3af;
              }
              .react-calendar__month-view__weekdays {
                text-align: center;
                font-weight: 600;
                font-size: 0.875rem;
                color: #6b7280;
                margin-bottom: 0.5rem;
              }
              .react-calendar__month-view__weekdays__weekday {
                padding: 0.5rem;
              }
              .react-calendar__month-view__weekdays__weekday abbr {
                text-decoration: none;
              }
              .react-calendar__tile {
                max-width: 100%;
                padding: 0.75rem 0.5rem;
                background: none;
                text-align: center;
                font-size: 0.875rem;
                border-radius: 0.5rem;
                aspect-ratio: 1;
                display: flex;
                align-items: center;
                justify-content: center;
              }
              .react-calendar__tile:enabled:hover,
              .react-calendar__tile:enabled:focus {
                background-color: #f3f4f6;
              }
              .react-calendar__tile--now {
                background-color: #dbeafe;
                color: #1e40af;
                font-weight: 600;
              }
              .react-calendar__tile--now:enabled:hover,
              .react-calendar__tile--now:enabled:focus {
                background-color: #bfdbfe;
              }
              .react-calendar__tile--active {
                background-color: #3b82f6 !important;
                color: white !important;
                font-weight: 600;
              }
              .react-calendar__tile--active:enabled:hover,
              .react-calendar__tile--active:enabled:focus {
                background-color: #2563eb !important;
              }
              .react-calendar__tile--rangeStart,
              .react-calendar__tile--rangeEnd {
                background-color: #3b82f6 !important;
                color: white !important;
              }
              .react-calendar__tile--range {
                background-color: #dbeafe !important;
                color: #1e40af !important;
              }
              .react-calendar__month-view__days__day--neighboringMonth {
                color: #d1d5db;
              }
              .react-calendar__year-view .react-calendar__tile,
              .react-calendar__decade-view .react-calendar__tile,
              .react-calendar__century-view .react-calendar__tile {
                padding: 1rem;
              }
            `}</style>
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
                    currentUserId={null}
                    onDelete={() => {
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
