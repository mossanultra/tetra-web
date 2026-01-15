"use client";

import useFcmToken from "@/src/hooks/useFcmToken";
import { useEffect, useState } from "react";

export default function FCMHandler() {
  const { notificationPermission, requestPermission } = useFcmToken();
  const [showPrompt, setShowPrompt] = useState(false);

  useEffect(() => {
    // Show prompt only if permission is default (neither granted nor denied)
    // and we are capable of asking (service worker supported etc check is implicitly handled by browser support usually, but good to check)
    if (notificationPermission === "default") {
      setShowPrompt(true);
    } else {
      setShowPrompt(false);
    }
  }, [notificationPermission]);

  if (!showPrompt) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 p-4 bg-white dark:bg-zinc-800 rounded-lg shadow-lg border border-zinc-200 dark:border-zinc-700 max-w-sm animate-in slide-in-from-bottom-5">
      <div className="flex flex-col gap-2">
        <h3 className="font-semibold text-sm">通知を受け取りますか？</h3>
        <p className="text-xs text-zinc-500 dark:text-zinc-400">
          イベントや重要なお知らせを受け取るために通知を許可してください。
        </p>
        <div className="flex gap-2 mt-2">
          <button
            onClick={() => setShowPrompt(false)}
            className="flex-1 px-3 py-1.5 text-xs font-medium text-zinc-600 bg-zinc-100 rounded-md hover:bg-zinc-200 dark:text-zinc-300 dark:bg-zinc-700 dark:hover:bg-zinc-600 transition-colors"
          >
            あとで
          </button>
          <button
            onClick={() => {
              requestPermission();
              setShowPrompt(false); // Optimistically hide, or wait for permission change
            }}
            className="flex-1 px-3 py-1.5 text-xs font-medium text-white bg-orange-500 rounded-md hover:bg-orange-600 transition-colors"
          >
            許可する
          </button>
        </div>
      </div>
    </div>
  );
}
