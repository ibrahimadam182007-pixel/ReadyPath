import type { Metadata, Viewport } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import { ReadyPathProvider } from "@/components/providers/readypath-store";
import "./globals.css";

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-sans",
});

export const metadata: Metadata = {
  title: "ReadyPath — Universitas AMIKOM Yogyakarta",
  description:
    "Know what you miss and by when to act for campus opportunities. Matches your student profile against scholarships, competitions, internships, and training.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#173D33",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`h-full antialiased ${plusJakartaSans.variable}`}>
      <body
        className={`${plusJakartaSans.className} min-h-screen bg-[#B7D1BA] text-rp-text flex justify-center`}
      >
        <div className="w-full max-w-[390px] min-h-screen bg-rp-bg flex flex-col border-x border-rp-border/70">
          <ReadyPathProvider>{children}</ReadyPathProvider>
        </div>
      </body>
    </html>
  );
}
