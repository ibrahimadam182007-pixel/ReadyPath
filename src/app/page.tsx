import React from "react";
import Link from "next/link";
import { CheckCircle2, Clock, Sparkles, AlertCircle, ArrowRight } from "lucide-react";

export default function HomePage() {
  return (
    <main className="flex-1 flex flex-col p-5">
      {/* Prototype Disclaimer Banner */}
      <div className="mb-4 flex items-start gap-2.5 rounded-lg border border-amber-200 bg-amber-50 p-3 text-xs text-amber-900">
        <AlertCircle className="h-4 w-4 shrink-0 text-amber-600 mt-0.5" />
        <div>
          <span className="font-semibold">Purwarupa (Prototype V1):</span> Memuat 15–20 data peluang resmi dengan perhitungan deterministik tanpa tebakan AI.
        </div>
      </div>

      {/* Header / Brand */}
      <header className="mb-6">
        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-semibold mb-2">
          <Sparkles className="h-3.5 w-3.5" />
          <span>ReadyPath V1</span>
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">
          Ukur Kesiapan & Rancang Countdown Peluangmu
        </h1>
        <p className="mt-2 text-sm text-slate-600 leading-relaxed">
          Bandingkan profil akademikmu dengan persyaratan beasiswa atau magang impian, dapatkan Gap Report akurat, dan susun target mundur sebelum deadline.
        </p>
      </header>

      {/* 4 Core Steps Card */}
      <section className="mb-6 space-y-3">
        <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-500">
          Alur Kerja Utama
        </h2>

        <div className="space-y-2.5">
          <div className="flex items-start gap-3 rounded-xl border border-slate-200 p-3.5 bg-slate-50/50">
            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-blue-600 text-xs font-bold text-white">1</span>
            <div>
              <h3 className="text-sm font-semibold text-slate-900">Isi Profil Akademik</h3>
              <p className="text-xs text-slate-500 mt-0.5">Semester saat ini, IPK kumulatif, sertifikat aktif (dengan masa berlaku), dan pengalaman.</p>
            </div>
          </div>

          <div className="flex items-start gap-3 rounded-xl border border-slate-200 p-3.5 bg-slate-50/50">
            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-blue-600 text-xs font-bold text-white">2</span>
            <div>
              <h3 className="text-sm font-semibold text-slate-900">Pilih Target Peluang</h3>
              <p className="text-xs text-slate-500 mt-0.5">Katalog 15–20 peluang terkurasi lengkap dengan link pengumuman resmi & tanggal verifikasi.</p>
            </div>
          </div>

          <div className="flex items-start gap-3 rounded-xl border border-slate-200 p-3.5 bg-slate-50/50">
            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-blue-600 text-xs font-bold text-white">3</span>
            <div>
              <h3 className="text-sm font-semibold text-slate-900">Cek Gap Report</h3>
              <p className="text-xs text-slate-500 mt-0.5">Evaluasi status Met / Not Met secara transparan dan terukur tanpa tebakan.</p>
            </div>
          </div>

          <div className="flex items-start gap-3 rounded-xl border border-slate-200 p-3.5 bg-slate-50/50">
            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-blue-600 text-xs font-bold text-white">4</span>
            <div>
              <h3 className="text-sm font-semibold text-slate-900">Countdown Plan & Reminder</h3>
              <p className="text-xs text-slate-500 mt-0.5">Hitung mundur deadline, target IPK semester depan, dan jadwal pengingat email otomatis.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Action CTA */}
      <div className="mt-auto pt-4 border-t border-slate-100 flex flex-col gap-2.5">
        <button
          type="button"
          className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-3.5 text-sm font-semibold text-white shadow-md hover:bg-blue-700 active:scale-[0.99] transition"
        >
          <span>Mulai Isi Profil</span>
          <ArrowRight className="h-4 w-4" />
        </button>
        <p className="text-center text-[11px] text-slate-400">
          Inisialisasi Fase 1 Project ReadyPath
        </p>
      </div>
    </main>
  );
}
