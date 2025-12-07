interface FormInputProps {
  label: string;
  name: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  icon?: React.ReactNode;
}

export const FormInput = ({
  label,
  name,
  value,
  onChange,
  placeholder,
  required = false,
  disabled = false,
  icon,
}: FormInputProps) => {
  return (
    <div className="mb-0">
      <label
        htmlFor={name}
        className="block text-sm font-medium text-gray-700 mb-1"
      >
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      {disabled ? (
        <div className="px-4 py-3 bg-gray-50 rounded-lg border border-gray-200">
          <p className="text-sm text-gray-800">{value || "未設定"}</p>
        </div>
      ) : (
        <div className="relative rounded-lg shadow-sm">
          {icon && (
            <div className="absolute top-0 bottom-0 left-0 pl-3 flex items-center pointer-events-none">
              {icon}
            </div>
          )}
          <input
            type="text"
            name={name}
            id={name}
            value={value}
            onChange={onChange}
            disabled={disabled}
            className={`block w-full ${
              icon ? "pl-10" : "pl-4"
            } pr-4 py-3 text-sm leading-6 text-gray-800 bg-white border border-gray-300 rounded-lg shadow-none transition-[border-color,box-shadow] duration-150 focus:outline-none focus:border-indigo-600 focus:ring-3 focus:ring-indigo-600/15 placeholder:text-gray-400`}
            placeholder={placeholder}
          />
        </div>
      )}
    </div>
  );
};