import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import { Poppins } from "next/font/google";
import "./globals.css";
import { PublicLayoutWrapper } from "@/components/layout/PublicLayoutWrapper";

const poppins = Poppins({
  weight: ["400", "500", "600", "700", "800"],
  subsets: ["latin"],
  variable: "--font-poppins",
  display: "swap",
});

const hollywood = localFont({
  src: [
    {
      path: "../public/fonts/HollyWoodFont/SF Hollywood Hills.ttf",
      weight: "400",
      style: "normal",
    },
    {
      path: "../public/fonts/HollyWoodFont/SF Hollywood Hills Bold.ttf", 
      weight: "700",
      style: "normal",
    },
    {
      path: "../public/fonts/HollyWoodFont/SF Hollywood Hills Italic.ttf",
      weight: "400",
      style: "italic",
    },
    {
      path: "../public/fonts/HollyWoodFont/SF Hollywood Hills Bold Italic.ttf",
      weight: "700",
      style: "italic",
    },
  ],
  variable: "--font-hollywood",
  display: "swap",
});

const crosner = localFont({
  src: "../public/fonts/Crosner-Regular-FREE.otf",
  variable: "--font-crosner",
  display: "swap",
});

const drowner = localFont({
  src: "../public/fonts/Drowner-Free.otf",
  variable: "--font-drowner",
  display: "swap",
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export const metadata: Metadata = {
  title: "IBL 2K26 | Open Recruitment Staff UKM Basket ITS",
  description: "Daftarkan diri kamu di IBL 2K26 — Open Recruitment Staff untuk ITS Basketball League tahun 2026. Acara tahunan UKM Basket Institut Teknologi Sepuluh Nopember.",
  keywords: ["IBL", "ITS Basketball League", "Open Recruitment", "UKM Basket ITS", "2K26"],
  openGraph: {
    title: "IBL 2K26 | Open Recruitment Staff",
    description: "Daftar sekarang untuk Open Recruitment Staff IBL 2K26!",
    type: "website",
    locale: "id_ID",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${hollywood.variable} ${crosner.variable} ${drowner.variable} ${poppins.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <head>
        {/* Scale up content proportionally for viewports wider than 1440px */}
        {/* zoom = viewport/1440 so blank gutters disappear and content fills screen */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                function applyZoom() {
                  var w = window.innerWidth || document.documentElement.clientWidth;
                  if (w > 1440) {
                    document.documentElement.style.zoom = (w / 1440).toFixed(6);
                  } else {
                    document.documentElement.style.zoom = '';
                  }
                }
                applyZoom();
                window.addEventListener('resize', applyZoom);
              })();
            `,
          }}
        />
      </head>
      <body className="relative min-h-full flex flex-col overflow-x-hidden">
        <PublicLayoutWrapper>{children}</PublicLayoutWrapper>
      </body>
    </html>
  );
}
