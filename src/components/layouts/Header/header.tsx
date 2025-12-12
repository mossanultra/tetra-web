import React from "react";
import Link from "next/link";
import { 
  FaUser, 
  FaRegCalendar, 
  FaSignOutAlt, 
  FaMapMarkedAlt, 
  FaStream 
} from "react-icons/fa";

const Header: React.FC = () => {
  return (
    <header className="text-white shadow-md">
      <div className="px-4 h-16 flex justify-between items-center">

        {/* 左：ロゴ */}
        <div className="flex items-center gap-2">
          <Link
            href="/"
            className="text-xl font-bold text-white no-underline hover:text-blue-200 transition-colors duration-200"
          >
            にゃんこ同盟
          </Link>
        </div>

        {/* 右：ナビゲーション */}
        <nav className="flex items-center">
          <ul className="flex list-none m-0 p-0 gap-6 items-center">

            {/* マップ */}
            <li>
              <Link 
                href="/map" 
                className="text-white no-underline hover:text-blue-200 transition-colors duration-200 flex items-center gap-2"
                title="地図"
              >
                <FaMapMarkedAlt className="text-xl" />
                <span className="hidden md:inline">マップ</span>
              </Link>
            </li>

            {/* タイムライン */}
            <li>
              <Link 
                href="/timeline" 
                className="text-white no-underline hover:text-blue-200 transition-colors duration-200 flex items-center gap-2"
                title="タイムライン"
              >
                <FaStream className="text-xl" />
                <span className="hidden md:inline">タイムライン</span>
              </Link>
            </li>

            {/* カレンダー */}
            <li>
              <Link 
                href="/calender" 
                className="text-white no-underline hover:text-blue-200 transition-colors duration-200 flex items-center gap-2"
                title="カレンダー"
              >
                <FaRegCalendar className="text-xl" />
                <span className="hidden md:inline">カレンダー</span>
              </Link>
            </li>

            {/* プロフィール */}
            <li>
              <Link 
                href="/profile/@self" 
                className="text-white no-underline hover:text-blue-200 transition-colors duration-200 flex items-center gap-2"
                title="プロフィール"
              >
                <FaUser className="text-xl" />
                <span className="hidden md:inline">プロフィール</span>
              </Link>
            </li>

            {/* ログアウト */}
            <li>
              <Link 
                href="/signout" 
                className="text-white no-underline hover:text-blue-200 transition-colors duration-200 flex items-center gap-2"
                title="ログアウト"
              >
                <FaSignOutAlt className="text-xl" />
                <span className="hidden md:inline">ログアウト</span>
              </Link>
            </li>

          </ul>
        </nav>
      </div>
    </header>
  );
};

export default Header;
