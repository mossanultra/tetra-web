import { CreateChatPointRequest, Point } from "../types/point";

export async function registerChatPoint(
  req: CreateChatPointRequest,
): Promise<Point> {
  const formData = new FormData();
  formData.append("lat", String(req.lat));
  formData.append("lng", String(req.lng));
  formData.append("threadName", req.threadName);
  formData.append("category", req.category);
  if (req.imageUrl) formData.append("imageUrl", req.imageUrl);

  const res = await fetch("/api/map/chat", {
    method: "POST",
    body: formData,
  });

  if (!res.ok) {
    throw new Error("スレッドの作成に失敗しました");
  }

  return res.json();
}
