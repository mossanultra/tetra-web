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
    const response = await fetch(`${apiBaseUrl}/inbox/summary`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `${session?.idToken}`,
      },
    });
    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    const responseJson = await response.json();
    return NextResponse.json(responseJson);
  } catch (error) {
    console.warn("inbox/summary GET API: falling back to mock summary due to:", error);
    return NextResponse.json({ unreadCount: 2 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.idToken) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const response = await fetch(`${apiBaseUrl}/inbox/summary`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: session.idToken as string,
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to update inbox summary: ${response.status}`);
    }

    const result = await response.json();
    return NextResponse.json(result);
  } catch (error) {
    console.warn("inbox/summary PUT API: falling back to mock summary due to:", error);
    return NextResponse.json({ success: true, unreadCount: 0 });
  }
}
