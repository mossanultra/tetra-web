"use client";

import { useEffect, useRef, useState } from "react";
import { Point } from "@/src/features/point/types/point";

const DEFAULT_CENTER = {
  lat: 35.681236,
  lng: 139.767125,
};

export const useMapState = () => {
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
