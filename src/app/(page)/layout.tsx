import React from "react";
import LayoutContent from "./LayoutContent";
import { SessionProvider } from "next-auth/react";
import { ModalProvider } from "@/src/contexts/ModalContext";

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <ModalProvider>
      <LayoutContent>
        <SessionProvider>{children}</SessionProvider>
      </LayoutContent>
    </ModalProvider>
  );
};

export default Layout;
