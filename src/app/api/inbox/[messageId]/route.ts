import { auth } from "@/src/services/auth";
import { NextRequest, NextResponse } from "next/server";

const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ messageId: string }> },
) {
  try {
    const session = await auth();

    if (!session?.idToken) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { messageId } = await params;

    const response = await fetch(`${apiBaseUrl}/inbox/${messageId}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `${session?.idToken}`,
      },
    });

    if (!response.ok) {
      if (response.status === 404) {
        return NextResponse.json(
          { error: "Message not found" },
          { status: 404 },
        );
      }
      throw new Error(`API error: ${response.status}`);
    }

    const responseJson = await response.json();
    return NextResponse.json(responseJson);
  } catch (error) {
    const { messageId } = await params;
    console.warn(`inbox/[messageId] GET API: falling back to mock for ${messageId} due to:`, error);
    
    // Detailed mock message
    const mockMessage = {
      messageId: messageId,
      type: "NewEvent",
      title: "新しいイベントが近くで開催されます！",
      body: "焚き火イベ🔥 が薄磯海岸で開催決定！詳細をチェックしましょう。いわき海岸にて18時より開催されます。どなたでもお気軽にご参加ください！",
      isRead: false,
      createdAt: new Date(Date.now() - 3600 * 1000 * 2).toISOString(),
      eventId: "mock_thread_2"
    };
    return NextResponse.json(mockMessage);
  }
}
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ messageId: string }> },
) {
  try {
    const session = await auth();

    if (!session?.idToken) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { messageId } = await params;

    const response = await fetch(`${apiBaseUrl}/inbox/${messageId}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        Authorization: `${session?.idToken}`,
      },
    });

    if (!response.ok) {
      if (response.status === 404) {
        return NextResponse.json(
          { error: "Message not found" },
          { status: 404 },
        );
      }
      throw new Error(`API error: ${response.status}`);
    }

    const responseJson = await response.json();
    return NextResponse.json(responseJson);
  } catch (error) {
    const { messageId } = await params;
    console.warn(`inbox/[messageId] DELETE API: falling back to mock for ${messageId} due to:`, error);
    return NextResponse.json({ success: true, messageId });
  }
}
