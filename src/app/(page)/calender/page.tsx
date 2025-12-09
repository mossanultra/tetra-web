"use client";
import { useState, useEffect } from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import { FaCalendarAlt } from "react-icons/fa";
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

type ValuePiece = Date | null;
type Value = ValuePiece | [ValuePiece, ValuePiece];

const CalendarTimelinePage = () => {
  const router = useRouter();
  const [dateRange, setDateRange] = useState<Value>(null);
  const [threads, setThreads] = useState<ThreadDTO[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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

      const startDateStr = startDate.toISOString().split('T')[0];
      const endDateStr = endDate.toISOString().split('T')[0];

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
      setError(err instanceof Error ? err.message : "不明なエラーが発生しました");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (dateRange) {
      fetchThreads();
    }
  }, [dateRange]);

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
      day: "numeric" 
    });
  };

  const getSelectedDateRange = () => {
    if (!dateRange) return null;

    if (Array.isArray(dateRange)) {
      const start = dateRange[0];
      const end = dateRange[1];
      if (start && end) {
        return `${start.toLocaleDateString("ja-JP")} 〜 ${end.toLocaleDateString("ja-JP")}`;
      } else if (start) {
        return start.toLocaleDateString("ja-JP");
      }
    } else {
      return dateRange.toLocaleDateString("ja-JP");
    }
    return null;
  };

  const navigateToThread = (threadId: string) => {
    router.push(`/timeline/${threadId}`);
  };

  const navigateToProfile = (userId: string) => {
    router.push(`/profile/${userId}`);
  };

  const resetSelection = () => {
    setDateRange(null);
    setThreads([]);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto p-4">
        {/* ヘッダー */}
        <div className="mb-6">
          {/* <h1 className="text-2xl font-bold text-gray-900 mb-2 flex items-center gap-2">
            <FaCalendarAlt className="text-blue-500" />
            カレンダー検索
          </h1> */}
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
                <div className="text-sm text-blue-700 font-medium mb-1">選択期間</div>
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
              {loading && (
                <div className="divide-y divide-gray-200">
                  {[1, 2, 3].map((n) => (
                    <div key={n} className="p-4 animate-pulse">
                      <div className="flex gap-3">
                        <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
                        <div className="flex-1 space-y-3">
                          <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                          <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

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
                {threads.map((t) => (
                  <article
                    key={t.threadId}
                    onClick={() => navigateToThread(t.threadId)}
                    className="px-4 py-3 hover:bg-gray-50 transition cursor-pointer"
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
                        className="w-10 h-10 rounded-full object-cover cursor-pointer hover:opacity-80 transition flex-shrink-0"
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
                            className="font-bold text-gray-900 hover:underline cursor-pointer text-sm"
                          >
                            {t.ownerUserProfile.userName}
                          </span>
                          <span className="text-gray-500 text-xs">
                            · {formatDate(t.createdAt)}
                          </span>
                        </div>

                        {/* 本文 */}
                        <div className="text-gray-900 text-sm leading-normal line-clamp-2 mb-1">
                          {t.threadName}
                        </div>

                        {/* 選択日付の表示 */}
                        {t.selectDate && (
                          <div className="mt-2 inline-flex items-center gap-1.5 px-2 py-1 bg-blue-50 text-blue-700 rounded-full text-xs font-medium border border-blue-200">
                            <span>📅</span>
                            <span>{formatSelectDate(t.selectDate)}</span>
                          </div>
                        )}

                        {/* 画像プレビュー */}
                        {t.imageUrl && (
                          <div className="mt-2">
                            <img
                              src={t.imageUrl}
                              alt="投稿画像"
                              className="rounded-lg w-full object-cover max-h-32 border border-gray-200"
                            />
                          </div>
                        )}

                        {/* 返信数 */}
                        {t.childThreadCount > 0 && (
                          <div className="mt-2 text-xs text-gray-500">
                            {t.childThreadCount}件の返信
                          </div>
                        )}
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CalendarTimelinePage;