import { auth } from "@/src/services/auth";
import { NextRequest, NextResponse } from "next/server";

const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.idToken) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();

    const response = await fetch(`${apiBaseUrl}/user/device-token`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `${session.idToken}`,
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      console.error(
        "Backend API Error:",
        response.status,
        await response.text()
      );
      return NextResponse.json(
        { error: "Failed to register token" },
        { status: response.status }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Device Token POST error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.idToken) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();

    const response = await fetch(`${apiBaseUrl}/user/device-token`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        Authorization: `${session.idToken}`,
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      console.error(
        "Backend API Error:",
        response.status,
        await response.text()
      );
      return NextResponse.json(
        { error: "Failed to delete token" },
        { status: response.status }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Device Token DELETE error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
