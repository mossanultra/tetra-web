"use client";

import { useEffect, useRef } from "react";
import { signOutAction } from "./action";

import { getMessaging, getToken, deleteToken } from "firebase/messaging";
import { app } from "@/src/lib/firebase";
import { deviceTokenApi } from "@/src/services/deviceToken";

export default function SignOutPage() {
  const formRef = useRef<HTMLFormElement>(null);

  // ページ読み込みと同時にサインアウト実行
  useEffect(() => {
    const handleSignOut = async () => {
      try {
        if (typeof window !== "undefined" && "serviceWorker" in navigator) {
          const messaging = getMessaging(app);
          // 既存のトークンを取得（通知許可済みの場合のみ取得できる）
          const currentToken = await getToken(messaging, {
            vapidKey: process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY,
          });

          if (currentToken) {
            // サーバーから削除
            await deviceTokenApi.deleteDeviceToken(currentToken);
            // クライアント側でも削除（非推奨だが念のため）
            // await deleteToken(messaging);
          }
        }
      } catch (error) {
        console.error("Error during token cleanup:", error);
      } finally {
        // 成功・失敗に関わらずサインアウト処理を実行
        formRef.current?.requestSubmit();
      }
    };

    handleSignOut();
  }, []);

  return (
    <form ref={formRef} action={signOutAction}>
      <p>サインアウト中...</p>
    </form>
  );
}
