import { auth } from "@/src/services/auth";
import { NextRequest, NextResponse } from "next/server";

const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

export async function GET(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.idToken) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const queryString = searchParams.toString();
    const url = `${apiBaseUrl}/inbox${queryString ? `?${queryString}` : ""}`;

    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `${session?.idToken}`,
      },
    });
    if (!response.ok) {
      // Backend typically returns 403 if user not found, 500 otherwise.
      // Forwarding the status code is usually good practice.
      throw new Error(`API error: ${response.status}`);
    }

    const responseJson = await response.json();
    return NextResponse.json(responseJson);
  } catch (error) {
    console.warn("inbox GET API: falling back to mock inbox due to:", error);
    
    // Mock InboxResponse
    const mockInbox = {
      items: [
        {
          messageId: "mock_msg_1",
          type: "NewEvent",
          title: "新しいイベントが近くで開催されます！",
          body: "焚き火イベ🔥 が薄磯海岸で開催決定！詳細をチェックしましょう。",
          isRead: false,
          createdAt: new Date(Date.now() - 3600 * 1000 * 2).toISOString(), // 2 hours ago
          eventId: "mock_thread_2"
        },
        {
          messageId: "mock_msg_2",
          type: "System",
          title: "コミュニティガイドライン更新のお知らせ",
          body: "お互いに気持ち良く利用できるよう、マナーを守って投稿しましょう。",
          isRead: true,
          createdAt: new Date(Date.now() - 3600 * 1000 * 24).toISOString(), // 1 day ago
          eventId: null
        },
        {
          messageId: "mock_msg_3",
          type: "NewEvent",
          title: "新しい出店のお知らせ",
          body: "ハンドメイド即売会が開催されます。お見逃しなく！",
          isRead: false,
          createdAt: new Date(Date.now() - 3600 * 1000 * 48).toISOString(), // 2 days ago
          eventId: "mock_thread_3"
        }
      ],
      total: 3
    };
    return NextResponse.json(mockInbox);
  }
}
