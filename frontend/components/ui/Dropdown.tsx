"use client";

import React, { useEffect, useRef, useState } from "react";

interface DropdownProps {
  label: string;
  options: string[];
  selected: string;
  onSelect: (val: string) => void;
  placeholder?: string;
}

const Dropdown: React.FC<DropdownProps> = ({ label, options, selected, onSelect, placeholder = "Pilih..." }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div className="relative flex w-full flex-col text-left" ref={dropdownRef}>
      <label
        className="font-drowner font-bold tracking-widest text-[#2D2D2D]"
        style={{
          fontSize: "var(--form-font-size)",
          marginBottom: "var(--form-margin-bottom)",
        }}
      >
        {label}
      </label>

      {/* Selection Box */}
      <button
        type="button"
        suppressHydrationWarning
        onClick={() => setIsOpen(!isOpen)}
        className="flex w-full cursor-pointer items-center justify-between border border-gray-300 bg-white text-left text-gray-800 shadow-sm outline-none"
        style={{
          fontSize: "var(--form-font-size)",
          paddingTop: "var(--form-padding-y)",
          paddingBottom: "var(--form-padding-y)",
          paddingLeft: "var(--form-padding-x)",
          paddingRight: "var(--form-padding-x)",
          borderRadius: "calc(var(--form-font-size) * 0.43)", // proportional to ~6px rounded-md
        }}
      >
        <span className={selected ? "text-gray-800" : "text-gray-400"}>{selected || placeholder}</span>
        <span
          className="transform text-gray-400 transition-transform duration-200"
          style={{ fontSize: "calc(var(--form-font-size) * 0.85)" }}
        >
          {isOpen ? "▲" : "▼"}
        </span>
      </button>

      {/* Options Panel */}
      {isOpen && (
        <div
          className="absolute left-0 z-50 w-full overflow-hidden border border-gray-300 bg-white shadow-lg"
          style={{
            top: "calc(100% + var(--form-margin-bottom))",
            borderRadius: "calc(var(--form-font-size) * 0.43)",
          }}
        >
          <ul className="m-0 flex list-none flex-col p-0">
            {options.map((option, idx) => (
              <li key={idx} className="m-0 border-b border-gray-100 p-0 last:border-b-0">
                <button
                  type="button"
                  suppressHydrationWarning
                  onClick={() => {
                    onSelect(option);
                    setIsOpen(false);
                  }}
                  className="w-full cursor-pointer text-left font-body text-gray-700 transition-colors hover:bg-gray-50"
                  style={{
                    fontSize: "var(--form-font-size)",
                    paddingTop: "calc(var(--form-padding-y) * 1.2)",
                    paddingBottom: "calc(var(--form-padding-y) * 1.2)",
                    paddingLeft: "var(--form-padding-x)",
                    paddingRight: "var(--form-padding-x)",
                  }}
                >
                  {option}
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default Dropdown;
