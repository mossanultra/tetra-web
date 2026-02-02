// app/api/thread/select-range/route.ts
import { auth } from "@/src/services/auth";
import { NextRequest, NextResponse } from "next/server";

const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

export async function GET(request: NextRequest) {
  try {
    const session = await auth();

    // if (!session?.idToken) {
    //   return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    // }
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
    console.error("Thread SelectRange API error:", error);
    return NextResponse.json(
      { error: "Failed to fetch thread range" },
      { status: 500 },
    );
  }
}
