"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  FaMapMarkedAlt,
  FaStream,
  FaCalendarAlt,
  FaSignOutAlt,
  FaUser,
  FaEnvelope,
  FaBug,
} from "react-icons/fa";
import useFcmToken from "@/src/hooks/useFcmToken";
import { useProfile } from "@/src/features/user/hooks/useProfile";
import { useInboxContext } from "@/src/contexts/InboxContext";
import { useModals } from "@/src/contexts/ModalContext";
import {
  useLoginMode,
  LoginMode,
} from "@/src/features/user/hooks/useLoginMode";

const navItems = [
  { href: "/map", label: "マップ", icon: FaMapMarkedAlt },
  { href: "/timeline", label: "タイムライン", icon: FaStream },
  { href: "/calender", label: "カレンダー", icon: FaCalendarAlt },
  { href: "/inbox", label: "通知", icon: FaEnvelope },
  { href: "/profile/@self", label: "マイページ", icon: FaUser },
];

export default function SidebarNavigation() {
  const pathname = usePathname();
  const { data: profile, fetchProfile } = useProfile();
  const { getLoginMode } = useLoginMode();
  const [isGuest, setIsGuest] = useState<boolean>(true);
  const { requestPermission } = useFcmToken();
  const { openPost } = useModals();

  // レンダリングごとの状態を確認するためのデバッグログを追加
  console.log("[SidebarNavigation] Render state:", {
    profile,
    profileUserName: profile?.userName,
    profileProfileId: profile?.profileId,
    isGuest,
  });

  useEffect(() => {
    const checkMode = async () => {
      const mode = await getLoginMode();
      console.log("[SidebarNavigation] useEffect checkMode:", { mode });
      setIsGuest(mode === LoginMode.GUEST);

      // ログイン状態であり、まだプロフィールが取得できていない場合に取得を実行
      if (mode === LoginMode.LOGIN && !profile) {
        console.log(
          "[SidebarNavigation] User is logged in but profile is null. Calling fetchProfile()...",
        );
        try {
          await fetchProfile();
          console.log(
            "[SidebarNavigation] fetchProfile completed successfully.",
          );
        } catch (error) {
          console.error("[SidebarNavigation] fetchProfile failed:", error);
        }
      }
    };
    checkMode();
  }, [getLoginMode, profile, fetchProfile]);

  const { unreadCount } = useInboxContext();

  return (
    <div className="hidden md:flex w-64 flex-col bg-white border-r border-gray-200 flex-shrink-0 z-20">
      <div className="px-5 pt-6 pb-4 flex items-center justify-between">
        <span className="text-2xl font-black text-brand">Machip</span>
      </div>
      <div className="flex-1 overflow-y-auto px-3 py-2 space-y-1">
        {navItems.map(({ href, icon: Icon, label }) => {
          const active = pathname === href || pathname.startsWith(href + "/");
          const isInbox = href === "/inbox";

          return (
            <Link
              key={href}
              href={href}
              className={`
                w-full flex items-center gap-3 px-3 py-3 rounded-xl transition-colors
                ${
                  active
                    ? "bg-brand-pale text-brand"
                    : "text-gray-500 hover:bg-gray-50 active:bg-gray-50"
                }
              `}
            >
              <div className="relative flex-shrink-0">
                <Icon size={22} className={active ? "text-brand" : "text-gray-500"} />
                {isInbox && unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-red-500 rounded-full border-2 border-white text-white text-[8px] flex items-center justify-center font-bold">
                    {unreadCount > 99 ? "99+" : unreadCount}
                  </span>
                )}
              </div>
              <span className={`text-sm ${active ? "font-bold" : "font-bold"}`}>{label}</span>
            </Link>
          );
        })}
        
        <div className="pt-4 px-3">
          <button onClick={openPost} aria-label="新規投稿" className="w-full h-11 rounded-full text-white text-sm font-bold shadow-md transition-transform hover:scale-105 bg-brand">
            投稿する
          </button>
        </div>

        {/* Debug Actions */}
        <div className="pt-8 space-y-1">
          <button
            onClick={async () => {
              await requestPermission();
              alert("FCMトークンをバックエンドへ送信しました");
            }}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-gray-400 hover:bg-gray-50 transition-colors"
          >
            <FaBug size={16} />
            <span className="text-xs font-medium">FCMトークン送信(Debug)</span>
          </button>
          <button
            onClick={async () => {
              try {
                const res = await fetch("/api/news", {
                  method: "POST",
                  headers: {
                    "Content-Type": "application/json",
                  },
                  body: JSON.stringify({ region: "福島県　いわき市" }),
                });
                if (res.ok) {
                  alert("ニュース取得に成功しました");
                } else {
                  alert("ニュース取得に失敗しました: " + res.status);
                }
              } catch (e) {
                alert("エラーが発生しました: " + e);
              }
            }}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-gray-400 hover:bg-gray-50 transition-colors"
          >
            <FaBug size={16} />
            <span className="text-xs font-medium">/news 実行(Debug)</span>
          </button>
        </div>
      </div>

      {/* User Profile / Settings */}
      <div className="p-4 border-t border-gray-100">
        <div className="flex items-center gap-3 cursor-pointer p-2 rounded-xl hover:bg-gray-50 transition-colors">
          <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden flex-shrink-0">
            <FaUser className="text-gray-400" size={20} />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold truncate">{profile?.userName || "ゲスト"}</p>
            <p className="text-xs text-gray-400 truncate">@{profile?.profileId || "guest"}</p>
          </div>
          <Link href="/signout" className="text-gray-400 hover:text-gray-600 flex-shrink-0">
            <FaSignOutAlt size={16} />
          </Link>
        </div>
      </div>
    </div>
  );
}
