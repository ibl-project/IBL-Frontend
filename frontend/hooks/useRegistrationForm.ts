import { useCallback, useEffect, useRef, useState } from "react";

import { submitRegistration } from "@/lib/api";
import {
  clearAllFiles,
  clearFormState,
  deleteFile,
  getAllFiles,
  isSessionActive,
  isStorageAvailable,
  loadFormState,
  markSessionActive,
  saveFile,
  saveFormState,
} from "@/lib/storage";
import { FileData, RegisterFormData, StepData, UploadData } from "@/types/register";

import { DIVISION_QUESTIONS, GENERAL_QUESTIONS } from "../constants/questions";
import { PORTFOLIO_REQUIRED_DIVISIONS } from "../constants/registerForm";

export const initialStepData = (): StepData => ({
  nama: "",
  nrp: "",
  whatsapp: "",
  lineId: "",
  departemen: "",
  angkatan: "",
  subdivisi1: "",
  subdivisi2: "",
  kelebihanKekurangan: "",
  halUnik: "",
});

export const initialUploadData = (): UploadData => ({
  cv: "",
  ktm: "",
  twibbon: "",
  buktiFollow: "",
  portofolio: "",
});

export const useRegistrationForm = () => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState<RegisterFormData>({
    informasiUmum: initialStepData(),
    pertanyaanGeneral: {},
    subdivisi1: {},
    subdivisi2: {},
    uploadBerkas: initialUploadData(),
  });
  const [rawFiles, setRawFiles] = useState<{ [key in keyof UploadData]?: FileData }>({});
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [showPortfolioModal, setShowPortfolioModal] = useState(false);

  const clearError = useCallback(() => setSubmitError(null), []);

  const getStepConfig = () => {
    switch (step) {
      case 1:
        return { type: "form" as const, key: "informasiUmum" as const, title: "INFORMASI UMUM" };
      case 2:
        return { type: "form" as const, key: "pertanyaanGeneral" as const, title: "PERTANYAAN GENERAL" };
      case 3:
        return { type: "form" as const, key: "subdivisi1" as const, title: "SUBDIVISI 1" };
      case 4:
        return { type: "form" as const, key: "subdivisi2" as const, title: "SUBDIVISI 2" };
      case 5:
        return { type: "upload" as const, key: "uploadBerkas" as const, title: "UPLOAD BERKAS" };
      default:
        return { type: "form" as const, key: "informasiUmum" as const, title: "INFORMASI UMUM" };
    }
  };

  const { type: currentType, key: currentKey, title: currentTitle } = getStepConfig();
  const currentData = formData[currentKey];

  const updateField = (field: string, value: string) => {
    setSubmitError(null); // Clear errors when user edits
    setFormData((prev) => ({
      ...prev,
      [currentKey]: {
        ...prev[currentKey as "informasiUmum" | "pertanyaanGeneral" | "subdivisi1" | "subdivisi2"],
        [field]: value,
      },
    }));
  };

  const updateUploadField = (field: keyof UploadData, value: string, fileData?: FileData) => {
    setSubmitError(null); // Clear errors when user uploads
    setFormData((prev) => ({
      ...prev,
      uploadBerkas: {
        ...prev.uploadBerkas,
        [field]: value,
      },
    }));
    if (fileData) {
      setRawFiles((prev) => ({
        ...prev,
        [field]: fileData,
      }));
      if (hydratedRef.current && isStorageAvailable()) {
        saveFile(field, fileData).catch(() => {});
      }
    }
  };

  const removeUploadField = (field: keyof UploadData) => {
    setSubmitError(null); // Clear errors when user removes a file
    setFormData((prev) => ({
      ...prev,
      uploadBerkas: {
        ...prev.uploadBerkas,
        [field]: "",
      },
    }));
    setRawFiles((prev) => {
      const next = { ...prev };
      delete next[field];
      return next;
    });
    if (hydratedRef.current && isStorageAvailable()) {
      deleteFile(field).catch(() => {});
    }
  };

  // Apakah pendaftar memilih divisi yang mewajibkan portofolio
  const isPortfolioRequired = useCallback(() => {
    const p1 = formData.informasiUmum.subdivisi1;
    const p2 = formData.informasiUmum.subdivisi2;
    return PORTFOLIO_REQUIRED_DIVISIONS.includes(p1) || PORTFOLIO_REQUIRED_DIVISIONS.includes(p2);
  }, [formData.informasiUmum.subdivisi1, formData.informasiUmum.subdivisi2]);

  const dismissPortfolioModal = useCallback(() => setShowPortfolioModal(false), []);

  // --- Persistensi form (sessionStorage untuk teks, IndexedDB untuk berkas) ---
  const hydratedRef = useRef(false);

  // Restore saat mount (post-mount → aman dari hydration mismatch).
  // Fresh session (browser baru dibuka) → bersihkan sisa file lama lebih dulu.
  // Refresh (sesi berlanjut) → pulihkan teks + berkas.
  useEffect(() => {
    if (!isStorageAvailable()) return; // incognito / storage diblokir → skip persist

    let cancelled = false;

    const restore = async () => {
      if (!isSessionActive()) {
        await clearAllFiles().catch(() => {});
        clearFormState();
        markSessionActive();
        hydratedRef.current = true;
        return;
      }

      const persisted = loadFormState();
      const files = await getAllFiles().catch(() => ({}));
      if (cancelled) return;
      if (persisted) {
        setStep(persisted.step);
        setFormData(persisted.formData);
      }
      if (files && Object.keys(files).length > 0) {
        setRawFiles(files as { [key in keyof UploadData]?: FileData });
      }
      hydratedRef.current = true;
    };

    restore();
    return () => {
      cancelled = true;
    };
  }, []);

  // Simpan data teks (debounced 400ms). Hanya aktif setelah restore selesai
  // supaya tidak menimpa storage dengan state awal yang kosong.
  useEffect(() => {
    if (!hydratedRef.current) return;
    const timer = setTimeout(() => saveFormState({ step, formData }), 400);
    return () => clearTimeout(timer);
  }, [step, formData]);

  // Validasi langkah 1-4 (data teks & jawaban). Mengembalikan pesan error atau null bila valid.
  const validateStep = (stepNum: number): string | null => {
    if (stepNum === 1) {
      const info = formData.informasiUmum;
      if (
        !info.nama?.trim() ||
        !info.nrp?.trim() ||
        !info.whatsapp?.trim() ||
        !info.lineId?.trim() ||
        !info.departemen?.trim() ||
        !info.angkatan?.trim() ||
        !info.subdivisi1?.trim() ||
        info.subdivisi1 === "Pilih Subdivisi" ||
        !info.kelebihanKekurangan?.trim() ||
        !info.halUnik?.trim()
      ) {
        return "Mohon lengkapi seluruh informasi umum yang bertanda bintang (*).";
      }

      // Validasi Angka Input Utama
      if (!/^\d{10}$/.test(info.nrp.trim())) {
        return "NRP harus berupa 10 digit angka.";
      }
      if (!/^\d{8,15}$/.test(info.whatsapp.trim())) {
        return "Nomor WhatsApp tidak valid (harus berupa angka saja, minimal 8 digit).";
      }
      if (!/^\d{4}$/.test(info.angkatan.trim())) {
        return "Angkatan harus berupa 4 digit angka (contoh: 2024).";
      }
      return null;
    }
    if (stepNum === 2) {
      const gen = formData.pertanyaanGeneral;
      for (const q of GENERAL_QUESTIONS) {
        if (!gen[q]?.trim()) {
          return "Mohon jawab seluruh Pertanyaan General (*).";
        }
      }

      // Validasi Skala Prioritas General (1-10)
      const scaleQ = "Skala prioritas IBL2K26 bagi kamu!";
      const scaleVal = gen[scaleQ];
      if (scaleVal) {
        const num = parseInt(scaleVal.trim(), 10);
        if (isNaN(num) || num < 1 || num > 10) {
          return "Jawaban untuk 'Skala prioritas' harus berupa angka bulat dari 1 sampai 10.";
        }
      }
      return null;
    }
    if (stepNum === 3) {
      const div1 = formData.informasiUmum.subdivisi1;
      if (div1 && div1 !== "Tidak Memilih" && div1 !== "Pilih Subdivisi") {
        const divData = DIVISION_QUESTIONS[div1];
        if (divData) {
          const required = [...(divData.divisionQuestions || []), ...(divData.studyCases || [])];
          for (const q of required) {
            if (!formData.subdivisi1[q]?.trim()) {
              return "Mohon jawab seluruh pertanyaan subdivisi pilihan 1 (*).";
            }
          }

          // Validasi skala prioritas SnL (1-10)
          const snlQ = "Berikan skala prioritas dengan rentang 1-10 untuk IBL 2026";
          if (formData.subdivisi1[snlQ]) {
            const num = parseInt(formData.subdivisi1[snlQ].trim(), 10);
            if (isNaN(num) || num < 1 || num > 10) {
              return "Jawaban skala prioritas untuk SnL harus berupa angka dari 1 sampai 10.";
            }
          }

          // Validasi skala excited Damen (1-5)
          const damenQ = "Seberapa excited kamu untuk masuk ke divisi Data Management (kasih opsi skala 1-5)";
          if (formData.subdivisi1[damenQ]) {
            const num = parseInt(formData.subdivisi1[damenQ].trim(), 10);
            if (isNaN(num) || num < 1 || num > 5) {
              return "Jawaban skala excited untuk Data Management harus berupa angka dari 1 sampai 5.";
            }
          }
        }
      }
      return null;
    }
    if (stepNum === 4) {
      const div2 = formData.informasiUmum.subdivisi2;
      if (div2 && div2 !== "Tidak Memilih" && div2 !== "Pilih Subdivisi") {
        const divData = DIVISION_QUESTIONS[div2];
        if (divData) {
          const required = [...(divData.divisionQuestions || []), ...(divData.studyCases || [])];
          for (const q of required) {
            if (!formData.subdivisi2[q]?.trim()) {
              return "Mohon jawab seluruh pertanyaan subdivisi pilihan 2 (*).";
            }
          }

          // Validasi skala prioritas SnL (1-10)
          const snlQ = "Berikan skala prioritas dengan rentang 1-10 untuk IBL 2026";
          if (formData.subdivisi2[snlQ]) {
            const num = parseInt(formData.subdivisi2[snlQ].trim(), 10);
            if (isNaN(num) || num < 1 || num > 10) {
              return "Jawaban skala prioritas untuk SnL harus berupa angka dari 1 sampai 10.";
            }
          }

          // Validasi skala excited Damen (1-5)
          const damenQ = "Seberapa excited kamu untuk masuk ke divisi Data Management (kasih opsi skala 1-5)";
          if (formData.subdivisi2[damenQ]) {
            const num = parseInt(formData.subdivisi2[damenQ].trim(), 10);
            if (isNaN(num) || num < 1 || num > 5) {
              return "Jawaban skala excited untuk Data Management harus berupa angka dari 1 sampai 5.";
            }
          }
        }
      }
      return null;
    }
    return null;
  };

  // Validasi langkah saat ini (1-4); bila valid kembalikan true (dan picu modal
  // portofolio saat meninggalkan langkah 4). Dipakai bersama oleh handleNext & goToStep.
  const advanceFrom = (fromStep: number): boolean => {
    const error = validateStep(fromStep);
    if (error) {
      setSubmitError(error);
      return false;
    }
    setSubmitError(null);
    if (fromStep === 4 && isPortfolioRequired()) {
      setShowPortfolioModal(true);
    }
    return true;
  };

  // Navigasi via klik bola step. Aturan:
  // - ke langkah sebelumnya/saat ini: boleh (untuk review).
  // - ke langkah +1 berikutnya: harus lulus validasi langkah saat ini.
  // - melompat lebih dari 1 langkah ke depan: dilarang (bola dimatikan di UI).
  const goToStep = (target: number) => {
    if (target === step) return;
    if (target < step) {
      setSubmitError(null);
      setStep(target);
      return;
    }
    if (target > step + 1) {
      setSubmitError("Lengkapi langkah ini terlebih dahulu sebelum melompat ke langkah lain.");
      return;
    }
    if (advanceFrom(step)) setStep(target);
  };

  const handleNext = async () => {
    // Langkah 1-4: validasi data teks/jawaban, lalu maju satu langkah.
    if (step < 5) {
      if (advanceFrom(step)) setStep((s) => s + 1);
      return;
    }

    // STEP 5 VALIDATION & SUBMISSION
    if (step === 5) {
      const uploads = formData.uploadBerkas;
      if (!uploads.cv || !uploads.ktm || !uploads.twibbon || !uploads.buktiFollow) {
        setSubmitError("Mohon lengkapi dokumen wajib (*): CV, KTM, Twibbon, dan Bukti Follow.");
        return;
      }

      // Dynamic portfolio check (menggunakan helper di hook)
      if (isPortfolioRequired() && !uploads.portofolio) {
        setSubmitError("Subdivisi pilihanmu mewajibkan portofolio. Mohon unggah berkas Portofolio (*).");
        return;
      }

      setIsSubmitting(true);
      setSubmitError(null);
      try {
        const gasUrl = process.env.NEXT_PUBLIC_BACKEND_URL;
        if (!gasUrl) {
          throw new Error("Backend URL (NEXT_PUBLIC_BACKEND_URL) is not configured");
        }

        const compiledData: RegisterFormData = {
          informasiUmum: {
            nama: formData.informasiUmum.nama || "",
            nrp: formData.informasiUmum.nrp || "",
            whatsapp: formData.informasiUmum.whatsapp || "",
            lineId: formData.informasiUmum.lineId || "",
            departemen: formData.informasiUmum.departemen || "",
            angkatan: formData.informasiUmum.angkatan || "",
            subdivisi1: formData.informasiUmum.subdivisi1 || "",
            subdivisi2: formData.informasiUmum.subdivisi2 || "",
            kelebihanKekurangan: formData.informasiUmum.kelebihanKekurangan || "",
            halUnik: formData.informasiUmum.halUnik || "",
          },
          pertanyaanGeneral: formData.pertanyaanGeneral,
          subdivisi1: formData.subdivisi1,
          subdivisi2: formData.subdivisi2,
          uploadBerkas: formData.uploadBerkas,
        };

        await submitRegistration(gasUrl, compiledData, rawFiles);
        setIsSubmitted(true);
        // Pendaftaran selesai → hapus draft dari storage (cegah submit ganda & data tertinggal)
        clearFormState();
        if (isStorageAvailable()) clearAllFiles().catch(() => {});
      } catch (err: unknown) {
        console.error("Submission failed:", err);
        const message = err instanceof Error ? err.message : "Failed to submit. Please try again.";
        setSubmitError(message);
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  const handleBack = () => {
    setSubmitError(null); // Clear validation warning on navigation back
    if (step > 1) {
      setStep((s) => s - 1);
    }
  };

  const handleReset = () => {
    setStep(1);
    setFormData({
      informasiUmum: initialStepData(),
      pertanyaanGeneral: {},
      subdivisi1: {},
      subdivisi2: {},
      uploadBerkas: initialUploadData(),
    });
    setRawFiles({});
    setIsSubmitted(false);
    setSubmitError(null);
    setIsSubmitting(false);
    setShowPortfolioModal(false);
    // Hapus draft dari storage saat reset
    clearFormState();
    if (isStorageAvailable()) clearAllFiles().catch(() => {});
  };

  return {
    step,
    setStep,
    formData,
    isSubmitted,
    isSubmitting,
    submitError,
    currentType,
    currentKey,
    currentTitle,
    currentData,
    updateField,
    updateUploadField,
    removeUploadField,
    rawFiles,
    showPortfolioModal,
    dismissPortfolioModal,
    goToStep,
    handleNext,
    handleBack,
    handleReset,
    clearError,
  };
};
