export const uploadFileToS3 = async (
  uploadUrl: string,
  file: File,
): Promise<void> => {
  const res = await fetch(uploadUrl, {
    method: "PUT",
    headers: {
      "Content-Type": file.type,
    },
    mode: "cors",
    body: file,
  });

  if (!res.ok) {
    const errorText = await res.text();
    console.error("S3 upload error:", errorText);
    throw new Error("Failed to upload file to S3");
  }
};
