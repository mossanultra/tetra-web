import { apiFetch } from "@/src/utils/api";
import { Point } from "../types/point";

/** ポイント登録 */
export async function registerPoint(
  lat: number,
  lng: number,
  selectedDate: Date | null,
  imageBase64: string | null,
  threadName: string,
  category: string,
): Promise<boolean> {
  console.log("Registering point with:", { lat, lng, threadName, category });
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
    formData.append("selectedDate", String(selectedDate?.toISOString()));
    formData.append("imageBase64", String(imageBase64));
    const result = await apiFetch<{ success: boolean }>("/api/map", {
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
