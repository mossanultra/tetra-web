"use client";

import { useState, useCallback, useEffect } from "react";
import { InboxMessage, InboxResponse } from "../types/Inbox";
import { useInboxContext } from "@/src/contexts/InboxContext";
import { getInboxMessages } from "../api/getInboxMessages";
import { markMessageAsRead as apiMarkAsRead } from "../api/markMessageAsRead";
import { markAllMessagesAsRead as apiMarkAllAsRead } from "../api/markAllMessagesAsRead";
import { deleteMessage as apiDeleteMessage } from "../api/deleteMessage";

export const useInbox = (options?: { enabled?: boolean }) => {
  const { enabled = true } = options || {};
  const [messages, setMessages] = useState<InboxMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [isMarking, setIsMarking] = useState(false);
  const [offset, setOffset] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const LIMIT = 10;

  // Use global context to refresh summary (badge count)
  const { refreshSummary } = useInboxContext();

  const fetchMessages = useCallback(
    async (currentOffset: number, isLoadMore: boolean = false) => {
      try {
        setLoading(true);

        const data = await getInboxMessages({
          limit: LIMIT,
          offset: currentOffset,
        });

        if (isLoadMore) {
          // 重複排除 (念のため)
          setMessages((prev) => {
            const newMessages = data.messages.filter(
              (newMsg: InboxMessage) =>
                !prev.some((msg) => msg.messageId === newMsg.messageId),
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
    [],
  );

  useEffect(() => {
    if (enabled) {
      fetchMessages(0, false);
    }
  }, [fetchMessages, enabled]);

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
          msg.messageId === messageId ? { ...msg, isRead: true } : msg,
        ),
      );

      // Optimistic update
      setMessages((prev) =>
        prev.map((msg) =>
          msg.messageId === messageId ? { ...msg, isRead: true } : msg,
        ),
      );

      await apiMarkAsRead(messageId);
    } catch (err) {
      console.error(err);
      // Revert
      setMessages((prev) =>
        prev.map((msg) =>
          msg.messageId === messageId ? { ...msg, isRead: false } : msg,
        ),
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

      await apiMarkAllAsRead();
    } catch (err) {
      console.error(err);
      // Revert by re-fetching (simplest)
      fetchMessages(0, false);
    } finally {
      setIsMarking(false);
    }
  }, [fetchMessages, refreshSummary]);

  const deleteMessage = useCallback(
    async (messageId: string) => {
      try {
        // Optimistic update
        setMessages((prev) =>
          prev.filter((msg) => msg.messageId !== messageId),
        );

        await apiDeleteMessage(messageId);
      } catch (err) {
        console.error(err);
        // Revert by re-fetching
        fetchMessages(0, false);
      }
    },
    [fetchMessages],
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
