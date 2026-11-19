import React from "react";

import Dropdown from "@/components/ui/Dropdown";
import InputField from "@/components/ui/InputField";
import { DIVISION_QUESTIONS, GENERAL_QUESTIONS } from "@/constants/questions";
import { DROPDOWN_OPTIONS, DROPDOWN_OPTIONS_2, FORM_LABELS } from "@/constants/registerForm";
import { RegisterFormData, StepData } from "@/types/register";

interface FormStepFieldsProps {
  step: number;
  formData: RegisterFormData;
  currentData: StepData;
  updateField: (field: string, value: string) => void;
}

export const FormStepFields = ({ step, formData, currentData, updateField }: FormStepFieldsProps) => {
  // STEP 1: INFORMASI UMUM
  if (step === 1) {
    return (
      <div className="flex flex-col" style={{ gap: "24px" }}>
        <InputField
          label="Nama Lengkap *"
          value={currentData.nama || ""}
          onChange={(val: string) => updateField("nama", val)}
        />
        <InputField label="NRP *" value={currentData.nrp || ""} onChange={(val: string) => updateField("nrp", val)} />
        <InputField
          label="No. WhatsApp *"
          value={currentData.whatsapp || ""}
          onChange={(val: string) => updateField("whatsapp", val)}
        />
        <InputField
          label="ID Line *"
          value={currentData.lineId || ""}
          onChange={(val: string) => updateField("lineId", val)}
        />
        <InputField
          label="Departemen *"
          value={currentData.departemen || ""}
          onChange={(val: string) => updateField("departemen", val)}
        />
        <InputField
          label="Angkatan *"
          value={currentData.angkatan || ""}
          onChange={(val: string) => updateField("angkatan", val)}
        />

        <Dropdown
          label={FORM_LABELS.dropdown + " *"}
          options={DROPDOWN_OPTIONS}
          selected={currentData.subdivisi1 || ""}
          onSelect={(val: string) => updateField("subdivisi1", val)}
        />

        <Dropdown
          label={FORM_LABELS.dropdown2}
          options={DROPDOWN_OPTIONS_2}
          selected={currentData.subdivisi2 || ""}
          onSelect={(val: string) => updateField("subdivisi2", val)}
        />

        {/* Pertanyaan Essay Informasi Umum */}
        <div className="mt-2 flex w-full flex-col text-left">
          <label
            className="font-drowner leading-relaxed font-bold tracking-widest text-[#2D2D2D]"
            style={{
              fontSize: "var(--form-font-size)",
              marginBottom: "var(--form-margin-bottom)",
            }}
          >
            Sebutkan kelebihan dan kekuranganmu! *
          </label>
          <textarea
            value={currentData.kelebihanKekurangan || ""}
            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => updateField("kelebihanKekurangan", e.target.value)}
            placeholder="Tulis jawabanmu di sini..."
            className="w-full resize-y border border-gray-300 bg-white font-body text-gray-800 placeholder-gray-400 shadow-inner transition-colors outline-none focus:border-[#2B918E] focus:ring-1 focus:ring-[#2B918E]"
            style={{
              fontSize: "var(--form-font-size)",
              paddingTop: "var(--form-padding-y)",
              paddingBottom: "var(--form-padding-y)",
              paddingLeft: "var(--form-padding-x)",
              paddingRight: "var(--form-padding-x)",
              minHeight: "120px",
              borderRadius: "calc(var(--form-font-size) * 0.43)",
            }}
          />
        </div>

        <div className="mt-3 flex w-full flex-col text-left">
          <label
            className="font-drowner leading-relaxed font-bold tracking-widest text-[#2D2D2D]"
            style={{
              fontSize: "var(--form-font-size)",
              marginBottom: "var(--form-margin-bottom)",
            }}
          >
            Apa satu hal yang kalian inginkan kami ketahui tentang diri Anda yang tidak dapat terlihat dari dokumen
            tertulis (CV atau portofolio) Anda? *
          </label>
          <textarea
            value={currentData.halUnik || ""}
            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => updateField("halUnik", e.target.value)}
            placeholder="Tulis jawabanmu di sini..."
            className="w-full resize-y border border-gray-300 bg-white font-body text-gray-800 placeholder-gray-400 shadow-inner transition-colors outline-none focus:border-[#2B918E] focus:ring-1 focus:ring-[#2B918E]"
            style={{
              fontSize: "var(--form-font-size)",
              paddingTop: "var(--form-padding-y)",
              paddingBottom: "var(--form-padding-y)",
              paddingLeft: "var(--form-padding-x)",
              paddingRight: "var(--form-padding-x)",
              minHeight: "120px",
              borderRadius: "calc(var(--form-font-size) * 0.43)",
            }}
          />
        </div>
      </div>
    );
  }

  // STEP 2: PERTANYAAN GENERAL
  if (step === 2) {
    return (
      <div className="flex flex-col gap-5">
        <h4 className="mb-1 border-l-4 border-[#2B918E] pl-2 font-crosner text-sm font-bold tracking-widest text-gray-700 uppercase">
          Pertanyaan General
        </h4>
        {GENERAL_QUESTIONS.map((q: string, idx: number) => (
          <div key={`gen-q-${idx}`} className="flex w-full flex-col text-left">
            <label
              className="font-drowner leading-relaxed font-bold tracking-widest text-[#2D2D2D]"
              style={{
                fontSize: "var(--form-font-size)",
                marginBottom: "var(--form-margin-bottom)",
              }}
            >
              {idx + 1}. {q} *
            </label>
            <textarea
              value={currentData[q] || ""}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => updateField(q, e.target.value)}
              placeholder="Tulis jawabanmu di sini..."
              className="w-full resize-y border border-gray-300 bg-white font-body text-gray-800 placeholder-gray-400 shadow-inner transition-colors outline-none focus:border-[#2B918E] focus:ring-1 focus:ring-[#2B918E]"
              style={{
                fontSize: "var(--form-font-size)",
                paddingTop: "var(--form-padding-y)",
                paddingBottom: "var(--form-padding-y)",
                paddingLeft: "var(--form-padding-x)",
                paddingRight: "var(--form-padding-x)",
                minHeight: "120px",
                borderRadius: "calc(var(--form-font-size) * 0.43)",
              }}
            />
          </div>
        ))}
      </div>
    );
  }

  // Determine which division choice this step is for
  const isChoice1 = step === 3;
  const divisionChoice = isChoice1 ? formData.informasiUmum.subdivisi1 : formData.informasiUmum.subdivisi2;

  // Handle case where no division is selected
  if (!divisionChoice || divisionChoice === "Tidak Memilih") {
    return (
      <div className="flex h-full min-h-[300px] flex-col items-center justify-center gap-4 p-6 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-full border border-[#864B4D] bg-[#D1EAE5]/40">
          <svg
            className="h-8 w-8 text-[#864B4D]"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
        </div>
        <h3 className="font-crosner text-xl font-semibold tracking-widest text-black uppercase">
          {isChoice1 ? "Subdivisi Pilihan 1 Kosong" : "Subdivisi Pilihan 2 Kosong / Tidak Dipilih"}
        </h3>
        <p className="max-w-md font-body text-sm text-gray-600">
          {isChoice1
            ? "Silakan kembali ke Halaman Informasi Umum untuk memilih Subdivisi Pilihan 1 terlebih dahulu."
            : "Kamu memilih untuk tidak mengambil pilihan subdivisi kedua. Silakan klik NEXT di navigasi bawah untuk melompat ke bagian Upload Berkas."}
        </p>
      </div>
    );
  }

  // Load questions for the selected division
  const divisionData = DIVISION_QUESTIONS[divisionChoice];
  if (!divisionData) {
    return (
      <div className="p-6 text-center font-body text-red-500">
        Error: Pertanyaan divisi &ldquo;{divisionChoice}&rdquo; tidak ditemukan.
      </div>
    );
  }

  const { divisionQuestions = [], studyCases = [] } = divisionData;

  return (
    <div className="flex flex-col" style={{ gap: "28px" }}>
      {/* Title indicating which division we are answering for */}
      <div className="mb-2 border-b border-[#864B4D]/30 pb-3">
        <h3 className="font-crosner text-xl font-bold tracking-widest text-[#864B4D] uppercase">
          DIVISI: {divisionChoice}
        </h3>
        <p className="mt-1 font-body text-[11px] text-gray-500">
          Jawablah pertanyaan di bawah ini dengan lengkap. (Semua pertanyaan wajib diisi *)
        </p>
      </div>

      {/* Part 1: Pertanyaan Divisi */}
      {divisionQuestions.length > 0 && (
        <div className="flex flex-col gap-5">
          <h4 className="mb-1 border-l-4 border-[#2B918E] pl-2 font-crosner text-sm font-bold tracking-widest text-gray-700 uppercase">
            Pertanyaan Divisi
          </h4>
          {divisionQuestions.map((q, idx) => (
            <div key={`div-q-${idx}`} className="flex w-full flex-col text-left">
              <label
                className="font-drowner leading-relaxed font-bold tracking-widest text-[#2D2D2D]"
                style={{
                  fontSize: "var(--form-font-size)",
                  marginBottom: "var(--form-margin-bottom)",
                }}
              >
                {idx + 1}. {q} *
              </label>
              <textarea
                value={currentData[q] || ""}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => updateField(q, e.target.value)}
                placeholder="Tulis jawabanmu di sini..."
                className="w-full resize-y border border-gray-300 bg-white font-body text-gray-800 placeholder-gray-400 shadow-inner transition-colors outline-none focus:border-[#2B918E] focus:ring-1 focus:ring-[#2B918E]"
                style={{
                  fontSize: "var(--form-font-size)",
                  paddingTop: "var(--form-padding-y)",
                  paddingBottom: "var(--form-padding-y)",
                  paddingLeft: "var(--form-padding-x)",
                  paddingRight: "var(--form-padding-x)",
                  minHeight: "120px",
                  borderRadius: "calc(var(--form-font-size) * 0.43)",
                }}
              />
            </div>
          ))}
        </div>
      )}

      {/* Part 2: Pertanyaan Study Case */}
      {studyCases.length > 0 && (
        <div className="mt-4 flex flex-col gap-5">
          <h4 className="mb-1 border-l-4 border-[#F4631E] pl-2 font-crosner text-sm font-bold tracking-widest text-gray-700 uppercase">
            Studi Kasus (Study Case)
          </h4>
          {studyCases.map((q, idx) => (
            <div key={`case-q-${idx}`} className="flex w-full flex-col text-left">
              <label
                className="font-drowner leading-relaxed font-bold tracking-widest text-[#2D2D2D]"
                style={{
                  fontSize: "var(--form-font-size)",
                  marginBottom: "var(--form-margin-bottom)",
                }}
              >
                {idx + 1}. {q} *
              </label>
              <textarea
                value={currentData[q] || ""}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => updateField(q, e.target.value)}
                placeholder="Tulis analisis dan jawaban studi kasusmu di sini..."
                className="w-full resize-y border border-gray-300 bg-white font-body text-gray-800 placeholder-gray-400 shadow-inner transition-colors outline-none focus:border-[#F4631E] focus:ring-1 focus:ring-[#F4631E]"
                style={{
                  fontSize: "var(--form-font-size)",
                  paddingTop: "var(--form-padding-y)",
                  paddingBottom: "var(--form-padding-y)",
                  paddingLeft: "var(--form-padding-x)",
                  paddingRight: "var(--form-padding-x)",
                  minHeight: "150px",
                  borderRadius: "calc(var(--form-font-size) * 0.43)",
                }}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
