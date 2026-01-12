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
    undefined
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
    setter: (date: Date | null) => void
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
      style={{
        position: "fixed",
        inset: 0,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "rgba(0,0,0,0.4)",
        zIndex: 9999,
      }}
      onClick={() => !savingPin && handleCancel()}
    >
      <div
        role="dialog"
        aria-modal="true"
        onClick={(e) => e.stopPropagation()}
        style={{
          width: 400,
          maxHeight: "90vh",
          overflowY: "auto",
          background: "#fff",
          borderRadius: 8,
          padding: 16,
          boxShadow: "0 8px 32px rgba(0,0,0,0.2)",
          color: "#333",
        }}
      >
        <h3 style={{ margin: "0 0 16px 0" }}>新しいピン</h3>

        <label
          style={{
            fontSize: 12,
            color: "#555",
            display: "block",
            marginBottom: 4,
          }}
        >
          スレッド名 <span style={{ color: "red" }}>*</span>
        </label>
        <input
          value={threadName}
          onChange={(e) => onThreadNameChange(e.target.value)}
          placeholder="スレッド名を入力"
          style={{
            width: "100%",
            padding: "8px 10px",
            marginBottom: 12,
            borderRadius: 6,
            border: "1px solid #ddd",
            boxSizing: "border-box",
            color: "#333",
          }}
        />

        <label
          style={{
            fontSize: 12,
            color: "#555",
            display: "block",
            marginBottom: 4,
          }}
        >
          カテゴリ <span style={{ color: "red" }}>*</span>
        </label>
        <select
          value={category}
          onChange={(e) => onCategoryChange(e.target.value as Category)}
          style={{
            width: "100%",
            padding: "8px 10px",
            marginBottom: 12,
            borderRadius: 6,
            border: "1px solid #ddd",
            boxSizing: "border-box",
            color: "#333",
          }}
        >
          {CATEGORIES.map((cat) => (
            <option key={cat.value} value={cat.value}>
              {cat.label}
            </option>
          ))}
        </select>

        {/* Date Fields - Show for Event */}
        {isEvent && (
          <div style={{ display: "flex", gap: 10, marginBottom: 12 }}>
            <div style={{ flex: 1 }}>
              <label
                style={{
                  fontSize: 12,
                  color: "#555",
                  display: "block",
                  marginBottom: 4,
                }}
              >
                開始日時 <span style={{ color: "red" }}>*</span>
              </label>
              <div style={{ position: "relative" }}>
                <input
                  type="datetime-local"
                  value={formatDateTimeForInput(selectedDate)}
                  onChange={(e) => handleDateChange(e, setSelectedDate)}
                  style={{
                    width: "100%",
                    padding: "8px 10px",
                    paddingLeft: 30, // Icon space
                    borderRadius: 6,
                    border: "1px solid #ddd",
                    boxSizing: "border-box",
                    color: "#333",
                    fontSize: "13px",
                  }}
                />
                <FiCalendar
                  style={{
                    position: "absolute",
                    left: 8,
                    top: "50%",
                    transform: "translateY(-50%)",
                    color: "#666",
                    pointerEvents: "none",
                  }}
                  size={16}
                />
              </div>
            </div>
            <div style={{ flex: 1 }}>
              <label
                style={{
                  fontSize: 12,
                  color: "#555",
                  display: "block",
                  marginBottom: 4,
                }}
              >
                終了日時 <span style={{ color: "red" }}>*</span>
              </label>
              <div style={{ position: "relative" }}>
                <input
                  type="datetime-local"
                  value={formatDateTimeForInput(endDate)}
                  onChange={(e) => handleDateChange(e, setEndDate)}
                  style={{
                    width: "100%",
                    padding: "8px 10px",
                    paddingLeft: 30,
                    borderRadius: 6,
                    border: "1px solid #ddd",
                    boxSizing: "border-box",
                    color: "#333",
                    fontSize: "13px",
                  }}
                />
                <FiCalendar
                  style={{
                    position: "absolute",
                    left: 8,
                    top: "50%",
                    transform: "translateY(-50%)",
                    color: "#666",
                    pointerEvents: "none",
                  }}
                  size={16}
                />
              </div>
            </div>
          </div>
        )}

        {/* URL - Show for Event */}
        {isEvent && (
          <>
            <label
              style={{
                fontSize: 12,
                color: "#555",
                display: "block",
                marginBottom: 4,
              }}
            >
              URL
            </label>
            <input
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://example.com"
              style={{
                width: "100%",
                padding: "8px 10px",
                marginBottom: 12,
                borderRadius: 6,
                border: "1px solid #ddd",
                boxSizing: "border-box",
                color: "#333",
              }}
            />
          </>
        )}

        {/* Detail - Show for Event */}
        {isEvent && (
          <>
            <label
              style={{
                fontSize: 12,
                color: "#555",
                display: "block",
                marginBottom: 4,
              }}
            >
              詳細
            </label>
            <textarea
              value={detail}
              onChange={(e) => setDetail(e.target.value)}
              placeholder="イベントの詳細を入力"
              rows={3}
              style={{
                width: "100%",
                padding: "8px 10px",
                marginBottom: 12,
                borderRadius: 6,
                border: "1px solid #ddd",
                boxSizing: "border-box",
                color: "#333",
                resize: "vertical",
              }}
            />
          </>
        )}

        <label
          style={{
            fontSize: 12,
            color: "#555",
            display: "block",
            marginBottom: 4,
          }}
        >
          画像
        </label>
        <div style={{ marginBottom: 12 }}>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleImageSelect}
            style={{ display: "none" }}
            id="image-upload"
          />
          <label
            htmlFor="image-upload"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              padding: "8px 16px",
              borderRadius: 6,
              border: "1px solid #ddd",
              background: "#f9f9f9",
              cursor: "pointer",
              fontSize: 14,
            }}
          >
            <FiImage size={18} />
            画像を選択
          </label>
          {imagePreview && (
            <div
              style={{
                marginTop: 12,
                position: "relative",
                display: "inline-block",
              }}
            >
              <img
                src={imagePreview}
                alt="選択された画像"
                style={{
                  maxWidth: "100%",
                  maxHeight: 200,
                  borderRadius: 6,
                  border: "1px solid #ddd",
                }}
              />
              <button
                onClick={handleRemoveImage}
                style={{
                  position: "absolute",
                  top: 8,
                  right: 8,
                  width: 28,
                  height: 28,
                  borderRadius: "50%",
                  border: "none",
                  background: "rgba(0,0,0,0.6)",
                  color: "#fff",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <FiX size={16} />
              </button>
            </div>
          )}
        </div>
        <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
          <button
            onClick={handleCancel}
            style={{
              padding: "8px 12px",
              borderRadius: 6,
              border: "1px solid #ccc",
              background: "#746d7763",
              cursor: "pointer",
            }}
            disabled={savingPin}
          >
            キャンセル
          </button>
          <button
            onClick={handleConfirm}
            style={{
              padding: "8px 12px",
              borderRadius: 6,
              border: "none",
              background: "#1976d2",
              color: "#fff",
              cursor: "pointer",
            }}
            disabled={
              savingPin ||
              !threadName.trim() ||
              (isEvent && (!selectedDate || !endDate))
            }
          >
            {savingPin ? "登録中..." : "ピンを立てる"}
          </button>
        </div>
      </div>
    </div>
  );
};
