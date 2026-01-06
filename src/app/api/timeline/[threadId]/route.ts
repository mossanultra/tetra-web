// app/api/user/route.ts
import { auth } from "@/src/services/auth";
import { NextRequest, NextResponse } from "next/server";

const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ threadId: string }> }
) {
  try {
    const session = await auth();
    const { threadId } = await params;

    // バックエンドAPIへの呼び出し
    const response = await fetch(
      `${apiBaseUrl}/timeline/thread?threadId=${threadId}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `${session?.idToken}`,
        },
      }
    );
    if (response.status === 404) {
      return NextResponse.json({ error: "Thread not found" }, { status: 404 });
    }
    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    const responseJson = await response.json();
    return NextResponse.json(responseJson);
  } catch (error) {
    console.error("map API error:", error);
    return NextResponse.json(
      { error: "Failed to fetch thread" },
      { status: 500 }
    );
  }
}

// export async function POST(request: NextRequest) {
//   try {
//     const session = await auth();

//     if (!session?.idToken) {
//       return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
//     }
//     const body = await request.json();
//     const response = await fetch(`${apiBaseUrl}/timeline/thread`, {
//       method: "POST",
//       headers: {
//         "Content-Type": "application/json",
//         Authorization: session.idToken as string,
//       },
//       body: JSON.stringify(body),
//     });

//     if (!response.ok) {
//       throw new Error(`Failed to create exercise: ${response.status}`);
//     }

//     const createdExercise = await response.json();
//     return NextResponse.json(createdExercise);
//   } catch (error) {
//     console.error("Thread Create API error:", error);
//     return NextResponse.json(
//       { error: "Failed to Thread Create API" },
//       { status: 500 }
//     );
//   }
// }
