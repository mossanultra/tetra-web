import { InboxMessage } from "../types/Inbox";
import { auth } from "@/src/services/auth"; // Assuming we need auth header or similar if client-side fetch doesn't handle it automatically.
// However, usually these API functions just fetch from the Next.js API route.

const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

export const getInboxMessage = async (
  messageId: string,
): Promise<InboxMessage> => {
  const response = await fetch(`/api/inbox/${messageId}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    throw new Error(`Error fetching message: ${response.statusText}`);
  }

  const data = await response.json();

  // Map MessageDetailResponse from backend to InboxMessage type
  return {
    id: data.userMessage?.id || "",
    messageId: data.message?.id || messageId,
    message: data.message,
    deliveredAt: data.userMessage?.deliveredAt || "",
    readAt: data.userMessage?.readAt || null,
    isRead: data.userMessage?.isRead || false,
  };
};
