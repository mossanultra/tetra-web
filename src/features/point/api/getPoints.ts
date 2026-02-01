import { Point } from "../types/point";

export async function getPoints(): Promise<Point[]> {
  const res = await fetch("/api/map");

  if (!res.ok) {
    throw new Error("ポイントの取得に失敗しました");
  }

  const result: Point[] = await res.json();

  if (!result) return [];

  return result.map((p) => ({
    ...p,
    lat: Number(p.lat),
    lng: Number(p.lng),
  }));
}
