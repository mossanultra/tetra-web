export interface InboxMessageSender {
  id: string;
  name: string;
  avatar: string;
}

export interface InboxMessageContent {
  id: string;
  type: string;
  subject: string;
  content: string;
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
