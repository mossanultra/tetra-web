// app/api/user/route.ts
import { auth } from "@/src/services/auth";
import { NextRequest, NextResponse } from "next/server";
import { getFormValue } from "../helper";

const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

export async function GET() {
  try {
    const session = await auth();

    if (!session?.idToken) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // バックエンドAPIへの呼び出し
    const response = await fetch(`${apiBaseUrl}/map`, {
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

export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.idToken) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const formData = await request.formData();
    const lat = formData.get("lat");
    const lng = formData.get("lng");
    const threadName = formData.get("threadName");
    const category = formData.get("category");
    const selectedDate = getFormValue(formData.get("selectedDate"));
    const imageBase64 = getFormValue(formData.get("imageBase64"));
    console.log("Received map POST data:", { lat, lng, threadName, category, selectedDate });
    const response = await fetch(`${apiBaseUrl}/map`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: session.idToken as string,
      },
      body: JSON.stringify({
        lat,
        lng,
        threadName,
        category,
        selectedDate,
        imageBase64
      }),
    });

    if (!response.ok) {
      throw new Error(`Failed to create thread: ${response.status}`);
    }

    const createdExercise = await response.json();
    return NextResponse.json(createdExercise);
  } catch (error) {
    return NextResponse.json(
      { error: error },
      { status: 500 }
    );
  }
}
