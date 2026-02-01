export const markAllMessagesAsRead = async (): Promise<void> => {
  const res = await fetch("/api/inbox/read-all", {
    method: "PUT",
  });

  if (!res.ok) throw new Error("Failed to mark all as read");
};
