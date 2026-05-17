// app/api/user/route.ts
import { auth } from "@/src/services/auth";
import { NextResponse } from "next/server";

const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

export async function GET() {
  try {
    const session = await auth();

    // バックエンドAPIへの呼び出し
    const response = await fetch(`${apiBaseUrl}/timeline`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `${session?.idToken || "mock-token"}`,
      },
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    const responseJson = await response.json();
    return NextResponse.json(responseJson);
  } catch (error) {
    console.warn("timeline API: falling back to mock data due to:", error);
    // Mock fallback data matching the timeline schema
    const mockTimeline = {
      threads: [
        {
          threadId: "mock_thread_1",
          ownerUserId: "user_muscle",
          ownerName: "筋肉マッチョまん",
          ownerAvatar: "筋",
          category: "community",
          title: "マッチョサークル参加者募集！",
          content: "毎週日曜朝に海岸沿いで合同トレーニングを行っています。初心者大歓迎！筋トレでいわきを盛り上げましょう！",
          createdAt: new Date(Date.now() - 3600 * 1000 * 4).toISOString(), // 4 hours ago
          replyCount: 5,
          categoryContent: {
            url: "http://muscle___instagram"
          }
        },
        {
          threadId: "mock_thread_2",
          ownerUserId: "user_takibi",
          ownerName: "焚き火マスター",
          ownerAvatar: "火",
          category: "event",
          title: "焚き火イベ🔥 18時から！",
          content: "いわき海岸で焚き火カフェを開催します。美味しいドリップコーヒーを用意してお待ちしております！",
          createdAt: new Date(Date.now() - 3600 * 1000 * 24).toISOString(), // 1 day ago
          replyCount: 12,
          categoryContent: {
            url: "",
            imageUrl: "https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?auto=format&fit=crop&w=800&q=80"
          }
        },
        {
          threadId: "mock_thread_3",
          ownerUserId: "user_handmade",
          ownerName: "ハンドクラフト作家",
          ownerAvatar: "芸",
          category: "shop",
          title: "ハンドメイドポップアップショップ",
          content: "いわき駅前広場にて、地元のクリエイターによるアクセサリーや小物の即売会を行います！ぜひ遊びにきてください。",
          createdAt: new Date(Date.now() - 3600 * 1000 * 48).toISOString(), // 2 days ago
          replyCount: 3,
          categoryContent: {
            url: "https://example.com/handmade-popup",
            imageUrl: "https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&w=800&q=80"
          }
        }
      ],
      total: 3
    };
    return NextResponse.json(mockTimeline);
  }
}
