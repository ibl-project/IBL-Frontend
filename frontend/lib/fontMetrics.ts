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
 * public/fonts/HollyWoodFont/SF Hollywood Hills Bold.ttf (unitsPerEm 2048), bobot yang dipakai kartu jadwal
 * (font-hollywood font-bold). Tanpa glyph: # $ % & * + - / < = > @ \ ^ _ ` | ~.
 */
export const HOLLYWOOD_BOLD_ADVANCE: AdvanceTable = {
  " ": 0.400, "!": 0.230, "\"": 0.420, "'": 0.230, "(": 0.330, ")": 0.330, ",": 0.230, ".": 0.230,
  "0": 0.480, "1": 0.230, "2": 0.480, "3": 0.490, "4": 0.480, "5": 0.480, "6": 0.480, "7": 0.510,
  "8": 0.460, "9": 0.480, ":": 0.230, ";": 0.230, "?": 0.480, "A": 0.430, "B": 0.470, "C": 0.480,
  "D": 0.480, "E": 0.430, "F": 0.400, "G": 0.480, "H": 0.480, "I": 0.230, "J": 0.450, "K": 0.480,
  "L": 0.400, "M": 0.580, "N": 0.480, "O": 0.480, "P": 0.450, "Q": 0.480, "R": 0.480, "S": 0.480,
  "T": 0.470, "U": 0.480, "V": 0.430, "W": 0.630, "X": 0.470, "Y": 0.470, "Z": 0.480, "[": 0.330,
  "]": 0.330, "a": 0.430, "b": 0.470, "c": 0.480, "d": 0.480, "e": 0.430, "f": 0.400, "g": 0.480,
  "h": 0.480, "i": 0.230, "j": 0.450, "k": 0.480, "l": 0.400, "m": 0.580, "n": 0.480, "o": 0.480,
  "p": 0.450, "q": 0.480, "r": 0.480, "s": 0.480, "t": 0.470, "u": 0.480, "v": 0.430, "w": 0.630,
  "x": 0.470, "y": 0.470, "z": 0.480, "{": 0.370, "}": 0.370,
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
