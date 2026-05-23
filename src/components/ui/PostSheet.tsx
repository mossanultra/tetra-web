"use client";

import React, { useEffect, useRef, useState } from "react";
import { useS3Upload } from "@/src/features/upload/hooks/useS3Upload";
import { resizeImage } from "@/src/utils/imageResize";

export interface PostSheetSubmitData {
  genre: "event" | "shop" | "community";
  title: string;
  date: string;
  location: string;
  url: string;
  detail: string;
  imageUrl: string | null;
  icon: { emoji: string; color: string } | null;
}

interface PostSheetProps {
  isOpen: boolean;
  onClose: () => void;
  initialLocation?: string;
  onSubmit?: (data: PostSheetSubmitData) => Promise<void>;
}

const GENRES = [
  { label: "イベント・出店", value: "event" as const },
  { label: "お店", value: "shop" as const },
  { label: "コミュニティ", value: "community" as const },
];

const ICONS = [
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

interface ImageSlotProps {
  preview: string | null;
  inputRef: React.RefObject<HTMLInputElement | null>;
  gradient: string;
  onChange: (file: File) => void;
  onRemove: () => void;
}

const ImageSlot: React.FC<ImageSlotProps> = ({
  preview,
  inputRef,
  gradient,
  onChange,
  onRemove,
}) => (
  <div
    className={`aspect-video rounded-xl border-2 border-dashed border-gray-200 flex items-center justify-center cursor-pointer overflow-hidden relative ${!preview ? gradient : ""}`}
    onClick={() => !preview && inputRef.current?.click()}
  >
    {preview ? (
      <>
        <img src={preview} className="w-full h-full object-cover" alt="" />
        <button
          onClick={(e) => {
            e.stopPropagation();
            onRemove();
          }}
          className="absolute top-1.5 right-1.5 w-6 h-6 bg-black/60 rounded-full flex items-center justify-center"
        >
          <svg width="10" height="10" viewBox="0 0 12 12" fill="none">
            <path
              d="M1 1l10 10M11 1L1 11"
              stroke="white"
              strokeWidth="1.8"
              strokeLinecap="round"
            />
          </svg>
        </button>
      </>
    ) : (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
        <rect x="3" y="4" width="18" height="16" rx="3" stroke="#9CA3AF" strokeWidth="1.5" />
        <circle cx="9" cy="9" r="2" stroke="#9CA3AF" strokeWidth="1.3" />
        <path
          d="M3 16l5-4 4 4 3-2.5 6 4.5"
          stroke="#9CA3AF"
          strokeWidth="1.3"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    )}
    <input
      ref={inputRef}
      type="file"
      accept="image/*"
      className="hidden"
      onChange={(e) => {
        const f = e.target.files?.[0];
        if (f) onChange(f);
      }}
    />
  </div>
);

export const PostSheet: React.FC<PostSheetProps> = ({
  isOpen,
  onClose,
  initialLocation = "",
  onSubmit,
}) => {
  const [isClosing, setIsClosing] = useState(false);
  const [genre, setGenre] = useState<"event" | "shop" | "community">("event");
  const [title, setTitle] = useState("");
  const [date, setDate] = useState("");
  const [location, setLocation] = useState(initialLocation);
  const [url, setUrl] = useState("");
  const [detail, setDetail] = useState("");
  const [image1, setImage1] = useState<File | null>(null);
  const [preview1, setPreview1] = useState<string | null>(null);
  const [image2, setImage2] = useState<File | null>(null);
  const [preview2, setPreview2] = useState<string | null>(null);
  const [selectedIcon, setSelectedIcon] = useState<{ emoji: string; color: string } | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const file1Ref = useRef<HTMLInputElement>(null);
  const file2Ref = useRef<HTMLInputElement>(null);
  const { uploadToS3 } = useS3Upload();

  useEffect(() => {
    if (isOpen) {
      setLocation(initialLocation);
    }
  }, [isOpen, initialLocation]);

  if (!isOpen && !isClosing) return null;

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => {
      setIsClosing(false);
      onClose();
      resetForm();
    }, 240);
  };

  const resetForm = () => {
    setGenre("event");
    setTitle("");
    setDate("");
    setLocation("");
    setUrl("");
    setDetail("");
    setImage1(null);
    setPreview1(null);
    setImage2(null);
    setPreview2(null);
    setSelectedIcon(null);
  };

  const handleImageSelect = async (
    file: File,
    setImg: (f: File | null) => void,
    setPreview: (s: string | null) => void,
  ) => {
    try {
      const resized = await resizeImage(file, 1920, 1920, 0.9);
      setImg(resized);
      const reader = new FileReader();
      reader.onloadend = () => setPreview(reader.result as string);
      reader.readAsDataURL(resized);
    } catch {
      setImg(file);
      const reader = new FileReader();
      reader.onloadend = () => setPreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const removeImage = (
    setImg: (f: File | null) => void,
    setPreview: (s: string | null) => void,
    inputRef: React.RefObject<HTMLInputElement | null>,
  ) => {
    setImg(null);
    setPreview(null);
    if (inputRef.current) inputRef.current.value = "";
  };

  const handleSubmit = async () => {
    if (!title.trim() || submitting) return;
    setSubmitting(true);
    try {
      let imageUrl: string | null = null;
      const primaryImage = image1 ?? image2;
      if (primaryImage) {
        imageUrl = await uploadToS3(primaryImage);
      }
      await onSubmit?.({
        genre,
        title: title.trim(),
        date,
        location,
        url,
        detail,
        imageUrl,
        icon: selectedIcon,
      });
      resetForm();
    } catch (err) {
      console.error(err);
      alert(err instanceof Error ? err.message : "投稿に失敗しました");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[9999]">
      <div
        className={`absolute inset-0 bg-black/40 ${isClosing ? "opacity-0 transition-opacity duration-200" : "fade-in"}`}
        onClick={handleClose}
      />
      <div
        className={`absolute bottom-0 left-0 right-0 bg-white rounded-t-3xl max-h-[92vh] overflow-y-auto ${isClosing ? "sheet-out" : "sheet-in"}`}
      >
        <div className="w-10 h-1 bg-gray-200 rounded-full mx-auto mt-3" />

        <div className="flex items-center justify-between px-5 pt-4 pb-4 border-b border-gray-100">
          <h2 className="text-base font-black">掲示板を投稿する</h2>
          <button
            onClick={handleClose}
            className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center"
          >
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
              <path
                d="M1 1l10 10M11 1L1 11"
                stroke="#6B7280"
                strokeWidth="1.8"
                strokeLinecap="round"
              />
            </svg>
          </button>
        </div>

        <div className="px-5 py-4 space-y-4">
          <div>
            <label className="block text-xs font-bold text-gray-500 mb-2">投稿ジャンル</label>
            <div className="flex gap-2 flex-wrap">
              {GENRES.map((g) => (
                <button
                  key={g.value}
                  onClick={() => setGenre(g.value)}
                  className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-colors ${
                    genre === g.value
                      ? "text-white bg-brand"
                      : "bg-gray-100 text-gray-600"
                  }`}
                >
                  {g.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-500 mb-1.5">タイトル</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="タイトルを入力"
              className="w-full h-11 border border-gray-200 rounded-xl px-4 text-sm text-gray-700 outline-none bg-white"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-gray-500 mb-1.5">日付を選択</label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full h-11 border border-gray-200 rounded-xl px-3 text-sm text-gray-700 outline-none bg-white"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 mb-1.5">場所</label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="地名を入力"
                className="w-full h-11 border border-gray-200 rounded-xl px-3 text-sm text-gray-700 outline-none bg-white"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-500 mb-1.5">
              関連リンク（任意）
            </label>
            <input
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://..."
              className="w-full h-11 border border-gray-200 rounded-xl px-4 text-sm text-gray-700 outline-none bg-white"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-500 mb-1.5">
              詳細文を入力（500字まで）
            </label>
            <textarea
              rows={3}
              value={detail}
              onChange={(e) => setDetail(e.target.value.slice(0, 500))}
              placeholder="詳細を入力してください…"
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-700 outline-none resize-none leading-relaxed bg-white"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-500 mb-2">
              画像を選択（2枚まで）
            </label>
            <div className="grid grid-cols-2 gap-3">
              <ImageSlot
                preview={preview1}
                inputRef={file1Ref}
                gradient="bg-gradient-to-br from-brand-pale to-emerald-100"
                onChange={(f) => handleImageSelect(f, setImage1, setPreview1)}
                onRemove={() => removeImage(setImage1, setPreview1, file1Ref)}
              />
              <ImageSlot
                preview={preview2}
                inputRef={file2Ref}
                gradient="bg-gradient-to-br from-blue-50 to-blue-100"
                onChange={(f) => handleImageSelect(f, setImage2, setPreview2)}
                onRemove={() => removeImage(setImage2, setPreview2, file2Ref)}
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-500 mb-2">
              マップに表示するアイコン{" "}
              <span className="font-normal text-gray-400">（タップして選択）</span>
            </label>
            <div className="flex gap-2 flex-wrap">
              {ICONS.map((icon, idx) => {
                const isSelected = selectedIcon?.emoji === icon.emoji;
                return (
                  <button
                    key={idx}
                    onClick={() => setSelectedIcon(isSelected ? null : icon)}
                    className="w-11 h-11 rounded-full text-xl flex items-center justify-center border-2 transition-colors"
                    style={{
                      borderColor: isSelected ? icon.color : "transparent",
                      background: isSelected ? `${icon.color}22` : "#F9FAFB",
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
            onClick={handleSubmit}
            disabled={!title.trim() || submitting}
            className="w-full h-12 rounded-full text-white text-sm font-black bg-gradient-to-r from-brand to-brand-mid disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {submitting ? "投稿中..." : "この内容で投稿する"}
          </button>
          <div className="h-2" />
        </div>
      </div>
    </div>
  );
};
