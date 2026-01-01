"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  FaHome,
  FaMapMarkedAlt,
  FaStream,
  FaCalendarAlt,
  FaSignOutAlt,
  FaUser,
} from "react-icons/fa";
import { useProfile } from "@/src/features/user/hooks/useProfile";

const navItems = [
  { href: "/home", label: "ホーム", icon: FaHome },
  { href: "/map", label: "マップ", icon: FaMapMarkedAlt },
  { href: "/timeline", label: "タイムライン", icon: FaStream },
  { href: "/calender", label: "カレンダー", icon: FaCalendarAlt },
  { href: "/profile/@self", label: "プロフィール", icon: FaUser },
];

interface Props {
  open: boolean;
  onClose: () => void;
}

export default function SidebarNavigation({ open, onClose }: Props) {
  const pathname = usePathname();
  const ref = useRef<HTMLDivElement>(null);
  const { data: profile } = useProfile();

  // 外側クリックで閉じる
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        onClose();
      }
    };
    if (open) document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open, onClose]);

  return (
    <>
      {/* 背景オーバーレイ */}
      {open && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 transition-opacity"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        ref={ref}
        className={`
          fixed z-50 top-0 left-0 h-screen w-64
          bg-neutral-900 text-white shadow-2xl
          flex flex-col py-6 px-4
          transition-transform duration-300 ease-in-out
          ${open ? "translate-x-0" : "-translate-x-full"}
        `}
      >
        {/* Profile Section */}
        {/* <div className="mb-8 px-2">
          <Link
            href="/profile/@self"
            onClick={onClose}
            className="flex items-center gap-3 p-2 rounded-xl hover:bg-neutral-800 transition-colors"
          >
            <div className="w-10 h-10 rounded-full overflow-hidden border border-neutral-700 bg-neutral-800 flex items-center justify-center">
              {profile?.imageUrl ? (
                <img
                  src={profile.imageUrl}
                  alt="プロフィール"
                  className="w-full h-full object-cover"
                />
              ) : (
                <FaUser className="text-neutral-500" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-bold text-sm truncate">
                {profile?.userName ?? "ゲスト"}
              </p>
              <p className="text-xs text-neutral-500 truncate">
                プロフィールを表示
              </p>
            </div>
          </Link>
        </div> */}

        {/* Navigation */}
        <nav className="flex flex-col gap-1 flex-1">
          {navItems.map(({ href, icon: Icon, label }) => {
            const active = pathname === href || pathname.startsWith(href + "/");

            return (
              <Link
                key={href}
                href={href}
                onClick={onClose}
                className={`
                  flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200
                  ${
                    active
                      ? "bg-white text-neutral-900 font-bold shadow-lg shadow-white/10"
                      : "text-neutral-400 hover:bg-neutral-800 hover:text-white"
                  }
                `}
              >
                <Icon size={20} />
                <span className="text-sm">{label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Bottom Actions */}
        <div className="mt-auto border-t border-neutral-800 pt-4">
          <Link
            href="/signout"
            onClick={onClose}
            className="flex items-center gap-3 px-4 py-3 rounded-xl text-neutral-400 hover:bg-red-500/10 hover:text-red-500 transition-all duration-200"
          >
            <FaSignOutAlt size={20} />
            <span className="text-sm font-medium">サインアウト</span>
          </Link>
        </div>
      </aside>
    </>
  );
}
