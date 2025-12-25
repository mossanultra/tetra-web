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
  { href: "/calender", label: "Calendar", icon: FaCalendarAlt },
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
                w-10 h-10 flex items-center justify-center rounded-lg
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
