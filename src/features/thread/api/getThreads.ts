import { Thread } from "../types/Thread";

export const getThreads = async (
  startDate: Date,
  endDate: Date,
): Promise<Thread[]> => {
  // Expand range to handle timezone differences (JST vs UTC)
  const expandedStart = new Date(startDate);
  expandedStart.setDate(expandedStart.getDate() - 1);
  const expandedEnd = new Date(endDate);
  expandedEnd.setDate(expandedEnd.getDate() + 1);

  const startDateStr = expandedStart.toISOString().split("T")[0];
  const endDateStr = expandedEnd.toISOString().split("T")[0];

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
