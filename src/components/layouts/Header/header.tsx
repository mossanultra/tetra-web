import React from "react";
import Link from "next/link";
import { FaHome, FaUser, FaCog } from "react-icons/fa";
import { GiNotebook } from "react-icons/gi";
import { MdFitnessCenter } from "react-icons/md";
import HamburgerButton from "./HamburgerButton";

const Header: React.FC = () => {
  return (
    <header className="text-white shadow-md">
      <div className="max-w-6xl mx-auto px-4 h-16 flex justify-between items-center">
        {/* 左側：ハンバーガーメニュー + ロゴ */}
        <div className="flex items-center gap-2">
          <HamburgerButton className="md:hidden bg-none border-none text-2xl text-blue-600 cursor-pointer mr-3" />
          <Link
            href="/"
            className="text-xl font-bold text-white no-underline hover:text-blue-200 transition-colors duration-200"
          >
            にゃんこ同盟
          </Link>
        </div>

        {/* 右側：ナビゲーションアイコン */}
        <nav className="flex items-center">
          <ul className="flex list-none m-0 p-0 gap-6 items-center">
            <li>
              <Link 
                href="/home" 
                className="text-white no-underline hover:text-blue-200 transition-colors duration-200 flex items-center gap-2"
                title="ホーム"
              >
                <FaHome className="text-xl" />
                <span className="hidden md:inline">ホーム</span>
              </Link>
            </li>
            <li>
              <Link 
                href="/profile" 
                className="text-white no-underline hover:text-blue-200 transition-colors duration-200 flex items-center gap-2"
                title="プロフィール"
              >
                <FaUser className="text-xl" />
                <span className="hidden md:inline">プロフィール</span>
              </Link>
            </li>
            <li>
              <Link 
                href="/map" 
                className="text-white no-underline hover:text-blue-200 transition-colors duration-200 flex items-center gap-2"
                title="地図"
              >
                <GiNotebook className="text-xl" />
                <span className="hidden md:inline">地図</span>
              </Link>
            </li>
            <li>
              <Link 
                href="/timeline" 
                className="text-white no-underline hover:text-blue-200 transition-colors duration-200 flex items-center gap-2"
                title="タイムライン"
              >
                <MdFitnessCenter className="text-xl" />
                <span className="hidden md:inline">タイムライン</span>
              </Link>
            </li>
            <li>
              <Link 
                href="/settings" 
                className="text-white no-underline hover:text-blue-200 transition-colors duration-200 flex items-center gap-2"
                title="設定"
              >
                <FaCog className="text-xl" />
                <span className="hidden md:inline">設定</span>
              </Link>
            </li>
          </ul>
        </nav>
      </div>
    </header>
  );
};

export default Header;