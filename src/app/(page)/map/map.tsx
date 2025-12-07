/* eslint-disable @typescript-eslint/no-explicit-any */
"use client"; // クライアントコンポーネントとして明示

import React, { ReactNode, useEffect, useRef, useState } from "react";
import { GoogleMap, Marker, OverlayView, useJsApiLoader } from "@react-google-maps/api";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { FiCheckCircle, FiAlertCircle, FiClock } from "react-icons/fi";
import { useGeoLocation } from "@/src/features/geoLocation/hooks/useGeoLocation";
import { fetchPoints, registerPoint } from "@/src/features/point/hooks/usePoint";
import { Point } from "@/src/features/point/types/point";
import { getAuthToken } from "@/src/services/actions";

type MapWithCustomModalMarkerProps = {
  zoom: number;
  children?: ReactNode;
};
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
          transform: "translate(-50%, -50%)", // 中央揃え
          cursor: "pointer",
          display: "inline-block",
        }}
      >
        {children}
      </div>
    </OverlayView>
  );
};
const MarkerContent: React.FC<{ point: Point; onClick?: () => void }> = ({ point, onClick }) => {
  const updatedAt = (point as any).updatedAt ? new Date((point as any).updatedAt) : null;
  const formattedDate = updatedAt ? updatedAt.toLocaleDateString() : "";
  const category = ((point as any).category as string) ?? "雑談";

  // 追加: サーバに保存した threadName を優先的に表示。なければ title を表示。
  const threadName = (point as any).threadName ?? (point as any).title ?? "";
  const title = (point as any).title ?? "";

  const EventIcon = () => (
    <svg width="44" height="44" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" aria-hidden>
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

  const AnnouncementIcon = () => (
    <svg width="44" height="44" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" aria-hidden>
      <rect x="6" y="6" width="88" height="88" rx="12" fill="#FFB800"/>
      <rect x="10" y="10" width="80" height="80" rx="10" fill="#FFF4D6"/>
      <rect x="36" y="45" width="28" height="20" rx="2" fill="#FFB800"/>
      <path d="M36 52 L50 60 L64 52" stroke="#FFF4D6" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
      <circle cx="64" cy="44" r="5" fill="#FF6B9D"/>
      <circle cx="64" cy="44" r="2.5" fill="#fff"/>
    </svg>
  );

  const ChatIcon = () => (
    <svg width="44" height="44" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" aria-hidden>
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

  const renderCategoryIcon = (cat: string) => {
    switch (cat) {
      case "イベント":
        return <EventIcon />;
      case "告知":
        return <AnnouncementIcon />;
      default:
        return <ChatIcon />;
    }
  };

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
        transform: "translate(-50%, -100%)", // マーカー真上に出す
        cursor: "pointer",
        whiteSpace: "nowrap",
      }}
    >
      <div style={{ width: 44, height: 44, flexShrink: 0 }}>
        {renderCategoryIcon(category)}
      </div>

      <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-start" }}>
        {/* threadName を優先表示。無ければ title */}
        <div style={{ fontSize: 12, color: "#222", fontWeight: 700 }}>
          {threadName || "(未設定)"}
        </div>
        {/* title が別にある場合は補助的に表示 */}
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
const MapWithCustomModalMarker: React.FC<MapWithCustomModalMarkerProps> = ({
  zoom,
}) => {
  const { isLoaded, loadError } = useJsApiLoader({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "",
  });

  const router = useRouter();
  const hasFetched = useRef(false);
  const { fetchLocation } = useGeoLocation();
  const [pointList, setPoints] = useState<Point[]>();
  const { data: session, status } = useSession();
  const [center, setCenter] = useState({ lat: 37.7608, lng: 140.473 });

  // --- モーダル用 state ---
  const [pinModalOpen, setPinModalOpen] = useState(false);
  // pendingPin は位置のみ保持（threadName/category は別 state を使う）
  const [pendingPin, setPendingPin] = useState<{ lat: number; lng: number } | null>(null);
  const [threadName, setThreadName] = useState("");
  const [category, setCategory] = useState<"イベント" | "雑談" | "告知">("雑談");
  const [savingPin, setSavingPin] = useState(false);

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

  useEffect(() => {
    const loadPoints = async () => {
      const token = await getAuthToken();
      if (!token) {
        throw new Error("認証情報が見つかりません");
      }
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "";
      const endpoint = `${apiUrl}/map`;

      const response = await fetch(endpoint, {
        method: "GET",
        headers: {
          "Authorization": `${token}`,
        },
      });

      if (!response.ok) {
        throw new Error(`マップ情報取得失敗 (${response.status})`);
      }
    };
    loadPoints();
  }, [session]);

  if (status === "loading") {
    return <p>Loading...</p>;
  }

  if (!session) {
    return <p>Not logged in</p>;
  }

  const containerStyle: React.CSSProperties = {
    width: "100%",
    height: "600px",
  };

  const handleMarkerClick = (marker: Point) => {
    router.push(`/points/${marker.id}`);
  };

  // const renderMarker = (point: Point, index: number) => {
  //   const icon = point.read
  //     ? undefined
  //     : {
  //         url: "/ma-motto.jpeg",
  //         scaledSize: new google.maps.Size(30, 30),
  //       };
  //   return (
  //     <Marker
  //       key={index}
  //       position={{ lat: point.lat, lng: point.lng }}
  //       icon={icon}
  //       onClick={() => handleMarkerClick(point)}
  //     />
  //   );
  // };
  const renderMarker = (point: Point) => {
    // 例: OverlayView を使って任意のコンポーネントを表示
    return (
      <CustomMarker
        key={point.id}
        position={{ lat: point.lat, lng: point.lng }}
        onClick={() => handleMarkerClick(point)}
      >
        <MarkerContent point={point} onClick={() => handleMarkerClick(point)} />
      </CustomMarker>
    );
  };

  // クリックでモーダルを開き、ピン情報を入力してから登録する
  const handleMapClick = async (event: google.maps.MapMouseEvent) => {
    if (event.latLng) {
      const lat = event.latLng.lat();
      const lng = event.latLng.lng();
      try {
        const geoLocation = await fetchLocation(lat, lng);
        // 位置のみ保存し、threadName/category は専用 state を使う
        setPendingPin({ lat, lng });
        const initialName = `${geoLocation?.city || ""}${geoLocation?.town || ""}`.trim();
        setThreadName(initialName);
        setCategory("雑談");
        setPinModalOpen(true);
        console.debug("open pin modal", { lat, lng, initialName, category: "雑談" });
      } catch (error) {
        console.error("Failed to handle map click:", error);
      }
    }
  };

  const confirmPlacePin = async () => {
    if (!pendingPin) return;
    setSavingPin(true);
    try {
      // デバッグ表示
      console.debug("confirmPlacePin called", {
        pendingPin,
        threadName,
        category,
      });
      // registerPoint の実装が threadName/category を受け取れる場合は渡す
      await registerPoint(pendingPin.lat, pendingPin.lng, threadName, category);
      // 必要に応じて thread 作成 API をここで呼ぶ
      const newPoints = await fetchPoints(session.user?.id);
      setPoints(newPoints);
      setPinModalOpen(false);
      setPendingPin(null);
      setThreadName("");
      setCategory("雑談");
    } catch (err) {
      console.error("Failed to register pin:", err);
      alert("ピンの登録に失敗しました。");
    } finally {
      setSavingPin(false);
    }
  };

  if (loadError) return <p>Error loading maps</p>;
  if (!isLoaded) return <p>Loading maps...</p>;

  return (
    <>
      {/* --- ピン作成モーダル --- */}
      {pinModalOpen && pendingPin && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "rgba(0,0,0,0.4)",
            zIndex: 9999,
          }}
          onClick={() => {
            if (!savingPin) {
              setPinModalOpen(false);
              setPendingPin(null);
            }
          }}
        >
          <div
            role="dialog"
            aria-modal="true"
            onClick={(e) => e.stopPropagation()}
            style={{
              width: 360,
              background: "#fff",
              borderRadius: 8,
              padding: 16,
              boxShadow: "0 8px 32px rgba(0,0,0,0.2)",
            }}
          >
            <h3 style={{ margin: "0 0 8px 0" }}>新しいピン</h3>
            <label style={{ fontSize: 12, color: "#555" }}>スレッド名</label>
            <input
              value={threadName}
              onChange={(e) => setThreadName(e.target.value)}
              placeholder="スレッド名を入力"
              style={{
                width: "100%",
                padding: "8px 10px",
                marginTop: 6,
                marginBottom: 10,
                borderRadius: 6,
                border: "1px solid #ddd",
                boxSizing: "border-box",
              }}
            />
            <label style={{ fontSize: 12, color: "#555" }}>カテゴリ</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as any)}
              style={{
                width: "100%",
                padding: "8px 10px",
                marginTop: 6,
                marginBottom: 14,
                borderRadius: 6,
                border: "1px solid #ddd",
                boxSizing: "border-box",
              }}
            >
              <option value="イベント">イベント</option>
              <option value="雑談">雑談</option>
              <option value="告知">告知</option>
            </select>

            {/* デバッグ: 現在の入力値を表示 */}
            <pre style={{ fontSize: 11, color: "#333", background: "#f7f7f7", padding: 8, borderRadius: 4 }}>
              {JSON.stringify({ pendingPin, threadName, category }, null, 2)}
            </pre>

            <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
              <button
                onClick={() => {
                  if (!savingPin) {
                    setPinModalOpen(false);
                    setPendingPin(null);
                  }
                }}
                style={{
                  padding: "8px 12px",
                  borderRadius: 6,
                  border: "1px solid #ccc",
                  background: "#746d7763",
                  cursor: "pointer",
                }}
                disabled={savingPin}
              >
                キャンセル
              </button>
              <button
                onClick={confirmPlacePin}
                style={{
                  padding: "8px 12px",
                  borderRadius: 6,
                  border: "none",
                  background: "#1976d2",
                  color: "#fff",
                  cursor: "pointer",
                }}
                disabled={savingPin || !threadName.trim()}
              >
                {savingPin ? "登録中..." : "ピンを立てる"}
              </button>
            </div>
          </div>
        </div>
      )}
      <p>Select Map Style</p>
      <GoogleMap
        mapContainerStyle={containerStyle}
        center={center}
        zoom={zoom}
        onClick={handleMapClick}
      >
        {pointList?.map((point) => renderMarker(point))}
        <Marker
          position={center}
          icon={{
            url: "/36959.png",
            scaledSize: new google.maps.Size(30, 30),
          }}
        />
      </GoogleMap>
    </>
  );
};

export default MapWithCustomModalMarker;
