// app/api/thread/select-range/route.ts
import { auth } from "@/src/services/auth";
import { NextRequest, NextResponse } from "next/server";

const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

export async function GET(request: NextRequest) {
  try {
    const session = await auth();

    // クエリ取得
    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");
    const limit = searchParams.get("limit");

    // バックエンド API の URL を組み立て
    const url = new URL(`${apiBaseUrl}/timeline/query`);
    if (startDate) url.searchParams.append("startDate", startDate);
    if (endDate) url.searchParams.append("endDate", endDate);
    if (limit) url.searchParams.append("limit", limit);

    // 外部 API 呼び出し
    const response = await fetch(url.toString(), {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `${session?.idToken}`,
      },
    });

    if (!response.ok) {
      throw new Error(`Fetch failed: ${response.status}`);
    }

    const result = await response.json();
    return NextResponse.json(result);
  } catch (error) {
    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");
    console.warn(`timeline/query API: falling back to mock (range: ${startDate} to ${endDate}) due to:`, error);

    // Mock query threads by date range (Calendar)
    const mockQueryThreads = [
      {
        threadId: "mock_query_thread_1",
        ownerUserId: "user_muscle",
        ownerName: "筋肉マッチョまん",
        ownerAvatar: "筋",
        category: "community",
        title: "マッチョサークル参加者募集！",
        content: "トレーニング参加お待ちしております！",
        createdAt: startDate || new Date().toISOString(),
        replyCount: 5,
        categoryContent: {
          url: "http://muscle___instagram"
        }
      },
      {
        threadId: "mock_query_thread_2",
        ownerUserId: "user_takibi",
        ownerName: "焚き火マスター",
        ownerAvatar: "火",
        category: "event",
        title: "焚き火イベ🔥 18時から！",
        content: "いわき海岸で焚き火やります！",
        createdAt: startDate || new Date().toISOString(),
        replyCount: 12,
        categoryContent: {
          url: ""
        }
      }
    ];

    return NextResponse.json(mockQueryThreads);
  }
}
