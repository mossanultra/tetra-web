interface AlertMessageProps {
  message: string;
  type?: "error" | "success" | "info";
}

export const AlertMessage = ({ message, type = "error" }: AlertMessageProps) => {
  const colors = {
    error: {
      bg: "bg-red-50",
      border: "border-red-400",
      icon: "text-red-400",
      text: "text-red-700",
    },
    success: {
      bg: "bg-emerald-50",
      border: "border-emerald-400",
      icon: "text-emerald-400",
      text: "text-emerald-700",
    },
    info: {
      bg: "bg-blue-50",
      border: "border-blue-400",
      icon: "text-blue-400",
      text: "text-blue-700",
    },
  };

  const color = colors[type];

  return (
    <div className="mb-6">
      <div className={`${color.bg} border-l-4 ${color.border} rounded p-4 flex`}>
        <svg
          className={`h-5 w-5 ${color.icon} flex-shrink-0`}
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          {type === "error" ? (
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
              clipRule="evenodd"
            />
          ) : (
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
              clipRule="evenodd"
            />
          )}
        </svg>
        <p className={`text-sm ${color.text} ml-3`}>{message}</p>
      </div>
    </div>
  );
};