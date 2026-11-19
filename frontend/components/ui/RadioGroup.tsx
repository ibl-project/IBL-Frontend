import React from "react";

interface RadioGroupProps {
  label: string;
  options: string[];
  selected: string;
  onChange: (val: string) => void;
}

const RadioGroup: React.FC<RadioGroupProps> = ({ label, options, selected, onChange }) => {
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
      <div className="flex flex-col" style={{ gap: "calc(var(--form-field-gap) * 1.5)" }}>
        {options.map((option, idx) => {
          const isSelected = selected === option;
          return (
            <button
              key={idx}
              type="button"
              suppressHydrationWarning
              onClick={() => onChange(option)}
              className="flex cursor-pointer items-start text-left focus:outline-none"
              style={{ gap: "var(--form-radio-gap)" }}
            >
              {/* Custom Radio Button */}
              <div
                className="flex flex-shrink-0 items-center justify-center rounded-full border border-black bg-white"
                style={{
                  width: "var(--form-radio-size)",
                  height: "var(--form-radio-size)",
                  marginTop: "calc(var(--form-font-size) * 0.05)",
                }}
              >
                {isSelected && (
                  <div
                    className="rounded-full bg-black"
                    style={{
                      width: "var(--form-radio-dot-size)",
                      height: "var(--form-radio-dot-size)",
                    }}
                  />
                )}
              </div>
              <span className="font-body leading-tight text-gray-800" style={{ fontSize: "var(--form-font-size)" }}>
                {option}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default RadioGroup;
