"use client";

import React, {
  createContext,
  useContext,
  ReactNode,
  useCallback,
} from "react";
import { useInboxSummary } from "@/src/features/inbox/hooks/useInboxSummary";
import { useProfile } from "@/src/features/user/hooks/useProfile";

interface InboxContextType {
  unreadCount: number;
  loading: boolean;
  refreshSummary: () => Promise<void>;
}

const InboxContext = createContext<InboxContextType>({
  unreadCount: 0,
  loading: false,
  refreshSummary: async () => {},
});

export const useInboxContext = () => useContext(InboxContext);

export function InboxProvider({ children }: { children: ReactNode }) {
  const { data: profile } = useProfile();
  const { unreadCount, loading, refresh } = useInboxSummary({
    enabled: !!profile,
  });

  const refreshSummary = useCallback(async () => {
    await refresh();
  }, [refresh]);

  return (
    <InboxContext.Provider
      value={{
        unreadCount,
        loading,
        refreshSummary,
      }}
    >
      {children}
    </InboxContext.Provider>
  );
}
