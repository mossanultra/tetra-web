import { apiFetch } from "@/src/utils/api";
import { Point } from "../types/point";

/** ポイント登録 */
export async function registerPoint(
  lat: number,
  lng: number,
  threadName?: string,
  category?: string
): Promise<boolean> {
  if (!lat || !lng) {
    console.warn("緯度経度を入れてください。");
    return false;
  }

  try {
    const formData = new FormData();
    formData.append("lat", String(lat));
    formData.append("lng", String(lng));
    formData.append("threadName", String(threadName));
    formData.append("category", String(category));
    const result = await apiFetch<{ success: boolean }>("/api/points", {
      method: "POST",
      body: formData,
    });

    return result?.success ?? false;
  } catch (error) {
    console.error("Error registering point:", error);
    return false;
  }
}

/** ポイント一覧取得 */
export async function fetchPoints(userId?: string): Promise<Point[]> {
  try {
    return (await apiFetch<Point[]>("/map")) ?? [];
  } catch (error) {
    console.error("Error fetching points:", error);
    return [];
  }
}

/** 指定ポイント取得 */
export async function fetchPoint(id: string): Promise<Point | null> {
  try {
    return await apiFetch<Point>(`/api/points/${id}`);
  } catch (error) {
    console.error("Error fetching point:", error);
    return null;
  }
}
