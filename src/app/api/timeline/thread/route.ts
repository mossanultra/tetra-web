// app/api/user/route.ts
import { auth } from "@/src/services/auth";
import { NextRequest, NextResponse } from "next/server";

const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

export async function GET() {
  try {
    const session = await auth();

    if (!session?.idToken) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // バックエンドAPIへの呼び出し
    const response = await fetch(`${apiBaseUrl}/timeline/thread`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `${session.idToken}`,
      },
    });
    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    const responseJson = await response.json();
    return NextResponse.json(responseJson);
  } catch (error) {
    console.error("map API error:", error);
    return NextResponse.json(
      { error: "Failed to fetch map" },
      { status: 500 }
    );
  }
}
