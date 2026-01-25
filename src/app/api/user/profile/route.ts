// app/api/user/route.ts
import { auth } from "@/src/services/auth";
import { NextRequest, NextResponse } from "next/server";

const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";
export async function PUT(request: NextRequest) {
  try {
    const session = await auth();

    console.log("=== User Update API ===");
    console.log("Backend URL:", `${apiBaseUrl}/user/profile`);

    if (!session?.idToken) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userData = await request.json();
    // バックエンドAPIへの呼び出し
    const response = await fetch(`${apiBaseUrl}/user/profile`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: session.idToken,
      },
      body: JSON.stringify(userData),
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    const updatedUserData = await response.json();
    return NextResponse.json(updatedUserData);
  } catch (error) {
    console.error("User API error:", error);
    return NextResponse.json(
      { error: "Failed to update user data" },
      { status: 500 },
    );
  }
}
export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.idToken) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const body = await request.json();
    const response = await fetch(`${apiBaseUrl}/user/profile`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: session.idToken as string,
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Backend Error Response:", errorText);
      throw new Error(
        `Failed to create profile: ${response.status} ${errorText}`,
      );
    }

    const createdExercise = await response.json();
    return NextResponse.json(createdExercise);
  } catch (error) {
    console.error("profile API error:", error);
    return NextResponse.json(
      {
        error: "Failed Create Post",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    );
  }
}
