"use client";

import React, { createContext, useContext, useState, ReactNode } from "react";
import { PostSheet } from "@/src/components/ui/PostSheet";
import { SearchOverlay } from "@/src/components/ui/SearchOverlay";

interface ModalContextType {
  openPost: () => void;
  closePost: () => void;
  openSearch: () => void;
  closeSearch: () => void;
}

const ModalContext = createContext<ModalContextType | undefined>(undefined);

export const ModalProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isPostOpen, setIsPostOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  return (
    <ModalContext.Provider
      value={{
        openPost: () => setIsPostOpen(true),
        closePost: () => setIsPostOpen(false),
        openSearch: () => setIsSearchOpen(true),
        closeSearch: () => setIsSearchOpen(false),
      }}
    >
      {children}
      <PostSheet isOpen={isPostOpen} onClose={() => setIsPostOpen(false)} />
      <SearchOverlay isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
    </ModalContext.Provider>
  );
};

export const useModals = () => {
  const context = useContext(ModalContext);
  if (!context) {
    throw new Error("useModals must be used within a ModalProvider");
  }
  return context;
};
