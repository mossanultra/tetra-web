import React from "react";
import LayoutContent from "./LayoutContent";
import { SessionProvider } from "next-auth/react";

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <LayoutContent>
      <SessionProvider>{children}</SessionProvider>
    </LayoutContent>
  );
};

export default Layout;
