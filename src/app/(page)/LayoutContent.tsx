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
  return (
    <>
      {/* Desktop Sidebar (hidden on mobile) */}
      <SidebarNavigation />

      {/* Main Content Wrapper */}
      <div className="flex-1 flex flex-col min-w-0 relative h-full">
        {/* Pages (Children) */}
        <div className="flex-1 overflow-hidden relative w-full h-full">
          {children}
        </div>

        {/* Mobile Bottom Navigation (hidden on md) */}
        <BottomNav />
      </div>
    </>
  );
};

export default LayoutContent;
