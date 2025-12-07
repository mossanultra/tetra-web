import { useState } from "react";

export const useImageUpload = () => {
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [profileImage, setProfileImage] = useState<File | null>(null);

  const handleImageChange = (file: File) => {
    setProfileImage(file);
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleImageRemove = () => {
    setProfileImage(null);
    setImagePreview(null);
  };

  const setInitialPreview = (url: string | null) => {
    setImagePreview(url);
  };

  const convertToBase64 = async (file: File): Promise<string> => {
    return new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        const base64String = result.split(",")[1];
        resolve(base64String);
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const getImageBase64 = async (): Promise<string> => {
    if (!profileImage) return "";
    return await convertToBase64(profileImage);
  };

  return {
    imagePreview,
    profileImage,
    handleImageChange,
    handleImageRemove,
    setInitialPreview,
    getImageBase64,
  };
};