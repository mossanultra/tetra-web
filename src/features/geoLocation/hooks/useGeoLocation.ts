import { useCallback, useState } from "react";

import { getGeoLocation, Location } from "../api/getGeoLocation";

export function useGeoLocation() {
  const [location, setLocation] = useState<Location>();

  /** ポイント登録 */
  const fetchLocation = useCallback(async (lat: number, lng: number) => {
    if (!lat || !lng) {
      alert("緯度経度を入れてください。");
      return;
    }
    let l;
    try {
      const location = await getGeoLocation(lat, lng);
      if (location) {
        l = location;
        setLocation(l);
      }
    } catch (error) {
      console.error("Error sending message:", error);
      alert("エラーが発生しました。");
    }

    return l;
  }, []);

  return {
    fetchLocation,
    location,
  };
}
