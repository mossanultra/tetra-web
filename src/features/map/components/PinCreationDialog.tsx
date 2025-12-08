import React, { useRef, useState } from "react";
import { FiCalendar, FiImage, FiX } from "react-icons/fi";

type Category = "イベント" | "雑談" | "告知";

type PendingPin = {
  lat: number;
  lng: number;
};

type PinCreationDialogProps = {
  isOpen: boolean;
  pendingPin: PendingPin | null;
  threadName: string;
  category: Category;
  savingPin: boolean;
  onThreadNameChange: (name: string) => void;
  onCategoryChange: (category: Category) => void;
  onConfirm: (selectedDate?: Date, selectedImage?: File) => void;
  onCancel: () => void;
};

const CATEGORIES: Category[] = ["イベント", "雑談", "告知"];

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
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [selectedImage, setSelectedImage] = useState<File | undefined>(undefined);
  const [imagePreview, setImagePreview] = useState<string | undefined>(undefined);
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
    setSelectedImage(undefined);
    setImagePreview(undefined);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleDateChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const date = event.target.value ? new Date(event.target.value) : undefined;
    setSelectedDate(date);
  };

  const formatDateForInput = (date?: Date) => {
    if (!date) return "";
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  const handleConfirm = () => {
    onConfirm(selectedDate, selectedImage);
    // リセット
    setSelectedDate(undefined);
    setSelectedImage(undefined);
    setImagePreview(undefined);
  };

  const handleCancel = () => {
    onCancel();
    // リセット
    setSelectedDate(undefined);
    setSelectedImage(undefined);
    setImagePreview(undefined);
  };

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
        
        <label style={{ fontSize: 12, color: "#555", display: "block", marginBottom: 4 }}>
          スレッド名
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
        
        <label style={{ fontSize: 12, color: "#555", display: "block", marginBottom: 4 }}>
          カテゴリ
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
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </select>

        <label style={{ fontSize: 12, color: "#555", display: "block", marginBottom: 4 }}>
          日付
        </label>
        <div style={{ position: "relative", marginBottom: 12 }}>
          <input
            type="date"
            value={formatDateForInput(selectedDate)}
            onChange={handleDateChange}
            style={{
              width: "100%",
              padding: "8px 10px",
              paddingLeft: 36,
              borderRadius: 6,
              border: "1px solid #ddd",
              boxSizing: "border-box",
              color: "#333",
            }}
          />
          <FiCalendar
            style={{
              position: "absolute",
              left: 10,
              top: "50%",
              transform: "translateY(-50%)",
              color: "#666",
              pointerEvents: "none",
            }}
            size={18}
          />
        </div>

        <label style={{ fontSize: 12, color: "#555", display: "block", marginBottom: 4 }}>
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
            disabled={savingPin || !threadName.trim()}
          >
            {savingPin ? "登録中..." : "ピンを立てる"}
          </button>
        </div>
      </div>
    </div>
  );
};