# IBL 2K26 - Frontend Repository

Proyek ini dibangun menggunakan [Next.js](https://nextjs.org) dan merupakan antarmuka (UI) utama untuk sistem IBL 2K26.

---

## 🚀 Cara Menjalankan Project (Local Development)

Pastikan Anda berada di dalam folder `frontend` di terminal Anda, lalu jalankan perintah berikut:

```bash
# 1. Install dependencies
npm install

# 2. Jalankan development server
npm run dev
```

Buka [http://localhost:3000](http://localhost:3000) di browser untuk melihat hasilnya. Halaman akan otomatis melakukan _auto-update_ (Fast Refresh) setiap kali Anda menyimpan perubahan kode.

---

## 🔌 Dashboard Panitia & Koneksi ke Backend

Login (`/login`) dan dashboard panitia (`/teams`, `/schedule-result`, `/scoring`) mengambil data dari API di repo **IBL-Backend**. Halaman publik (`/schedule-result-main`, klasemen, leaderboard) belum tersambung.

1. Tidak perlu clone backend. Buat `.env.local` dari template: `cp .env.local.example .env.local`. **URL API (staging/produksi) tidak disimpan di repo: minta ke grup tim Webdev IBL atau Evan.** URL form registrasi (`NEXT_PUBLIC_BACKEND_URL`) sudah tidak dipakai sejak form ditutup. `.env` dan `.env.local` tidak di-commit.
2. Untuk uji, pakai URL **staging** (datanya salinan produksi). Simpan baris produksi di `.env.local` dalam keadaan di-comment; aktifkan hanya kalau memang perlu menguji dengan data asli, lalu restart `npm run dev`. `NEXT_PUBLIC_API_URL` wajib diisi: frontend selalu memakai API staging atau produksi, tidak pernah backend lokal.
3. Buka lewat **http://localhost:3000**, bukan `127.0.0.1` atau IP jaringan, supaya CORS cocok. Akun panitia diminta ke admin backend (akun staging = akun produksi). Login ke API staging/produksi dari laptop memakai cookie lintas site: sesi bertahan setelah reload hanya di browser yang mengizinkan cookie pihak ketiga (Chrome biasa); di Safari, Brave, atau incognito, reload membuat logout.

Aturan untuk kode dashboard:

- Panggil API lewat `lib/apiClient.ts` (`apiFetch`), `lib/teamsApi.ts`, atau `lib/matchesApi.ts`. Jangan memakai `fetch` langsung.
- Jangan simpan token di `localStorage` atau `sessionStorage`. Access token hanya di memori; refresh token ada di cookie httpOnly yang diurus browser.
- Menyembunyikan tombol berdasarkan role (`canEditData`) hanya untuk tampilan. Yang benar-benar menolak akses adalah API.
- Kontrak endpoint ada di repo **IBL-apidocs** (koleksi Bruno: request bisa langsung dicoba ke staging, plus Docs). Tidak perlu clone repo backend.

---

## ⚠️ Panduan Pembagian Kerja (Untuk Staff FE)

Agar alur kerja pengembangan berjalan rapi dan menghindari bentrok kode (_merge conflict_), seluruh tim diwajibkan untuk mematuhi aturan berikut:

### 🛠️ Alur Kerja Utama Staff

1. **Cek Task Assignment**: Periksa tugas komponen/section yang di-assign kepada Anda melalui GitHub / Task Manager.
2. **Buka Komponen Section**: Buka file section tugas Anda di dalam direktori `components/sections/` (misalnya `components/sections/MainPage/` atau `components/sections/RegistrationPage/`).
3. **Kerjakan Komponen**: Temukan komentar `TODO: Implementasikan...` di dalam file tersebut dan mulailah menyusun UI di sana.

### ✅ BAGIAN YANG BOLEH DIKERJAKAN STAFF

- **Hanya file `sections` tugas masing-masing**: Modifikasi hanya file section yang menjadi tanggung jawab Anda di `components/sections/`.
- **Menambahkan Aset Baru**: Menambahkan file gambar/SVG baru ke dalam folder `public/` sesuai kategorinya.

### ❌ BAGIAN YANG JANGAN DIUBAH / DISENTUH STAFF

- **JANGAN mengubah file `page.tsx` (Perakit Halaman)**: File seperti `app/page.tsx` atau `app/registration/page.tsx` bertugas sebagai perakit/canvas utama. File ini dikontrol langsung oleh **FE Lead** untuk mengatur struktur _background_ global. Jangan menambahkan _styling background/layout_ global ke dalamnya.
- **JANGAN mengubah konfigurasi inti**: Jangan menyentuh file seperti `layout.tsx`, `globals.css`, `tailwind.config.ts`, `next.config.ts`, atau `package.json` tanpa instruksi dari FE Lead.
- **JANGAN mengedit section milik staf lain**: Fokus pada tugas Anda sendiri agar proses _merge_ di Git berjalan mulus.

---

## 📁 Panduan Pengelolaan & Ekspor Aset (SVG / Gambar)

Jika section yang Anda kerjakan membutuhkan gambar atau teks berupa gambar SVG dari Figma, ikuti alur dan tempat penyimpanannya di bawah ini:

### 1. Tempat Menyimpan File Aset (Folder `public/`)

Semua aset statis disimpan di dalam direktori `public/`:

- **`public/texts/`** ➡️ Khusus untuk file SVG yang berupa **teks berdesain / judul artistik** (contoh: SVG tulisan _"OPEN TEAM REGISTRATION"_, _"COMING SOON"_, _"GET TO KNOW IBL"_, dll).
- **`public/images/`** ➡️ Khusus untuk file **ilustrasi, ornamen dekoratif, ikon, atau foto** (contoh: ilustrasi pemain basket, bola, vektor latar belakang, dll).

### 2. Cara Menggunakan Aset di Komponen Next.js

Selalu gunakan komponen `<Image />` bawaan Next.js untuk mengimpor file gambar dari folder `public/`.

```tsx
import Image from "next/image";

export const ContohSection = () => {
  return (
    <section className="w-full py-10 text-center">
      {/* Contoh memanggil SVG teks dari public/texts/ */}
      <Image src="/texts/NAMA_FILE_TEKS.svg" alt="Deskripsi Teks" width={500} height={100} />

      {/* Contoh memanggil SVG/Gambar dari public/images/ */}
      <Image src="/images/nama-ilustrasi.svg" alt="Ilustrasi Dekoratir" width={300} height={300} />
    </section>
  );
};
```

---

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.
