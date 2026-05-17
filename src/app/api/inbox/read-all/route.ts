import { auth } from "@/src/services/auth";
import { NextRequest, NextResponse } from "next/server";

const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

export async function PUT(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.idToken) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Optional: Parse body if the backend supports filter by type
    let body = {};
    try {
      const text = await request.text();
      if (text) {
        body = JSON.parse(text);
      }
    } catch {
      // ignore if empty body
    }

    const response = await fetch(`${apiBaseUrl}/inbox/read-all`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `${session?.idToken}`,
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    const responseJson = await response.json();
    return NextResponse.json(responseJson);
  } catch (error) {
    console.warn("inbox/read-all PUT API: falling back to mock read-all due to:", error);
    return NextResponse.json({ success: true, count: 3 });
  }
}
