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
    const startDate = getFormValue(formData.get("startDate"));
    const endDate = getFormValue(formData.get("endDate"));
    const detail = getFormValue(formData.get("detail"));
    const url = getFormValue(formData.get("url"));
    const imageUrl = getFormValue(formData.get("imageUrl"));

    const response = await fetch(`${apiBaseUrl}/map/event`, {
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
        startDate,
        endDate,
        detail,
        url,
        imageUrl,
      }),
    });

    if (!response.ok) {
      throw new Error(`Failed to create event point: ${response.status}`);
    }

    const createdPoint = await response.json();
    return NextResponse.json(createdPoint);
  } catch (error) {
    console.error("Map Event API Error:", error);
    return NextResponse.json({ error: error }, { status: 500 });
  }
}
