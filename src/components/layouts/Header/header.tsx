"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import {
  FaUser,
  FaRegCalendar,
  FaSignOutAlt,
  FaMapMarkedAlt,
  FaStream,
  FaHome,
} from "react-icons/fa";
import { useProfile } from "@/src/features/user/hooks/useProfile";

const Header: React.FC = () => {
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
    <header className="text-white shadow-md relative">
      <div className="px-4 h-16 flex justify-between items-center">
        {/* ▼ 左：ユーザーアイコン */}
        <div className="flex items-center gap-3 relative" ref={popupRef}>
          <button
            onClick={() => setOpen((prev) => !prev)}
            className="rounded-full overflow-hidden w-10 h-10 border border-gray-300 flex items-center justify-center bg-white"
          >
            {data?.imageUrl ? (
              <img
                src={data.imageUrl}
                alt="プロフィール"
                className="w-full h-full object-cover"
              />
            ) : (
              <FaUser className="text-gray-700 text-xl" />
            )}
          </button>

          {/* ▼ プロフィールポップアップ */}
          {open && (
            <div className="absolute top-14 left-0 bg-white text-black rounded-xl shadow-xl w-72 py-3 z-50 border border-gray-200">
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

              {/* ▼ メニューリスト */}
              <div className="flex flex-col">
                <Link
                  href="/profile/@self"
                  className="flex items-center gap-3 px-4 py-3 hover:bg-gray-100 transition-colors"
                >
                  <FaUser className="text-gray-700" />
                  <span className="text-gray-800">プロフィールを見る</span>
                </Link>

                <Link
                  href="/settings"
                  className="flex items-center gap-3 px-4 py-3 hover:bg-gray-100 transition-colors"
                >
                  <FaRegCalendar className="text-gray-700" />
                  <span className="text-gray-800">設定</span>
                </Link>

                <Link
                  href="/signout"
                  className="flex items-center gap-3 px-4 py-3 hover:bg-gray-100 transition-colors"
                >
                  <FaSignOutAlt className="text-gray-700" />
                  <span className="text-gray-800">サインアウト</span>
                </Link>
              </div>
            </div>
          )}

          {/* ロゴ */}
          <Link
            href="/"
            className="text-xl font-bold text-white no-underline hover:text-blue-200 transition-colors duration-200 ml-2"
          >
            にゃんこ同盟
          </Link>
        </div>

        {/* ▼ 右：ナビゲーション */}
        <nav className="flex items-center">
          <ul className="flex list-none m-0 p-0 gap-6 items-center">
            <li>
              <Link
                href="/home"
                className="text-white no-underline hover:text-blue-200 transition-colors duration-200 flex items-center gap-2"
              >
                <FaHome className="text-xl" />
                <span className="hidden md:inline">ホーム</span>
              </Link>
            </li>

            <li>
              <Link
                href="/map"
                className="text-white no-underline hover:text-blue-200 transition-colors duration-200 flex items-center gap-2"
              >
                <FaMapMarkedAlt className="text-xl" />
                <span className="hidden md:inline">マップ</span>
              </Link>
            </li>

            <li>
              <Link
                href="/timeline"
                className="text-white no-underline hover:text-blue-200 transition-colors duration-200 flex items-center gap-2"
              >
                <FaStream className="text-xl" />
                <span className="hidden md:inline">タイムライン</span>
              </Link>
            </li>

            <li>
              <Link
                href="/calender"
                className="text-white no-underline hover:text-blue-200 transition-colors duration-200 flex items-center gap-2"
              >
                <FaRegCalendar className="text-xl" />
                <span className="hidden md:inline">カレンダー</span>
              </Link>
            </li>

            <li>
              <Link
                href="/signout"
                className="text-white no-underline hover:text-blue-200 transition-colors duration-200 flex items-center gap-2"
              >
                <FaSignOutAlt className="text-xl" />
                <span className="hidden md:inline">ログアウト</span>
              </Link>
            </li>
          </ul>
        </nav>
      </div>
    </header>
  );
};

export default Header;
