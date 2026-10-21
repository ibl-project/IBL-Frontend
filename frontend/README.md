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

Buka [http://localhost:3000](http://localhost:3000) di browser untuk melihat hasilnya. Halaman akan otomatis melakukan *auto-update* (Fast Refresh) setiap kali Anda menyimpan perubahan kode.

---

## 🔌 Dashboard Panitia & Koneksi ke Backend

Login (`/login`) dan dashboard panitia (`/teams`, `/schedule-result`, `/scoring`) mengambil data dari API di repo **IBL-Backend**. Halaman publik (`/schedule-result-main`, klasemen, leaderboard) belum tersambung.

1. Jalankan backend lebih dulu sesuai `SETUP.md` di repo IBL-Backend, lalu cek [http://localhost:4000/api/health](http://localhost:4000/api/health).
2. Alamat API diambil dari `NEXT_PUBLIC_API_URL`. Di mode dev, tanpa variabel ini otomatis `http://localhost:4000/api`. Untuk menggantinya, tambahkan satu baris itu di `.env.local`. Jangan menyalin seluruh `.env.local.example`, karena placeholder `NEXT_PUBLIC_BACKEND_URL` di dalamnya akan menimpa URL form registrasi di `.env`.
3. Buka lewat **http://localhost:3000**, bukan `127.0.0.1` atau IP jaringan, supaya cookie login dan CORS cocok. Akun panitia diminta ke admin backend.

Aturan untuk kode dashboard:
- Panggil API lewat `lib/apiClient.ts` (`apiFetch`), `lib/teamsApi.ts`, atau `lib/matchesApi.ts`. Jangan memakai `fetch` langsung.
- Jangan simpan token di `localStorage` atau `sessionStorage`. Access token hanya di memori; refresh token ada di cookie httpOnly yang diurus browser.
- Menyembunyikan tombol berdasarkan role (`canEditData`) hanya untuk tampilan. Yang benar-benar menolak akses adalah API.
- Kontrak endpoint ada di `docs/API.md` repo IBL-Backend.

---

## ⚠️ Panduan Pembagian Kerja (Untuk Staff FE)

Agar alur kerja pengembangan berjalan rapi dan menghindari bentrok kode (*merge conflict*), seluruh tim diwajibkan untuk mematuhi aturan berikut:

### 🛠️ Alur Kerja Utama Staff
1. **Cek Task Assignment**: Periksa tugas komponen/section yang di-assign kepada Anda melalui GitHub / Task Manager.
2. **Buka Komponen Section**: Buka file section tugas Anda di dalam direktori `components/sections/` (misalnya `components/sections/MainPage/` atau `components/sections/RegistrationPage/`).
3. **Kerjakan Komponen**: Temukan komentar `TODO: Implementasikan...` di dalam file tersebut dan mulailah menyusun UI di sana.

### ✅ BAGIAN YANG BOLEH DIKERJAKAN STAFF
- **Hanya file `sections` tugas masing-masing**: Modifikasi hanya file section yang menjadi tanggung jawab Anda di `components/sections/`.
- **Menambahkan Aset Baru**: Menambahkan file gambar/SVG baru ke dalam folder `public/` sesuai kategorinya.

### ❌ BAGIAN YANG JANGAN DIUBAH / DISENTUH STAFF
- **JANGAN mengubah file `page.tsx` (Perakit Halaman)**: File seperti `app/page.tsx` atau `app/registration/page.tsx` bertugas sebagai perakit/canvas utama. File ini dikontrol langsung oleh **FE Lead** untuk mengatur struktur *background* global. Jangan menambahkan *styling background/layout* global ke dalamnya.
- **JANGAN mengubah konfigurasi inti**: Jangan menyentuh file seperti `layout.tsx`, `globals.css`, `tailwind.config.ts`, `next.config.ts`, atau `package.json` tanpa instruksi dari FE Lead.
- **JANGAN mengedit section milik staf lain**: Fokus pada tugas Anda sendiri agar proses *merge* di Git berjalan mulus.

---

## 📁 Panduan Pengelolaan & Ekspor Aset (SVG / Gambar)

Jika section yang Anda kerjakan membutuhkan gambar atau teks berupa gambar SVG dari Figma, ikuti alur dan tempat penyimpanannya di bawah ini:

### 1. Tempat Menyimpan File Aset (Folder `public/`)
Semua aset statis disimpan di dalam direktori `public/`:
* **`public/texts/`** ➡️ Khusus untuk file SVG yang berupa **teks berdesain / judul artistik** (contoh: SVG tulisan *"OPEN TEAM REGISTRATION"*, *"COMING SOON"*, *"GET TO KNOW IBL"*, dll).
* **`public/images/`** ➡️ Khusus untuk file **ilustrasi, ornamen dekoratif, ikon, atau foto** (contoh: ilustrasi pemain basket, bola, vektor latar belakang, dll).

### 2. Cara Menggunakan Aset di Komponen Next.js
Selalu gunakan komponen `<Image />` bawaan Next.js untuk mengimpor file gambar dari folder `public/`.

```tsx
import Image from "next/image";

export const ContohSection = () => {
  return (
    <section className="w-full text-center py-10">
      {/* Contoh memanggil SVG teks dari public/texts/ */}
      <Image 
        src="/texts/NAMA_FILE_TEKS.svg" 
        alt="Deskripsi Teks" 
        width={500} 
        height={100} 
      />

      {/* Contoh memanggil SVG/Gambar dari public/images/ */}
      <Image 
        src="/images/nama-ilustrasi.svg" 
        alt="Ilustrasi Dekoratir" 
        width={300} 
        height={300} 
      />
    </section>
  );
};
```

---

## Learn More

To learn more about Next.js, take a look at the following resources:
- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.
