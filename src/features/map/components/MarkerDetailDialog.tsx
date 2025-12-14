"use client";

import React from "react";
import { FiX } from "react-icons/fi";
import { Point } from "@/src/features/point/types/point";
import { MarkerContent } from "./MarkerContent";

type Props = {
  point: Point;
  isOpen: boolean;
  onClose: () => void;
  onNavigate: () => void;
};

export const MarkerDetailDialog: React.FC<Props> = ({
  point,
  onClose,
  onNavigate,
}) => {
  return (
    <>
      {/* 背景 */}
      <div
        onClick={onClose}
        style={{
          position: "fixed",
          inset: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "rgba(0,0,0,0.4)",
          zIndex: 9999,
        }}
      />

      {/* ダイアログ */}
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: 400,
          maxHeight: "90vh",
          overflowY: "auto",
          background: "transparent",
          borderRadius: 8,
          padding: 16,
          boxShadow: "0 8px 32px rgba(0,0,0,0.2)",
          color: "#333",
        }}
      >
        {/* ✕ */}
        <button
          onClick={onClose}
          style={{
            position: "absolute",
            top: -12,
            right: -12,
            width: 28,
            height: 28,
            borderRadius: "50%",
            border: "none",
            background: "#fff",
            boxShadow: "0 2px 6px rgba(0,0,0,0.3)",
            cursor: "pointer",
          }}
        >
          <FiX size={16} />
        </button>

        {/* 既存UIをそのまま使用 */}
        <MarkerContent point={point} onClick={onNavigate} />
      </div>
    </>
  );
};
