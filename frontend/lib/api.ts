import { FileData, RegisterFormData, UploadData } from "@/types/register";

import { DIVISION_QUESTIONS } from "../constants/questions";

/**
 * Submits the registration data along with base64-encoded files to the Google Apps Script Web App.
 *
 * @param url The deployed Google Apps Script Web App URL
 * @param formData The compiled registration form data
 * @param rawFiles Map of base64-encoded file data
 */
export async function submitRegistration(
  url: string,
  formData: RegisterFormData,
  rawFiles: Partial<Record<keyof UploadData, FileData>>,
) {
  // Compile the final payload
  const payload = {
    nama: formData.informasiUmum.nama,
    nrp: formData.informasiUmum.nrp,
    whatsapp: formData.informasiUmum.whatsapp,
    lineId: formData.informasiUmum.lineId,
    departemen: formData.informasiUmum.departemen,
    angkatan: formData.informasiUmum.angkatan,
    subdivisi1: formData.informasiUmum.subdivisi1,
    subdivisi2: formData.informasiUmum.subdivisi2,

    // New essay & general questions answers
    kelebihanKekurangan: formData.informasiUmum.kelebihanKekurangan,
    halUnik: formData.informasiUmum.halUnik,
    generalAnswers: Object.entries(formData.pertanyaanGeneral).map(([q, ans]) => ({
      question: q,
      answer: ans,
    })),

    // Convert subdivisiAnswers to structured format for backend
    answers1: Object.entries(formData.subdivisi1).map(([q, ans]) => ({
      question: q,
      answer: ans,
      isStudyCase: isStudyCaseQuestion(formData.informasiUmum.subdivisi1, q),
    })),

    answers2: Object.entries(formData.subdivisi2).map(([q, ans]) => ({
      question: q,
      answer: ans,
      isStudyCase: isStudyCaseQuestion(formData.informasiUmum.subdivisi2, q),
    })),

    files: rawFiles,
  };

  const response = await fetch(url, {
    method: "POST",
    mode: "cors",
    headers: {
      "Content-Type": "text/plain;charset=utf-8", // GAS doPost prefers text/plain or no-cors content types
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error(`HTTP error! Status: ${response.status}`);
  }

  const result = await response.json();
  if (result.status === "error") {
    throw new Error(result.message || "Failed to submit registration");
  }

  return result;
}

// Simple helper to check if a question belongs to study case
function isStudyCaseQuestion(division: string, question: string): boolean {
  try {
    const divData = DIVISION_QUESTIONS[division];
    if (divData && divData.studyCases) {
      return divData.studyCases.includes(question);
    }
  } catch {
    // fallback
  }
  return false;
}
