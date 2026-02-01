// src/app/points/[id]/page.tsx
import { MapClient } from "@/src/features/map/components/MapClient";

export default async function ServerPointPage({}: {
  params: Promise<{ id: string }>;
}) {
  return <MapClient zoom={15} />;
}
