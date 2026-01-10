"use client";

import { useState, useCallback, useEffect } from "react";
import { InboxMessage, InboxResponse } from "../types/Inbox";

export const useInbox = () => {
  const [messages, setMessages] = useState<InboxMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [isMarking, setIsMarking] = useState(false);
  const [offset, setOffset] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const LIMIT = 10;

  const fetchMessages = useCallback(
    async (currentOffset: number, isLoadMore: boolean = false) => {
      try {
        setLoading(true);

        const res = await fetch(
          `/api/inbox?limit=${LIMIT}&offset=${currentOffset}`
        );
        if (!res.ok) throw new Error("Failed to fetch");
        const data: InboxResponse = await res.json();

        if (isLoadMore) {
          // 重複排除 (念のため)
          setMessages((prev) => {
            const newMessages = data.messages.filter(
              (newMsg) =>
                !prev.some((msg) => msg.messageId === newMsg.messageId)
            );
            return [...prev, ...newMessages];
          });
        } else {
          setMessages(data.messages || []);
        }

        if (data.pagination) {
          setHasMore(data.pagination.hasMore);
          setOffset(currentOffset + LIMIT);
        }
      } catch (err) {
        setError(err as Error);
      } finally {
        setLoading(false);
      }
    },
    []
  );

  useEffect(() => {
    fetchMessages(0, false);
  }, [fetchMessages]);

  const loadMore = useCallback(() => {
    if (!loading && hasMore) {
      fetchMessages(offset, true);
    }
  }, [loading, hasMore, offset, fetchMessages]);

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
      // Revert
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
      // Revert by re-fetching (simplest)
      fetchMessages(0, false);
    } finally {
      setIsMarking(false);
    }
  }, [fetchMessages]);

  const deleteMessage = useCallback(
    async (messageId: string) => {
      try {
        // Optimistic update
        setMessages((prev) =>
          prev.filter((msg) => msg.messageId !== messageId)
        );

        const res = await fetch(`/api/inbox/${messageId}`, {
          method: "DELETE",
        });

        if (!res.ok) {
          throw new Error("Failed to delete message");
        }
      } catch (err) {
        console.error(err);
        // Revert by re-fetching
        fetchMessages(0, false);
      }
    },
    [fetchMessages]
  );

  return {
    messages,
    isLoading: loading,
    error,
    markAsRead,
    markAllAsRead,
    deleteMessage,
    isMarking,
    refresh: () => fetchMessages(0, false),
    loadMore,
    hasMore,
  };
};
