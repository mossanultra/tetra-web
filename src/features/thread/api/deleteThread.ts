export const deleteThread = async (threadId: string): Promise<void> => {
  const res = await fetch(`/api/timeline/thread?threadId=${threadId}`, {
    method: "DELETE",
  });

  if (!res.ok) throw new Error("failed");
};
