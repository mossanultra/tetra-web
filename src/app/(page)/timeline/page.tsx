"use client";
import { useState, useEffect } from "react";
import { getAuthToken } from "../../../services/actions";

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
  const [items, setItems] = useState<ThreadDTO[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [openImage, setOpenImage] = useState<string | null>(null);

  useEffect(() => {
    fetchTimeline();
  }, []);

  const fetchTimeline = async () => {
    setLoading(true);
    setError(null);

    try {
      const token = await getAuthToken();
      if (!token) throw new Error("認証エラー: 再ログインしてください。");

      const res = await fetch("/api/timeline", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: token,
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

    if (diff < 60) return `${diff}s`;
    if (diff < 3600) return `${Math.floor(diff / 60)}m`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h`;
    return d.toLocaleString();
  };

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <div className="max-w-xl mx-auto bg-white rounded-2xl shadow-lg p-4 border border-gray-200">
        <h2 className="text-xl font-bold text-gray-800 mb-4">タイムライン</h2>

        {/* エラー */}
        {error && (
          <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg text-sm">
            {error}
          </div>
        )}

        {/* 更新ボタン */}
        <div className="flex justify-end mb-4">
          <button
            onClick={fetchTimeline}
            disabled={loading}
            className={`px-4 py-2 text-sm text-white rounded-md shadow-md bg-indigo-600 hover:bg-indigo-700 transition ${
              loading ? "opacity-70 cursor-not-allowed" : ""
            }`}
          >
            {loading ? "読み込み中..." : "更新"}
          </button>
        </div>

        {/* スケルトン */}
        {loading && (
          <div className="space-y-4">
            {[1, 2, 3].map((n) => (
              <div key={n} className="animate-pulse">
                <div className="h-20 bg-gray-200 rounded-xl"></div>
              </div>
            ))}
          </div>
        )}

        {/* 投稿なし */}
        {!loading && items.length === 0 && (
          <div className="text-center text-gray-500 py-10">
            投稿がありません
          </div>
        )}

        {/* タイムライン */}
        <div className="space-y-4">
          {items.map((t) => (
            <div
              key={t.threadId}
              className="p-4 border border-gray-200 rounded-2xl bg-white shadow-sm hover:shadow-md transition"
            >
              {/* ユーザー情報 */}
              <div className="flex items-center gap-3">
                <img
                  src={t.ownerUserProfile.imageUrl ?? "/default-user.png"}
                  className="w-10 h-10 rounded-full object-cover"
                />
                <div>
                  <div className="font-semibold text-gray-800">
                    {t.ownerUserProfile.userName}
                  </div>
                  <div className="text-sm text-gray-400">
                    {formatDate(t.createdAt)}
                  </div>
                </div>
              </div>

              {/* 文章 */}
              <div className="mt-3 text-gray-800 text-[15px]">
                {t.threadName}
              </div>

              {/* 画像 */}
              {t.imageUrl && (
                <div className="mt-3">
                  <img
                    src={t.imageUrl}
                    onClick={() => setOpenImage(t.imageUrl!)}
                    className="rounded-xl w-full object-cover max-h-80 cursor-pointer hover:opacity-90 transition"
                  />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* 画像モーダル */}
      {openImage && (
        <div
          className="fixed inset-0 bg-black/60 flex items-center justify-center z-50"
          onClick={() => setOpenImage(null)}
        >
          <img
            src={openImage}
            className="max-w-[90vw] max-h-[90vh] rounded-xl shadow-xl"
          />
        </div>
      )}
    </div>
  );
};

export default TimelinePage;
