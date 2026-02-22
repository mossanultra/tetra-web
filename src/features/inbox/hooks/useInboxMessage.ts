"use client";

import { useState, useEffect, useCallback } from "react";
import { InboxMessage } from "../types/Inbox";
import { getInboxMessage } from "../api/getInboxMessage";

export const useInboxMessage = (messageId: string) => {
  const [message, setMessage] = useState<InboxMessage | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchMessage = useCallback(async () => {
    if (!messageId) return;

    try {
      setLoading(true);
      const data = await getInboxMessage(messageId);
      setMessage(data);
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  }, [messageId]);

  useEffect(() => {
    fetchMessage();
  }, [fetchMessage]);

  return { message, loading, error, refetch: fetchMessage };
};
