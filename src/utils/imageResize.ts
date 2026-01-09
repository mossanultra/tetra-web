/**
 * Resize an image file to fit within max dimensions while maintaining aspect ratio
 * @param file - The image file to resize
 * @param maxWidth - Maximum width (default: 1920px)
 * @param maxHeight - Maximum height (default: 1920px)
 * @param quality - JPEG quality 0-1 (default: 0.9)
 * @returns Resized image file
 */
export async function resizeImage(
  file: File,
  maxWidth: number = 1920,
  maxHeight: number = 1920,
  quality: number = 0.9
): Promise<File> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onerror = () => reject(new Error("Failed to read file"));

    reader.onload = (e) => {
      const img = new Image();

      img.onerror = () => reject(new Error("Failed to load image"));

      img.onload = () => {
        const canvas = document.createElement("canvas");
        let width = img.width;
        let height = img.height;

        // Calculate new dimensions while maintaining aspect ratio
        if (width > maxWidth || height > maxHeight) {
          if (width > height) {
            height = (height / width) * maxWidth;
            width = maxWidth;
          } else {
            width = (width / height) * maxHeight;
            height = maxHeight;
          }
        }

        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext("2d");
        if (!ctx) {
          reject(new Error("Failed to get canvas context"));
          return;
        }

        // Draw resized image
        ctx.drawImage(img, 0, 0, width, height);

        // Convert to blob
        canvas.toBlob(
          (blob) => {
            if (!blob) {
              reject(new Error("Failed to create blob"));
              return;
            }

            // Create new file with original name
            const resizedFile = new File([blob], file.name, {
              type: "image/jpeg",
              lastModified: Date.now(),
            });

            resolve(resizedFile);
          },
          "image/jpeg",
          quality
        );
      };

      img.src = e.target!.result as string;
    };

    reader.readAsDataURL(file);
  });
}

/**
 * Check if file size exceeds maximum
 * @param file - File to check
 * @param maxSizeMB - Maximum size in MB (default: 10MB)
 * @returns true if file is too large
 */
export function isFileTooLarge(file: File, maxSizeMB: number = 10): boolean {
  const maxBytes = maxSizeMB * 1024 * 1024;
  return file.size > maxBytes;
}

/**
 * Format file size for display
 * @param bytes - File size in bytes
 * @returns Formatted string (e.g., "2.5 MB")
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 Bytes";

  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i];
}
