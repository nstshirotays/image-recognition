import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "画像認識",
  description: "AI画像認識プログラム集",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="jp" data-theme="retro">
      <body className={inter.className}>{children}</body>
    </html>
  );
}
