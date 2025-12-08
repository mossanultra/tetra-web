/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { ReactNode, useEffect, useRef, useState } from "react";
import { GoogleMap, Marker, OverlayView, useJsApiLoader } from "@react-google-maps/api";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { FiCheckCircle, FiAlertCircle, FiClock } from "react-icons/fi";
import { useGeoLocation } from "@/src/features/geoLocation/hooks/useGeoLocation";
import { fetchPoints, registerPoint } from "@/src/features/point/hooks/usePoint";
import { Point } from "@/src/features/point/types/point";
import { PinCreationDialog } from "@/src/features/map/components/PinCreationDialog";
import { useImageUpload } from "@/src/features/user/hooks/useImageUpload";


// ========== 型定義 ==========
type MapWithCustomModalMarkerProps = {
  zoom: number;
  children?: ReactNode;
};

type Category = "イベント" | "雑談" | "告知";

type PendingPin = {
  lat: number;
  lng: number;
};

type PointWithMetadata = Point & {
  updatedAt?: string;
  category?: string;
  threadName?: string;
  title?: string;
};

// ========== 定数 ==========
const MAP_CONTAINER_STYLE: React.CSSProperties = {
  width: "100%",
  height: "600px",
};

const DEFAULT_CENTER = { lat: 37.7608, lng: 140.473 };
const MARKER_SIZE = 44;
const USER_MARKER_SIZE = 30;

// ========== アイコンコンポーネント ==========
const EventIcon: React.FC = () => (
  <svg width={MARKER_SIZE} height={MARKER_SIZE} viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" aria-hidden>
    <rect x="6" y="6" width="88" height="88" rx="12" fill="#FF6B9D" />
    <rect x="10" y="10" width="80" height="80" rx="10" fill="#FFE5EE" />
    <path d="M50 30 L40 55 L60 55 Z" fill="#FF6B9D" />
    <ellipse cx="50" cy="60" rx="10" ry="3" fill="#FFB800" />
    <rect x="36" y="54" width="4" height="4" fill="#FFB800" transform="rotate(20 38 56)" />
    <circle cx="62" cy="48" r="2" fill="#4ECDC4" />
    <rect x="44" y="66" width="4" height="4" fill="#95E1D3" transform="rotate(-15 46 68)"/>
    <circle cx="58" cy="68" r="2" fill="#FFB800"/>
  </svg>
);

const AnnouncementIcon: React.FC = () => (
  <svg width={MARKER_SIZE} height={MARKER_SIZE} viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" aria-hidden>
    <rect x="6" y="6" width="88" height="88" rx="12" fill="#FFB800"/>
    <rect x="10" y="10" width="80" height="80" rx="10" fill="#FFF4D6"/>
    <rect x="36" y="45" width="28" height="20" rx="2" fill="#FFB800"/>
    <path d="M36 52 L50 60 L64 52" stroke="#FFF4D6" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
    <circle cx="64" cy="44" r="5" fill="#FF6B9D"/>
    <circle cx="64" cy="44" r="2.5" fill="#fff"/>
  </svg>
);

const ChatIcon: React.FC = () => (
  <svg width={MARKER_SIZE} height={MARKER_SIZE} viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" aria-hidden>
    <rect x="6" y="6" width="88" height="88" rx="12" fill="#4ECDC4"/>
    <rect x="10" y="10" width="80" height="80" rx="10" fill="#E0F9F7"/>
    <circle cx="50" cy="48" r="14" fill="#4ECDC4"/>
    <path d="M42 58 L38 66 L48 58 Z" fill="#4ECDC4"/>
    <circle cx="45" cy="46" r="2" fill="#fff"/>
    <circle cx="55" cy="46" r="2" fill="#fff"/>
    <path d="M44 50 Q50 54 56 50" stroke="#fff" strokeWidth="2" fill="none" strokeLinecap="round"/>
    <path d="M62 42 Q62 40 63.5 40 Q65 40 65 42 Q65 43 63.5 44.5 Q62 43 62 42 Z" fill="#FF6B9D"/>
  </svg>
);

const CategoryIcon: React.FC<{ category: string }> = ({ category }) => {
  switch (category) {
    case "イベント":
      return <EventIcon />;
    case "告知":
      return <AnnouncementIcon />;
    default:
      return <ChatIcon />;
  }
};

// ========== カスタムマーカーコンポーネント ==========
const CustomMarker: React.FC<{
  position: { lat: number; lng: number };
  onClick?: () => void;
  children?: React.ReactNode;
}> = ({ position, onClick, children }) => {
  return (
    <OverlayView
      position={position}
      mapPaneName={OverlayView.OVERLAY_MOUSE_TARGET}
    >
      <div
        onClick={onClick}
        style={{
          transform: "translate(-50%, -50%)",
          cursor: "pointer",
          display: "inline-block",
        }}
      >
        {children}
      </div>
    </OverlayView>
  );
};

// ========== マーカーコンテンツコンポーネント ==========
const MarkerContent: React.FC<{ point: PointWithMetadata; onClick?: () => void }> = ({ point, onClick }) => {
  const updatedAt = point.updatedAt ? new Date(point.updatedAt) : null;
  const formattedDate = updatedAt ? updatedAt.toLocaleDateString() : "";
  const category = point.category ?? "雑談";
  const threadName = point.threadName ?? point.title ?? "";
  const title = point.title ?? "";

  return (
    <div
      onClick={onClick}
      style={{
        display: "flex",
        alignItems: "center",
        gap: 8,
        padding: "6px 8px",
        background: "rgba(255,255,255,0.95)",
        borderRadius: 12,
        boxShadow: "0 2px 6px rgba(0,0,0,0.2)",
        transform: "translate(-50%, -100%)",
        cursor: "pointer",
        whiteSpace: "nowrap",
      }}
    >
      <div style={{ width: MARKER_SIZE, height: MARKER_SIZE, flexShrink: 0 }}>
        <CategoryIcon category={category} />
      </div>

      <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-start" }}>
        <div style={{ fontSize: 12, color: "#222", fontWeight: 700 }}>
          {threadName || "(未設定)"}
        </div>
        {threadName && title && title !== threadName && (
          <div style={{ fontSize: 11, color: "#555" }}>{title}</div>
        )}
        <div style={{ fontSize: 11, color: "#666" }}>{formattedDate}</div>
        <div style={{ display: "flex", gap: 6, marginTop: 6 }}>
          <FiCheckCircle color="#2ecc71" size={14} />
          <FiAlertCircle color="#e74c3c" size={14} />
          <FiClock color="#f39c12" size={14} />
        </div>
      </div>
    </div>
  );
};

// ========== カスタムフック: 地図の状態管理 ==========
const useMapState = () => {
  const [center, setCenter] = useState(DEFAULT_CENTER);
  const [pointList, setPoints] = useState<Point[]>();
  const hasFetched = useRef(false);

  const updateCurrentPosition = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setCenter({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
        },
        (error) => console.error("Failed to get current position:", error)
      );
    }
  };

  useEffect(() => {
    if (!hasFetched.current) {
      updateCurrentPosition();
      hasFetched.current = true;
    }
  }, []);

  return { center, pointList, setPoints };
};

// ========== カスタムフック: ピン作成の状態管理 ==========
const usePinCreation = (setPoints: (points: Point[]) => void) => {
  const [pinModalOpen, setPinModalOpen] = useState(false);
  const [pendingPin, setPendingPin] = useState<PendingPin | null>(null);
  const [threadName, setThreadName] = useState("");
  const [category, setCategory] = useState<Category>("雑談");
  const [savingPin, setSavingPin] = useState(false);

  const { fetchLocation } = useGeoLocation();
  const fileToBase64 = async (file: File): Promise<string> => {
    return new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        const base64String = result.split(",")[1];
        resolve(base64String);
      }
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  const handleMapClick = async (event: google.maps.MapMouseEvent) => {
    if (!event.latLng) return;

    const lat = event.latLng.lat();
    const lng = event.latLng.lng();

    try {
      const geoLocation = await fetchLocation(lat, lng);
      setPendingPin({ lat, lng });
      const initialName = `${geoLocation?.city || ""}${geoLocation?.town || ""}`.trim();
      setThreadName(initialName);
      setCategory("雑談");
      setPinModalOpen(true);
      console.debug("open pin modal", { lat, lng, initialName, category: "雑談" });
    } catch (error) {
      console.error("Failed to handle map click:", error);
    }
  };

  const confirmPlacePin = async (selectedDate?: Date, selectedImage?: File) => {
    if (!pendingPin) return;
    
    setSavingPin(true);
    try {
      console.debug("confirmPlacePin called", { 
        pendingPin, 
        threadName, 
        category,
        selectedDate,
        selectedImage: selectedImage?.name 
      });
      let imageBase64: string | undefined = undefined;
      if (selectedImage) {
        imageBase64 = await fileToBase64(selectedImage);
      }
      // ここで selectedDate と selectedImage を使用してピンを登録
      await registerPoint(pendingPin.lat, pendingPin.lng, selectedDate, imageBase64, threadName, category);
      const newPoints = await fetchPoints();
      setPoints(newPoints);
      resetPinState();
    } catch (err) {
      console.error("Failed to register pin:", err);
      alert("ピンの登録に失敗しました。");
    } finally {
      setSavingPin(false);
    }
  };

  const resetPinState = () => {
    setPinModalOpen(false);
    setPendingPin(null);
    setThreadName("");
    setCategory("雑談");
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
    cancelPin: resetPinState,
  };
};

// ========== メインコンポーネント ==========
const MapWithCustomModalMarker: React.FC<MapWithCustomModalMarkerProps> = ({ zoom }) => {
  const { isLoaded, loadError } = useJsApiLoader({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "",
  });

  const router = useRouter();
  const { data: session, status } = useSession();
  const { center, pointList, setPoints } = useMapState();
  const pinCreation = usePinCreation(setPoints);

  useEffect(() => {
    const loadPoints = async () => {
      const pointData = await fetchPoints();
      if (pointData) {
        setPoints(pointData);
      }
    };
    loadPoints();
  }, [session, setPoints]);

  const handleMarkerClick = (marker: Point) => {
    router.push(`/points/${marker.id}`);
  };

  const renderMarker = (point: Point) => {
    return (
      <CustomMarker
        key={point.id}
        position={{ lat: point.lat, lng: point.lng }}
        onClick={() => handleMarkerClick(point)}
      >
        <MarkerContent 
          point={point as PointWithMetadata} 
          onClick={() => handleMarkerClick(point)} 
        />
      </CustomMarker>
    );
  };

  if (status === "loading") {
    return <p>Loading...</p>;
  }

  if (!session) {
    return <p>Not logged in</p>;
  }

  if (loadError) {
    return <p>Error loading maps</p>;
  }

  if (!isLoaded) {
    return <p>Loading maps...</p>;
  }

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
      <p>Select Map Style</p>
      <GoogleMap
        mapContainerStyle={MAP_CONTAINER_STYLE}
        center={center}
        zoom={zoom}
        onClick={pinCreation.handleMapClick}
      >
        {pointList?.map((point) => renderMarker(point))}
        <Marker
          position={center}
          icon={{
            url: "/36959.png",
            scaledSize: new google.maps.Size(USER_MARKER_SIZE, USER_MARKER_SIZE),
          }}
        />
      </GoogleMap>
    </>
  );
};

export default MapWithCustomModalMarker;