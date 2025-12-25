"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { FaUser, FaRegCalendar, FaSignOutAlt, FaBars } from "react-icons/fa";
import { useProfile } from "@/src/features/user/hooks/useProfile";

interface HeaderProps {
  onMenuClick: () => void;
}

const Header: React.FC<HeaderProps> = ({ onMenuClick }) => {
  const { data, fetchProfile } = useProfile();
  const [open, setOpen] = useState(false);
  const popupRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  // 外側クリックで閉じる
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        popupRef.current &&
        !popupRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <header className="bg-neutral-900 text-white shadow-md relative">
      <div className="px-4 h-14 flex items-center justify-between">
        {/* ▼ 左側：ハンバーガー + タイトル */}
        <div className="flex items-center gap-3">
          <button
            onClick={onMenuClick}
            className="w-8 h-8 flex items-center justify-center rounded hover:bg-neutral-800"
            aria-label="メニューを開く"
          >
            <FaBars />
          </button>

          <h1 className="text-sm font-semibold tracking-wide">マチップ</h1>
        </div>

        {/* ▼ 右側：ユーザーアイコン */}
        <div className="relative" ref={popupRef}>
          <button
            onClick={() => setOpen((prev) => !prev)}
            className="rounded-full overflow-hidden w-9 h-9 border border-gray-300 flex items-center justify-center bg-white"
          >
            {data?.imageUrl ? (
              <img
                src={data.imageUrl}
                alt="プロフィール"
                className="w-full h-full object-cover"
              />
            ) : (
              <FaUser className="text-gray-700 text-sm" />
            )}
          </button>

          {/* ▼ プロフィールポップアップ */}
          {open && (
            <div className="absolute right-0 top-12 bg-white text-black rounded-xl shadow-xl w-72 py-3 z-50 border border-gray-200">
              {/* プロフィール概要 */}
              <div className="flex items-center gap-3 px-4 py-2">
                <div className="w-12 h-12 rounded-full overflow-hidden border bg-gray-100 flex items-center justify-center">
                  {data?.imageUrl ? (
                    <img
                      src={data.imageUrl}
                      alt="プロフィール"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <FaUser className="text-gray-500 text-xl" />
                  )}
                </div>
                <div>
                  <p className="font-bold text-gray-900">
                    {data?.userName ?? "未設定"}
                  </p>
                  <p className="text-sm text-gray-500">
                    {data?.introduction ?? ""}
                  </p>
                </div>
              </div>

              <div className="h-px bg-gray-200 my-2" />

              {/* メニュー */}
              <div className="flex flex-col">
                <Link
                  href="/profile/@self"
                  className="flex items-center gap-3 px-4 py-3 hover:bg-gray-100"
                >
                  <FaUser />
                  プロフィールを見る
                </Link>

                <Link
                  href="/settings"
                  className="flex items-center gap-3 px-4 py-3 hover:bg-gray-100"
                >
                  <FaRegCalendar />
                  設定
                </Link>

                <Link
                  href="/signout"
                  className="flex items-center gap-3 px-4 py-3 hover:bg-gray-100"
                >
                  <FaSignOutAlt />
                  サインアウト
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
