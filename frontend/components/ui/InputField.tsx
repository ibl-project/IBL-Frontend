import React from "react";

interface InputFieldProps {
  label: string;
  value: string;
  onChange: (val: string) => void;
  placeholder?: string;
  type?: string;
  error?: string;
}

const InputField: React.FC<InputFieldProps> = ({
  label,
  value,
  onChange,
  placeholder = "Ketik di sini...",
  type = "text",
  error,
}) => {
  return (
    <div className="flex w-full flex-col text-left">
      <label
        className="font-drowner font-bold tracking-widest text-[#2D2D2D]"
        style={{
          fontSize: "var(--form-font-size)",
          marginBottom: "var(--form-margin-bottom)",
        }}
      >
        {label}
      </label>
      <input
        type={type}
        suppressHydrationWarning
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full border border-gray-300 bg-white font-body text-gray-800 placeholder-gray-400 shadow-inner transition-colors outline-none focus:border-gray-500"
        style={{
          fontSize: "var(--form-font-size)",
          paddingTop: "var(--form-padding-y)",
          paddingBottom: "var(--form-padding-y)",
          paddingLeft: "var(--form-padding-x)",
          paddingRight: "var(--form-padding-x)",
          borderRadius: "calc(var(--form-font-size) * 0.43)", // proportional to ~6px rounded-md
        }}
      />
      {error && (
        <span className="mt-1 text-red-600" style={{ fontSize: "var(--form-error-font-size)" }}>
          {error}
        </span>
      )}
    </div>
  );
};

export default InputField;
