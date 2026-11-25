import type { EngineOpportunityTarget } from "@/lib/engine";

export type UiOpportunityCategory =
  | "Scholarship"
  | "Competition"
  | "Internship"
  | "Training";

export interface PrototypeOpportunity extends EngineOpportunityTarget {
  slug: string;
  organizer: string;
  category: UiOpportunityCategory;
  summary: string;
  sourceUrl: string;
  lastVerifiedAt: Date;
  isPrototype: true;
  highlights: string[];
}

/**
 * 15 Verified Official Opportunities (Scholarship, Training, Internship)
 * Curated from official ministerial guides, state institutions, SOEs, and foundation announcements (2026 Cycle).
 * Source: Kompilasi 15 Peluang Resmi Beasiswa & Magang 2026.
 */
export const PROTOTYPE_OPPORTUNITIES: PrototypeOpportunity[] = [
  // 1. Beasiswa Unggulan Kemendikdasmen
  {
    id: "opp-beasiswa-unggulan-kemendikdasmen-2026",
    slug: "beasiswa-unggulan-kemendikdasmen-2026",
    title: "Beasiswa Unggulan (Masyarakat Berprestasi & Disabilitas)",
    organizer: "Kemendikdasmen RI",
    category: "Scholarship",
    summary:
      "Beasiswa gelar dari Kemendikdasmen untuk mahasiswa berprestasi jenjang S1/D4 (maksimal 2 tahun kelulusan SMA) atau mahasiswa aktif S2/S3 di perguruan tinggi terakreditasi minimal B/Baik Sekali.",
    deadline: new Date("2026-08-24T23:59:59Z"),
    sourceUrl: "https://beasiswaunggulan.kemendikdasmen.go.id",
    lastVerifiedAt: new Date("2026-11-20T00:00:00Z"),
    isPrototype: true,
    highlights: [
      "Pembiayaan penuh UKT/SPP dan uang saku biaya hidup bulanan",
      "Terbuka bagi mahasiswa baru & on-going maksimal semester 3",
      "Wajib melampirkan sertifikat UKBI resmi predikat Madya/Unggul",
    ],
    rule: {
      minSemester: 1,
      maxSemester: 3,
      minGpa: 3.0,
      minExperienceMonths: 0,
      allowedExperienceCategories: [],
      targetDegrees: ["D4", "S1", "S2"],
      eligibleMajors: ["ALL"],
      requiredCertificates: [
        {
          id: "req-ukbi",
          category: "OTHER_LANGUAGE",
          label: "Sertifikat Uji Kemahiran Berbahasa Indonesia (UKBI)",
          acceptedCodes: [
            { code: "UKBI", displayName: "UKBI Kemendikbud", minScore: 578 },
          ],
          mustBeValidUntilDaysAfterDeadline: 0,
          estPrepAndResultDays: 30,
        },
      ],
    },
  },

  // 2. Beasiswa LPDP Tahap 2
  {
    id: "opp-lpdp-tahap-2-2026",
    slug: "beasiswa-lpdp-tahap-2-2026",
    title: "Beasiswa LPDP Tahap 2 (STEM, SHARE, & Afirmasi)",
    organizer: "LPDP Kementerian Keuangan RI",
    category: "Scholarship",
    summary:
      "Program beasiswa penuh magister (S2) dan doktor (S3) dari Kementerian Keuangan RI untuk mencetak pemimpin masa depan di bidang prioritas nasional STEM, SHARE, dan Afirmasi.",
    deadline: new Date("2026-07-31T23:59:59Z"),
    sourceUrl: "https://lpdp.kemenkeu.go.id",
    lastVerifiedAt: new Date("2026-11-20T00:00:00Z"),
    isPrototype: true,
    highlights: [
      "Beasiswa Magister & Doktor fully funded di dalam maupun luar negeri",
      "Mencakup seluruh biaya kuliah, biaya hidup bulanan, tunjangan tesis, dan asuransi",
      "Memerlukan sertifikat kemahiran bahasa Inggris internasional (IELTS / TOEFL)",
    ],
    rule: {
      minSemester: 7,
      maxSemester: 8,
      minGpa: 3.0,
      minExperienceMonths: 0,
      allowedExperienceCategories: [],
      targetDegrees: ["S1", "D4", "S2"],
      eligibleMajors: ["ALL"],
      requiredCertificates: [
        {
          id: "req-lpdp-english",
          category: "ENGLISH_PROFICIENCY",
          label: "Sertifikat Kemampuan Bahasa Inggris (IELTS / TOEFL iBT / PTE)",
          acceptedCodes: [
            { code: "IELTS", displayName: "IELTS Academic", minScore: 6.5 },
            { code: "TOEFL_IBT", displayName: "TOEFL iBT", minScore: 80 },
            { code: "PTE_ACADEMIC", displayName: "PTE Academic", minScore: 58 },
          ],
          mustBeValidUntilDaysAfterDeadline: 0,
          estPrepAndResultDays: 60,
        },
      ],
    },
  },

  // 3. Beasiswa Pendidikan Indonesia (BPI) GTK
  {
    id: "opp-bpi-gtk-kemendikdasmen-2026",
    slug: "beasiswa-pendidikan-indonesia-bpi-gtk-2026",
    title: "Beasiswa Pendidikan Indonesia (BPI) Calon Guru GTK",
    organizer: "Kemendikdasmen RI",
    category: "Scholarship",
    summary:
      "Program beasiswa gelar D4/S1 untuk calon pendidik dan guru aktif di bawah naungan Ditjen GTK Kemendikdasmen guna mempercepat ketersediaan tenaga pendidik unggul.",
    deadline: new Date("2026-08-17T23:59:59Z"),
    sourceUrl: "https://beasiswa.kemendikdasmen.go.id",
    lastVerifiedAt: new Date("2026-11-20T00:00:00Z"),
    isPrototype: true,
    highlights: [
      "Pembiayaan penuh biaya kuliah untuk calon guru dan pendidik berprestasi",
      "Memerlukan LoA Unconditional di program studi prioritas kependidikan",
      "Bantuan biaya hidup, tunjangan buku, dan dana darurat",
    ],
    rule: {
      minSemester: 1,
      maxSemester: 3,
      minGpa: 3.0,
      minExperienceMonths: 0,
      allowedExperienceCategories: [],
      targetDegrees: ["D4", "S1"],
      eligibleMajors: ["ALL"],
      requiredCertificates: [],
    },
  },

  // 4. Djarum Beasiswa Plus
  {
    id: "opp-djarum-beasiswa-plus-2026",
    slug: "djarum-beasiswa-plus-2026",
    title: "Djarum Beasiswa Plus",
    organizer: "Djarum Foundation",
    category: "Scholarship",
    summary:
      "Beasiswa prestasi untuk mahasiswa aktif semester 4 di perguruan tinggi mitra Djarum Foundation, dilengkapi pelatihan soft skills kepemimpinan, karakter, dan nation building.",
    deadline: new Date("2026-06-10T23:59:59Z"),
    sourceUrl: "https://djarumbeasiswaplus.org",
    lastVerifiedAt: new Date("2026-11-20T00:00:00Z"),
    isPrototype: true,
    highlights: [
      "Bantuan finansial Rp 1.000.000/bulan selama 1 tahun penuh",
      "Program eksklusif Character Building, Leadership Development, dan Nation Building",
      "Khusus mahasiswa aktif semester 4 dengan IPK min. 3.00 di semester 3",
    ],
    rule: {
      minSemester: 4,
      maxSemester: 4,
      minGpa: 3.0,
      minExperienceMonths: 6,
      allowedExperienceCategories: ["ORGANIZATION", "VOLUNTEER"],
      targetDegrees: ["D4", "S1"],
      eligibleMajors: ["ALL"],
      requiredCertificates: [],
    },
  },

  // 5. Beasiswa Bank Indonesia (Reguler & Unggulan)
  {
    id: "opp-beasiswa-bank-indonesia-2026",
    slug: "beasiswa-bank-indonesia-2026",
    title: "Beasiswa Bank Indonesia (Reguler & Unggulan)",
    organizer: "Bank Indonesia",
    category: "Scholarship",
    summary:
      "Beasiswa biaya pendidikan dan wadah pengembangan kepemimpinan komunitas Generasi Baru Indonesia (GenBI) bagi mahasiswa S1/D4 dan D3 di perguruan tinggi mitra Bank Indonesia.",
    deadline: new Date("2026-05-31T23:59:59Z"),
    sourceUrl: "https://www.bi.go.id",
    lastVerifiedAt: new Date("2026-11-20T00:00:00Z"),
    isPrototype: true,
    highlights: [
      "Uang saku bulanan Rp 1.000.000 selama 1 tahun (dapat diperpanjang)",
      "Keanggotaan eksklusif komunitas Generasi Baru Indonesia (GenBI)",
      "Minimal telah menyelesaikan 40 SKS (semester 3 S1/D4 atau semester 2 D3)",
    ],
    rule: {
      minSemester: 3,
      maxSemester: 6,
      minGpa: 3.0,
      minExperienceMonths: 6,
      allowedExperienceCategories: ["ORGANIZATION", "VOLUNTEER"],
      targetDegrees: ["D3", "D4", "S1"],
      eligibleMajors: ["ALL"],
      requiredCertificates: [],
    },
  },

  // 6. Program TELADAN (Tanoto Foundation)
  {
    id: "opp-tanoto-teladan-2026",
    slug: "tanoto-teladan-fellowship-2026",
    title: "Program TELADAN (Tanoto Foundation)",
    organizer: "Tanoto Foundation",
    category: "Scholarship",
    summary:
      "Program beasiswa kepemimpinan transformasional untuk mahasiswa reguler S1 semester 1 di 10 Perguruan Tinggi Mitra (UI, ITB, UGM, IPB, Undip, Unair, UB, Unhas, USU, Unri).",
    deadline: new Date("2026-09-07T23:59:59Z"),
    sourceUrl: "https://tanotofoundation.org",
    lastVerifiedAt: new Date("2026-11-20T00:00:00Z"),
    isPrototype: true,
    highlights: [
      "Biaya kuliah penuh (UKT) dibayarkan langsung s.d Semester 8",
      "Tunjangan biaya hidup bulanan dan program kepemimpinan berjenjang 3 tahun",
      "Kesempatan magang global, sponsorship riset, dan pertukaran pelajar",
    ],
    rule: {
      minSemester: 1,
      maxSemester: 1,
      minGpa: 3.0,
      minExperienceMonths: 0,
      allowedExperienceCategories: [],
      targetDegrees: ["S1"],
      eligibleMajors: ["ALL"],
      requiredCertificates: [],
    },
  },

  // 7. BSI Scholarship (Inspirasi & Afirmasi)
  {
    id: "opp-bsi-scholarship-2026",
    slug: "bsi-scholarship-inspirasi-afirmasi-2026",
    title: "BSI Scholarship (Inspirasi & Afirmasi)",
    organizer: "BSI Maslahat / Bank Syariah Indonesia",
    category: "Scholarship",
    summary:
      "Bantuan biaya pendidikan UKT dan uang saku bulanan dari BSI Maslahat untuk mahasiswa aktif semester 3 di kampus mitra BSI, ditujukan bagi keluarga pra-sejahtera berprestasi.",
    deadline: new Date("2026-08-31T23:59:59Z"),
    sourceUrl: "https://bsischolarship.id",
    lastVerifiedAt: new Date("2026-11-20T00:00:00Z"),
    isPrototype: true,
    highlights: [
      "Bantuan UKT semester dan uang saku bulanan selama 2 tahun akademik",
      "Pembinaan literasi perbankan syariah, social project, dan mentorship kepemimpinan",
      "Wajib melampirkan Surat Keterangan Tidak Mampu (SKTM) resmi",
    ],
    rule: {
      minSemester: 3,
      maxSemester: 3,
      minGpa: 3.0,
      minExperienceMonths: 0,
      allowedExperienceCategories: [],
      targetDegrees: ["S1"],
      eligibleMajors: ["ALL"],
      requiredCertificates: [],
    },
  },

  // 8. Beasiswa Cendekia BAZNAS (BCB) Dalam Negeri
  {
    id: "opp-bcb-baznas-2026",
    slug: "beasiswa-cendekia-baznas-bcb-2026",
    title: "Beasiswa Cendekia BAZNAS (BCB) Dalam Negeri",
    organizer: "BAZNAS RI",
    category: "Scholarship",
    summary:
      "Beasiswa subsidi biaya pendidikan dan pembinaan karakter bulanan bagi mahasiswa aktif S1 semester 5 di 191 perguruan tinggi mitra BAZNAS RI di seluruh Indonesia.",
    deadline: new Date("2026-09-30T23:59:59Z"),
    sourceUrl: "https://beasiswa.baznas.go.id",
    lastVerifiedAt: new Date("2026-11-20T00:00:00Z"),
    isPrototype: true,
    highlights: [
      "Subsidi UKT maksimal Rp 3.000.000 per semester hingga semester 8",
      "Uang saku bulanan dan pembinaan pengembangan diri berkala dari BAZNAS",
      "Prioritas bidang studi STEM & SHARE (Sosial Humaniora & Keagamaan)",
    ],
    rule: {
      minSemester: 5,
      maxSemester: 5,
      minGpa: 3.0,
      minExperienceMonths: 0,
      allowedExperienceCategories: [],
      targetDegrees: ["S1"],
      eligibleMajors: ["ALL"],
      requiredCertificates: [],
    },
  },

  // 9. Beasiswa Pertamina Sobat Bumi
  {
    id: "opp-pertamina-sobat-bumi-2026",
    slug: "beasiswa-pertamina-sobat-bumi-2026",
    title: "Beasiswa Pertamina Sobat Bumi",
    organizer: "Pertamina Foundation",
    category: "Scholarship",
    summary:
      "Apresiasi beasiswa untuk mahasiswa berprestasi dan peduli pelestarian lingkungan hidup dari Pertamina Foundation di puluhan universitas mitra se-Indonesia.",
    deadline: new Date("2026-05-31T23:59:59Z"),
    sourceUrl: "https://pertaminafoundation.org",
    lastVerifiedAt: new Date("2026-11-20T00:00:00Z"),
    isPrototype: true,
    highlights: [
      "Bantuan biaya pendidikan UKT dan uang saku bulanan",
      "Aksi Solidaritas Sobat Bumi (Green Action & Desa Energi Berdikari)",
      "Memerlukan karya tulis bertema kelestarian lingkungan hidup",
    ],
    rule: {
      minSemester: 2,
      maxSemester: 6,
      minGpa: 3.0,
      minExperienceMonths: 6,
      allowedExperienceCategories: ["ORGANIZATION", "VOLUNTEER"],
      targetDegrees: ["D3", "D4", "S1"],
      eligibleMajors: ["ALL"],
      requiredCertificates: [],
    },
  },

  // 10. Digital Talent Scholarship (DTS) – Komdigi
  {
    id: "opp-dts-komdigi-2026",
    slug: "digital-talent-scholarship-dts-komdigi-2026",
    title: "Digital Talent Scholarship (DTS) – Digital Talent Academy",
    organizer: "Kementerian Komunikasi dan Digital RI",
    category: "Training",
    summary:
      "Program pelatihan intensif dan sertifikasi kompetensi digital berstandar global (AI, Cloud, Cybersecurity, Big Data) gratis dari Kementerian Komunikasi dan Digital RI.",
    deadline: new Date("2026-12-31T23:59:59Z"),
    sourceUrl: "https://digitalent.komdigi.go.id",
    lastVerifiedAt: new Date("2026-11-20T00:00:00Z"),
    isPrototype: true,
    highlights: [
      "Pelatihan daring gratis bersama mitra global (Google, AWS, Microsoft, Cisco)",
      "Voucher sertifikasi internasional gratis bagi peserta berprestasi",
      "Terbuka bagi mahasiswa D3/D4/S1 dan umum tanpa batas minimal IPK",
    ],
    rule: {
      minSemester: 1,
      maxSemester: 8,
      minGpa: 0.0,
      minExperienceMonths: 0,
      allowedExperienceCategories: [],
      targetDegrees: ["D3", "D4", "S1", "S2"],
      eligibleMajors: ["ALL"],
      requiredCertificates: [],
    },
  },

  // 11. Program Pemagangan Nasional (MagangHub Kemnaker)
  {
    id: "opp-maganghub-kemnaker-2026",
    slug: "program-pemagangan-nasional-maganghub-2026",
    title: "Program Pemagangan Nasional (MagangHub) Batch 3B",
    organizer: "Kementerian Ketenagakerjaan RI",
    category: "Internship",
    summary:
      "Program magang industri resmi bersertifikasi pemerintah untuk fresh graduate dan mahasiswa tingkat akhir, dibekali uang saku setara UMK serta perlindungan jaminan sosial BPJS.",
    deadline: new Date("2026-12-01T23:59:59Z"),
    sourceUrl: "https://maganghub.kemnaker.go.id",
    lastVerifiedAt: new Date("2026-11-20T00:00:00Z"),
    isPrototype: true,
    highlights: [
      "Pendaftaran Batch 3B aktif: 23 November – 1 Desember 2026",
      "Uang saku bulanan setara UMK setempat dan jaminan BPJS Ketenagakerjaan",
      "Durasi magang 6 bulan dengan sertifikat pemagangan resmi Kemnaker RI",
    ],
    rule: {
      minSemester: 7,
      maxSemester: 8,
      minGpa: 2.75,
      minExperienceMonths: 0,
      allowedExperienceCategories: [],
      targetDegrees: ["D3", "D4", "S1"],
      eligibleMajors: ["ALL"],
      requiredCertificates: [],
    },
  },

  // 12. MAGENTA BUMN
  {
    id: "opp-magenta-bumn-2026",
    slug: "magenta-bumn-magang-generasi-bertalenta-2026",
    title: "MAGENTA BUMN (Magang Generasi Bertalenta)",
    organizer: "Kementerian BUMN & FHCI",
    category: "Internship",
    summary:
      "Platform magang terintegrasi resmi di ratusan Badan Usaha Milik Negara (BUMN) se-Indonesia dengan skema Magang Umum, Magang Bersertifikat BUMN, dan Magang Santri.",
    deadline: new Date("2026-12-31T23:59:59Z"),
    sourceUrl: "https://magenta.bumn.go.id",
    lastVerifiedAt: new Date("2026-11-20T00:00:00Z"),
    isPrototype: true,
    highlights: [
      "Peluang penempatan di BUMN ternama (Telkom, Pertamina, Mandiri, BRI, PLN)",
      "Sertifikat resmi tanda tamat magang yang diakui FHCI BUMN",
      "Dukungan konversi SKS Kampus Merdeka / MBKM",
    ],
    rule: {
      minSemester: 4,
      maxSemester: 8,
      minGpa: 2.75,
      minExperienceMonths: 0,
      allowedExperienceCategories: [],
      targetDegrees: ["D3", "D4", "S1", "S2"],
      eligibleMajors: ["ALL"],
      requiredCertificates: [],
    },
  },

  // 13. Program Magang Mahasiswa BRIN
  {
    id: "opp-magang-brin-2026",
    slug: "program-magang-mahasiswa-brin-2026",
    title: "Program Magang Mahasiswa BRIN (Riset & Tugas Akhir)",
    organizer: "Badan Riset dan Inovasi Nasional (BRIN)",
    category: "Internship",
    summary:
      "Peluang riset dan kerja praktik laboratorium langsung bersama periset terkemuka BRIN untuk mahasiswa D4/S1/S2/S3 di seluruh kawasan sains dan teknologi BRIN.",
    deadline: new Date("2026-07-31T23:59:59Z"),
    sourceUrl: "https://elsa.brin.go.id",
    lastVerifiedAt: new Date("2026-11-20T00:00:00Z"),
    isPrototype: true,
    highlights: [
      "Akses fasilitas laboratorium dan komputasi riset canggih ELSA BRIN",
      "Mentorship langsung oleh peneliti bergelar Doktor/Profesor",
      "Cocok untuk pemenuhan skripsi, tugas akhir (TA), dan magang riset 1 semester",
    ],
    rule: {
      minSemester: 5,
      maxSemester: 8,
      minGpa: 3.0,
      minExperienceMonths: 0,
      allowedExperienceCategories: [],
      targetDegrees: ["D4", "S1", "S2"],
      eligibleMajors: ["ALL"],
      requiredCertificates: [],
    },
  },

  // 14. Internship Program Bank Indonesia
  {
    id: "opp-internship-bank-indonesia-2026",
    slug: "internship-program-bank-indonesia-2026",
    title: "Internship Program Bank Indonesia",
    organizer: "Bank Indonesia",
    category: "Internship",
    summary:
      "Program magang profesional di bank sentral Republik Indonesia bagi mahasiswa aktif D3/D4/S1 minimal semester 4 atau lulusan baru maksimal 1 tahun kelulusan.",
    deadline: new Date("2026-12-31T23:59:59Z"),
    sourceUrl: "https://www.bi.go.id",
    lastVerifiedAt: new Date("2026-11-20T00:00:00Z"),
    isPrototype: true,
    highlights: [
      "Terbuka dalam 4 periode triwulan sepanjang tahun",
      "Pengalaman mendalam pada perumusan kebijakan moneter, sistem pembayaran, dan teknologi perbankan",
      "Mendapatkan uang saku bulanan dan sertifikat magang resmi BI",
    ],
    rule: {
      minSemester: 4,
      maxSemester: 8,
      minGpa: 3.0,
      minExperienceMonths: 0,
      allowedExperienceCategories: [],
      targetDegrees: ["D3", "D4", "S1"],
      eligibleMajors: ["ALL"],
      requiredCertificates: [],
    },
  },

  // 15. Program Magang Kementerian Keuangan (Kemenkeu)
  {
    id: "opp-magang-kemenkeu-2026",
    slug: "program-magang-kementerian-keuangan-2026",
    title: "Program Magang Kementerian Keuangan RI",
    organizer: "Kementerian Keuangan RI",
    category: "Internship",
    summary:
      "Program Praktik Kerja Lapangan (PKL) dan Magang Riset di lingkungan Kementerian Keuangan (DJP, Bea Cukai, Anggaran, Perbendaharaan, Kekayaan Negara, BKF).",
    deadline: new Date("2026-12-31T23:59:59Z"),
    sourceUrl: "https://magang.kemenkeu.go.id",
    lastVerifiedAt: new Date("2026-11-20T00:00:00Z"),
    isPrototype: true,
    highlights: [
      "Tersedia jalur Reguler dan Khusus Mandiri secara periodik sepanjang tahun",
      "Penempatan di unit eselon I strategis pengelola keuangan dan fiskal negara",
      "Didampingi mentor profesional pejabat fungsional perbendaharaan/pajak/analis kebijakan",
    ],
    rule: {
      minSemester: 4,
      maxSemester: 8,
      minGpa: 3.0,
      minExperienceMonths: 0,
      allowedExperienceCategories: [],
      targetDegrees: ["D3", "D4", "S1"],
      eligibleMajors: ["ALL"],
      requiredCertificates: [],
    },
  },
];

export function getOpportunityById(
  id: string
): PrototypeOpportunity | undefined {
  return PROTOTYPE_OPPORTUNITIES.find(
    (opp) => opp.id === id || opp.slug === id
  );
}
