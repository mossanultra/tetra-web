import { auth } from "@/src/services/auth";
import { NextRequest, NextResponse } from "next/server";

const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ messageId: string }> }
) {
  try {
    const session = await auth();

    if (!session?.idToken) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { messageId } = await params;

    const response = await fetch(`${apiBaseUrl}/inbox/${messageId}/read`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `${session?.idToken}`,
      },
    });

    if (!response.ok) {
      if (response.status === 404) {
        return NextResponse.json(
          { error: "Message not found" },
          { status: 404 }
        );
      }
      throw new Error(`API error: ${response.status}`);
    }

    const responseJson = await response.json();
    return NextResponse.json(responseJson);
  } catch (error) {
    console.error("Inbox mark read API error:", error);
    return NextResponse.json(
      { error: "Failed to mark message as read" },
      { status: 500 }
    );
  }
}
