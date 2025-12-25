/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { ReactNode, useEffect, useRef, useState } from "react";
import {
  GoogleMap,
  Marker,
  OverlayView,
  useJsApiLoader,
} from "@react-google-maps/api";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { useGeoLocation } from "@/src/features/geoLocation/hooks/useGeoLocation";
import {
  fetchPoints,
  registerPoint,
} from "@/src/features/point/hooks/usePoint";
import { Point } from "@/src/features/point/types/point";
import { PinCreationDialog } from "@/src/features/map/components/PinCreationDialog";
import { MarkerDetailDialog } from "@/src/features/map/components/MarkerDetailDialog";

/* =======================
   型定義
======================= */
type MapWithCustomModalMarkerProps = {
  zoom: number;
  children?: ReactNode;
};

type Category = "イベント" | "雑談" | "告知";

type PendingPin = {
  lat: number;
  lng: number;
};

/* =======================
   定数
======================= */
const DEFAULT_CENTER = {
  lat: 35.681236,
  lng: 139.767125,
};

const MAP_CONTAINER_STYLE: React.CSSProperties = {
  width: "100%",
  height: "100%",
};

const USER_MARKER_SIZE = 40;

/* =======================
   Map state hook
======================= */
const useMapState = () => {
  const [center, setCenter] = useState(DEFAULT_CENTER);
  const [pointList, setPoints] = useState<Point[]>();
  const fetched = useRef(false);

  useEffect(() => {
    if (!navigator.geolocation || fetched.current) return;
    fetched.current = true;

    navigator.geolocation.getCurrentPosition((pos) => {
      setCenter({
        lat: pos.coords.latitude,
        lng: pos.coords.longitude,
      });
    });
  }, []);

  return { center, pointList, setPoints };
};

/* =======================
   Pin creation hook
======================= */
const usePinCreation = (setPoints: (p: Point[]) => void) => {
  const [pinModalOpen, setPinModalOpen] = useState(false);
  const [pendingPin, setPendingPin] = useState<PendingPin | null>(null);
  const [threadName, setThreadName] = useState("");
  const [category, setCategory] = useState<Category>("雑談");
  const [savingPin, setSavingPin] = useState(false);

  const { fetchLocation } = useGeoLocation();

  const handleMapClick = async (e: google.maps.MapMouseEvent) => {
    if (!e.latLng) return;

    const lat = e.latLng.lat();
    const lng = e.latLng.lng();

    const geo = await fetchLocation(lat, lng);
    setPendingPin({ lat, lng });
    setThreadName(`${geo?.city ?? ""}${geo?.town ?? ""}`.trim());
    setCategory("雑談");
    setPinModalOpen(true);
  };
  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === "string") {
          resolve(reader.result);
        } else {
          reject(new Error("Failed to convert file to base64"));
        }
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const confirmPlacePin = async (date: Date | null, image: File | null) => {
    if (!pendingPin) return;

    setSavingPin(true);
    try {
      let imageBase64: string | null = null;

      if (image) {
        imageBase64 = await fileToBase64(image);
      }

      await registerPoint(
        pendingPin.lat,
        pendingPin.lng,
        date,
        imageBase64, // ← ここにBase64を渡す
        threadName,
        category
      );

      setPoints(await fetchPoints());
      setPinModalOpen(false);
      setPendingPin(null);
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

/* =======================
   メインコンポーネント
======================= */
const MapWithCustomModalMarker: React.FC<MapWithCustomModalMarkerProps> = ({
  zoom,
}) => {
  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "",
  });

  const router = useRouter();
  const { data: session } = useSession();
  const { center, pointList, setPoints } = useMapState();
  const pinCreation = usePinCreation(setPoints);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [pinDetailModalOpen, setPinDetailModalOpen] = useState(false);

  useEffect(() => {
    fetchPoints().then(setPoints);
  }, [session, setPoints]);

  if (!session || !isLoaded) return null;

  return (
    <>
      <PinCreationDialog
        isOpen={pinCreation.pinModalOpen}
        pendingPin={pinCreation.pendingPin}
        threadName={pinCreation.threadName}
        category={pinCreation.category}
        savingPin={pinCreation.savingPin}
        onThreadNameChange={pinCreation.setThreadName}
        onCategoryChange={pinCreation.setCategory}
        onConfirm={pinCreation.confirmPlacePin}
        onCancel={pinCreation.cancelPin}
      />

      <GoogleMap
        mapContainerStyle={MAP_CONTAINER_STYLE}
        center={center}
        zoom={zoom}
        onClick={pinCreation.handleMapClick}
      >
        {pointList?.map((p) => (
          <React.Fragment key={p.id}>
            <Marker
              position={{ lat: p.lat, lng: p.lng }}
              onClick={() => setActiveId(p.id)}
            />

            {activeId === p.id && (
              <OverlayView
                position={{ lat: p.lat, lng: p.lng }}
                mapPaneName={OverlayView.OVERLAY_MOUSE_TARGET}
              >
                <div style={{ transform: "translate(-50%, -110%)" }}>
                  <MarkerDetailDialog
                    point={p}
                    isOpen={pinDetailModalOpen}
                    onClose={() => {
                      setActiveId(null);
                    }}
                    onNavigate={() => router.push(`/timeline/${p.id}`)}
                  />
                </div>
              </OverlayView>
            )}
          </React.Fragment>
        ))}

        <Marker
          position={center}
          icon={{
            url: "/36959.png",
            scaledSize: new google.maps.Size(
              USER_MARKER_SIZE,
              USER_MARKER_SIZE
            ),
          }}
        />
      </GoogleMap>
    </>
  );
};

export default MapWithCustomModalMarker;
