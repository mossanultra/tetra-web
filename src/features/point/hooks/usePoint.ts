import { apiFetch } from "@/src/utils/api";
import {
  Point,
  CreateEventPointRequest,
  CreateChatPointRequest,
} from "../types/point";

/** イベントポイント登録 */
export async function registerEventPoint(
  req: CreateEventPointRequest
): Promise<boolean> {
  try {
    const formData = new FormData();
    formData.append("lat", String(req.lat));
    formData.append("lng", String(req.lng));
    formData.append("threadName", req.threadName);
    formData.append("category", req.category);
    formData.append("startDate", req.startDate);
    formData.append("endDate", req.endDate);
    if (req.detail) formData.append("detail", req.detail);
    if (req.url) formData.append("url", req.url);
    if (req.imageUrl) formData.append("imageUrl", req.imageUrl);

    const result = await apiFetch<Point>("/api/map/event", {
      method: "POST",
      body: formData,
    });

    return !!result?.id;
  } catch (error) {
    console.error("Error registering event point:", error);
    return false;
  }
}

/** チャットポイント登録 */
export async function registerChatPoint(
  req: CreateChatPointRequest
): Promise<boolean> {
  try {
    const formData = new FormData();
    formData.append("lat", String(req.lat));
    formData.append("lng", String(req.lng));
    formData.append("threadName", req.threadName);
    formData.append("category", req.category);
    if (req.imageUrl) formData.append("imageUrl", req.imageUrl);

    const result = await apiFetch<Point>("/api/map/chat", {
      method: "POST",
      body: formData,
    });

    return !!result?.id;
  } catch (error) {
    console.error("Error registering chat point:", error);
    return false;
  }
}

/** ポイント一覧取得 */
export async function fetchPoints(): Promise<Point[]> {
  try {
    const result = await apiFetch<Point[]>("/api/map");

    if (!result) return [];

    // lat / lng を number に変換して返却
    return result.map((p) => ({
      ...p,
      lat: Number(p.lat),
      lng: Number(p.lng),
    }));
  } catch (error) {
    console.error("Error fetching points:", error);
    return [];
  }
}
