"use client";

import React, { useEffect, useState } from "react";

// カスタムフォントの読み込み
const fontStyle = `
  @font-face {
    font-family: 'Nyashi Friends';
    src: url('/nyashi_friends_tte/Nyashi_Friends.ttf') format('truetype');
    font-weight: normal;
    font-style: normal;
  }
`;

const ThreadCard = ({ thread, index }) => {
  const rotations = [-8, 5, -12, 7, -5, 10, -15, 3, -6, 12];
  const rotation = rotations[index % rotations.length];

  const pinColors = [
    "bg-red-500",
    "bg-blue-500",
    "bg-yellow-500",
    "bg-green-500",
    "bg-pink-500",
    "bg-purple-500",
  ];
  const pinColor = pinColors[index % pinColors.length];

  const pinLeftPositions = ["25%", "33%", "50%", "66%", "75%"];
  const pinLeft = pinLeftPositions[index % pinLeftPositions.length];

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return `${date.getMonth() + 1}/${date.getDate()}`;
  };

  return (
    <div
      className="relative hover:scale-110 hover:z-50 transition-all duration-300 cursor-pointer"
      style={{
        transform: `rotate(${rotation}deg)`,
        transformOrigin: "top center",
      }}
    >
      {/* ピン */}
      <div
        className="absolute -top-2 z-10"
        style={{ left: pinLeft, transform: "translateX(-50%)" }}
      >
        <div
          className={`w-4 h-4 ${pinColor} rounded-full shadow-lg border-2 border-gray-700`}
        ></div>
        <div className="w-1 h-3 bg-gray-600 mx-auto shadow"></div>
      </div>

      {/* カード本体 */}
      <div
        className="bg-yellow-50 p-3 sm:p-4 shadow-xl border border-gray-300"
        style={{
          fontFamily: "'Nyashi Friends', cursive",
          minHeight: "160px",
        }}
      >
        <h3 className="text-sm sm:text-base font-bold mb-2 text-gray-800 break-words">
          {thread.threadName}
        </h3>

        {thread.imageUrl && (
          <img
            src={thread.imageUrl}
            alt={thread.threadName}
            className="w-full h-16 sm:h-20 object-cover mb-2 border-2 border-white shadow-sm"
          />
        )}

        <div className="flex items-center gap-2 mb-2">
          <img
            src={thread.ownerUserProfile.imageUrl}
            alt={thread.ownerUserProfile.userName}
            className="w-5 h-5 sm:w-6 sm:h-6 rounded-full border border-gray-400 shadow"
          />
          <span className="text-xs text-gray-700 truncate">
            {thread.ownerUserProfile.userName}
          </span>
        </div>

        {thread.selectDate && (
          <div className="text-xs text-gray-600 border-t border-gray-300 pt-2">
            📅 {formatDate(thread.selectDate)}
          </div>
        )}
      </div>
    </div>
  );
};

const SketchThreadList = () => {
  const [threads, setThreads] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchThreads = async () => {
      try {
        const endDate = new Date();
        const startDate = new Date();
        startDate.setHours(0, 0, 0, 0);
        endDate.setMonth(endDate.getMonth() + 1);
        endDate.setHours(23, 59, 59, 999);

        const startDateStr = startDate.toISOString();
        const endDateStr = endDate.toISOString();

        console.log("Fetching threads from", startDateStr, "to", endDateStr);

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
          throw new Error("Failed to fetch threads");
        }

        const data = await res.json();
        setThreads(data.threads ?? []);
      } catch (err) {
        console.error(err);
        setThreads([]);
      } finally {
        setLoading(false);
      }
    };

    fetchThreads();
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
              <ThreadCard
                key={thread.threadId}
                thread={thread}
                index={index}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default SketchThreadList;
