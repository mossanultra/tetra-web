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
  FaEnvelope,
} from "react-icons/fa";
import { useProfile } from "@/src/features/user/hooks/useProfile";
import { useInboxSummary } from "@/src/features/inbox/hooks/useInboxSummary";

const navItems = [
  { href: "/home", label: "ホーム", icon: FaHome },
  { href: "/map", label: "マップ", icon: FaMapMarkedAlt },
  { href: "/timeline", label: "タイムライン", icon: FaStream },
  { href: "/inbox", label: "受信トレイ", icon: FaEnvelope },
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
  const { unreadCount } = useInboxSummary();

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
        {/* Navigation */}
        <nav className="flex flex-col gap-1 flex-1">
          {navItems.map(({ href, icon: Icon, label }) => {
            const active = pathname === href || pathname.startsWith(href + "/");
            const isInbox = href === "/inbox";

            return (
              <Link
                key={href}
                href={href}
                onClick={onClose}
                className={`
                  flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 relative
                  ${
                    active
                      ? "bg-white text-neutral-900 font-bold shadow-lg shadow-white/10"
                      : "text-neutral-400 hover:bg-neutral-800 hover:text-white"
                  }
                `}
              >
                <div className="relative">
                  <Icon size={20} />
                  {isInbox && unreadCount > 0 && (
                    <span className="absolute -top-1.5 -right-1.5 min-w-[16px] h-[16px] bg-red-500 text-white text-[10px] font-bold flex items-center justify-center rounded-full px-1 border-2 border-neutral-900 shadow-sm">
                      {unreadCount > 99 ? "99+" : unreadCount}
                    </span>
                  )}
                </div>
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
