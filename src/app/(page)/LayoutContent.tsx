import Footer from "@/src/components/layouts/Footer/footer";
import Header from "@/src/components/layouts/Header/header";
import SidebarNavigation from "@/src/components/layouts/Sidebar/Sidebar";
import SidebarContent from "@/src/components/layouts/Sidebar/SidebarContent";
import React from "react";

interface LayoutContentProps {
  children: React.ReactNode;
}

const LayoutContent: React.FC<LayoutContentProps> = ({ children }) => {
  return (
    <div className="flex flex-col h-screen">
      {/* Header */}
      <Header />

      {/* Body（残り高さを固定） */}
      <div className="flex flex-1 min-h-0">
        {/* Sidebar（スクロールしない） */}
        <aside className="w-12 shrink-0">
          <SidebarNavigation />
        </aside>

        {/* Main（ここだけスクロール） */}
        <main className="flex-1 overflow-y-auto">{children}</main>
      </div>

      {/* Footer（不要なら消す） */}
      {/* <Footer /> */}
    </div>
  );
};

export default LayoutContent;
