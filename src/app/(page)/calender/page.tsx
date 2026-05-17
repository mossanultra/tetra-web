"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
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

  const router = useRouter();
  
  return (
    <div className="absolute inset-0 flex flex-col bg-white md:max-w-2xl md:mx-auto md:w-full md:border-x md:border-gray-200 md:shadow-sm">
      {/* Header */}
      <div className="flex-shrink-0 px-4 py-3 flex items-center gap-3 border-b border-gray-100">
        <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 bg-brand-pale">
          <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
            <rect x="2" y="3" width="12" height="11" rx="2" stroke="#1A6B5A" strokeWidth="1.3" />
            <path d="M2 7h12M6 2v2M10 2v2" stroke="#1A6B5A" strokeWidth="1.3" strokeLinecap="round" />
          </svg>
        </div>
        <h1 className="text-base font-black">カレンダー検索</h1>
      </div>
      <p className="text-xs text-gray-400 px-4 pt-2">期間を選択してスレッドを検索できます</p>

      <div className="flex-1 overflow-y-auto">
        {/* Calendar Widget */}
        <div className="px-3 pt-3">
          <CalendarWidget value={dateRange} onChange={handleDateChange} />
          
          {dateRange && (
            <div className="flex justify-end px-2 mt-2">
              <button
                onClick={resetSelection}
                className="text-xs text-brand font-bold"
              >
                選択をクリア
              </button>
            </div>
          )}
        </div>

        {/* Search Results */}
        <div className="px-4 pt-5 pb-4">
          <p className="text-sm font-black mb-3">検索結果 {threads.length > 0 ? `(${threads.length})` : ""}</p>
          
          <div className="space-y-2">
            {/* Loading */}
            {loading && <div className="animate-pulse flex space-x-4"><div className="flex-1 space-y-4 py-1"><div className="h-4 bg-gray-200 rounded w-3/4"></div></div></div>}
            
            {/* Empty State */}
            {!loading && dateRange && threads.length === 0 && (
              <p className="text-xs text-gray-500 py-4 text-center bg-gray-50 rounded-xl">スレッドが見つかりませんでした</p>
            )}
            
            {!loading && !dateRange && (
               <p className="text-xs text-gray-400 py-4 text-center">カレンダーから日付を選択してください</p>
            )}

            {/* Results List */}
            {threads.map((thread) => {
              const d = new Date(thread.createdAt);
              const dateStr = `${d.getMonth() + 1}月${d.getDate()}日`;
              const tagColor = thread.category === "event" ? "#f83600" : "#3b82f6";
              
              return (
                <div 
                  key={thread.threadId} 
                  onClick={() => router.push(`/timeline/${thread.threadId}`)}
                  className="flex gap-3 items-start p-3.5 bg-gray-50 rounded-xl cursor-pointer active:opacity-70 transition"
                >
                  <div className="w-1 self-stretch rounded-full flex-shrink-0" style={{ background: tagColor }}></div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold truncate">{thread.threadName}</p>
                    <p className="text-xs text-gray-400 mt-0.5 truncate">{dateStr} · {thread.ownerUserProfile.userName}</p>
                  </div>
                  <svg className="text-gray-300 flex-shrink-0 mt-0.5" width="14" height="14" viewBox="0 0 14 14" fill="none">
                    <path d="M5 3l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CalendarTimelinePage;
