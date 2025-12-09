"use client";
import { useState, useEffect } from "react";
import { FaRegComment, FaRegBookmark, FaBookmark } from "react-icons/fa";
import { useRouter } from "next/navigation";

// getAuthToken は元のファイルからインポート
// import { getAuthToken } from "../../../services/actions";

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

const TimelinePage = () => {
  const router = useRouter();
  const [items, setItems] = useState<ThreadDTO[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [openImage, setOpenImage] = useState<string | null>(null);
  const [bookmarkedThreads, setBookmarkedThreads] = useState<Set<string>>(new Set());

  useEffect(() => {
    fetchTimeline();
  }, []);

  const fetchTimeline = async () => {
    setLoading(true);
    setError(null);

    try {
      // const token = await getAuthToken();
      // if (!token) throw new Error("認証エラー: 再ログインしてください。");

      const res = await fetch("/api/timeline", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          // Authorization: token,
        },
      });

      if (!res.ok) {
        throw new Error(`データ取得に失敗しました (${res.status})`);
      }

      const data = await res.json();
      setItems(data.threads);
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : "不明なエラーが発生しました");
    } finally {
      setLoading(false);
    }
  };

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

  const handleReply = (threadId: string) => {
    console.log("Reply to:", threadId);
    // リプライ処理をここに実装
  };

  const toggleBookmark = (threadId: string) => {
    setBookmarkedThreads(prev => {
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
        {/* ヘッダー */}
        <div className="sticky top-0 z-10 bg-white/80 backdrop-blur-md border-b border-gray-200">
          <div className="flex items-center justify-between px-4 py-3">
            <h2 className="text-xl font-bold text-gray-900">タイムライン</h2>
            <button
              onClick={fetchTimeline}
              disabled={loading}
              className={`px-4 py-1.5 text-sm font-semibold text-white rounded-full bg-blue-500 hover:bg-blue-600 transition ${
                loading ? "opacity-70 cursor-not-allowed" : ""
              }`}
            >
              {loading ? "読み込み中..." : "更新"}
            </button>
          </div>
        </div>

        {/* エラー */}
        {error && (
          <div className="mx-4 mt-4 p-3 bg-red-50 text-red-600 rounded-lg text-sm border border-red-200">
            {error}
          </div>
        )}

        {/* スケルトン */}
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
                        className="rounded-2xl w-full object-cover max-h-96 border border-gray-200 cursor-pointer hover:opacity-95 transition"
                      />
                    </div>
                  )}

                  {/* アクションボタン */}
                  <div className="flex items-center gap-6 mt-3 text-gray-500">
                    {/* リプライボタン */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleReply(t.threadId);
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
    </div>
  );
};

export default TimelinePage;