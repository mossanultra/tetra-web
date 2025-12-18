"use client";

import { useState } from "react";
import { Thread } from "../types/Thread";

export const useThread = (
  initialThread: Thread | null,
  initialChildThreads: Thread[]
) => {
  const [thread, setThread] = useState(initialThread);
  const [childThreads, setChildThreads] = useState(initialChildThreads);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
    } catch {
      setError("返信に失敗しました");
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

  return {
    thread,
    childThreads,
    loading,
    error,
    submitReply,
    deleteThread,
  };
};
