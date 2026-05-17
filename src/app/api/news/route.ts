// app/api/timeline/thread/route.ts
import { auth } from "@/src/services/auth";
import { NextRequest, NextResponse } from "next/server";

const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    console.log("api call /news");

    if (!session?.idToken) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();

    // Forward JSON to backend
    const response = await fetch(`${apiBaseUrl}/news`, {
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
    console.error("Thread Create API error:", error);
    return NextResponse.json(
      { error: "Failed to create thread" },
      { status: 500 },
    );
  }
}
