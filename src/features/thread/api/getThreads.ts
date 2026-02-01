import { Thread } from "../types/Thread";

export const getThreads = async (
  startDate: Date,
  endDate: Date,
): Promise<Thread[]> => {
  const startDateStr = startDate.toISOString().split("T")[0];
  const endDateStr = endDate.toISOString().split("T")[0];

  const res = await fetch(
    `/api/timeline/query?startDate=${startDateStr}&endDate=${endDateStr}&limit=20`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    },
  );

  if (!res.ok) throw new Error(`データ取得に失敗しました (${res.status})`);

  const data = await res.json();
  return data.threads || [];
};
