export interface Point {
  lat: number;
  lng: number;
  id: string;
  threadName: string;
  category: "event" | "chat";
  imageUrl: string | null;
  startDate: string | null;
  endDate: string | null;
}

export interface CreateEventPointRequest {
  lat: number;
  lng: number;
  threadName: string;
  category: string;
  startDate: string;
  endDate: string;
  detail?: string;
  url?: string;
  imageUrl?: string;
  iconEmoji?: string;
  iconColor?: string;
}

export interface CreateChatPointRequest {
  lat: number;
  lng: number;
  threadName: string;
  category: string;
  imageUrl?: string;
  iconEmoji?: string;
  iconColor?: string;
}
