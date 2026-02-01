"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  FaMapMarkerAlt,
  FaBell,
  FaHome,
  FaCalendarAlt,
  FaUser,
} from "react-icons/fa";
import { useInboxContext } from "@/src/contexts/InboxContext";
import {
  useLoginMode,
  LoginMode,
} from "@/src/features/user/hooks/useLoginMode";

const BottomNav: React.FC = () => {
  const pathname = usePathname();
  const { getLoginMode } = useLoginMode();
  const [isGuest, setIsGuest] = useState<boolean>(true);

  useEffect(() => {
    const checkMode = async () => {
      const mode = await getLoginMode();
      setIsGuest(mode === LoginMode.GUEST);
    };
    checkMode();
  }, [getLoginMode]);

  const { unreadCount } = useInboxContext();

  const navItems = [
    {
      label: "マップ",
      href: "/map",
      icon: FaMapMarkerAlt,
    },
    {
      label: "通知",
      href: "/inbox",
      icon: FaBell,
      badge: unreadCount > 0 ? unreadCount : undefined,
    },
    {
      label: "タイムライン",
      href: "/timeline",
      icon: FaHome,
    },
    {
      label: "カレンダー",
      href: "/calender",
      icon: FaCalendarAlt,
    },
    {
      label: "マイページ",
      href: "/profile/@self",
      icon: FaUser,
    },
  ];

  const isActive = (href: string) => {
    if (href === "/timeline") {
      return pathname === "/timeline" || pathname === "/";
    }
    return pathname?.startsWith(href);
  };

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50 safe-area-inset-bottom">
      <div className="flex justify-around items-center h-16 px-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center justify-center flex-1 h-full relative transition-colors ${
                active ? "text-blue-600" : "text-gray-600"
              }`}
            >
              <div className="relative">
                <Icon className="text-xl" />
                {item.badge !== undefined && item.badge > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1">
                    {item.badge > 99 ? "99+" : item.badge}
                  </span>
                )}
              </div>
              <span className="text-[10px] mt-1 font-medium">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
};

export default BottomNav;
