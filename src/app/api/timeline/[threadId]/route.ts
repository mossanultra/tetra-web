// app/api/user/route.ts
import { auth } from "@/src/services/auth";
import { NextRequest, NextResponse } from "next/server";

const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ threadId: string }> }
) {
  try {
    const session = await auth();
    const { threadId } = await params;

    // バックエンドAPIへの呼び出し
    const response = await fetch(
      `${apiBaseUrl}/timeline/thread?threadId=${threadId}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `${session?.idToken}`,
        },
      }
    );
    if (response.status === 404) {
      return NextResponse.json({ error: "Thread not found" }, { status: 404 });
    }
    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    const responseJson = await response.json();
    return NextResponse.json(responseJson);
  } catch (error) {
    const { threadId } = await params;
    console.warn(`timeline [threadId] API: falling back to mock thread ${threadId} due to:`, error);
    
    // Detailed mock thread matching schema
    const mockThreadDetails = {
      threadId: threadId,
      ownerUserId: "user_muscle",
      ownerName: "筋肉マッチョまん",
      ownerAvatar: "筋",
      category: "community",
      title: "マッチョサークル参加者募集！",
      content: "毎週日曜朝に海岸沿いで合同トレーニングを行っています。初心者大歓迎！筋トレでいわきを盛り上げましょう！",
      createdAt: new Date(Date.now() - 3600 * 1000 * 4).toISOString(),
      replyCount: 2,
      categoryContent: {
        url: "http://muscle___instagram"
      },
      replies: [
        {
          threadId: "mock_reply_1",
          ownerUserId: "user_takibi",
          ownerName: "焚き火マスター",
          ownerAvatar: "火",
          category: "comment",
          content: "すごく興味あります！今週の日曜日は開催されますか？",
          createdAt: new Date(Date.now() - 3600 * 1000 * 2).toISOString(),
          replyCount: 0
        },
        {
          threadId: "mock_reply_2",
          ownerUserId: "user_muscle",
          ownerName: "筋肉マッチョまん",
          ownerAvatar: "筋",
          category: "comment",
          content: "はい！今週日曜日も午前8時から薄磯海岸で行う予定です。動きやすい服装でお越しください！",
          createdAt: new Date(Date.now() - 3600 * 1000 * 1).toISOString(),
          replyCount: 0
        }
      ]
    };

    return NextResponse.json(mockThreadDetails);
  }
}

// export async function POST(request: NextRequest) {
//   try {
//     const session = await auth();

//     if (!session?.idToken) {
//       return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
//     }
//     const body = await request.json();
//     const response = await fetch(`${apiBaseUrl}/timeline/thread`, {
//       method: "POST",
//       headers: {
//         "Content-Type": "application/json",
//         Authorization: session.idToken as string,
//       },
//       body: JSON.stringify(body),
//     });

//     if (!response.ok) {
//       throw new Error(`Failed to create exercise: ${response.status}`);
//     }

//     const createdExercise = await response.json();
//     return NextResponse.json(createdExercise);
//   } catch (error) {
//     console.error("Thread Create API error:", error);
//     return NextResponse.json(
//       { error: "Failed to Thread Create API" },
//       { status: 500 }
//     );
//   }
// }
