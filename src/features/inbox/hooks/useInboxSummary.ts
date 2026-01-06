"use client";

import { useState, useCallback, useEffect } from "react";
import { InboxResponse, InboxSummary } from "../types/Inbox";

export const useInboxSummary = () => {
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

      const res = await fetch("/api/inbox?limit=1");
      if (!res.ok) throw new Error("Failed to fetch summary");
      const data: InboxResponse = await res.json();
      setSummary(data.summary);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSummary();

    // Optional: Poll every 60 seconds
    const interval = setInterval(fetchSummary, 60000);
    return () => clearInterval(interval);
  }, [fetchSummary]);

  return {
    summary,
    unreadCount: summary?.unreadCount || 0,
    loading,
    refresh: fetchSummary,
  };
};
