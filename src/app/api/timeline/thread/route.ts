// app/api/timeline/thread/route.ts
import { auth } from "@/src/services/auth";
import { NextRequest, NextResponse } from "next/server";

const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    const { searchParams } = new URL(request.url);
    const ownerUserId = searchParams.get("ownerUserId");
    const limit = searchParams.get("limit") || "20";
    const offset = searchParams.get("offset") || "0";

    const response = await fetch(
      `${apiBaseUrl}/timeline/thread?ownerUserId=${ownerUserId}&limit=${limit}&offset=${offset}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `${session?.idToken}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    const responseJson = await response.json();
    return NextResponse.json(responseJson);
  } catch (error) {
    const { searchParams } = new URL(request.url);
    const ownerUserId = searchParams.get("ownerUserId");
    console.warn(`timeline/thread GET API: falling back to mock for user ${ownerUserId} due to:`, error);

    // Mock specific user threads
    const mockUserThreads = [
      {
        threadId: "mock_user_thread_1",
        ownerUserId: ownerUserId || "user_muscle",
        ownerName: "筋肉マッチョまん",
        ownerAvatar: "筋",
        category: "community",
        title: "マッチョサークル参加者募集！",
        content: "毎週日曜朝に海岸沿いで合同トレーニングを行っています。初心者大歓迎！筋トレでいわきを盛り上げましょう！",
        createdAt: new Date(Date.now() - 3600 * 1000 * 4).toISOString(),
        replyCount: 5,
        categoryContent: {
          url: "http://muscle___instagram"
        }
      }
    ];

    return NextResponse.json(mockUserThreads);
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.idToken) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();

    // Forward JSON to backend
    const response = await fetch(`${apiBaseUrl}/timeline/thread`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: session.idToken,
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      throw new Error(`Failed to create thread: ${response.status}`);
    }

    const createdThread = await response.json();
    return NextResponse.json(createdThread);
  } catch (error) {
    console.warn("timeline/thread POST API: falling back to mock due to:", error);
    try {
      const body = await request.clone().json();
      const mockCreatedThread = {
        threadId: `mock_thread_${Date.now()}`,
        ownerUserId: "user_muscle",
        ownerName: "筋肉マッチョまん",
        ownerAvatar: "筋",
        category: body.category || "community",
        title: body.title || "新規作成スレッド",
        content: body.content || "新規作成コンテンツ",
        createdAt: new Date().toISOString(),
        replyCount: 0,
        categoryContent: {
          url: body.url || "",
          imageUrl: body.imageUrl || ""
        }
      };
      return NextResponse.json(mockCreatedThread);
    } catch {
      return NextResponse.json({ error: "Failed to parse post body" }, { status: 400 });
    }
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.idToken) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // クエリパラメータからthreadIdを取得
    const { searchParams } = new URL(request.url);
    const threadId = searchParams.get("threadId");

    if (!threadId) {
      return NextResponse.json(
        { error: "threadId is required" },
        { status: 400 }
      );
    }

    // バックエンドAPIへの呼び出し
    const response = await fetch(
      `${apiBaseUrl}/timeline/thread?threadId=${threadId}`,
      {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `${session.idToken}`,
        },
      }
    );

    if (response.status === 404) {
      return NextResponse.json({ error: "Thread not found" }, { status: 404 });
    }

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    return NextResponse.json({ success: true, threadId });
  } catch (error) {
    const { searchParams } = new URL(request.url);
    const threadId = searchParams.get("threadId");
    console.warn(`timeline/thread DELETE API: falling back to mock for thread ${threadId} due to:`, error);
    return NextResponse.json({ success: true, threadId });
  }
}
