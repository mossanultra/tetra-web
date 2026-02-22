export interface InboxMessageSender {
  id: string;
  name: string;
  avatar: string;
}

// Parsed content types for different message types
export interface SystemMessageContent {
  message: string;
}

export interface ReplyMessageContent {
  ownerThreadId: string;
  threadId: string;
  content: string;
  replyUserId: string;
  replyUserName: string;
}

export interface NewEventMessageContent {
  pointInfoId: string; // Same as threadId
  ownerUserId: string;
  address: string;
  title: string;
  date: string;
  id: string;
}

export type ParsedMessageContent =
  | SystemMessageContent
  | ReplyMessageContent
  | NewEventMessageContent;

export interface InboxMessageContent {
  id: string;
  type: string;
  subject: string;
  content: string; // JSON string from API
  sender: InboxMessageSender;
  createdAt: string;
}

export interface InboxMessage {
  id: string;
  messageId: string;
  message: InboxMessageContent;
  deliveredAt: string;
  readAt: string | null;
  isRead: boolean;
}

export interface InboxPagination {
  total: number;
  offset: number;
  limit: number;
  hasMore: boolean;
}

export interface InboxSummary {
  unreadCount: number;
  systemUnreadCount: number;
  aiUnreadCount: number;
}

export interface InboxResponse {
  messages: InboxMessage[];
  pagination: InboxPagination;
  summary: InboxSummary;
}
