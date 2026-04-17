import type { Metadata } from "next";
import { Geist_Mono } from "next/font/google";
import "./globals.css";

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Signal",
  description:
    "Signal watches your GitHub history and tells you things about yourself you didn't notice.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${geistMono.variable} antialiased`}>
      <body className="bg-zinc-950 text-zinc-100 font-mono">{children}</body>
    </html>
  );
}
