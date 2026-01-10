"use client";

import Footer from "@/src/components/layouts/Footer/footer";
import Header from "@/src/components/layouts/Header/header";
import SidebarNavigation from "@/src/components/layouts/Sidebar/Sidebar";
import SidebarContent from "@/src/components/layouts/Sidebar/SidebarContent";
import BottomNav from "@/src/components/layouts/BottomNav/BottomNav";
import React, { useState } from "react";

interface LayoutContentProps {
  children: React.ReactNode;
}

const LayoutContent: React.FC<LayoutContentProps> = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  return (
    <div className="flex flex-col h-screen">
      {/* Header */}
      <Header onMenuClick={() => setSidebarOpen(true)} />

      {/* Body（残り高さを固定） */}
      <div className="flex flex-1 min-h-0">
        {/* Sidebar（スクロールしない） */}
        <SidebarNavigation
          open={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
        />

        {/* Main（ここだけスクロール） - Add bottom padding on mobile for bottom nav */}
        <main
          id="scrollableDiv"
          className="flex-1 overflow-y-auto pb-16 md:pb-0"
        >
          {children}
        </main>
      </div>

      {/* Mobile Bottom Navigation */}
      <BottomNav />

      {/* Footer（不要なら消す） */}
      {/* <Footer /> */}
    </div>
  );
};

export default LayoutContent;
