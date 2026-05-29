"use client";

import React, { useState, useRef } from "react";
import { useS3Upload } from "@/src/features/upload/hooks/useS3Upload";
import { createThread } from "@/src/features/thread/api/createThread";
import { useRouter } from "next/navigation";
import { FaTimes } from "react-icons/fa";

interface PostSheetProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PostSheet: React.FC<PostSheetProps> = ({ isOpen, onClose }) => {
  const [isClosing, setIsClosing] = useState(false);
  const [selectedGenre, setSelectedGenre] = useState<string>("イベント・出店");
  
  const [title, setTitle] = useState("");
  const [url, setUrl] = useState("");
  const [detail, setDetail] = useState("");
  const [images, setImages] = useState<(File | null)[]>([null, null]);
  const [imagePreviews, setImagePreviews] = useState<(string | null)[]>([null, null]);
  const [submitting, setSubmitting] = useState(false);

  const fileInputRef1 = useRef<HTMLInputElement>(null);
  const fileInputRef2 = useRef<HTMLInputElement>(null);

  const router = useRouter();
  const { uploadToS3 } = useS3Upload();

  if (!isOpen && !isClosing) return null;

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => {
      setIsClosing(false);
      onClose();
    }, 240); // Matches animation duration
  };

  const handleImageSelect = (idx: number) => (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setImages(prev => {
        const next = [...prev];
        next[idx] = file;
        return next;
      });
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreviews(prev => {
          const next = [...prev];
          next[idx] = reader.result as string;
          return next;
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = (idx: number) => () => {
    setImages(prev => {
      const next = [...prev];
      next[idx] = null;
      return next;
    });
    setImagePreviews(prev => {
      const next = [...prev];
      next[idx] = null;
      return next;
    });
    if (idx === 0 && fileInputRef1.current) fileInputRef1.current.value = "";
    if (idx === 1 && fileInputRef2.current) fileInputRef2.current.value = "";
  };

  const handleSubmit = async () => {
    if (!title.trim()) {
      alert("タイトルを入力してください");
      return;
    }

    setSubmitting(true);
    try {
      let imageUrl: string | null = null;
      // とりあえず1枚目の画像があればアップロード、なければ2枚目
      if (images[0]) {
        imageUrl = await uploadToS3(images[0]);
      } else if (images[1]) {
        imageUrl = await uploadToS3(images[1]);
      }

      await createThread({
        threadName: title,
        imageUrl,
        category: selectedGenre,
        url,
        detail,
      });

      // リセット
      setTitle("");
      setUrl("");
      setDetail("");
      setImages([null, null]);
      setImagePreviews([null, null]);

      handleClose();
      router.refresh();
    } catch (err) {
      console.error(err);
      alert("投稿に失敗しました");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50">
      <div 
        className={`absolute inset-0 bg-black/40 ${isClosing ? 'opacity-0 transition-opacity duration-200' : 'fade-in'}`}
        onClick={() => !submitting && handleClose()}
      />
      <div 
        role="dialog"
        aria-modal="true"
        className={`absolute bottom-0 left-0 right-0 bg-white rounded-t-3xl max-h-[92vh] overflow-y-auto ${isClosing ? 'sheet-out' : 'sheet-in'}`}
      >
        <div className="w-10 h-1 bg-gray-200 rounded-full mx-auto mt-3"></div>
        <div className="flex items-center justify-between px-5 pt-4 pb-4 border-b border-gray-100">
          <h2 className="text-base font-black">掲示板を投稿する</h2>
          <button 
            onClick={handleClose} 
            disabled={submitting}
            className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center disabled:opacity-50"
          >
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
              <path d="M1 1l10 10M11 1L1 11" stroke="#6B7280" strokeWidth="1.8" strokeLinecap="round" />
            </svg>
          </button>
        </div>
        <div className="px-5 py-4 space-y-4">
          <div>
            <label className="block text-xs font-bold text-gray-500 mb-2">投稿ジャンル</label>
            <div className="flex gap-2 flex-wrap">
              {["イベント・出店", "お店", "コミュニティ"].map((genre) => {
                const isSelected = selectedGenre === genre;
                return (
                  <button
                    key={genre}
                    type="button"
                    onClick={() => setSelectedGenre(genre)}
                    className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-colors ${
                      isSelected
                        ? "text-white bg-brand"
                        : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                    }`}
                  >
                    {genre}
                  </button>
                );
              })}
            </div>
          </div>
          
          <div>
            <label className="block text-xs font-bold text-gray-500 mb-1.5">タイトル</label>
            <input 
              type="text" 
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="タイトルを入力" 
              className="w-full h-11 border border-gray-200 rounded-xl px-4 text-sm text-gray-700 outline-none bg-white focus:border-brand transition-colors" 
            />
          </div>
          
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
          
          <div>
            <label className="block text-xs font-bold text-gray-500 mb-1.5">詳細文を入力（500字まで）</label>
            <textarea 
              rows={3} 
              value={detail}
              onChange={(e) => setDetail(e.target.value)}
              placeholder="詳細を入力してください…" 
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-700 outline-none resize-none leading-relaxed bg-white focus:border-brand transition-colors"
            />
          </div>
          
          <div>
            <label className="block text-xs font-bold text-gray-500 mb-2">画像を選択（2枚まで）</label>
            <div className="grid grid-cols-2 gap-3">
              {/* 画像スロット1 */}
              <div>
                <input 
                  ref={fileInputRef1}
                  type="file"
                  accept="image/*"
                  onChange={handleImageSelect(0)}
                  className="hidden"
                />
                <div 
                  onClick={() => fileInputRef1.current?.click()}
                  className="aspect-video rounded-xl border-2 border-dashed border-gray-200 flex items-center justify-center cursor-pointer bg-gradient-to-br from-brand-pale to-emerald-100 transition-opacity hover:opacity-90"
                >
                  {imagePreviews[0] ? (
                    <div className="relative w-full h-full">
                      <img 
                        src={imagePreviews[0]} 
                        alt="プレビュー1" 
                        className="w-full h-full object-cover rounded-xl"
                      />
                      <button 
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRemoveImage(0)();
                        }}
                        className="absolute top-2 right-2 p-1.5 bg-gray-900/70 hover:bg-gray-900 rounded-full transition"
                      >
                        <FaTimes className="w-4 h-4 text-white" />
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

              {/* 画像スロット2 */}
              <div>
                <input 
                  ref={fileInputRef2}
                  type="file"
                  accept="image/*"
                  onChange={handleImageSelect(1)}
                  className="hidden"
                />
                <div 
                  onClick={() => fileInputRef2.current?.click()}
                  className="aspect-video rounded-xl border-2 border-dashed border-gray-200 flex items-center justify-center cursor-pointer bg-gradient-to-br from-blue-50 to-blue-100 transition-opacity hover:opacity-90"
                >
                  {imagePreviews[1] ? (
                    <div className="relative w-full h-full">
                      <img 
                        src={imagePreviews[1]} 
                        alt="プレビュー2" 
                        className="w-full h-full object-cover rounded-xl"
                      />
                      <button 
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRemoveImage(1)();
                        }}
                        className="absolute top-2 right-2 p-1.5 bg-gray-900/70 hover:bg-gray-900 rounded-full transition"
                      >
                        <FaTimes className="w-4 h-4 text-white" />
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
          </div>
          
          <button 
            onClick={handleSubmit} 
            disabled={submitting || !title.trim()}
            className="w-full h-12 rounded-full text-white text-sm font-black bg-gradient-to-r from-brand to-brand-mid disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md active:scale-[0.98]"
          >
            {submitting ? "投稿中..." : "この内容で投稿する"}
          </button>
          <div className="h-2"></div>
        </div>
      </div>
    </div>
  );
};
