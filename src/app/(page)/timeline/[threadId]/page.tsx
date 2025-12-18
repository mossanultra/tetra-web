// src/app/%28page%29/timeline/[threadId]/page.tsx
import { Suspense } from "react";
import { auth } from "@/src/services/auth";
import ThreadClient from "@/src/features/thread/components/ThreadClient";
import { Thread } from "@/src/features/thread/types/Thread";

export const dynamic = "force-dynamic";

const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

type PageProps = {
  params: {
    threadId: string;
  };
};

type ThreadResponse = {
  thread: Thread;
  childThreads: Thread[];
  parentThread: Thread;
};

export default async function ThreadPage({ params }: PageProps) {
  const { threadId } = await params;

  const session = await auth();
  if (!session?.idToken) {
    throw new Error("Unauthorized");
  }

  const res = await fetch(
    `${apiBaseUrl}/timeline/thread?threadId=${threadId}`,
    {
      headers: {
        "Content-Type": "application/json",
        Authorization: session.idToken,
      },
      cache: "no-store",
    }
  );

  // =========================
  // 404 は「存在しないが正常」
  // =========================
  if (res.status === 404) {
    return (
      <Suspense>
        <ThreadClient
          initialThread={null}
          initialChildThreads={[]}
          ownUserId={null}
        />
      </Suspense>
    );
  }

  // =========================
  // その他のエラーは異常
  // =========================
  if (!res.ok) {
    throw new Error(`Failed to fetch thread: ${res.status}`);
  }
  const userResponse = await fetch(`${apiBaseUrl}/user`, {
    headers: {
      "Content-Type": "application/json",
      Authorization: session.idToken,
    },
    cache: "no-store",
  });

  // =========================
  // 正常系のみ JSON を読む
  // =========================
  const data: {
    thread: Thread;
    childThreads: ThreadResponse[];
  } = await res.json();

  const user = await userResponse.json();

  const normalizedChildThreads: Thread[] = data.childThreads.map(
    (item) => item.thread
  );

  return (
    <Suspense>
      <ThreadClient
        initialThread={data.thread}
        initialChildThreads={normalizedChildThreads}
        ownUserId={user.userId}
      />
    </Suspense>
  );
}
