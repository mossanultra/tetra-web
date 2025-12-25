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
} from "react-icons/fa";

const navItems = [
  { href: "/home", label: "Home", icon: FaHome },
  { href: "/map", label: "Map", icon: FaMapMarkedAlt },
  { href: "/timeline", label: "Timeline", icon: FaStream },
  { href: "/calender", label: "Calendar", icon: FaCalendarAlt },
];

interface Props {
  open: boolean;
  onClose: () => void;
}

export default function SidebarNavigation({ open, onClose }: Props) {
  const pathname = usePathname();
  const ref = useRef<HTMLDivElement>(null);

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
        <div className="fixed inset-0 bg-black/40 z-40" onClick={onClose} />
      )}

      {/* Sidebar */}
      <aside
        ref={ref}
        className={`
          fixed z-50 top-0 left-0 h-screen w-14
          bg-neutral-900 text-white
          flex flex-col items-center py-3
          transition-transform duration-200
          ${open ? "translate-x-0" : "-translate-x-full"}
        `}
      >
        <nav className="flex flex-col gap-2 flex-1">
          {navItems.map(({ href, icon: Icon, label }) => {
            const active = pathname === href || pathname.startsWith(href + "/");

            return (
              <Link
                key={href}
                href={href}
                aria-label={label}
                onClick={onClose}
                className={`
                  w-10 h-10 flex items-center justify-center rounded-lg
                  ${
                    active
                      ? "bg-white text-neutral-900"
                      : "hover:bg-neutral-800"
                  }
                `}
              >
                <Icon className="text-sm" />
              </Link>
            );
          })}
        </nav>

        <Link
          href="/signout"
          onClick={onClose}
          className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-red-600"
          aria-label="ログアウト"
        >
          <FaSignOutAlt className="text-sm" />
        </Link>
      </aside>
    </>
  );
}
