import { useCallback, useEffect, useState } from "react";

import { errorMessage } from "@/lib/teamsApi";

export type AsyncState<T> =
  | { status: "loading" }
  | { status: "error"; message: string }
  | { status: "ready"; data: T };

/**
 * Muat data dari backend dan simpan statusnya (loading / error / ready).
 *
 * `load` harus stabil (bungkus dengan useCallback), karena data dimuat ulang
 * setiap kali `load` berubah. `reload()` memuat ulang tanpa mengosongkan data
 * yang sedang tampil, jadi layar tidak berkedip setelah simpan/hapus.
 */
export function useAsyncData<T>(load: () => Promise<T>) {
  const [state, setState] = useState<AsyncState<T>>({ status: "loading" });
  const [version, setVersion] = useState(0);

  useEffect(() => {
    let active = true;
    load().then(
      (data) => {
        if (active) setState({ status: "ready", data });
      },
      (error: unknown) => {
        if (active) setState({ status: "error", message: errorMessage(error) });
      },
    );
    return () => {
      active = false;
    };
  }, [load, version]);

  const reload = useCallback(() => setVersion((value) => value + 1), []);

  return { state, reload, setState };
}
