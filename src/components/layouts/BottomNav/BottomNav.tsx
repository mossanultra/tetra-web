"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  FaMapMarkerAlt,
  FaHome,
  FaCalendarAlt,
  FaUser,
} from "react-icons/fa";
import { useModals } from "@/src/contexts/ModalContext";

const BottomNav: React.FC = () => {
  const pathname = usePathname();
  const { openPost } = useModals();

  // Create two halves of nav items to place the FAB in the center
  const leftNavItems = [
    { label: "マップ", href: "/map", icon: FaMapMarkerAlt },
    { label: "タイムライン", href: "/timeline", icon: FaHome },
  ];
  const rightNavItems = [
    { label: "カレンダー", href: "/calender", icon: FaCalendarAlt },
    { label: "マイページ", href: "/profile/@self", icon: FaUser },
  ];

  const isActive = (href: string) => {
    if (href === "/timeline") {
      return pathname === "/timeline" || pathname === "/";
    }
    return pathname?.startsWith(href);
  };

  const renderNavItem = (item: any) => {
    const Icon = item.icon;
    const active = isActive(item.href);
    return (
      <Link
        key={item.href}
        href={item.href}
        className="flex flex-col items-center justify-center flex-1 h-full relative cursor-pointer"
      >
        <div className="relative flex items-center justify-center mb-1">
          <Icon size={20} className={active ? "text-brand" : "text-gray-400"} />
          {item.badge !== undefined && item.badge > 0 && (
            <span className="absolute -top-1 -right-1.5 w-3.5 h-3.5 bg-red-500 rounded-full border-2 border-white text-white text-[8px] flex items-center justify-center font-bold">
              {item.badge > 99 ? "99+" : item.badge}
            </span>
          )}
        </div>
        <span
          className={`text-[9px] ${
            active ? "text-brand font-bold" : "text-gray-400 font-normal"
          }`}
        >
          {item.label}
        </span>
      </Link>
    );
  };

  return (
    <div className="flex-shrink-0 relative md:hidden bg-white border-t border-gray-100 z-30 overflow-visible safe-area-inset-bottom">
      {/* Floating Action Button */}
      <button
        onClick={openPost}
        aria-label="新規投稿"
        className="absolute left-1/2 flex flex-col items-center bg-transparent transition-transform hover:scale-105 active:scale-95"
        style={{ transform: "translate(-50%, -52%)", top: 0, zIndex: 31 }}
      >
        <div className="w-14 h-14 rounded-full flex items-center justify-center bg-gradient-to-tr from-brand to-brand-mid shadow-lg">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path d="M12 4v16M4 12h16" stroke="white" strokeWidth="2.5" strokeLinecap="round" />
          </svg>
        </div>
      </button>

      <div className="flex justify-around items-center h-[56px]">
        {leftNavItems.map(renderNavItem)}
        
        {/* Placeholder for center FAB */}
        <div className="flex-1 flex flex-col items-center justify-center gap-0.5">
          <div style={{ width: 22, height: 22 }}></div>
          <span className="text-[9px] text-gray-400">投稿</span>
        </div>
        
        {rightNavItems.map(renderNavItem)}
      </div>
    </div>
  );
};

export default BottomNav;
