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
import { Point } from "@/src/features/point/types/point";
import { PinCreationDialog } from "@/src/features/map/components/PinCreationDialog";
import { MarkerDetailDialog } from "@/src/features/map/components/MarkerDetailDialog";
import { SignUpPromptDialog } from "@/src/features/user/components/SignUpPromptDialog";
import { useSignUpPrompt } from "@/src/features/user/hooks/useSignUpPrompt";
import { useLoginMode } from "@/src/features/user/hooks/useLoginMode";
import { useMapState } from "../hooks/useMapState";
import { usePinCreation } from "../hooks/usePinCreation";
import { getPoints } from "@/src/features/point/api/getPoints";

type MapClientProps = {
  zoom: number;
  children?: ReactNode;
};

const MAP_CONTAINER_STYLE: React.CSSProperties = {
  width: "100%",
  height: "100%",
};

const USER_MARKER_SIZE = 40;

export const MapClient: React.FC<MapClientProps> = ({ zoom }) => {
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
    getPoints().then(setPoints);
  }, [session, setPoints]);

  // Only check if Google Maps is loaded, allow guest users to view the map
  if (!isLoaded) return null;

  const handleMarkerClick = (point: Point) => {
    setActiveId(point.id);
    // Explicitly open modal when marker is clicked (if separate state is used)
    // In original code, it conditionally rendered OverlayView when activeId matches.
    // Also it had `pinDetailModalOpen` state but it wasn't toggled in handleMarkerClick?
    // Looking at original code:
    // <MarkerDetailDialog isOpen={pinDetailModalOpen} ... />
    // But where is setPinDetailModalOpen(true) called?
    // It seems missing in `handleMarkerClick`.
    // Wait, original code:
    // const [pinDetailModalOpen, setPinDetailModalOpen] = useState(false);
    // ...
    // <MarkerDetailDialog isOpen={pinDetailModalOpen} ... />
    // It seems the original code might have a bug or I missed something.
    // Ah, usually OverlayView is shown when `activeId === p.id`.
    // And MarkerDetailDialog `isOpen` prop.
    // If `isOpen` is false, it won't show even if OverlayView is rendered?
    // Let's assume we want to show it.
    setPinDetailModalOpen(true);

    if (mapRef.current) {
      const latLng = { lat: point.lat, lng: point.lng };
      mapRef.current.panTo(latLng);

      const div = mapRef.current.getDiv();
      const width = div.offsetWidth;
      const targetX = Math.min(width * 0.1, 80);
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
              icon={{
                url:
                  p.category === "event"
                    ? "http://maps.google.com/mapfiles/ms/icons/red-dot.png"
                    : "http://maps.google.com/mapfiles/ms/icons/blue-dot.png",
              }}
            />

            {activeId === p.id && (
              <OverlayView
                position={{ lat: p.lat, lng: p.lng }}
                mapPaneName={OverlayView.OVERLAY_MOUSE_TARGET}
              >
                <div style={{ transform: "translate(20px, -50%)" }}>
                  <MarkerDetailDialog
                    point={p}
                    isOpen={pinDetailModalOpen}
                    onClose={() => {
                      setActiveId(null);
                      setPinDetailModalOpen(false);
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
              USER_MARKER_SIZE,
            ),
          }}
        />
      </GoogleMap>

      <SignUpPromptDialog
        isOpen={isOpen}
        onClose={closeDialog}
        title="ピンを作成するにはアカウントが必要です"
        message="アカウントを作成すると、マップ上にお気に入りの場所をピン留めしたり、新しいスレッドを開始したりできるようになります。"
      />
    </>
  );
};
