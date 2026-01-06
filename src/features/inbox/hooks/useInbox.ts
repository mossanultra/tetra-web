"use client";

import { useState, useCallback, useEffect } from "react";
import { InboxMessage, InboxResponse } from "../types/Inbox";

export const useInbox = () => {
  const [messages, setMessages] = useState<InboxMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [isMarking, setIsMarking] = useState(false);

  const fetchMessages = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/inbox?limit=50");
      if (!res.ok) throw new Error("Failed to fetch");
      const data: InboxResponse = await res.json();
      setMessages(data.messages || []);
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMessages();
  }, [fetchMessages]);

  const markAsRead = useCallback(async (messageId: string) => {
    try {
      setIsMarking(true);

      // Optimistic update
      setMessages((prev) =>
        prev.map((msg) =>
          msg.messageId === messageId ? { ...msg, isRead: true } : msg
        )
      );

      const res = await fetch(`/api/inbox/${messageId}/read`, {
        method: "PUT",
      });

      if (!res.ok) {
        throw new Error("Failed to mark as read");
      }
    } catch (err) {
      console.error(err);
      // Revert optimistic update
      setMessages((prev) =>
        prev.map((msg) =>
          msg.messageId === messageId ? { ...msg, isRead: false } : msg
        )
      );
    } finally {
      setIsMarking(false);
    }
  }, []);

  const markAllAsRead = useCallback(async () => {
    try {
      setIsMarking(true);

      // Optimistic update
      setMessages((prev) => prev.map((msg) => ({ ...msg, isRead: true })));

      const res = await fetch("/api/inbox/read-all", {
        method: "PUT",
      });

      if (!res.ok) throw new Error("Failed to mark all as read");
    } catch (err) {
      console.error(err);
      fetchMessages();
    } finally {
      setIsMarking(false);
    }
  }, [fetchMessages]);

  return {
    messages,
    isLoading: loading,
    error,
    markAsRead,
    markAllAsRead,
    isMarking,
    refresh: fetchMessages,
  };
};
