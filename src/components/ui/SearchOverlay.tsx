"use client";

import React, { useState, useRef, useEffect } from "react";

interface SearchOverlayProps {
  isOpen: boolean;
  onClose: () => void;
}

const SEARCH_DATA = [
  { title: 'マッチョサークルつくりませんか？', user: '筋肉マッチョまん', tag: 'コミュニティ', tagBg: '#FFFBEB', tagCol: '#B45309', grad: 'linear-gradient(135deg,#d4fc79,#96e6a1)', emoji: '💪' },
  { title: 'ハンドメイドポップアップ開催！', user: 'ハンドメイドマッチョ', tag: 'お店', tagBg: '#FFF0F5', tagCol: '#BE185D', grad: 'linear-gradient(135deg,#fccb90,#d57eeb)', emoji: '🎨' },
  { title: '18:00〜 焚き火します！', user: '焚き火のにーちゃん', tag: 'イベント', tagBg: '#E8F5F2', tagCol: '#1A6B5A', grad: 'linear-gradient(135deg,#f83600,#f9d423)', emoji: '🔥' },
  { title: 'コミュニティカフェ始めたい…', user: 'マッチョニャンコ', tag: 'つぶやき', tagBg: '#F3F4F6', tagCol: '#6B7280', grad: 'linear-gradient(135deg,#a18cd1,#fbc2eb)', emoji: '☕' },
  { title: '持ち寄りスナック店🍟', user: 'スナック太郎', tag: 'イベント', tagBg: '#E8F5F2', tagCol: '#1A6B5A', grad: 'linear-gradient(135deg,#fde68a,#fca5a5)', emoji: '🍟' },
  { title: 'まほまほ会すべしやるよ！！', user: 'まほちゃん', tag: 'イベント', tagBg: '#E8F5F2', tagCol: '#1A6B5A', grad: 'linear-gradient(135deg,#a1c4fd,#c2e9fb)', emoji: '🎉' },
];

export const SearchOverlay: React.FC<SearchOverlayProps> = ({ isOpen, onClose }) => {
  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setQuery("");
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const hits = query.trim()
    ? SEARCH_DATA.filter(d => d.title.includes(query) || d.user.includes(query) || d.tag.includes(query))
    : [];

  return (
    <div className="fixed inset-0 z-40 flex flex-col bg-white fade-in">
      <div className="flex-shrink-0 px-4 pt-3 pb-3 border-b border-gray-100">
        <div className="flex items-center gap-3">
          <div className="flex-1 flex items-center gap-2 bg-gray-100 rounded-2xl px-4 py-2.5">
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
              <circle cx="7" cy="7" r="5" stroke="#9CA3AF" strokeWidth="1.5" />
              <path d="M11 11l3 3" stroke="#9CA3AF" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
            <input
              ref={inputRef}
              type="text"
              placeholder="キーワードで検索…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="flex-1 bg-transparent text-sm text-gray-700 outline-none"
            />
          </div>
          <button onClick={onClose} className="text-sm font-bold flex-shrink-0 text-brand">
            キャンセル
          </button>
        </div>
      </div>

      {!query.trim() ? (
        <div className="flex-1 flex flex-col items-center justify-center text-gray-400 gap-3">
          <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
            <circle cx="18" cy="18" r="12" stroke="#D1D5DB" strokeWidth="2" />
            <path d="M28 28l8 8" stroke="#D1D5DB" strokeWidth="2.5" strokeLinecap="round" />
          </svg>
          <p className="text-sm">キーワードを入力してください</p>
        </div>
      ) : hits.length > 0 ? (
        <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
          {hits.map((d, i) => (
            <div
              key={i}
              className="bg-white rounded-2xl overflow-hidden shadow-sm cursor-pointer active:opacity-80"
              onClick={onClose}
            >
              <div className="h-28 relative overflow-hidden" style={{ background: d.grad }}>
                <div className="absolute inset-0 flex items-center justify-center text-5xl opacity-35">
                  {d.emoji}
                </div>
              </div>
              <div className="p-3">
                <div className="flex items-center gap-2 mb-1">
                  <p className="text-sm font-bold flex-1 truncate">{d.title}</p>
                  <span
                    className="text-[10px] font-bold px-2 py-0.5 rounded-full flex-shrink-0"
                    style={{ background: d.tagBg, color: d.tagCol }}
                  >
                    {d.tag}
                  </span>
                </div>
                <p className="text-xs text-gray-400">{d.user}</p>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="flex-1 flex flex-col items-center justify-center text-gray-400 text-sm gap-2">
          <span>😔</span>
          <span>「{query}」の検索結果はありません</span>
        </div>
      )}
    </div>
  );
};
