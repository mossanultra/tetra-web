import Cognito from "next-auth/providers/cognito";
import NextAuth from "next-auth";
import { JWT } from "next-auth/jwt";

const cognitoIssuer = process.env.COGNITO_ISSUER; // Cognitoのユーザープールのエンドポイント
const cognitoClientId = process.env.COGNITO_CLIENT_ID || "";
const cognitoClientSecret = process.env.COGNITO_CLIENT_SECRET || ""; // 追加: client_secretが必要な場合

// リフレッシュトークンを使って新しいアクセストークンとIDトークンを取得する関数
async function refreshTokens(token: JWT): Promise<{
  accessToken: string;
  idToken: string;
  refreshToken?: string;
} | null> {
  if (!token.refreshToken) {
    console.error("No refresh token available");
    return null;
  }

  if (!cognitoIssuer) {
    console.error("COGNITO_ISSUER environment variable is not set");
    return null;
  }
  if (!cognitoClientId) {
    console.error("COGNITO_CLIENT_ID environment variable is not set");
    return null;
  }
  if (!cognitoClientSecret) {
    console.error("COGNITO_CLIENT_SECRET environment variable is not set");
    return null;
  }

  try {
    const baseUrl =
      process.env.NEXTAUTH_URL ||
      process.env.VERCEL_URL ||
      "http://localhost:3000";

    const response = await fetch(`${baseUrl}/api/auth/refresh-token`, {
      // const response = await fetch(`/api/auth/refresh-token`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        refreshToken: token.refreshToken,
        userName: token.userName,
      }),
    });

    // レスポンスを処理
    if (!response.ok) {
      console.error(
        "Failed to refresh token:",
        response.status,
        response.statusText
      );
      const errorText = await response.text();
      console.error("Error details:", errorText);
      return null;
    }

    const data = await response.json();
    // レスポンスにaccess_tokenとid_tokenが含まれているか確認
    if (!data.accessToken || !data.idToken) {
      console.error("Refresh response missing expected tokens:", data);
      return null;
    }

    return {
      accessToken: data.accessToken,
      idToken: data.idToken,
      refreshToken: data.refreshToken || token.refreshToken, // 既存のrefreshTokenを保持
    };
  } catch (error) {
    console.error("Error refreshing tokens:", error);
    return null;
  }
}

// トークンが期限切れかどうかを確認する関数
function isTokenExpired(token: string): boolean {
  // console.log("Checking token expiration");
  if (!token) return true;

  try {
    // トークンをデコードしてペイロード部分を取得
    const base64Url = token.split(".")[1];
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const payload = JSON.parse(Buffer.from(base64, "base64").toString("utf-8"));

    // 現在の時間（秒単位）
    const now = Math.floor(Date.now() / 1000);

    // トークンの有効期限（exp）と比較
    // 期限切れの10分前から更新対象とする（バッファ）
    return now >= payload.exp - 600;
  } catch (error) {
    console.error("Error checking token expiration:", error);
    return true; // エラーが発生した場合は期限切れとみなす
  }
}

// Extend the Session type to include accessToken and error
declare module "next-auth" {
  interface Session {
    accessToken?: string;
    idToken?: string;
    error?: string;
  }
}
export const { auth, handlers, signIn, signOut } = NextAuth({
  providers: [
    Cognito({
      issuer: cognitoIssuer,
      clientId: cognitoClientId,
      clientSecret: cognitoClientSecret,
      authorization: {
        params: {
          scope: "openid email",
        },
      },
    }),
  ],
  callbacks: {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    async signIn({ user, account, profile, email, credentials }) {
      if (!account) {
        return false;
      }
      // console.log("signIn callback triggered");
      return true;
    },
    async redirect() {
      return "/map";
    },
    async jwt({ token, account, user }) {
      // 初回サインイン時
      if (account && user) {
        // console.log("jwt initial - storing tokens");

        // トークン情報をJWTに保存
        // JWTに保存するデータを必要最小限に
        token.accessToken = account.access_token;
        token.idToken = account.id_token;
        token.refreshToken = account.refresh_token;
        token.email = user.email;
        // ここで不要な情報は保存しない

        // アクセストークンの有効期限を設定（デフォルトは1時間）
        const expiresAt = account.expires_at
          ? account.expires_at * 1000
          : Date.now() + 3600 * 1000;
        token.accessTokenExpires = expiresAt;

        // サインイン時にユーザー作成処理を実行
        // if (token.idToken) {
        //   await createOrVerifyUser(token.idToken as string);
        // }

        // id_tokenからcognito:usernameを取得
        let cognitoUsername = undefined;
        if (account.id_token) {
          try {
            const payload = JSON.parse(
              Buffer.from(account.id_token.split(".")[1], "base64").toString(
                "utf-8"
              )
            );
            // console.log('cognito payload', payload)
            cognitoUsername = payload["cognito:username"];
          } catch (e) {
            console.error("Failed to decode id_token for cognito:username", e);
          }
        }
        token.userName = cognitoUsername;

        return token;
      }

      // アクセストークンがまだ有効な場合はそのまま返す
      // IDトークンも有効期限をチェック
      if (
        token.accessTokenExpires &&
        Date.now() < (token.accessTokenExpires as number) - 600000 && // 10分前から更新対象
        token.accessToken &&
        token.idToken &&
        !isTokenExpired(token.idToken as string)
      ) {
        return token;
      }

      // ここに来た場合はトークンが期限切れまたは期限切れが近いのでリフレッシュ
      // console.log("Token expired or expiring soon, attempting to refresh...");

      if (!token.refreshToken) {
        // console.log("No refresh token available");
        return {
          ...token,
          error: "RefreshTokenNotAvailable",
        };
      }

      // トークンをリフレッシュ
      try {
        const newTokens = await refreshTokens(token);

        if (newTokens) {
          // console.log("Token refreshed successfully");
          // 新しいトークンでJWTを更新
          return {
            ...token,
            accessToken: newTokens.accessToken,
            idToken: newTokens.idToken,
            // 新しいリフレッシュトークンがある場合は更新
            refreshToken: newTokens.refreshToken || token.refreshToken,
            accessTokenExpires: Date.now() + 3600 * 1000, // 1時間後
            error: undefined,
          };
        } else {
          throw new Error("Failed to refresh tokens");
        }
      } catch (error) {
        console.error("Error refreshing token:", error);

        // リフレッシュに失敗した場合
        console.error("Failed to refresh token, marking token for re-login");
        return {
          ...token,
          error: "RefreshAccessTokenError",
        };
      }
    },
    async session({ session, token }) {
      // セッションにアクセストークンとIDトークンを含める
      session.accessToken = token.accessToken as string;
      session.idToken = token.idToken as string;

      // エラー情報があればセッションにも含める
      if (token.error) {
        session.error = token.error as string;
      }

      return session;
    },
  },
  // セッション設定
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30日（リフレッシュトークンの有効期限に合わせる）
  },
  debug: false, // デバッグログを出さない
});
