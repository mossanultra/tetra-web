"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  FaUser,
  FaHome,
  FaMapMarkedAlt,
  FaStream,
  FaCalendarAlt,
  FaSignOutAlt,
} from "react-icons/fa";
import { useProfile } from "@/src/features/user/hooks/useProfile";

const navItems = [
  { href: "/home", label: "Home", icon: FaHome },
  { href: "/map", label: "Map", icon: FaMapMarkedAlt },
  { href: "/timeline", label: "Timeline", icon: FaStream },
  { href: "/calendar", label: "Calendar", icon: FaCalendarAlt },
];

export default function SidebarNavigation() {
  const pathname = usePathname();
  const { data, fetchProfile } = useProfile();

  const [open, setOpen] = useState(false);
  const popupRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  // 外側クリックで閉じる
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (popupRef.current && !popupRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div className="h-full bg-neutral-900 text-white flex flex-col items-center py-3">
      {/* ===== プロフィール ===== */}
      <div className="relative mb-4" ref={popupRef}>
        <button
          onClick={() => setOpen((v) => !v)}
          className="w-8 h-8 rounded-full overflow-hidden border border-neutral-600 bg-white flex items-center justify-center"
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

        {/* ポップアップ */}
        {open && (
          <div className="absolute left-12 top-0 bg-white text-black rounded-xl shadow-xl w-72 py-3 z-50 border border-gray-200">
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

            <div className="flex flex-col">
              <Link
                href="/profile/@self"
                className="px-4 py-3 hover:bg-gray-100 flex items-center gap-3"
              >
                <FaUser />
                プロフィールを見る
              </Link>

              <Link
                href="/settings"
                className="px-4 py-3 hover:bg-gray-100 flex items-center gap-3"
              >
                <FaCalendarAlt />
                設定
              </Link>

              <Link
                href="/signout"
                className="px-4 py-3 hover:bg-gray-100 flex items-center gap-3"
              >
                <FaSignOutAlt />
                サインアウト
              </Link>
            </div>
          </div>
        )}
      </div>

      {/* ===== ナビ ===== */}
      <nav className="flex flex-col gap-2 flex-1">
        {navItems.map(({ href, icon: Icon, label }) => {
          const active = pathname === href || pathname.startsWith(href + "/");

          return (
            <Link
              key={href}
              href={href}
              aria-label={label}
              className={`
                w-8 h-8 flex items-center justify-center rounded-lg
                transition-colors
                ${active ? "bg-white text-neutral-900" : "hover:bg-neutral-800"}
              `}
            >
              <Icon className="text-sm" />
            </Link>
          );
        })}
      </nav>

      {/* ===== ログアウト（保険） ===== */}
      <Link
        href="/signout"
        className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-red-600"
        aria-label="ログアウト"
      >
        <FaSignOutAlt className="text-sm" />
      </Link>
    </div>
  );
}
