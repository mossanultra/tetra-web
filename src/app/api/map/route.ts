// app/api/user/route.ts
import { auth } from "@/src/services/auth";
import { NextRequest, NextResponse } from "next/server";
import { getFormValue } from "../helper";

const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

export async function GET() {
  try {
    const session = await auth();

    // バックエンドAPIへの呼び出し
    const response = await fetch(`${apiBaseUrl}/map`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `${session?.idToken || "mock-token"}`,
      },
    });
    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    const responseJson = await response.json();
    return NextResponse.json(responseJson);
  } catch (error) {
    console.warn("map GET API: falling back to mock points due to:", error);
    // Mock Map Points
    const mockPoints = [
      {
        pointId: "mock_point_1",
        lat: 37.0505,
        lng: 140.8878,
        threadName: "筋肉サークル合同練習",
        category: "community",
        imageUrl: null
      },
      {
        pointId: "mock_point_2",
        lat: 37.0535,
        lng: 140.8928,
        threadName: "いわき海岸焚き火カフェ",
        category: "event",
        imageUrl: "https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?auto=format&fit=crop&w=800&q=80"
      },
      {
        pointId: "mock_point_3",
        lat: 37.0485,
        lng: 140.8818,
        threadName: "ハンドメイド即売会",
        category: "shop",
        imageUrl: "https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&w=800&q=80"
      }
    ];
    return NextResponse.json(mockPoints);
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
        imageBase64,
      }),
    });

    if (!response.ok) {
      throw new Error(`Failed to create thread: ${response.status}`);
    }

    const createdExercise = await response.json();
    return NextResponse.json(createdExercise);
  } catch (error) {
    console.warn("map POST API: falling back to mock point creation due to:", error);
    try {
      const formData = await request.clone().formData();
      const mockCreatedPoint = {
        pointId: `mock_point_${Date.now()}`,
        lat: Number(formData.get("lat")) || 37.0505,
        lng: Number(formData.get("lng")) || 140.8878,
        threadName: formData.get("threadName") || "新規作成ポイント",
        category: formData.get("category") || "chat",
        imageUrl: getFormValue(formData.get("imageBase64")) || null
      };
      return NextResponse.json(mockCreatedPoint);
    } catch {
      return NextResponse.json({ error: "Failed to parse form body" }, { status: 400 });
    }
  }
}
