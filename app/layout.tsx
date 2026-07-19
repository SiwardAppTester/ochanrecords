import type { Metadata } from "next";
import { Instrument_Serif, Inter, Geist_Mono } from "next/font/google";
import { Grain } from "@/components/Grain";
import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import { Intro } from "@/components/site/Intro";
import { AmbientAudio } from "@/components/site/AmbientAudio";
import "./globals.css";

// High-contrast editorial serif for display. This is the single choice doing
// the most work to keep the site from reading as a generic Tailwind template.
const instrumentSerif = Instrument_Serif({
  variable: "--font-instrument-serif",
  subsets: ["latin"],
  weight: "400",
  style: ["normal", "italic"],
});

// Neutral grotesk for body — deliberately unopinionated so the serif leads.
const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

// Mono for cat numbers, dates, and metadata.
const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "Ocham Records",
    template: "%s — Ocham Records",
  },
  description: "An independent record label.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${instrumentSerif.variable} ${inter.variable} ${geistMono.variable} h-full`}
    >
      <body className="relative flex min-h-full flex-col">
        <Intro />
        <Header />
        {children}
        <Footer />
        <AmbientAudio />
        <Grain />
      </body>
    </html>
  );
}
