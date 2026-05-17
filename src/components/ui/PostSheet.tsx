"use client";

import React, { useState } from "react";

interface PostSheetProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PostSheet: React.FC<PostSheetProps> = ({ isOpen, onClose }) => {
  const [isClosing, setIsClosing] = useState(false);
  const [selectedIcon, setSelectedIcon] = useState<{ emoji: string; color: string } | null>(null);

  if (!isOpen && !isClosing) return null;

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => {
      setIsClosing(false);
      onClose();
    }, 240); // Matches animation duration
  };

  const icons = [
    { emoji: "🔥", color: "#F97316" },
    { emoji: "🎨", color: "#EC4899" },
    { emoji: "☕", color: "#3B82F6" },
    { emoji: "🎉", color: "#8B5CF6" },
    { emoji: "💪", color: "#10B981" },
    { emoji: "🍜", color: "#1A6B5A" },
    { emoji: "🌸", color: "#F59E0B" },
    { emoji: "⚽", color: "#EF4444" },
    { emoji: "🎵", color: "#6366F1" },
    { emoji: "🐟", color: "#0EA5E9" },
  ];

  return (
    <div className="fixed inset-0 z-50">
      <div 
        className={`absolute inset-0 bg-black/40 ${isClosing ? 'opacity-0 transition-opacity duration-200' : 'fade-in'}`}
        onClick={handleClose}
      />
      <div className={`absolute bottom-0 left-0 right-0 bg-white rounded-t-3xl max-h-[92vh] overflow-y-auto ${isClosing ? 'sheet-out' : 'sheet-in'}`}>
        <div className="w-10 h-1 bg-gray-200 rounded-full mx-auto mt-3"></div>
        <div className="flex items-center justify-between px-5 pt-4 pb-4 border-b border-gray-100">
          <h2 className="text-base font-black">掲示板を投稿する</h2>
          <button onClick={handleClose} className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
              <path d="M1 1l10 10M11 1L1 11" stroke="#6B7280" strokeWidth="1.8" strokeLinecap="round" />
            </svg>
          </button>
        </div>
        <div className="px-5 py-4 space-y-4">
          <div>
            <label className="block text-xs font-bold text-gray-500 mb-2">投稿ジャンル</label>
            <div className="flex gap-2 flex-wrap">
              <button className="px-3.5 py-2 rounded-xl text-xs font-bold text-white bg-brand">イベント・出店</button>
              <button className="px-3.5 py-2 rounded-xl text-xs font-bold bg-gray-100 text-gray-600">お店</button>
              <button className="px-3.5 py-2 rounded-xl text-xs font-bold bg-gray-100 text-gray-600">コミュニティ</button>
            </div>
          </div>
          
          <div>
            <label className="block text-xs font-bold text-gray-500 mb-1.5">タイトル</label>
            <input type="text" placeholder="タイトルを入力" className="w-full h-11 border border-gray-200 rounded-xl px-4 text-sm text-gray-700 outline-none bg-white" />
          </div>
          
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-gray-500 mb-1.5">日付を選択</label>
              <input type="date" className="w-full h-11 border border-gray-200 rounded-xl px-3 text-sm text-gray-700 outline-none bg-white" />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 mb-1.5">場所</label>
              <input type="text" placeholder="地名を入力" className="w-full h-11 border border-gray-200 rounded-xl px-3 text-sm text-gray-700 outline-none bg-white" />
            </div>
          </div>
          
          <div>
            <label className="block text-xs font-bold text-gray-500 mb-1.5">関連リンク（任意）</label>
            <input type="url" placeholder="https://..." className="w-full h-11 border border-gray-200 rounded-xl px-4 text-sm text-gray-700 outline-none bg-white" />
          </div>
          
          <div>
            <label className="block text-xs font-bold text-gray-500 mb-1.5">詳細文を入力（500字まで）</label>
            <textarea rows={3} placeholder="詳細を入力してください…" className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-700 outline-none resize-none leading-relaxed bg-white"></textarea>
          </div>
          
          <div>
            <label className="block text-xs font-bold text-gray-500 mb-2">画像を選択（2枚まで）</label>
            <div className="grid grid-cols-2 gap-3">
              <div className="aspect-video rounded-xl border-2 border-dashed border-gray-200 flex items-center justify-center cursor-pointer bg-gradient-to-br from-brand-pale to-emerald-100">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                  <rect x="3" y="4" width="18" height="16" rx="3" stroke="#9CA3AF" strokeWidth="1.5" />
                  <circle cx="9" cy="9" r="2" stroke="#9CA3AF" strokeWidth="1.3" />
                  <path d="M3 16l5-4 4 4 3-2.5 6 4.5" stroke="#9CA3AF" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
              <div className="aspect-video rounded-xl border-2 border-dashed border-gray-200 flex items-center justify-center cursor-pointer bg-gradient-to-br from-blue-50 to-blue-100">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                  <rect x="3" y="4" width="18" height="16" rx="3" stroke="#9CA3AF" strokeWidth="1.5" />
                  <circle cx="9" cy="9" r="2" stroke="#9CA3AF" strokeWidth="1.3" />
                  <path d="M3 16l5-4 4 4 3-2.5 6 4.5" stroke="#9CA3AF" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
            </div>
          </div>
          
          <div>
            <label className="block text-xs font-bold text-gray-500 mb-2">マップに表示するアイコン <span className="font-normal text-gray-400">（タップして選択）</span></label>
            <div className="flex gap-2 flex-wrap">
              {icons.map((icon, idx) => {
                const isSelected = selectedIcon?.emoji === icon.emoji;
                return (
                  <button
                    key={idx}
                    onClick={() => setSelectedIcon(icon)}
                    className="w-11 h-11 rounded-full text-xl flex items-center justify-center border-2"
                    style={{
                      borderColor: isSelected ? icon.color : "transparent",
                      background: isSelected ? `${icon.color}22` : "#F9FAFB"
                    }}
                  >
                    {icon.emoji}
                  </button>
                );
              })}
            </div>
            {selectedIcon && (
              <div className="mt-2.5 flex items-center gap-2 fade-in">
                <div 
                  className="w-9 h-9 rounded-full flex items-center justify-center text-lg shadow-sm flex-shrink-0"
                  style={{ background: selectedIcon.color }}
                >
                  {selectedIcon.emoji}
                </div>
                <p className="text-xs text-gray-500">このアイコンがマップに表示されます</p>
              </div>
            )}
          </div>
          
          <button 
            onClick={handleClose} 
            className="w-full h-12 rounded-full text-white text-sm font-black bg-gradient-to-r from-brand to-brand-mid"
          >
            この内容で投稿する
          </button>
          <div className="h-2"></div>
        </div>
      </div>
    </div>
  );
};
