import { useRef } from "react";

interface ProfileImageUploadProps {
  imagePreview: string | null;
  onImageChange: (file: File) => Promise<void>;
  onImageRemove: () => void;
  disabled?: boolean;
  onError: (message: string) => void;
}

export const ProfileImageUpload = ({
  imagePreview,
  onImageChange,
  onImageRemove,
  disabled = false,
  onError,
}: ProfileImageUploadProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const validateAndProcessFile = async (file: File) => {
    // Remove size check - resizing will handle large files
    // if (file.size > 5 * 1024 * 1024) {
    //   onError("画像ファイルは5MB以下にしてください");
    //   return false;
    // }

    if (!file.type.startsWith("image/")) {
      onError("画像ファイルを選択してください");
      return false;
    }

    await onImageChange(file);
    return true;
  };

  const handleFileInputChange = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    if (file) {
      await validateAndProcessFile(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();

    const file = e.dataTransfer.files?.[0];
    if (file) {
      await validateAndProcessFile(file);
    }
  };

  const handleRemove = () => {
    onImageRemove();
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <div className="mb-0">
      <label className="block text-sm font-medium mb-3">プロフィール画像</label>
      <div className="flex flex-col items-center gap-4">
        <div className="relative">
          {imagePreview ? (
            <>
              <img
                src={imagePreview}
                alt="プレビュー"
                className="h-32 w-32 rounded-full object-cover border-4 border-white shadow-md"
              />
              {!disabled && (
                <button
                  type="button"
                  onClick={handleRemove}
                  className="absolute -top-2 -right-2 bg-red-500 rounded-full p-1.5 border-2 border-white shadow-md hover:bg-red-600 transition-colors"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 w-4 text-white"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                      clipRule="evenodd"
                    />
                  </svg>
                </button>
              )}
            </>
          ) : (
            <div className="h-32 w-32 rounded-full bg-gray-100 border-4 border-white shadow-md flex items-center justify-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-12 w-12 text-gray-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                />
              </svg>
            </div>
          )}
        </div>

        {!disabled && (
          <div
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            className="w-full border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-indigo-400 transition-colors cursor-pointer"
            onClick={() => fileInputRef.current?.click()}
          >
            <svg
              className="mx-auto h-8 w-8 text-gray-400"
              stroke="currentColor"
              fill="none"
              viewBox="0 0 48 48"
            >
              <path
                d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <p className="mt-2 text-sm text-gray-600">
              クリックまたはドラッグ&ドロップ
            </p>
            <p className="text-xs text-gray-500 mt-1">
              PNG, JPG, GIF (最大5MB)
            </p>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileInputChange}
              className="hidden"
            />
          </div>
        )}
      </div>
    </div>
  );
};
