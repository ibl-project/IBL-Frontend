"use client";

import React, { useEffect, useRef } from "react";

interface ModalProps {
  open: boolean;
  onClose: () => void;
  /** id judul di dalam modal, untuk pembaca layar (aria-labelledby). */
  labelledBy: string;
  className?: string;
  children: React.ReactNode;
}

/**
 * Modal di atas halaman yang di-blur (sesuai desain Schedule Result).
 *
 * Memakai <dialog> + showModal(): Escape menutup modal, halaman di belakang
 * tidak bisa difokus (inert), dan fokus kembali ke tombol pembuka setelah
 * ditutup. Isi modal baru dirender saat terbuka, jadi form selalu mulai bersih.
 */
export const Modal = ({ open, onClose, labelledBy, className = "", children }: ModalProps) => {
  const ref = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  return (
    <dialog
      ref={ref}
      aria-labelledby={labelledBy}
      onCancel={(event) => {
        // Escape: biarkan state React yang menutup, supaya tetap sinkron.
        event.preventDefault();
        onClose();
      }}
      className={`m-auto w-[calc(100%-2rem)] max-h-[calc(100dvh-2rem)] overflow-visible bg-transparent p-0 font-poppins backdrop:bg-[#e1e7ea]/40 backdrop:backdrop-blur-[6px] ${className}`}
    >
      {open && children}
    </dialog>
  );
};
