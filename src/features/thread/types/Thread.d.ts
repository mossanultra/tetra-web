interface ThreadItemCommon {
  threadId: string;
  threadName: string;
  createdAt: string;
  ownerUserId: string;
  ownerUserProfile: {
    userId: string;
    userName: string;
    imageUrl: string | null;
  };
  parentThreadId: string | null;
  childThreadIds: string[];
  mapPointInfoId: string | null;
  childThreadCount: number;
}

export interface ThreadItemEvent extends ThreadItemCommon {
  category: "event";
  categoryContent: {
    startDate: string;
    endDate: string;
    detail: string | null;
    url: string | null;
    imageUrl: string | null;
  };
}

export interface ThreadItemChat extends ThreadItemCommon {
  category: "chat";
  categoryContent: {
    imageUrl: string | null;
  };
}

export type Thread = ThreadItemEvent | ThreadItemChat;
