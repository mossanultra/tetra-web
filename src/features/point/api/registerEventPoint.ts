import { CreateEventPointRequest, Point } from "../types/point";

export async function registerEventPoint(
  req: CreateEventPointRequest,
): Promise<Point> {
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
  if (req.iconEmoji) formData.append("iconEmoji", req.iconEmoji);
  if (req.iconColor) formData.append("iconColor", req.iconColor);

  const res = await fetch("/api/map/event", {
    method: "POST",
    body: formData,
  });

  if (!res.ok) {
    throw new Error("イベントの作成に失敗しました");
  }

  return res.json();
}
