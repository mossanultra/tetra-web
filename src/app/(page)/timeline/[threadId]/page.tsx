"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { FaRegComment } from "react-icons/fa";

interface ThreadDTO {
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

interface ThreadResponse {
  thread: ThreadDTO;
  childThreads: { thread: ThreadDTO; childThreads: []; parentThread: ThreadDTO }[];
  parentThread: ThreadDTO | null;
}

// ------------------------------
// 日付フォーマット
// ------------------------------
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

export default function ThreadPage() {
  const params = useParams();
  const router = useRouter();
  const threadId = params.threadId as string;

  const [thread, setThread] = useState<ThreadDTO | null>(null);
  const [childThreads, setChildThreads] = useState<ThreadDTO[]>([]);
  const [loading, setLoading] = useState(true);

  // ------------------------------
  // 初期データ取得
  // ------------------------------
  useEffect(() => {
    fetchThread();
  }, [threadId]);

  const fetchThread = async () => {
    setLoading(true);

    try {
      const res = await fetch(`/api/timeline/${threadId}`);
      if (!res.ok) throw new Error("取得に失敗しました");

      const data: ThreadResponse = await res.json();

      setThread(data.thread);
      setChildThreads(data.childThreads.map((c) => c.thread));
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  // ------------------------------
  // スレッドカード（親・子共通）
  // ------------------------------
  const ThreadCard = ({
    data,
    isChild = false,
  }: {
    data: ThreadDTO;
    isChild?: boolean;
  }) => (
    <div
      className={`flex gap-3 px-4 py-4 ${
        isChild ? "ml-10 border-l border-gray-300" : ""
      }`}
    >
      {/* プロフィール画像 */}
      <img
        src={data.ownerUserProfile.imageUrl ?? "/default-user.png"}
        alt={data.ownerUserProfile.userName}
        className="w-12 h-12 rounded-full object-cover cursor-pointer hover:opacity-80"
        onClick={() => router.push(`/profile/${data.ownerUserId}`)}
      />
      {/* 右側コンテンツ */}
      <div className="flex-1 min-w-0">
        {/* 名前 & 日付 */}
        <div className="flex items-center gap-2">
          <span
            className="font-bold text-gray-900 hover:underline cursor-pointer"
            onClick={() => router.push(`/profile/${data.ownerUserId}`)}
          >
            {data.ownerUserProfile.userName}
          </span>
          <span className="text-gray-500 text-sm">· {formatDate(data.createdAt)}</span>
        </div>

        {/* 本文 */}
        <p className="text-gray-900 whitespace-pre-wrap break-words mt-1">
          {data.threadName}
        </p>

        {/* 画像 */}
        {data.imageUrl && (
          <img
            src={data.imageUrl}
            className="mt-3 rounded-xl border border-gray-200 max-h-96 object-cover"
            alt="thread image"
          />
        )}

        {/* 子スレッド数 */}
        <div className="flex items-center gap-1 text-gray-500 mt-3">
          <FaRegComment className="w-4 h-4" />
          {data.childThreadCount > 0 && (
            <span className="text-sm">{data.childThreadCount}</span>
          )}
        </div>
      </div>
    </div>
  );

  // ------------------------------
  // レンダリング
  // ------------------------------
  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-2xl mx-auto border-x border-gray-200 min-h-screen">
        {/* ローディング */}
        {loading && (
          <div className="p-6 text-center text-gray-500">読み込み中...</div>
        )}

        {/* 親スレッド */}
        {!loading && thread && <ThreadCard data={thread} />}

        {/* 子スレッド */}
        {!loading && childThreads.length > 0 && (
          <div className="border-t border-gray-200">
            {childThreads.map((child) => (
              <ThreadCard key={child.threadId} data={child} isChild />
            ))}
          </div>
        )}

        {/* スレッドなし */}
        {!loading && !thread && (
          <div className="p-6 text-center text-gray-500">スレッドが見つかりません</div>
        )}
      </div>
    </div>
  );
}
