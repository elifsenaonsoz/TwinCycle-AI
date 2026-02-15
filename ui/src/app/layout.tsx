import type { Metadata } from "next";
import type { CSSProperties } from "react";
import "./globals.css";

export const metadata: Metadata = {
  title: "TwinCycle AI — Akıllı Cihaz Yaşam Döngüsü",
  description:
    "AI destekli cihaz değerlendirme ve sürdürülebilir seçenek önerisi platformu",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="tr" suppressHydrationWarning>
      <body
        suppressHydrationWarning
        className="antialiased"
        style={
          {
            "--font-geist-sans":
              "ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial",
            "--font-geist-mono":
              "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, Liberation Mono, Courier New",
          } as CSSProperties
        }
      >
        {children}
      </body>
    </html>
  );
}
