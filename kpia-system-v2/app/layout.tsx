import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "KPIA SYSTEM 2",
  description: "Deconstructing the 12-tone temperament.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <body>{children}</body>
    </html>
  );
}