import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Menu Roulette",
  description: "Pick a vibe. Spin the wheel. Let your friends decide what you eat.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${inter.className} min-h-screen bg-[#0a0a0a]`}>
        {children}
      </body>
    </html>
  );
}