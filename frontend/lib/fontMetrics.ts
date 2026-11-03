/**
 * Lebar huruf (advance width) font yang dipakai untuk nama tim, dalam em. Dipakai untuk menghitung ukuran
 * font supaya nama panjang (mis. HIMATEKTRO) muat di kotaknya tanpa mengukur DOM.
 *
 * Nilai dibaca dari tabel `hmtx` file font di public/fonts (dibagi unitsPerEm). Kalau font diganti,
 * tabelnya harus dibaca ulang.
 */

export type AdvanceTable = Readonly<Record<string, number>>;

/**
 * public/fonts/Drowner-Free.otf (unitsPerEm 1000). Font ini tidak punya glyph untuk sebagian besar tanda baca
 * (! " # ( ) - / : dll.); browser menggambarnya dengan font cadangan, jadi lebarnya tidak diketahui.
 */
export const DROWNER_ADVANCE: AdvanceTable = {
  " ": 0.200, ",": 0.090, ".": 0.101, "0": 0.476, "1": 0.286, "2": 0.442, "3": 0.451, "4": 0.484,
  "5": 0.457, "6": 0.491, "7": 0.449, "8": 0.488, "9": 0.461, "A": 0.612, "B": 0.580, "C": 0.540,
  "D": 0.624, "E": 0.485, "F": 0.473, "G": 0.604, "H": 0.631, "I": 0.217, "J": 0.430, "K": 0.602,
  "L": 0.481, "M": 0.729, "N": 0.605, "O": 0.635, "P": 0.566, "Q": 0.631, "R": 0.568, "S": 0.496,
  "T": 0.485, "U": 0.560, "V": 0.555, "W": 0.847, "X": 0.562, "Y": 0.569, "Z": 0.532, "a": 0.480,
  "b": 0.490, "c": 0.450, "d": 0.494, "e": 0.468, "f": 0.284, "g": 0.491, "h": 0.442, "i": 0.126,
  "j": 0.145, "k": 0.428, "l": 0.134, "m": 0.772, "n": 0.458, "o": 0.502, "p": 0.487, "q": 0.488,
  "r": 0.297, "s": 0.408, "t": 0.280, "u": 0.467, "v": 0.459, "w": 0.716, "x": 0.444, "y": 0.436,
  "z": 0.413,
};

/**
 * Lebar teks dalam em: jumlah lebar huruf + letter-spacing per huruf (CSS juga menambah spasi setelah huruf
 * terakhir). Huruf yang tidak ada di tabel dihitung selebar huruf terlebar, supaya hasilnya tidak pernah
 * lebih kecil dari lebar sebenarnya (lebih baik sedikit mengecil daripada terpotong).
 */
export function textWidthEm(advances: AdvanceTable, text: string, letterSpacingEm: number): number {
  const fallback = Math.max(...Object.values(advances));
  let width = 0;
  for (const char of text) width += (advances[char] ?? fallback) + letterSpacingEm;
  return width;
}
