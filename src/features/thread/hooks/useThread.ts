"use client";

import { useState } from "react";
import { Thread } from "../types/Thread";

export const useThread = (
  initialThread: Thread | null = null,
  initialChildThreads: Thread[] = []
) => {
  const [thread, setThread] = useState(initialThread);
  const [childThreads, setChildThreads] = useState(initialChildThreads);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createThread = async (
    threadName: string,
    imageBase64: string | null
  ) => {
    try {
      const res = await fetch("/api/timeline/thread", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ threadName, imageBase64 }),
      });

      if (!res.ok) throw new Error("failed");

      const newThread = await res.json();
      return newThread;
    } catch (err) {
      setError("投稿に失敗しました");
      throw err;
    }
  };

  const submitReply = async (
    parentThreadId: string,
    threadName: string,
    imageBase64: string | null
  ) => {
    try {
      const res = await fetch("/api/timeline/thread", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ parentThreadId, threadName, imageBase64 }),
      });

      if (!res.ok) throw new Error("failed");

      const newThread = await res.json();
      setChildThreads((prev) => [newThread, ...prev]);
      return newThread;
    } catch (err) {
      setError("返信に失敗しました");
      throw err;
    }
  };

  const deleteThread = async (threadId: string) => {
    console.log("Deleting thread with ID:", threadId);
    try {
      const res = await fetch(`/api/timeline/thread?threadId=${threadId}`, {
        method: "DELETE",
      });

      if (!res.ok) throw new Error("failed");

      setChildThreads((prev) => prev.filter((t) => t.threadId !== threadId));

      // メインスレッドが削除された場合
      if (thread?.threadId === threadId) {
        setThread(null);
      }
    } catch {
      setError("削除に失敗しました");
    }
  };

  const fetchThreadsByDate = async (startDate: Date, endDate: Date) => {
    try {
      setLoading(true);
      const startDateStr = startDate.toISOString().split("T")[0];
      const endDateStr = endDate.toISOString().split("T")[0];

      const res = await fetch(
        `/api/timeline/query?startDate=${startDateStr}&endDate=${endDateStr}&limit=20`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (!res.ok) throw new Error(`データ取得に失敗しました (${res.status})`);

      const data = await res.json();
      return data.threads || [];
    } catch {
      setError("タイムラインの取得に失敗しました");
      throw new Error("Failed to fetch threads");
    } finally {
      setLoading(false);
    }
  };

  return {
    thread,
    childThreads,
    loading,
    error,
    createThread,
    submitReply,
    deleteThread,
    fetchThreadsByDate,
  };
};
