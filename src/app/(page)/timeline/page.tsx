import { Suspense } from "react";
import TimelineClient from "@/src/features/timeline/components/TimelineClient";
import { auth } from "@/src/services/auth";
import { fetchTimeline } from "@/src/features/timeline/fetchers/fetchTimeline";
import { fetchUser } from "@/src/features/user/fetchers/fetchUser";

export const dynamic = "force-dynamic";

export default async function TimelinePage() {
  const session = await auth();

  if (!session?.idToken) {
    throw new Error("Unauthorized");
  }

  const userResponse = await fetchUser({
    idToken: session.idToken,
  });

  // 👇 通信ロジックは useTimeline と同じ fetcher を使う
  const initialItems = await fetchTimeline({
    idToken: session.idToken,
  });
  console.log("初期タイムラインアイテム:", initialItems[0]);

  return (
    <Suspense>
      <TimelineClient
        initialItems={initialItems}
        ownUserId={userResponse.userId || null}
      />
    </Suspense>
  );
}
