"use client";

import { useState, useCallback, useEffect } from "react";
import { InboxMessage, InboxResponse } from "../types/Inbox";

export const useInbox = () => {
  const [messages, setMessages] = useState<InboxMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [isMarking, setIsMarking] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  const fetchMessages = useCallback(async (page: number = 0) => {
    try {
      setLoading(true);
      // API expects 1-based index but ReactPaginate uses 0-based
      const apiPage = page + 1;
      const res = await fetch(`/api/inbox?page=${apiPage}&limit=10`);
      if (!res.ok) throw new Error("Failed to fetch");
      const data: InboxResponse = await res.json();
      setMessages(data.messages || []);

      if (data.pagination) {
        // Calculate total pages based on total count and limit
        const calculatedTotalPages = Math.ceil(
          data.pagination.total / data.pagination.limit
        );
        setTotalPages(calculatedTotalPages);
        setCurrentPage(page);
      }
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMessages(0);
  }, [fetchMessages]);

  const changePage = useCallback(
    (page: number) => {
      fetchMessages(page);
    },
    [fetchMessages]
  );

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
      fetchMessages(currentPage);
    } finally {
      setIsMarking(false);
    }
  }, [fetchMessages, currentPage]);

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

        // If the current page becomes empty after deletion and it's not the first page, go to previous page
        if (messages.length === 1 && currentPage > 0) {
          fetchMessages(currentPage - 1);
        } else {
          // Refresh to get correct pagination state (e.g. items from next page need to shift)
          fetchMessages(currentPage);
        }
      } catch (err) {
        console.error(err);
        // Revert is complex here because we need the deleted message back.
        // Simplest strategy for now is just re-fetch current page if it fails.
        fetchMessages(currentPage);
      }
    },
    [currentPage, messages.length, fetchMessages]
  );

  return {
    messages,
    isLoading: loading,
    error,
    markAsRead,
    markAllAsRead,
    deleteMessage,
    isMarking,
    refresh: () => fetchMessages(currentPage),
    pagination: {
      pageCount: totalPages,
      currentPage,
      onPageChange: changePage,
    },
  };
};
