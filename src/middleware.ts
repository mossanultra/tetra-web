import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { auth } from "./services/auth";
const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

export type UserCheckResult = "ok" | "unauthorized" | "not_found" | "failed";

async function getProfile(token: string): Promise<UserCheckResult> {
  if (!token) return "unauthorized";

  try {
    // ユーザーの存在確認
    const res = await fetch(`${baseUrl}/user/profile/@self`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: token,
      },
    });
    if (res.status === 200) {
      return "ok";
    } else if (res.status === 404) {
      return "not_found";
    } else {
      console.error("Error checking user:", res.status, res.statusText);
      return "failed";
    }
  } catch (error) {
    console.error("Error in createOrVerifyUser:", error);
    return "failed";
  }
}
async function getUser(token: string): Promise<UserCheckResult> {
  if (!token) return "unauthorized";

  try {
    // ユーザーの存在確認
    const res = await fetch(`${baseUrl}/user`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: token,
      },
    });
    if (res.status === 200) {
      return "ok";
    } else if (res.status === 404) {
      return "not_found";
    } else {
      console.error("Error checking user:", res.status, res.statusText);
      return "failed";
    }
  } catch (error) {
    console.error("Error in createOrVerifyUser:", error);
    return "failed";
  }
}

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  console.log("[Middleware] Requested Path:", pathname);

  // ルートパス（"/"）へのアクセスの場合 "/home" にリダイレクト
  if (pathname === "/") {
    return NextResponse.redirect(new URL("/map", req.url));
  }

  try {
    // セッションを取得
    const session = await auth();

    if (!session) {
      console.log(
        "[Middleware] No session found. Redirecting to /login-prompt"
      );
      // guest mode
      return NextResponse.next();
    }

    // sessionが有効か検証する
    const isValid = session.expires && new Date(session.expires) > new Date();
    if (!isValid) {
      console.log("[Middleware] Session expired. Redirecting to /login-prompt");
      return NextResponse.redirect(new URL("/login-prompt", req.url));
    }

    // sessionが有効なのにユーザーがいないと場合はユーザーが削除されたと判断し、
    // セッションをクリアしてログインプロンプトに戻す
    try {
      const isUser = await getUser(session.idToken!);
      if (isUser === "failed") {
        console.log(
          "[Middleware] Not Found User or Unauthorized. Redirecting to /login-prompt"
        );

        return NextResponse.redirect(new URL("/login-prompt", req.url));
      }
    } catch (error) {
      console.error("[Middleware] Error checking user status:", error);
      // エラーが発生した場合はログインプロンプトに戻す
      return NextResponse.redirect(new URL("/login-prompt", req.url));
    }

    try {
      // ユーザーが存在するかチェックする
      const isUser = await getProfile(session.idToken!);
      if (isUser === "failed") {
        console.log(
          "[Middleware] Not Found User or Unauthorized. Redirecting to /login-prompt"
        );
        return NextResponse.redirect(new URL("/new-user", req.url));
      } else if (isUser === "not_found") {
        console.log(
          "[Middleware] Not Found User or Unauthorized. Redirecting to /login-prompt"
        );
        return NextResponse.redirect(new URL("/new-user", req.url));
      }
      return NextResponse.next();
    } catch (error) {
      console.error("[Middleware] Error checking user status:", error);
      // エラーが発生した場合はログインプロンプトに戻す
      return NextResponse.redirect(new URL("/login-prompt", req.url));
    }
  } catch (error) {
    console.error("[Middleware] Error in auth middleware:", error);
    return NextResponse.redirect(new URL("/login-prompt", req.url));
  }
}
export const config = {
  matcher: [
    "/profile/:path*",
    "/map/:path*",
    "/calender/:path*",
    "/timeline/:path*",
    "/",
  ],
};
