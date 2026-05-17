import React, { useRef, useState } from "react";
import { FiCalendar, FiImage, FiX } from "react-icons/fi";

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
};

type PinCreationDialogProps = {
  isOpen: boolean;
  pendingPin: PendingPin | null;
  threadName: string;
  category: Category;
  savingPin: boolean;
  onThreadNameChange: (name: string) => void;
  onCategoryChange: (category: Category) => void;
  onConfirm: (data: ConfirmData) => void;
  onCancel: () => void;
};

const CATEGORIES: { label: string; value: Category }[] = [
  { label: "イベント", value: "event" },
  { label: "雑談", value: "chat" },
];

export const PinCreationDialog: React.FC<PinCreationDialogProps> = ({
  isOpen,
  pendingPin,
  threadName,
  category,
  savingPin,
  onThreadNameChange,
  onCategoryChange,
  onConfirm,
  onCancel,
}) => {
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [url, setUrl] = useState("");
  const [detail, setDetail] = useState("");

  const [imagePreview, setImagePreview] = useState<string | undefined>(
    undefined,
  );
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen || !pendingPin) return null;

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
    setImagePreview(undefined);
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

  // datetime-local 用のフォーマット: YYYY-MM-DDTHH:mm
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
    });
    // リセット
    resetForm();
  };

  const handleCancel = () => {
    onCancel();
    // リセット
    resetForm();
  };

  const resetForm = () => {
    setSelectedDate(null);
    setEndDate(null);
    setSelectedImage(null);
    setUrl("");
    setDetail("");
    setImagePreview(undefined);
  };

  const isEvent = category === "event";

  return (
    <div
      className="fixed inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm z-[9999]"
      onClick={() => !savingPin && handleCancel()}
    >
      <div
        role="dialog"
        aria-modal="true"
        onClick={(e) => e.stopPropagation()}
        className="w-[400px] max-w-[90vw] max-h-[90vh] overflow-y-auto bg-white rounded-2xl p-6 shadow-2xl text-gray-800"
      >
        <h3 className="text-lg font-bold mb-6 text-gray-900">新しいピン</h3>

        <label className="block text-xs font-medium text-gray-500 mb-1">
          スレッド名 <span className="text-red-500">*</span>
        </label>
        <input
          value={threadName}
          onChange={(e) => onThreadNameChange(e.target.value)}
          placeholder="スレッド名を入力"
          className="w-full px-3 py-2 mb-4 rounded-lg border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all outline-none text-sm text-gray-800 placeholder-gray-400"
        />

        <label className="block text-xs font-medium text-gray-500 mb-1">
          カテゴリ <span className="text-red-500">*</span>
        </label>
        <div className="relative mb-4">
          <select
            value={category}
            onChange={(e) => onCategoryChange(e.target.value as Category)}
            className="w-full px-3 py-2 rounded-lg border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all outline-none text-sm text-gray-800 appearance-none bg-white"
          >
            {CATEGORIES.map((cat) => (
              <option key={cat.value} value={cat.value}>
                {cat.label}
              </option>
            ))}
          </select>
          <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-500">
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </div>
        </div>

        {/* Date Fields - Show for Event */}
        {isEvent && (
          <div className="flex flex-col gap-4 mb-4">
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">
                開始日時 <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="datetime-local"
                  value={formatDateTimeForInput(selectedDate)}
                  onChange={(e) => handleDateChange(e, setSelectedDate)}
                  className="w-full pl-9 pr-3 py-2 rounded-lg border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all outline-none text-sm text-gray-800"
                />
                <FiCalendar
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
                  size={16}
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">
                終了日時 <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="datetime-local"
                  value={formatDateTimeForInput(endDate)}
                  onChange={(e) => handleDateChange(e, setEndDate)}
                  className="w-full pl-9 pr-3 py-2 rounded-lg border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all outline-none text-sm text-gray-800"
                />
                <FiCalendar
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
                  size={16}
                />
              </div>
            </div>
          </div>
        )}

        {/* URL - Show for Event */}
        {isEvent && (
          <>
            <label className="block text-xs font-medium text-gray-500 mb-1">
              URL
            </label>
            <input
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://example.com"
              className="w-full px-3 py-2 mb-4 rounded-lg border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all outline-none text-sm text-gray-800 placeholder-gray-400"
            />
          </>
        )}

        {/* Detail - Show for Event */}
        {isEvent && (
          <>
            <label className="block text-xs font-medium text-gray-500 mb-1">
              詳細
            </label>
            <textarea
              value={detail}
              onChange={(e) => setDetail(e.target.value)}
              placeholder="イベントの詳細を入力"
              rows={3}
              className="w-full px-3 py-2 mb-4 rounded-lg border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all outline-none text-sm text-gray-800 placeholder-gray-400 resize-y min-h-[80px]"
            />
          </>
        )}

        <label className="block text-xs font-medium text-gray-500 mb-1">
          画像
        </label>
        <div className="mb-6">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleImageSelect}
            className="hidden"
            id="image-upload"
          />
          <label
            htmlFor="image-upload"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg border border-dashed border-gray-300 bg-gray-50 hover:bg-gray-100 hover:border-gray-400 cursor-pointer transition-all text-sm text-gray-600 w-full justify-center"
          >
            <FiImage size={18} />
            {imagePreview ? "画像を変更" : "画像を選択"}
          </label>
          {imagePreview && (
            <div className="mt-3 relative inline-block group">
              <img
                src={imagePreview}
                alt="選択された画像"
                className="max-w-full max-h-[200px] rounded-lg border border-gray-200 object-cover"
              />
              <button
                onClick={handleRemoveImage}
                className="absolute top-2 right-2 w-7 h-7 rounded-full bg-black/60 text-white flex items-center justify-center hover:bg-black/80 transition-colors"
              >
                <FiX size={14} />
              </button>
            </div>
          )}
        </div>

        <div className="flex gap-3 justify-end pt-2 border-t border-gray-100">
          <button
            onClick={handleCancel}
            disabled={savingPin}
            className="px-4 py-2 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-100 hover:text-gray-900 transition-colors disabled:opacity-50"
          >
            キャンセル
          </button>
          <button
            onClick={handleConfirm}
            disabled={
              savingPin ||
              !threadName.trim() ||
              (isEvent && (!selectedDate || !endDate))
            }
            className="px-5 py-2 rounded-lg text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm shadow-blue-200"
          >
            {savingPin ? "登録中..." : "ピンを立てる"}
          </button>
        </div>
      </div>
    </div>
  );
};
