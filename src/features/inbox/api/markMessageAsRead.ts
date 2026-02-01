export const markMessageAsRead = async (messageId: string): Promise<void> => {
  const res = await fetch(`/api/inbox/${messageId}/read`, {
    method: "PUT",
  });

  if (!res.ok) {
    throw new Error("Failed to mark as read");
  }
};
