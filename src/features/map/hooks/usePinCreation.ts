"use client";

import { useState } from "react";
import { LoginMode } from "@/src/features/user/hooks/useLoginMode";
import { useGeoLocation } from "@/src/features/geoLocation/hooks/useGeoLocation";
import { useS3Upload } from "@/src/features/upload/hooks/useS3Upload";
import { registerEventPoint } from "@/src/features/point/api/registerEventPoint";
import { registerChatPoint } from "@/src/features/point/api/registerChatPoint";
import { getPoints } from "@/src/features/point/api/getPoints";
import { Point } from "@/src/features/point/types/point";
import { ConfirmData } from "../components/MapPostSheet";

type Category = "event" | "chat";

type PendingPin = {
  lat: number;
  lng: number;
};

export const usePinCreation = (
  setPoints: (p: Point[]) => void,
  getLoginMode: () => Promise<LoginMode>,
  onGuestAction: () => void,
) => {
  const [pinModalOpen, setPinModalOpen] = useState(false);
  const [pendingPin, setPendingPin] = useState<PendingPin | null>(null);
  const [threadName, setThreadName] = useState("");
  const [category, setCategory] = useState<Category>("chat");
  const [savingPin, setSavingPin] = useState(false);

  const { fetchLocation } = useGeoLocation();
  const { uploadToS3 } = useS3Upload();

  const handleMapClick = async (e: google.maps.MapMouseEvent) => {
    if (!e.latLng) return;

    // Check if user is guest
    const mode = await getLoginMode();
    if (mode === LoginMode.GUEST) {
      onGuestAction();
      return;
    }
    if (pinModalOpen) {
      setPinModalOpen(false);
      return;
    }

    const lat = e.latLng.lat();
    const lng = e.latLng.lng();

    const geo = await fetchLocation(lat, lng);
    setPendingPin({ lat, lng });
    setThreadName(`${geo?.city ?? ""}${geo?.town ?? ""}`.trim());
    setCategory("chat");
    setPinModalOpen(true);
  };

  const confirmPlacePin = async (data: ConfirmData) => {
    if (!pendingPin) return;

    setSavingPin(true);
    try {
      let imageUrl: string | undefined = undefined;

      // Upload to S3 if image exists
      if (data.image) {
        const url = await uploadToS3(data.image);
        if (url) {
          imageUrl = url;
        } else {
          // Upload failed, stop process (alert handled in hook)
          return;
        }
      }

      let success = false;

      // Wrap in try-catch because new API throws error, but original code expects boolean return or handles error here
      // The original code in usePoint returned boolean. New API throws.
      // We should adapt to try-catch here.

      try {
        if (category === "event") {
          if (!data.startDate || !data.endDate) {
            alert("イベントの開始日と終了日は必須です");
            return;
          }

          await registerEventPoint({
            lat: pendingPin.lat,
            lng: pendingPin.lng,
            threadName,
            category,
            startDate: data.startDate.toISOString(),
            endDate: data.endDate.toISOString(),
            detail: data.detail,
            url: data.url,
            imageUrl,
          });
          success = true;
        } else {
          // Chat
          await registerChatPoint({
            lat: pendingPin.lat,
            lng: pendingPin.lng,
            threadName,
            category,
            imageUrl,
          });
          success = true;
        }
      } catch (err) {
        console.error(err);
        success = false;
      }

      if (success) {
        const newPoints = await getPoints();
        setPoints(newPoints);
        setPinModalOpen(false);
        setPendingPin(null);
      } else {
        alert("ピンの作成に失敗しました");
      }
    } catch (error) {
      console.error(error);
      alert("エラーが発生しました");
    } finally {
      setSavingPin(false);
    }
  };

  return {
    pinModalOpen,
    pendingPin,
    threadName,
    category,
    savingPin,
    setThreadName,
    setCategory,
    handleMapClick,
    confirmPlacePin,
    cancelPin: () => setPinModalOpen(false),
  };
};
