"use client";

import React from "react";
import { FiClock, FiTag } from "react-icons/fi";
import { Point } from "@/src/features/point/types/point";

const MARKER_SIZE = 44;

const CATEGORY_STYLE: Record<string, { bg: string; border: string }> = {
  event: {
    bg: "#FFF0F5",
    border: "#FF6B9D",
  },
  chat: {
    bg: "#E9F9F7",
    border: "#4ECDC4",
  },
};

const formatEventDateRange = (startDate: string, endDate: string) => {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const format = (d: Date) =>
    d.toLocaleDateString("ja-JP", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  return `${format(start)} 〜 ${format(end)}`;
};

// ========== アイコンコンポーネント ==========
const EventIcon: React.FC = () => (
  <svg
    width={MARKER_SIZE}
    height={MARKER_SIZE}
    viewBox="0 0 100 100"
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden
  >
    <rect x="6" y="6" width="88" height="88" rx="12" fill="#FF6B9D" />
    <rect x="10" y="10" width="80" height="80" rx="10" fill="#FFE5EE" />
    <path d="M50 30 L40 55 L60 55 Z" fill="#FF6B9D" />
    <ellipse cx="50" cy="60" rx="10" ry="3" fill="#FFB800" />
    <rect
      x="36"
      y="54"
      width="4"
      height="4"
      fill="#FFB800"
      transform="rotate(20 38 56)"
    />
    <circle cx="62" cy="48" r="2" fill="#4ECDC4" />
    <rect
      x="44"
      y="66"
      width="4"
      height="4"
      fill="#95E1D3"
      transform="rotate(-15 46 68)"
    />
    <circle cx="58" cy="68" r="2" fill="#FFB800" />
  </svg>
);

const ChatIcon: React.FC = () => (
  <svg
    width={MARKER_SIZE}
    height={MARKER_SIZE}
    viewBox="0 0 100 100"
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden
  >
    <rect x="6" y="6" width="88" height="88" rx="12" fill="#4ECDC4" />
    <rect x="10" y="10" width="80" height="80" rx="10" fill="#E0F9F7" />
    <circle cx="50" cy="48" r="14" fill="#4ECDC4" />
    <path d="M42 58 L38 66 L48 58 Z" fill="#4ECDC4" />
    <circle cx="45" cy="46" r="2" fill="#fff" />
    <circle cx="55" cy="46" r="2" fill="#fff" />
    <path
      d="M44 50 Q50 54 56 50"
      stroke="#fff"
      strokeWidth="2"
      fill="none"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M62 42 Q62 40 63.5 40 Q65 40 65 42 Q65 43 63.5 44.5 Q62 43 62 42 Z"
      fill="#FF6B9D"
    />
  </svg>
);

const CategoryIcon: React.FC<{ category: string }> = ({ category }) => {
  switch (category) {
    case "event":
      return <EventIcon />;
    default:
      return <ChatIcon />;
  }
};

export const MarkerContent: React.FC<{
  point: Point;
  onClick?: () => void;
}> = ({ point, onClick }) => {
  const {
    id,
    category = "chat",
    threadName,
    imageUrl,
    startDate,
    endDate,
  } = point;

  const style = CATEGORY_STYLE[category] ?? CATEGORY_STYLE["chat"];

  return (
    <div
      onClick={onClick}
      style={{
        display: "flex",
        gap: 10,
        padding: 10,
        borderRadius: 14,
        backgroundColor: style.bg,
        border: `1px solid ${style.border}`,
        boxShadow: "0 4px 10px rgba(0,0,0,0.25)",
        cursor: "pointer",
        maxWidth: 300,
      }}
    >
      {/* サムネイル画像 */}
      {imageUrl && (
        <img
          src={imageUrl}
          alt="point image"
          style={{
            width: 64,
            height: 64,
            borderRadius: 10,
            objectFit: "cover",
            flexShrink: 0,
          }}
        />
      )}

      <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
        {/* タイトル */}
        <div style={{ fontSize: 13, fontWeight: 700 }}>
          {threadName || "(タイトル未設定)"}
        </div>

        {/* カテゴリ */}
        <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
          <FiTag size={12} />
          <span style={{ fontSize: 11 }}>
            {category === "event" ? "イベント" : "雑談"}
          </span>
        </div>

        {/* 開催日時 */}
        {startDate && endDate && (
          <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
            <FiClock size={12} />
            <span style={{ fontSize: 11 }}>
              {formatEventDateRange(startDate, endDate)}
            </span>
          </div>
        )}

        {/* ID（デバッグ用） */}
        <div
          style={{
            marginTop: 4,
            fontSize: 10,
            color: "#aaa",
            wordBreak: "break-all",
          }}
        >
          ID: {id}
        </div>
      </div>
    </div>
  );
};
