"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import {
  FaUser,
  FaRegCalendar,
  FaSignOutAlt,
  FaMapMarkedAlt,
  FaStream,
  FaHome,
} from "react-icons/fa";
import { useProfile } from "@/src/features/user/hooks/useProfile";

const Header: React.FC = () => {
  const popupRef = useRef<HTMLDivElement | null>(null);

  return (
    <header className="text-white shadow-md relative">
      <div className="px-4 h-16 flex justify-between items-center">
        <h1 className="text-lg font-semibold tracking-wide">マチップ</h1>
      </div>
    </header>
  );
};

export default Header;
