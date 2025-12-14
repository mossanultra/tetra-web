import { ThreadDTO } from "@/src/features/thread/components/ThreadCard";

type FetchTimelineArgs = {
  idToken?: string;
  baseUrl?: string;
};

export const fetchTimeline = async ({
  idToken,
  baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000",
}: FetchTimelineArgs): Promise<ThreadDTO[]> => {
  const res = await fetch(`${baseUrl}/timeline`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      ...(idToken ? { Authorization: idToken } : {}),
    },
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error(`Timeline API error: ${res.status}`);
  }

  const data = await res.json();
  return data.threads;
};
