interface SuccessToastProps {
  title: string;
  message: string;
  position?: "top-right" | "center";
  showProgress?: boolean;
}

export const SuccessToast = ({
  title,
  message,
  position = "top-right",
  showProgress = false,
}: SuccessToastProps) => {
  if (position === "center") {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-xl shadow-[0_20px_25px_-5px_rgba(0,0,0,0.1),0_10px_10px_-5px_rgba(0,0,0,0.04)] p-8 max-w-md w-full text-center">
          <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-emerald-100">
            <svg
              className="h-8 w-8 text-emerald-500"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
          <h3 className="mt-4 text-xl font-semibold text-gray-800">{title}</h3>
          <p className="mt-2 text-gray-600">{message}</p>
          {showProgress && (
            <div className="mt-4 w-full h-2.5 bg-gray-200 rounded-full overflow-hidden">
              <div className="h-full w-0 bg-emerald-500 rounded-full animate-[progress_3s_linear_forwards]"></div>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="fixed top-4 right-4 z-50 animate-[slideIn_0.3s_ease-out]">
      <div className="bg-white rounded-lg shadow-[0_10px_25px_rgba(0,0,0,0.2)] p-4 flex items-center gap-3 min-w-[300px]">
        <div className="flex items-center justify-center h-10 w-10 rounded-full bg-emerald-100 flex-shrink-0">
          <svg
            className="h-6 w-6 text-emerald-500"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 13l4 4L19 7"
            />
          </svg>
        </div>
        <div>
          <h4 className="text-sm font-semibold text-gray-800">{title}</h4>
          <p className="text-xs text-gray-600">{message}</p>
        </div>
      </div>
    </div>
  );
};