"use client";

import { useState } from "react";

import { getPresignedUrl } from "../api/getPresignedUrl";
import { uploadFileToS3 as apiUploadFileToS3 } from "../api/uploadFileToS3";

export const useS3Upload = () => {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const uploadToS3 = async (file: File): Promise<string | null> => {
    setUploading(true);
    setProgress(0);
    setError(null);

    // Track execution stage for better error reporting
    let stage = "INIT";

    try {
      console.log("=== S3 Upload Start ===");
      console.log("File:", file.name, file.type, file.size, "bytes");

      stage = "FETCH_PRESIGNED_URL";
      // 1. Get Presigned URL
      const { uploadUrl, fileUrl } = await getPresignedUrl(
        file.name,
        file.type,
      );

      console.log("Presigned URL obtained, uploading to S3...");

      stage = "UPLOAD_TO_S3";
      // 2. Upload to S3
      await apiUploadFileToS3(uploadUrl, file);

      setProgress(100);
      console.log("Upload successful, fileUrl:", fileUrl);
      return fileUrl;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Upload failed";

      // Determine which step failed based on stage
      let failedStepDescription = "";
      switch (stage) {
        case "INIT":
          failedStepDescription = "Initialization";
          break;
        case "FETCH_PRESIGNED_URL":
          failedStepDescription = "1. Fetching Presigned URL";
          break;
        case "UPLOAD_TO_S3":
          failedStepDescription = "2. S3 Upload Request";
          break;
        default:
          failedStepDescription = "Unknown";
      }

      // Debug alert for mobile
      const errorDetails = `
S3 Upload Error:
Step: ${failedStepDescription}
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
