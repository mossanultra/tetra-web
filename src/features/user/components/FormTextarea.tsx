interface FormTextareaProps {
  label: string;
  name: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  placeholder?: string;
  rows?: number;
  maxLength?: number;
  disabled?: boolean;
}

export const FormTextarea = ({
  label,
  name,
  value,
  onChange,
  placeholder,
  rows = 4,
  maxLength = 500,
  disabled = false,
}: FormTextareaProps) => {
  return (
    <div className="mb-0">
      <label
        htmlFor={name}
        className="block text-sm font-medium text-gray-700 mb-1"
      >
        {label}
      </label>
      {disabled ? (
        <div className="px-4 py-3 bg-gray-50 rounded-lg border border-gray-200 min-h-[100px]">
          <p className="text-sm text-gray-800 whitespace-pre-wrap">
            {value || "自己紹介が未設定です"}
          </p>
        </div>
      ) : (
        <>
          <div className="relative rounded-lg shadow-sm">
            <textarea
              name={name}
              id={name}
              rows={rows}
              value={value}
              onChange={onChange}
              maxLength={maxLength}
              disabled={disabled}
              className="block w-full px-4 py-3 text-sm leading-6 text-gray-800 bg-white border border-gray-300 rounded-lg shadow-none transition-[border-color,box-shadow] duration-150 focus:outline-none focus:border-indigo-600 focus:ring-3 focus:ring-indigo-600/15 placeholder:text-gray-400 resize-none"
              placeholder={placeholder}
            />
          </div>
          <p className="mt-1 text-xs text-gray-500">
            {value.length} / {maxLength}文字
          </p>
        </>
      )}
    </div>
  );
};