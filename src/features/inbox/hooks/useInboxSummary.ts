"use client";

import { useState, useCallback, useEffect } from "react";
import { InboxSummary } from "../types/Inbox";
import { getInboxMessages } from "../api/getInboxMessages";

export const useInboxSummary = (options?: { enabled?: boolean }) => {
  const { enabled = true } = options || {};
  const [summary, setSummary] = useState<InboxSummary | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchSummary = useCallback(async () => {
    try {
      // Using the main inbox endpoint which returns the summary in the response
      // Ideally this should be a lightweight endpoint if possible, but the current valid endpoint is /api/inbox
      // which matches the full response schema including summary.
      // Alternatively, we could check /api/inbox/summary if it returns the same structure or just the summary.
      // Based on previous file reads, /api/inbox/summary exists but returns a different structure in the backend?
      // Let's stick to the known working /api/inbox for now, or use /api/inbox?limit=1 to be lighter.

      // Using request with limit=1 to get summary
      const data = await getInboxMessages({ limit: 1 });
      setSummary(data.summary);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (enabled) {
      fetchSummary();
    }
  }, [fetchSummary, enabled]);

  return {
    summary,
    unreadCount: summary?.unreadCount || 0,
    loading,
    refresh: fetchSummary,
  };
};
