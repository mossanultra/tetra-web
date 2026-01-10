import { useState } from "react";
import { resizeImage } from "@/src/utils/imageResize";

export const useImageUpload = () => {
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [profileImage, setProfileImage] = useState<File | null>(null);
  const [isResizing, setIsResizing] = useState(false);

  const handleImageChange = async (file: File) => {
    try {
      setIsResizing(true);

      console.log("=== Image Resize Start ===");
      console.log("File name:", file.name);
      console.log("File type:", file.type);
      console.log("File size:", file.size, "bytes");

      // Automatically resize image if it's too large
      // Max dimensions: 1920x1920, quality: 0.9
      const resizedFile = await resizeImage(file, 1920, 1920, 0.9);

      console.log("Original size:", file.size, "bytes");
      console.log("Resized size:", resizedFile.size, "bytes");
      console.log(
        "Compression ratio:",
        ((1 - resizedFile.size / file.size) * 100).toFixed(1) + "%"
      );

      setProfileImage(resizedFile);

      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(resizedFile);
    } catch (error) {
      console.error("Image resize error:", error);

      // Display detailed error for mobile debugging
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      const errorStack = error instanceof Error ? error.stack : "";
      const detailedError = `
エラー発生:
メッセージ: ${errorMessage}
ファイル名: ${file.name}
ファイルタイプ: ${file.type}
ファイルサイズ: ${file.size} bytes
スタック: ${errorStack}
      `.trim();

      alert(detailedError);
      console.error("Detailed error:", detailedError);

      // Fallback to original file if resize fails
      setProfileImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    } finally {
      setIsResizing(false);
    }
  };

  const handleImageRemove = () => {
    setProfileImage(null);
    setImagePreview(null);
  };

  const setInitialPreview = (url: string | null) => {
    setImagePreview(url);
  };

  const getImageFile = (): File | null => {
    return profileImage;
  };

  return {
    imagePreview,
    handleImageChange,
    handleImageRemove,
    setInitialPreview,
    getImageFile,
    isResizing,
  };
};
