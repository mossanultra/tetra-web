"use client";

import { useEffect, useState } from "react";
import { ThreadDTO } from "@/src/features/thread/components/ThreadCard";

export const useTimeline = (initialItems: ThreadDTO[] = []) => {
  const [items, setItems] = useState(initialItems);
  const [loading, setLoading] = useState(!initialItems.length);
  const [error, setError] = useState<string | null>(null);

  const refetch = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/timeline");
      if (!res.ok) throw new Error();
      const data = await res.json();
      setItems(data.threads);
    } catch {
      setError("タイムラインの取得に失敗しました");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!initialItems.length) refetch();
  }, []);

  return { items, loading, error, refetch };
};
