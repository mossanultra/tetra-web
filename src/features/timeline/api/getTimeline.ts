import { Thread } from "../../thread/types/Thread";

type GetTimelineParams = {
  offset: number;
  limit: number;
  ownerUserId?: string | null;
};

type GetTimelineResponse = {
  threads: Thread[];
  total?: number;
};

export const getTimeline = async ({
  offset,
  limit,
  ownerUserId,
}: GetTimelineParams): Promise<Thread[]> => {
  const url = ownerUserId
    ? `/api/timeline/thread?ownerUserId=${ownerUserId}&limit=${limit}&offset=${offset}`
    : `/api/timeline?limit=${limit}&offset=${offset}`;

  const res = await fetch(url);
  if (!res.ok) {
    throw new Error("Failed to fetch timeline");
  }

  const data = await res.json();

  if (ownerUserId) {
    // ユーザー別: Thread[]
    return (data as Thread[]) || [];
  } else {
    // 全体: { threads: Thread[], total: number }
    return (data as GetTimelineResponse).threads || [];
  }
};
