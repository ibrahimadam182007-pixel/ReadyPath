import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "ReadyPath - Student Opportunity Eligibility & Countdown Planner",
  description:
    "Mobile-friendly planner that compares student profiles against opportunity requirements, generates gap reports, and computes countdown plans backward from deadlines.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#2563eb",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id" className="h-full antialiased">
      <body className={`${inter.className} min-h-screen bg-slate-100 text-slate-900 flex justify-center`}>
        <div className="w-full max-w-md min-h-screen bg-white shadow-xl flex flex-col border-x border-slate-200">
          {children}
        </div>
      </body>
    </html>
  );
}
