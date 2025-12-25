export const runtime = "nodejs"; // cryptoがNodeでしか動かせないので

import crypto from "crypto";
import {
  CognitoIdentityProvider,
  InitiateAuthCommandInput,
} from "@aws-sdk/client-cognito-identity-provider";
import { NextRequest, NextResponse } from "next/server";

function generateSecretHash(
  userName: string,
  clientId: string,
  clientSecret: string
): string {
  return crypto
    .createHmac("sha256", clientSecret)
    .update(`${userName}${clientId}`)
    .digest("base64");
}

async function refreshAccessToken({
  refreshToken,
  userName,
}: {
  refreshToken: string;
  userName: string;
}) {
  const cognito = new CognitoIdentityProvider({ region: "ap-northeast-1" });
  const secretHash = generateSecretHash(
    userName,
    process.env.COGNITO_CLIENT_ID!,
    process.env.COGNITO_CLIENT_SECRET!
  );

  const params: InitiateAuthCommandInput = {
    AuthFlow: "REFRESH_TOKEN_AUTH",
    ClientId: process.env.COGNITO_CLIENT_ID!,
    AuthParameters: {
      REFRESH_TOKEN: refreshToken,
      SECRET_HASH: secretHash,
    },
  };

  const res = await cognito.initiateAuth(params);

  const result = res.AuthenticationResult!;

  return {
    accessToken: result.AccessToken,
    idToken: result.IdToken ?? null,
    refreshToken: result.RefreshToken || refreshToken, // 新しいリフレッシュトークンまたは既存のものを返す
    expiresIn: result.ExpiresIn,
  };
}

export async function POST(req: NextRequest) {
  console.log('refresh token post');
  try {
    const body = await req.json();

    if (!body.refreshToken || !body.userName) {
      return NextResponse.json(
        { error: "Missing refreshToken or userName" },
        { status: 400 }
      );
    }

    const newTokens = await refreshAccessToken({
      refreshToken: body.refreshToken,
      userName: body.userName,
    });

    return NextResponse.json(newTokens);
  } catch (err) {
    console.error("[refresh-token API] Failed to refresh:", err);
    return NextResponse.json({ error: "Refresh failed" }, { status: 500 });
  }
}