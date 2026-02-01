"use client";

import React, { useEffect, useState } from "react";
import { Thread } from "@/src/features/thread/types/Thread";
import { getThreads } from "@/src/features/thread/api/getThreads";
import { ThreadCard } from "./ThreadCard";

// カスタムフォントの読み込み
const fontStyle = `
  @font-face {
    font-family: 'Nyashi Friends';
    src: url('/nyashi_friends_tte/Nyashi_Friends.ttf') format('truetype');
    font-weight: normal;
    font-style: normal;
  }
`;

export const SketchThreadList: React.FC = () => {
  const [threads, setThreads] = useState<Thread[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchThreadsData = async () => {
      try {
        const endDate = new Date();
        const startDate = new Date();
        startDate.setHours(0, 0, 0, 0);
        endDate.setMonth(endDate.getMonth() + 1);
        endDate.setHours(23, 59, 59, 999);

        const data = await getThreads(startDate, endDate);
        setThreads(data);
      } catch (err) {
        console.error(err);
        setThreads([]);
      } finally {
        setLoading(false);
      }
    };

    fetchThreadsData();
  }, []);

  return (
    <div
      className="min-h-screen p-4"
      style={{
        backgroundImage: "url(/images/CorkBoard02.jpg)",
        backgroundSize: "cover",
        backgroundAttachment: "fixed",
      }}
    >
      <style>{fontStyle}</style>

      <div className="max-w-7xl mx-auto">
        <h1
          className="text-3xl font-bold text-amber-900 mb-6 text-center bg-amber-100 inline-block px-6 py-3 border-4 border-amber-800 shadow-lg"
          style={{
            fontFamily: "'Nyashi Friends', cursive",
            transform: "rotate(-2deg)",
          }}
        >
          今月のイベント
        </h1>

        {loading ? (
          <div className="text-center text-gray-600">読み込み中...</div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 p-4">
            {threads.map((thread, index) => (
              <ThreadCard key={thread.threadId} thread={thread} index={index} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
