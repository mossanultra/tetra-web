"use client";

import { useEffect, useState, useCallback } from "react";
import { Thread } from "../../thread/types/Thread";

type UseTimelineOptions = {
  initialItems?: Thread[];
  ownerUserId?: string | null;
};

export const useTimeline = ({
  initialItems = [],
  ownerUserId,
}: UseTimelineOptions = {}) => {
  const [items, setItems] = useState<Thread[]>(initialItems);
  const [loading, setLoading] = useState(!initialItems.length);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [offset, setOffset] = useState(0);

  const LIMIT = 20;

  const fetchThreads = useCallback(
    async (currentOffset: number, isLoadMore: boolean = false) => {
      try {
        setLoading(true);

        const url = ownerUserId
          ? `/api/timeline/thread?ownerUserId=${ownerUserId}&limit=${LIMIT}&offset=${currentOffset}`
          : `/api/timeline?limit=${LIMIT}&offset=${currentOffset}`;

        const res = await fetch(url);
        if (!res.ok) throw new Error();

        const data = await res.json();
        let newThreads: Thread[] = [];

        if (ownerUserId) {
          // ユーザー別: Thread[]
          newThreads = (data as Thread[]) || [];
        } else {
          // 全体: { threads: Thread[], total: number }
          newThreads = data.threads || [];
        }

        // 次ページ判定: 取得件数がLIMIT未満なら終了
        setHasMore(newThreads.length >= LIMIT);

        if (isLoadMore) {
          // 重複排除して追記
          setItems((prev) => {
            const uniqueNewThreads = newThreads.filter(
              (nt) => !prev.some((pt) => pt.threadId === nt.threadId)
            );
            return [...prev, ...uniqueNewThreads];
          });
        } else {
          setItems(newThreads);
        }

        // オフセット更新
        if (newThreads.length > 0) {
          setOffset(currentOffset + LIMIT);
        }
      } catch (err) {
        console.error(err);
        setError("タイムラインの取得に失敗しました");
      } finally {
        setLoading(false);
      }
    },
    [ownerUserId]
  );

  // 初回ロード
  useEffect(() => {
    // initialItemsがある場合はそれを使いつつ、次のロード準備をする必要があるが、
    // シンプルにするため、initialItemsがない場合のみ初回フェッチを行う、あるいは
    // initialItemsがあってもoffsetを更新する必要がある。
    // ここでは「initialItemsがあればそれを表示し、loadMoreはoffset=LIMITから開始」とするのが理想だが、
    // initialItemsの件数がわからないとズレる。
    // 安全策として、initialItemsがない場合のみ0からフェッチする。
    if (initialItems.length === 0) {
      fetchThreads(0, false);
    } else {
      // initialItemsがある場合、offsetは items.length に設定すべきだが、
      // API仕様が offset ベースなので、initialItems.length を次のoffsetとする。
      setOffset(initialItems.length);
      setLoading(false);
    }
  }, [fetchThreads, initialItems.length]); // initialItems.length change triggers reset? usually initialItems is static prop.

  // リフレッシュ（投稿後など）
  const refetch = useCallback(async () => {
    // 0から再取得
    setOffset(0);
    setHasMore(true);
    await fetchThreads(0, false);
  }, [fetchThreads]);

  const loadMore = useCallback(() => {
    if (!loading && hasMore) {
      fetchThreads(offset, true);
    }
  }, [loading, hasMore, offset, fetchThreads]);

  return { items, loading, error, refetch, loadMore, hasMore };
};
