"use client";

import { useEffect, useRef } from "react";
import { signOutAction } from "./action";

export default function SignOutPage() {
  const formRef = useRef<HTMLFormElement>(null);

  // ページ読み込みと同時にサインアウト実行
  useEffect(() => {
    formRef.current?.requestSubmit();
  }, []);

  return (
    <form ref={formRef} action={signOutAction}>
      <p>サインアウト中...</p>
    </form>
  );
}
