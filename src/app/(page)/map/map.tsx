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
import { useS3Upload } from "@/src/features/upload/hooks/useS3Upload";
import {
  fetchPoints,
  registerEventPoint,
  registerChatPoint,
} from "@/src/features/point/hooks/usePoint";
import { Point } from "@/src/features/point/types/point";
import {
  PinCreationDialog,
  ConfirmData,
} from "@/src/features/map/components/PinCreationDialog";
import { MarkerDetailDialog } from "@/src/features/map/components/MarkerDetailDialog";
import { SignUpPromptDialog } from "@/src/features/user/components/SignUpPromptDialog";
import { useSignUpPrompt } from "@/src/features/user/hooks/useSignUpPrompt";
import {
  useLoginMode,
  LoginMode,
} from "@/src/features/user/hooks/useLoginMode";

/* =======================
   型定義
======================= */
type MapWithCustomModalMarkerProps = {
  zoom: number;
  children?: ReactNode;
};

type Category = "event" | "chat";

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
const usePinCreation = (
  setPoints: (p: Point[]) => void,
  getLoginMode: () => Promise<LoginMode>,
  onGuestAction: () => void
) => {
  const [pinModalOpen, setPinModalOpen] = useState(false);
  const [pendingPin, setPendingPin] = useState<PendingPin | null>(null);
  const [threadName, setThreadName] = useState("");
  const [category, setCategory] = useState<Category>("chat");
  const [savingPin, setSavingPin] = useState(false);

  const { fetchLocation } = useGeoLocation();

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

  // ... (other imports)

  // ... (inside usePinCreation)
  const { uploadToS3, uploading } = useS3Upload(); // Use S3 upload hook

  // ... (remove fileToBase64 function)

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

      if (category === "event") {
        if (!data.startDate || !data.endDate) {
          alert("イベントの開始日と終了日は必須です");
          return;
        }

        success = await registerEventPoint({
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
      } else {
        // Chat
        success = await registerChatPoint({
          lat: pendingPin.lat,
          lng: pendingPin.lng,
          threadName,
          category,
          imageUrl,
        });
      }
      // ...

      if (success) {
        setPoints(await fetchPoints());
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

  // Sign-up prompt dialog
  const { isOpen, openDialog, closeDialog } = useSignUpPrompt();
  const { getLoginMode } = useLoginMode();

  const pinCreation = usePinCreation(setPoints, getLoginMode, openDialog);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [pinDetailModalOpen, setPinDetailModalOpen] = useState(false);
  const mapRef = useRef<google.maps.Map | null>(null);

  const onMapLoad = React.useCallback((map: google.maps.Map) => {
    mapRef.current = map;
  }, []);

  useEffect(() => {
    fetchPoints().then(setPoints);
  }, [session, setPoints]);

  // Only check if Google Maps is loaded, allow guest users to view the map
  if (!isLoaded) return null;

  const handleMarkerClick = (point: Point) => {
    setActiveId(point.id);
    if (mapRef.current) {
      const latLng = { lat: point.lat, lng: point.lng };
      mapRef.current.panTo(latLng);

      const div = mapRef.current.getDiv();
      const width = div.offsetWidth;
      // ピンを左端（左から25%または80pxなどの位置）に寄せる
      // そのために、マップ中心を右にずらす (panByのxをプラスにする)
      // 例: 中心(W/2) から 左位置(TargetX) への移動量 = W/2 - TargetX
      const targetX = Math.min(width * 0.1, 80); // 画面幅の20%か80pxの小さい方
      const offsetX = width / 2 - targetX;

      mapRef.current.panBy(offsetX, 0);
    }
  };

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
        onLoad={onMapLoad}
        onClick={(e) => {
          if (activeId) {
            setActiveId(null);
            return;
          }

          pinCreation.handleMapClick(e);
        }}
      >
        {pointList?.map((p) => (
          <React.Fragment key={p.id}>
            <Marker
              position={{ lat: p.lat, lng: p.lng }}
              onClick={() => handleMarkerClick(p)}
            />

            {activeId === p.id && (
              <OverlayView
                position={{ lat: p.lat, lng: p.lng }}
                mapPaneName={OverlayView.OVERLAY_MOUSE_TARGET}
              >
                {/* ピンの右側に吹き出しを表示するように変更 */}
                <div style={{ transform: "translate(20px, -50%)" }}>
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

      {/* Sign-up prompt dialog for guest users */}
      <SignUpPromptDialog
        isOpen={isOpen}
        onClose={closeDialog}
        title="ピンを作成するにはアカウントが必要です"
        message="アカウントを作成すると、マップ上にお気に入りの場所をピン留めしたり、新しいスレッドを開始したりできるようになります。"
      />
    </>
  );
};

export default MapWithCustomModalMarker;
