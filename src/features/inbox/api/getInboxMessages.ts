import { InboxResponse } from "../types/Inbox";

type GetInboxMessagesParams = {
  limit?: number;
  offset?: number;
};

export const getInboxMessages = async ({
  limit = 10,
  offset = 0,
}: GetInboxMessagesParams): Promise<InboxResponse> => {
  const res = await fetch(`/api/inbox?limit=${limit}&offset=${offset}`);
  if (!res.ok) throw new Error("Failed to fetch inbox messages");
  return res.json();
};
