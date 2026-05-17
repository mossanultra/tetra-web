import { auth } from "@/src/services/auth";
import { NextRequest, NextResponse } from "next/server";
import { getFormValue } from "../../helper";

const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

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
    const imageUrl = getFormValue(formData.get("imageUrl"));

    const response = await fetch(`${apiBaseUrl}/map/chat`, {
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
        imageUrl,
      }),
    });

    if (!response.ok) {
      throw new Error(`Failed to create chat point: ${response.status}`);
    }

    const createdPoint = await response.json();
    return NextResponse.json(createdPoint);
  } catch (error) {
    console.warn("map/chat POST API: falling back to mock point due to:", error);
    try {
      const formData = await request.clone().formData();
      const mockCreatedPoint = {
        pointId: `mock_point_${Date.now()}`,
        lat: Number(formData.get("lat")) || 37.0505,
        lng: Number(formData.get("lng")) || 140.8878,
        threadName: formData.get("threadName") || "新規チャットポイント",
        category: formData.get("category") || "chat",
        imageUrl: getFormValue(formData.get("imageUrl")) || null
      };
      return NextResponse.json(mockCreatedPoint);
    } catch {
      return NextResponse.json({ error: "Failed to parse form body" }, { status: 400 });
    }
  }
}
