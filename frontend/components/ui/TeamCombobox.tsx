"use client";

import React, { useId, useMemo, useState } from "react";
import { Search } from "lucide-react";

import { OutlinedField } from "./OutlinedField";

export interface TeamOption {
  id: string;
  name: string;
  group: string | null;
}

interface TeamComboboxProps {
  id: string;
  label: string;
  options: TeamOption[];
  /** ID tim terpilih, atau null. */
  value: string | null;
  onChange: (teamId: string | null) => void;
  disabled?: boolean;
  error?: string | null;
  placeholder?: string;
  /** Teks saat tidak ada pilihan sama sekali (mis. grup lawan kosong). */
  emptyText?: string;
}

/**
 * Pilih tim dengan mengetik nama (desain "Select Team" + ikon cari).
 * Pola ARIA combobox: ↑/↓ memilih, Enter mengambil, Escape menutup.
 */
export const TeamCombobox = ({
  id,
  label,
  options,
  value,
  onChange,
  disabled = false,
  error,
  placeholder = "Select Team",
  emptyText = "Tidak ada tim yang cocok",
}: TeamComboboxProps) => {
  const listId = useId();
  const selected = options.find((option) => option.id === value) ?? null;
  const [query, setQuery] = useState(selected?.name ?? "");
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);

  // Ikuti pilihan dari luar (mis. form Edit terisi, atau tim lawan berubah).
  const [syncedValue, setSyncedValue] = useState(value);
  if (syncedValue !== value) {
    setSyncedValue(value);
    setQuery(selected?.name ?? "");
  }

  const filtered = useMemo(() => {
    const term = query.trim().toLowerCase();
    if (!term || term === selected?.name.toLowerCase()) return options;
    return options.filter((option) => option.name.toLowerCase().includes(term));
  }, [options, query, selected]);

  const choose = (option: TeamOption) => {
    setQuery(option.name);
    setOpen(false);
    onChange(option.id);
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "ArrowDown" || event.key === "ArrowUp") {
      event.preventDefault();
      if (!open) {
        setOpen(true);
        return;
      }
      const step = event.key === "ArrowDown" ? 1 : -1;
      setActive((current) => (filtered.length === 0 ? 0 : (current + step + filtered.length) % filtered.length));
    } else if (event.key === "Enter" && open) {
      event.preventDefault();
      const option = filtered[active];
      if (option) choose(option);
    } else if (event.key === "Escape" && open) {
      // Jangan sampai ikut menutup modal.
      event.preventDefault();
      event.stopPropagation();
      setOpen(false);
      setQuery(selected?.name ?? "");
    }
  };

  return (
    <OutlinedField
      label={label}
      htmlFor={id}
      error={error}
      trailing={<Search aria-hidden="true" className="h-5 w-5 shrink-0 text-[#1c1b1f]" />}
    >
      <input
        id={id}
        type="text"
        role="combobox"
        aria-expanded={open}
        aria-controls={listId}
        aria-autocomplete="list"
        aria-activedescendant={open && filtered[active] ? `${listId}-${filtered[active].id}` : undefined}
        autoComplete="off"
        value={query}
        disabled={disabled}
        placeholder={placeholder}
        onChange={(event) => {
          setQuery(event.target.value);
          setActive(0);
          setOpen(true);
          if (selected && event.target.value !== selected.name) onChange(null);
        }}
        // Dibuka saat diklik/diketik/↓, bukan saat fokus: modal memfokuskan
        // field ini otomatis, dan daftar yang langsung terbuka menutupi form.
        onClick={() => setOpen(true)}
        onBlur={() => {
          setOpen(false);
          if (!selected) return;
          setQuery(selected.name);
        }}
        onKeyDown={handleKeyDown}
        className="w-full bg-transparent text-base text-[#1c1b1f] outline-none placeholder:text-[#1c1b1f] disabled:cursor-not-allowed disabled:text-gray-600"
      />
      {open && !disabled && (
        <ul
          id={listId}
          role="listbox"
          aria-label={label}
          className="absolute left-0 top-full z-20 mt-3 -ml-4 max-h-64 w-[calc(100%+2rem)] overflow-y-auto bg-white shadow-[0_8px_24px_rgba(0,0,0,0.18)]"
        >
          {filtered.length === 0 ? (
            <li className="px-4 py-3 text-sm text-gray-600">{emptyText}</li>
          ) : (
            filtered.map((option, index) => (
              <li
                key={option.id}
                id={`${listId}-${option.id}`}
                role="option"
                aria-selected={option.id === value}
                // mousedown supaya pilihan diambil sebelum input kehilangan fokus.
                onMouseDown={(event) => {
                  event.preventDefault();
                  choose(option);
                }}
                onMouseEnter={() => setActive(index)}
                className={`flex cursor-pointer items-center justify-between gap-3 border-b border-gray-200 px-4 py-3 last:border-b-0 ${
                  index === active ? "bg-[#e8f3f3]" : "bg-white"
                }`}
              >
                <span className="truncate text-base text-[#1c1b1f]">{option.name}</span>
                {option.group && <span className="shrink-0 text-xs text-gray-600">{option.group}</span>}
              </li>
            ))
          )}
        </ul>
      )}
    </OutlinedField>
  );
};
