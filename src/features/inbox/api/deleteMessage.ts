export const deleteMessage = async (messageId: string): Promise<void> => {
  const res = await fetch(`/api/inbox/${messageId}`, {
    method: "DELETE",
  });

  if (!res.ok) {
    throw new Error("Failed to delete message");
  }
};
