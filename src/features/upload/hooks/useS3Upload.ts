"use client";

import { useState } from "react";

interface PresignedURLResponse {
  uploadUrl: string;
  fileUrl: string;
  key: string;
}

export const useS3Upload = () => {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const uploadToS3 = async (file: File): Promise<string | null> => {
    setUploading(true);
    setProgress(0);
    setError(null);

    try {
      console.log("=== S3 Upload Start ===");
      console.log("File:", file.name, file.type, file.size, "bytes");

      // 1. Get Presigned URL
      const presignedResponse = await fetch("/api/upload/presigned-url", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          fileName: file.name,
          fileType: file.type,
        }),
      });

      if (!presignedResponse.ok) {
        throw new Error("Failed to get upload URL");
      }

      const { uploadUrl, fileUrl }: PresignedURLResponse =
        await presignedResponse.json();

      console.log("Presigned URL obtained, uploading to S3...");

      // 2. Upload to S3
      const uploadResponse = await fetch(uploadUrl, {
        method: "PUT",
        headers: {
          "Content-Type": file.type,
        },
        body: file,
      });

      console.log("S3 upload response status:", uploadResponse.status);

      if (!uploadResponse.ok) {
        const errorText = await uploadResponse.text();
        console.error("S3 upload error:", errorText);
        throw new Error("Failed to upload file to S3");
      }

      setProgress(100);
      console.log("Upload successful, fileUrl:", fileUrl);
      return fileUrl;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Upload failed";

      // Debug alert for mobile
      const errorDetails = `
S3 Upload Error:
Message: ${errorMessage}
File: ${file.name}
Type: ${file.type}
Size: ${file.size}
      `.trim();
      alert(errorDetails);

      setError(errorMessage);
      console.error("S3 upload error:", err);
      return null;
    } finally {
      setUploading(false);
    }
  };

  return {
    uploadToS3,
    uploading,
    progress,
    error,
  };
};
