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

    if (!session?.idToken) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // バックエンドAPIへの呼び出し
    const response = await fetch(`${apiBaseUrl}/user/profile/${userId}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `${session.idToken}`,
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
    console.error("User API error:", error);
    return NextResponse.json(
      { error: "Failed to fetch user data" },
      { status: 500 }
    );
  }
}
