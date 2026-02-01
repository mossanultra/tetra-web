interface PresignedURLResponse {
  uploadUrl: string;
  fileUrl: string;
  key: string;
}

export const getPresignedUrl = async (
  fileName: string,
  fileType: string,
): Promise<PresignedURLResponse> => {
  const res = await fetch("/api/upload/presigned-url", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      fileName,
      fileType,
    }),
  });

  if (!res.ok) {
    throw new Error("Failed to get upload URL");
  }

  return res.json();
};
