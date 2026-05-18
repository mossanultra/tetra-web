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
import { useInboxContext } from "@/src/contexts/InboxContext";

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
  const { unreadCount } = useInboxContext();

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
    <div className="absolute inset-0 flex flex-col w-full">
      
      {/* Map Header (Mobile only) */}
      <div className="absolute top-4 left-4 z-20 md:hidden flex gap-2">
        <button className="w-10 h-10 rounded-full bg-white shadow-md flex items-center justify-center text-gray-700">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
        </button>
      </div>
      <div className="absolute top-4 right-4 z-20 md:hidden flex gap-2">
        <button onClick={() => router.push('/inbox')} className="relative w-10 h-10 rounded-full bg-white shadow-md flex items-center justify-center text-gray-700">
          <svg width="20" height="20" viewBox="0 0 22 22" fill="none"><path d="M11 2C7.7 2 5 4.7 5 8V14L3.5 15.5V16H18.5V15.5L17 14V8C17 4.7 14.3 2 11 2Z" stroke="currentColor" strokeWidth="1.5"/><path d="M9 16C9 17.1 9.9 18 11 18S13 17.1 13 16" stroke="currentColor" strokeWidth="1.5"/></svg>
          {unreadCount > 0 && (
            <span className="absolute top-1 right-1 w-3.5 h-3.5 bg-red-500 rounded-full border-2 border-white text-white text-[8px] flex items-center justify-center font-bold animate-pulse">
              {unreadCount > 99 ? "99+" : unreadCount}
            </span>
          )}
        </button>
        <button onClick={() => router.push('/profile/@self')} className="w-10 h-10 rounded-full bg-white shadow-md overflow-hidden border-2 border-white">
          <img src="/default-user.png" className="w-full h-full object-cover" alt="User" />
        </button>
      </div>

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

      <div className="flex-1 relative z-0">
        <GoogleMap
          mapContainerStyle={MAP_CONTAINER_STYLE}
          center={center}
          zoom={zoom}
          onLoad={onMapLoad}
          options={{
            disableDefaultUI: true,
            gestureHandling: "greedy",
            mapId: process.env.NEXT_PUBLIC_GOOGLE_MAP_ID || "",
          }}
          onClick={(e) => {
            if (activeId) {
              setActiveId(null);
              return;
            }
            pinCreation.handleMapClick(e);
          }}
        >
          {pointList?.map((p) => {
            const isEvent = p.category === "event";
            const color = isEvent ? "#f83600" : "#10B981";
            const emoji = isEvent ? "🔥" : "📍";
            
            return (
              <React.Fragment key={p.id}>
                <OverlayView
                  position={{ lat: p.lat, lng: p.lng }}
                  mapPaneName={OverlayView.OVERLAY_MOUSE_TARGET}
                >
                  <div 
                    className="map-pin-wrap" 
                    onClick={() => handleMarkerClick(p)}
                  >
                    <div className="bg-white rounded-md shadow px-1.5 py-0.5 text-[10px] font-bold mb-1 whitespace-nowrap">
                      {p.threadName}
                    </div>
                    <div className="map-pin-circle" style={{ background: color }}>{emoji}</div>
                    <div className="map-pin-tail" style={{ borderTop: `10px solid ${color}` }}></div>
                  </div>
                </OverlayView>

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
            );
          })}

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
      </div>

      <SignUpPromptDialog
        isOpen={isOpen}
        onClose={closeDialog}
        title="ピンを作成するにはアカウントが必要です"
        message="アカウントを作成すると、マップ上にお気に入りの場所をピン留めしたり、新しいスレッドを開始したりできるようになります。"
      />
    </div>
  );
};
