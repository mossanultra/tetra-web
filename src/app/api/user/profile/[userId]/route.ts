// app/api/user/route.ts
import { auth } from "@/src/services/auth";
import { NextRequest, NextResponse } from "next/server";

const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const session = await auth();
    const { userId } = await params;

    // バックエンドAPIへの呼び出し
    const response = await fetch(`${apiBaseUrl}/user/profile/${userId}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `${session?.idToken}`,
      },
    });

    if (!response.ok) {
      if (response.status === 404) {
        return NextResponse.json({ error: "User not found" }, { status: 404 });
      }
      throw new Error(`API error: ${response.status}`);
    }

    const userData = await response.json();
    return NextResponse.json(userData);
  } catch (error) {
    const { userId } = await params;
    console.warn(`user/profile/[userId] GET API: falling back to mock for user ${userId} due to:`, error);
    
    // Detailed mock profile matching schema
    const mockProfile = {
      profileId: userId === "@self" ? "user_muscle" : userId,
      userId: userId === "@self" ? "user_muscle" : userId,
      userName: userId === "@self" ? "筋肉マッチョまん" : `ユーザー_${userId.slice(0, 4)}`,
      imageUrl: null,
      url: userId === "@self" ? "http://muscle___instagram" : "https://example.com/user",
      introduction: userId === "@self" ? "薄磯海岸で毎週末朝トレやってます！よろしくお願いします！" : "いわき在住の tetra ユーザーです。よろしくお願いします！",
    };
    
    return NextResponse.json(mockProfile);
  }
}
