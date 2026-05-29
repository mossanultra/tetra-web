"use client";

import React, { useRef, useState, useEffect } from "react";
import { FaTimes } from "react-icons/fa";

type Category = "event" | "chat";

type PendingPin = {
  lat: number;
  lng: number;
};

export type ConfirmData = {
  startDate: Date | null;
  endDate: Date | null;
  image: File | null;
  url: string;
  detail: string;
  iconEmoji: string | null;
  iconColor: string | null;
};

interface MapPostSheetProps {
  isOpen: boolean;
  onClose: () => void;
  pendingPin: PendingPin | null;
  threadName: string;
  category: Category;
  savingPin: boolean;
  onThreadNameChange: (name: string) => void;
  onCategoryChange: (category: Category) => void;
  onConfirm: (data: ConfirmData) => void;
  onCancel: () => void;
}

export const MapPostSheet: React.FC<MapPostSheetProps> = ({
  isOpen,
  onClose,
  pendingPin,
  threadName,
  category,
  savingPin,
  onThreadNameChange,
  onCategoryChange,
  onConfirm,
  onCancel,
}) => {
  const [isClosing, setIsClosing] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [url, setUrl] = useState("");
  const [detail, setDetail] = useState("");
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [selectedIcon, setSelectedIcon] = useState<{ emoji: string; color: string } | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

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

  // Initialize selected icon based on category
  useEffect(() => {
    if (category === "event") {
      setSelectedIcon({ emoji: "🔥", color: "#F97316" });
    } else {
      setSelectedIcon({ emoji: "📍", color: "#10B981" });
    }
  }, [category]);

  if (!isOpen || !pendingPin) return null;

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => {
      setIsClosing(false);
      onCancel();
    }, 240); // Matches animation duration
  };

  const handleImageSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = () => {
    setSelectedImage(null);
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleDateChange = (
    event: React.ChangeEvent<HTMLInputElement>,
    setter: (date: Date | null) => void,
  ) => {
    const val = event.target.value;
    const date = val ? new Date(val) : null;
    setter(date);
  };

  const formatDateTimeForInput = (date: Date | null) => {
    if (!date) return "";
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    const hours = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  };

  const handleConfirm = () => {
    onConfirm({
      startDate: selectedDate,
      endDate: endDate,
      image: selectedImage,
      url,
      detail,
      iconEmoji: selectedIcon?.emoji || null,
      iconColor: selectedIcon?.color || null,
    });
    resetForm();
  };

  const resetForm = () => {
    setSelectedDate(null);
    setEndDate(null);
    setSelectedImage(null);
    setUrl("");
    setDetail("");
    setImagePreview(null);
  };

  const isEvent = category === "event";

  return (
    <div className="fixed inset-0 z-50">
      <div 
        className={`absolute inset-0 bg-black/40 ${isClosing ? 'opacity-0 transition-opacity duration-200' : 'fade-in'}`}
        onClick={() => !savingPin && handleClose()}
      />
      <div 
        role="dialog"
        aria-modal="true"
        className={`absolute bottom-0 left-0 right-0 bg-white rounded-t-3xl max-h-[92vh] overflow-y-auto ${isClosing ? 'sheet-out' : 'sheet-in'}`}
      >
        <div className="w-10 h-1 bg-gray-200 rounded-full mx-auto mt-3"></div>
        <div className="flex items-center justify-between px-5 pt-4 pb-4 border-b border-gray-100">
          <h2 className="text-base font-black">ピンを立てる</h2>
          <button 
            onClick={handleClose} 
            disabled={savingPin}
            className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center disabled:opacity-50"
          >
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
              <path d="M1 1l10 10M11 1L1 11" stroke="#6B7280" strokeWidth="1.8" strokeLinecap="round" />
            </svg>
          </button>
        </div>
        
        <div className="px-5 py-4 space-y-4">
          {/* 投稿ジャンル（カテゴリ） */}
          <div>
            <label className="block text-xs font-bold text-gray-500 mb-2">投稿ジャンル</label>
            <div className="flex gap-2 flex-wrap">
              <button 
                type="button"
                onClick={() => onCategoryChange("event")}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-colors ${
                  category === "event"
                    ? "text-white bg-brand"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                イベント
              </button>
              <button 
                type="button"
                onClick={() => onCategoryChange("chat")}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-colors ${
                  category === "chat"
                    ? "text-white bg-brand"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                雑談
              </button>
            </div>
          </div>
          
          {/* タイトル / 場所 */}
          <div>
            <label className="block text-xs font-bold text-gray-500 mb-1.5">タイトル（スレッド名）</label>
            <input 
              type="text" 
              value={threadName}
              onChange={(e) => onThreadNameChange(e.target.value)}
              placeholder="タイトルを入力" 
              className="w-full h-11 border border-gray-200 rounded-xl px-4 text-sm text-gray-700 outline-none bg-white focus:border-brand transition-colors" 
            />
          </div>



          {/* 日付（イベント時のみ表示） */}
          {isEvent && (
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-gray-500 mb-1.5">開始日時</label>
                <input 
                  type="datetime-local" 
                  value={formatDateTimeForInput(selectedDate)}
                  onChange={(e) => handleDateChange(e, setSelectedDate)}
                  className="w-full h-11 border border-gray-200 rounded-xl px-3 text-sm text-gray-700 outline-none bg-white focus:border-brand transition-colors" 
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 mb-1.5">終了日時</label>
                <input 
                  type="datetime-local" 
                  value={formatDateTimeForInput(endDate)}
                  onChange={(e) => handleDateChange(e, setEndDate)}
                  className="w-full h-11 border border-gray-200 rounded-xl px-3 text-sm text-gray-700 outline-none bg-white focus:border-brand transition-colors" 
                />
              </div>
            </div>
          )}
          
          {/* 関連リンク（イベント時のみ表示） */}
          {isEvent && (
            <div>
              <label className="block text-xs font-bold text-gray-500 mb-1.5">関連リンク（任意）</label>
              <input 
                type="url" 
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://..." 
                className="w-full h-11 border border-gray-200 rounded-xl px-4 text-sm text-gray-700 outline-none bg-white focus:border-brand transition-colors" 
              />
            </div>
          )}
          
          {/* 詳細（イベント時のみ表示） */}
          {isEvent && (
            <div>
              <label className="block text-xs font-bold text-gray-500 mb-1.5">詳細文を入力</label>
              <textarea 
                rows={3} 
                value={detail}
                onChange={(e) => setDetail(e.target.value)}
                placeholder="詳細を入力してください…" 
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-700 outline-none resize-none leading-relaxed bg-white focus:border-brand transition-colors"
              />
            </div>
          )}
          
          {/* 画像選択 */}
          <div>
            <label className="block text-xs font-bold text-gray-500 mb-2">画像を選択</label>
            <div className="w-full">
              <input 
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageSelect}
                className="hidden"
              />
              <div 
                onClick={() => fileInputRef.current?.click()}
                className="aspect-video rounded-xl border-2 border-dashed border-gray-200 flex items-center justify-center cursor-pointer bg-gradient-to-br from-brand-pale to-emerald-100 transition-opacity hover:opacity-90"
              >
                {imagePreview ? (
                  <div className="relative w-full h-full">
                    <img 
                      src={imagePreview} 
                      alt="プレビュー" 
                      className="w-full h-full object-cover rounded-xl"
                    />
                    <button 
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRemoveImage();
                      }}
                      className="absolute top-2 right-2 p-1.5 bg-gray-900/70 hover:bg-gray-900 rounded-full transition"
                    >
                      <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                        <path d="M1 1l10 10M11 1L1 11" stroke="#FFFFFF" strokeWidth="1.8" strokeLinecap="round" />
                      </svg>
                    </button>
                  </div>
                ) : (
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                    <rect x="3" y="4" width="18" height="16" rx="3" stroke="#9CA3AF" strokeWidth="1.5" />
                    <circle cx="9" cy="9" r="2" stroke="#9CA3AF" strokeWidth="1.3" />
                    <path d="M3 16l5-4 4 4 3-2.5 6 4.5" stroke="#9CA3AF" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                )}
              </div>
            </div>
          </div>

          {/* マップに表示するアイコン選択 */}
          <div>
            <label className="block text-xs font-bold text-gray-500 mb-2">マップに表示するアイコン <span className="font-normal text-gray-400">（タップして選択）</span></label>
            <div className="flex gap-2 flex-wrap">
              {icons.map((icon, idx) => {
                const isSelected = selectedIcon?.emoji === icon.emoji;
                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setSelectedIcon(icon)}
                    className="w-11 h-11 rounded-full text-xl flex items-center justify-center border-2 transition-all hover:scale-105"
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
                  className="w-9 h-9 rounded-full flex items-center justify-center text-lg shadow-sm flex-shrink-0 text-white"
                  style={{ background: selectedIcon.color }}
                >
                  {selectedIcon.emoji}
                </div>
                <p className="text-xs text-gray-500">このアイコンがマップに表示されます</p>
              </div>
            )}
          </div>
          
          <button 
            type="button"
            onClick={handleConfirm} 
            disabled={
              savingPin ||
              !threadName.trim() ||
              (isEvent && (!selectedDate || !endDate))
            }
            className="w-full h-12 rounded-full text-white text-sm font-black bg-gradient-to-r from-brand to-brand-mid disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md active:scale-[0.98]"
          >
            {savingPin ? "ピンを立てています..." : "この内容でピンを立てる"}
          </button>
          <div className="h-2"></div>
        </div>
      </div>
    </div>
  );
};
