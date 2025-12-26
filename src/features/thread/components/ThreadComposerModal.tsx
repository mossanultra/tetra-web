"use client";
import { useRef, useState } from "react";
import { FaTimes, FaImage } from "react-icons/fa";

interface ThreadComposerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (text: string, image: string | null) => Promise<void>;
  title: string;
  submitLabel: string;
  placeholder?: string;
  headerContent?: React.ReactNode;
}

export const ThreadComposerModal: React.FC<ThreadComposerModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  title,
  submitLabel,
  placeholder = "",
  headerContent,
}) => {
  const [text, setText] = useState("");
  const [image, setImage] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setImage(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleSubmit = async () => {
    if (!text.trim()) return;

    setSubmitting(true);
    try {
      await onSubmit(text, image);
      setText("");
      setImage(null);
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleClose = () => {
    setText("");
    setImage(null);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-start justify-center z-50 p-4 pt-12 overflow-y-auto"
      onClick={handleClose}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* モーダルヘッダー */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <button
            onClick={handleClose}
            className="p-2 hover:bg-gray-100 rounded-full transition"
          >
            <FaTimes className="w-5 h-5 text-gray-700" />
          </button>
          <h3 className="text-lg font-bold text-gray-900">{title}</h3>
          <div className="w-9"></div>
        </div>

        {/* 追加のヘッダーコンテンツ (返信先情報など) */}
        {headerContent}

        {/* 入力エリア */}
        <div className="p-4">
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder={placeholder}
            className="w-full min-h-[120px] text-gray-900 text-lg resize-none outline-none placeholder-gray-400"
            autoFocus
          />

          {/* プレビュー画像 */}
          {image && (
            <div className="relative mt-3 inline-block">
              <img
                src={image}
                alt="プレビュー"
                className="rounded-xl max-h-60 object-cover"
              />
              <button
                onClick={removeImage}
                className="absolute top-2 right-2 p-1.5 bg-gray-900/70 hover:bg-gray-900 rounded-full transition"
              >
                <FaTimes className="w-4 h-4 text-white" />
              </button>
            </div>
          )}
        </div>

        {/* モーダルフッター */}
        <div className="flex items-center justify-between p-4 border-t border-gray-200">
          <div className="flex items-center gap-2">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageSelect}
              className="hidden"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              className="p-2 hover:bg-blue-50 rounded-full transition text-blue-500"
            >
              <FaImage className="w-5 h-5" />
            </button>
          </div>

          <button
            onClick={handleSubmit}
            disabled={!text.trim() || submitting}
            className={`px-6 py-2 text-sm font-semibold text-white rounded-full transition ${
              !text.trim() || submitting
                ? "bg-blue-300 cursor-not-allowed"
                : "bg-blue-500 hover:bg-blue-600"
            }`}
          >
            {submitting ? "投稿中..." : submitLabel}
          </button>
        </div>
      </div>
    </div>
  );
};
