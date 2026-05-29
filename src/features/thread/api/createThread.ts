import { Thread } from "../types/Thread";

type CreateThreadDTO = {
  threadName: string;
  imageUrl: string | null;
  parentThreadId?: string;
  category?: string;
  url?: string;
  detail?: string;
};

export const createThread = async ({
  threadName,
  imageUrl,
  parentThreadId,
  category,
  url,
  detail,
}: CreateThreadDTO): Promise<Thread> => {
  const res = await fetch("/api/timeline/thread", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ threadName, imageUrl, parentThreadId, category, url, detail }),
  });

  if (!res.ok) throw new Error("failed");

  return res.json();
};
