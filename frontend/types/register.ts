// TypeScript types & interfaces untuk form pendaftaran IBL

export interface StepData {
  [key: string]: string;
}

export interface FileData {
  name: string;
  mimeType: string;
  base64: string;
}

export interface UploadData {
  cv: string;
  ktm: string;
  twibbon: string;
  buktiFollow: string;
  portofolio: string;
}

export interface RegisterFormData {
  informasiUmum: StepData;
  pertanyaanGeneral: StepData;
  subdivisi1: StepData;
  subdivisi2: StepData;
  uploadBerkas: UploadData;
}

export interface CountdownTime {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}
