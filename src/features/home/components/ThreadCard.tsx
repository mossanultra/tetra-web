import React from "react";
import { Thread } from "@/src/features/thread/types/Thread";

type ThreadCardProps = {
  thread: Thread;
  index: number;
};

export const ThreadCard: React.FC<ThreadCardProps> = ({ thread, index }) => {
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

  const formatDate = (dateString: string) => {
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

        {thread.categoryContent?.imageUrl && (
          <img
            src={thread.categoryContent.imageUrl}
            alt={thread.threadName}
            className="w-full h-16 sm:h-20 object-cover mb-2 border-2 border-white shadow-sm"
          />
        )}

        <div className="flex items-center gap-2 mb-2">
          {thread.ownerUserProfile.imageUrl && (
            <img
              src={thread.ownerUserProfile.imageUrl}
              alt={thread.ownerUserProfile.userName}
              className="w-5 h-5 sm:w-6 sm:h-6 rounded-full border border-gray-400 shadow"
            />
          )}
          <span className="text-xs text-gray-700 truncate">
            {thread.ownerUserProfile.userName}
          </span>
        </div>

        {"startDate" in thread.categoryContent &&
          thread.categoryContent.startDate && (
            <div className="text-xs text-gray-600 border-t border-gray-300 pt-2">
              📅 {formatDate(thread.categoryContent.startDate)}
            </div>
          )}
      </div>
    </div>
  );
};
