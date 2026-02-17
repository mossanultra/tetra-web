"use client";

import React, { use } from "react";
import { InboxMessageDetail } from "@/src/features/inbox/components/InboxMessageDetail";
import { useInboxMessage } from "@/src/features/inbox/hooks/useInboxMessage";
import { useRouter } from "next/navigation";

export default function InboxMessagePage(props: {
  params: Promise<{ messageId: string }>;
}) {
  const params = use(props.params);
  const { messageId } = params;
  const { message, loading, error } = useInboxMessage(messageId);
  const router = useRouter();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error || !message) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-white p-4">
        <p className="text-gray-500 mb-4">メッセージが見つかりませんでした</p>
        <button
          onClick={() => router.push("/inbox")}
          className="text-blue-600 font-medium hover:underline"
        >
          Inboxに戻る
        </button>
      </div>
    );
  }

  return <InboxMessageDetail message={message} />;
}
