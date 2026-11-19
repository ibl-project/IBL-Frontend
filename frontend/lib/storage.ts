import type { FileData, RegisterFormData } from "@/types/register";

// Persistensi form pendaftaran: teks di sessionStorage, berkas (base64) di IndexedDB.
// - sessionStorage hilang otomatis saat tab/browser ditutup.
// - IndexedDB persisten, jadi dibersihkan via session marker saat sesi baru (lihat useRegistrationForm).

const FORM_STATE_KEY = "ibl_registration_form";
const SESSION_MARKER = "ibl_session_active";
const DB_NAME = "ibl_registration";
const STORE = "files";

export interface PersistedFormState {
  step: number;
  formData: RegisterFormData;
}

/* ---------- Availability probe (incognito / storage diblokir) ---------- */
export const isStorageAvailable = (): boolean => {
  try {
    const k = "__probe__";
    sessionStorage.setItem(k, "1");
    sessionStorage.removeItem(k);
    return typeof indexedDB !== "undefined";
  } catch {
    return false;
  }
};

/* ---------- sessionStorage: text form state ---------- */
export const saveFormState = (state: PersistedFormState): void => {
  try {
    sessionStorage.setItem(FORM_STATE_KEY, JSON.stringify(state));
  } catch (err) {
    // QuotaExceededError atau mode private → form tetap jalan, persist dinonaktifkan
    console.warn("[storage] gagal menyimpan form state:", err);
  }
};

export const loadFormState = (): PersistedFormState | null => {
  try {
    const raw = sessionStorage.getItem(FORM_STATE_KEY);
    return raw ? (JSON.parse(raw) as PersistedFormState) : null;
  } catch {
    return null;
  }
};

export const clearFormState = (): void => {
  try {
    sessionStorage.removeItem(FORM_STATE_KEY);
  } catch {
    /* noop */
  }
};

/* ---------- Session marker (pemicu cleanup IndexedDB) ---------- */
export const isSessionActive = (): boolean => {
  try {
    return sessionStorage.getItem(SESSION_MARKER) === "1";
  } catch {
    return false;
  }
};

export const markSessionActive = (): void => {
  try {
    sessionStorage.setItem(SESSION_MARKER, "1");
  } catch {
    /* noop */
  }
};

/* ---------- IndexedDB: berkas (base64) ---------- */
const openDB = (): Promise<IDBDatabase> =>
  new Promise((resolve, reject) => {
    let active = true;
    const timeout = setTimeout(() => {
      active = false;
      reject(new Error("IndexedDB connection timeout"));
    }, 1000); // 1s timeout to prevent hanging in iOS WebViews

    try {
      if (typeof indexedDB === "undefined") {
        clearTimeout(timeout);
        reject(new Error("IndexedDB is undefined"));
        return;
      }
      const req = indexedDB.open(DB_NAME, 1);
      req.onupgradeneeded = () => {
        if (!active) return;
        const db = req.result;
        if (!db.objectStoreNames.contains(STORE)) db.createObjectStore(STORE);
      };
      req.onsuccess = () => {
        clearTimeout(timeout);
        if (active) resolve(req.result);
        else {
          try {
            req.result.close();
          } catch {}
        }
      };
      req.onerror = () => {
        clearTimeout(timeout);
        if (active) reject(req.error || new Error("Unknown IndexedDB error"));
      };
    } catch (err) {
      clearTimeout(timeout);
      reject(err);
    }
  });

export const saveFile = async (field: string, file: FileData): Promise<void> => {
  const db = await openDB();
  await new Promise<void>((resolve, reject) => {
    const tx = db.transaction(STORE, "readwrite");
    tx.objectStore(STORE).put(file, field);
    tx.oncomplete = () => {
      db.close();
      resolve();
    };
    tx.onerror = () => reject(tx.error);
  });
};

export const deleteFile = async (field: string): Promise<void> => {
  const db = await openDB();
  await new Promise<void>((resolve, reject) => {
    const tx = db.transaction(STORE, "readwrite");
    tx.objectStore(STORE).delete(field);
    tx.oncomplete = () => {
      db.close();
      resolve();
    };
    tx.onerror = () => reject(tx.error);
  });
};

export const getAllFiles = async (): Promise<Partial<Record<string, FileData>>> => {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE, "readonly");
    const store = tx.objectStore(STORE);
    const result: Partial<Record<string, FileData>> = {};
    const cursorReq = store.openCursor();
    cursorReq.onsuccess = () => {
      const cursor = cursorReq.result;
      if (cursor) {
        result[String(cursor.key)] = cursor.value as FileData;
        cursor.continue();
      } else {
        db.close();
        resolve(result);
      }
    };
    cursorReq.onerror = () => reject(cursorReq.error);
  });
};

export const clearAllFiles = async (): Promise<void> => {
  const db = await openDB();
  await new Promise<void>((resolve, reject) => {
    const tx = db.transaction(STORE, "readwrite");
    tx.objectStore(STORE).clear();
    tx.oncomplete = () => {
      db.close();
      resolve();
    };
    tx.onerror = () => reject(tx.error);
  });
};
