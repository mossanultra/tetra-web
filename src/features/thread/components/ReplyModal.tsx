// components/thread/ReplyModal.tsx
"use client";
import { useRef, useState } from "react";
import { FaTimes, FaImage } from "react-icons/fa";
import { formatDate, ThreadDTO } from "./ThreadCard";

interface ReplyModalProps {
  isOpen: boolean;
  replyTarget: ThreadDTO | null;
  onClose: () => void;
  onSubmit: (text: string, image: string | null) => Promise<void>;
}

export const ReplyModal: React.FC<ReplyModalProps> = ({
  isOpen,
  replyTarget,
  onClose,
  onSubmit,
}) => {
  const [replyText, setReplyText] = useState("");
  const [replyImage, setReplyImage] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen || !replyTarget) return null;

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setReplyImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setReplyImage(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleSubmit = async () => {
    if (!replyText.trim()) return;

    setSubmitting(true);
    try {
      await onSubmit(replyText, replyImage);
      setReplyText("");
      setReplyImage(null);
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleClose = () => {
    setReplyText("");
    setReplyImage(null);
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
          <h3 className="text-lg font-bold text-gray-900">返信</h3>
          <div className="w-9"></div>
        </div>

        {/* 元の投稿 */}
        <div className="p-4 border-b border-gray-200">
          <div className="flex gap-3">
            <img
              src={replyTarget.ownerUserProfile.imageUrl ?? "/default-user.png"}
              alt={replyTarget.ownerUserProfile.userName}
              className="w-10 h-10 rounded-full object-cover flex-shrink-0"
            />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span className="font-bold text-gray-900">
                  {replyTarget.ownerUserProfile.userName}
                </span>
                <span className="text-gray-500 text-sm">
                  · {formatDate(replyTarget.createdAt)}
                </span>
              </div>
              <div className="text-gray-900 text-sm">
                {replyTarget.threadName}
              </div>
              {replyTarget.imageUrl && (
                <img
                  src={replyTarget.imageUrl}
                  alt="元の投稿画像"
                  className="mt-2 rounded-xl max-h-40 object-cover"
                />
              )}
            </div>
          </div>
          <div className="ml-[52px] mt-2 text-sm text-gray-500">
            返信先: <span className="text-blue-500">@{replyTarget.ownerUserProfile.userName}</span>
          </div>
        </div>

        {/* 返信入力エリア */}
        <div className="p-4">
          <textarea
            value={replyText}
            onChange={(e) => setReplyText(e.target.value)}
            placeholder="返信を入力"
            className="w-full min-h-[120px] text-gray-900 text-lg resize-none outline-none placeholder-gray-400"
            autoFocus
          />

          {/* プレビュー画像 */}
          {replyImage && (
            <div className="relative mt-3 inline-block">
              <img
                src={replyImage}
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
            disabled={!replyText.trim() || submitting}
            className={`px-6 py-2 text-sm font-semibold text-white rounded-full transition ${
              !replyText.trim() || submitting
                ? "bg-blue-300 cursor-not-allowed"
                : "bg-blue-500 hover:bg-blue-600"
            }`}
          >
            {submitting ? "投稿中..." : "返信"}
          </button>
        </div>
      </div>
    </div>
  );
};