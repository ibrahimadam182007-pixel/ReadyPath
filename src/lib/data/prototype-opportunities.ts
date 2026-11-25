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
 * Curated prototype opportunities tailored for Universitas AMIKOM Yogyakarta students.
 * Dates are placed across late 2026 – mid 2027 so countdown plans remain active relative to Nov 2026.
 */
export const PROTOTYPE_OPPORTUNITIES: PrototypeOpportunity[] = [
  {
    id: "opp-beasiswa-unggulan-2027",
    slug: "beasiswa-unggulan-kemendikbud-2027",
    title: "Beasiswa Unggulan Kemendikbudristek",
    organizer: "Ministry of Education (Kemendikbudristek)",
    category: "Scholarship",
    summary:
      "Full tuition and living allowance scholarship for high-achieving undergraduate students enrolled in accredited Indonesian universities.",
    deadline: new Date("2027-01-15T23:59:59Z"),
    sourceUrl: "https://beasiswaunggulan.kemdikbud.go.id",
    lastVerifiedAt: new Date("2026-11-10T00:00:00Z"),
    isPrototype: true,
    highlights: [
      "Full UKT tuition coverage + monthly living stipend",
      "Open to Semester 1–3 ongoing S1/D4 students",
    ],
    rule: {
      minSemester: 2,
      maxSemester: 6,
      minGpa: 3.25,
      minExperienceMonths: 0,
      allowedExperienceCategories: [],
      targetDegrees: ["D4", "S1"],
      eligibleMajors: ["ALL"],
      requiredCertificates: [
        {
          id: "ukbi-or-toefl",
          category: "ENGLISH_PROFICIENCY",
          label: "TOEFL ITP / iBT Certificate",
          acceptedCodes: [
            { code: "TOEFL_ITP", displayName: "TOEFL ITP", minScore: 450 },
            { code: "TOEFL_IBT", displayName: "TOEFL iBT", minScore: 55 },
            { code: "IELTS", displayName: "IELTS", minScore: 5.5 },
          ],
          mustBeValidUntilDaysAfterDeadline: 0,
          estPrepAndResultDays: 30,
        },
      ],
    },
  },
  {
    id: "opp-iisma-2027",
    slug: "iisma-student-mobility-2027",
    title: "Indonesian International Student Mobility (IISMA)",
    organizer: "Kemendikbudristek · Kampus Merdeka",
    category: "Scholarship",
    summary:
      "One-semester fully funded international exchange program at top partner universities abroad for undergraduate and vocational students.",
    deadline: new Date("2027-03-31T23:59:59Z"),
    sourceUrl: "https://iisma.kemdikbud.go.id",
    lastVerifiedAt: new Date("2026-11-15T00:00:00Z"),
    isPrototype: true,
    highlights: [
      "Tuition waiver, return airfare, visa & living allowance",
      "Requires valid English proficiency test on submission date",
    ],
    rule: {
      minSemester: 4,
      maxSemester: 6,
      minGpa: 3.0,
      minExperienceMonths: 3,
      allowedExperienceCategories: [],
      targetDegrees: ["D3", "D4", "S1"],
      eligibleMajors: ["ALL"],
      requiredCertificates: [
        {
          id: "iisma-english",
          category: "ENGLISH_PROFICIENCY",
          label: "English Proficiency (IELTS / TOEFL iBT / DET)",
          acceptedCodes: [
            { code: "TOEFL_IBT", displayName: "TOEFL iBT", minScore: 78 },
            { code: "IELTS", displayName: "IELTS", minScore: 6.0 },
            { code: "DUOLINGO", displayName: "Duolingo English Test", minScore: 100 },
          ],
          mustBeValidUntilDaysAfterDeadline: 0,
          estPrepAndResultDays: 45,
        },
      ],
    },
  },
  {
    id: "opp-amikom-prestasi-2027",
    slug: "beasiswa-prestasi-amikom-2027",
    title: "Beasiswa Prestasi Akademik AMIKOM",
    organizer: "Universitas AMIKOM Yogyakarta",
    category: "Scholarship",
    summary:
      "Internal merit tuition discount granted by Universitas AMIKOM Yogyakarta to active students with outstanding GPA and campus organization involvement.",
    deadline: new Date("2027-02-10T23:59:59Z"),
    sourceUrl: "https://amikom.ac.id",
    lastVerifiedAt: new Date("2026-11-18T00:00:00Z"),
    isPrototype: true,
    highlights: [
      "SPP/UKT scholarship reduction up to 50% for next semester",
      "Prioritizes active UKM / Himpunan / Lab assistant members",
    ],
    rule: {
      minSemester: 3,
      maxSemester: 7,
      minGpa: 3.6,
      minExperienceMonths: 6,
      allowedExperienceCategories: ["ORGANIZATION", "VOLUNTEER", "RESEARCH_PROJECT"],
      targetDegrees: ["D3", "S1"],
      eligibleMajors: ["ALL"],
      requiredCertificates: [],
    },
  },
  {
    id: "opp-gemastik-2027",
    slug: "gemastik-puspresnas-2027",
    title: "GEMASTIK ICT National Competition",
    organizer: "Puspresnas · Kemendikbudristek",
    category: "Competition",
    summary:
      "National collegiate ICT competition covering Software Development, UX Design, Cyber Security, Data Mining, and Smart City.",
    deadline: new Date("2027-04-20T23:59:59Z"),
    sourceUrl: "https://pusatprestasinasional.kemdikbud.go.id",
    lastVerifiedAt: new Date("2026-11-12T00:00:00Z"),
    isPrototype: true,
    highlights: [
      "Eligible for AMIKOM Dies Natalis / Rector appreciation points",
      "Team of 3 active undergraduate students",
    ],
    rule: {
      minSemester: 2,
      maxSemester: 7,
      minGpa: 2.75,
      minExperienceMonths: 0,
      allowedExperienceCategories: [],
      targetDegrees: ["D3", "D4", "S1"],
      eligibleMajors: ["Informatics", "Informatika", "Information Systems", "Sistem Informasi", "Computer Engineering", "Teknik Komputer"],
      requiredCertificates: [],
    },
  },
  {
    id: "opp-pkm-2027",
    slug: "pkm-pendanaan-dikti-2027",
    title: "Program Kreativitas Mahasiswa (PKM) Grant",
    organizer: "Belmawa · Kemendikbudristek",
    category: "Competition",
    summary:
      "National research and innovation funding grant for student teams across Karsa Cipta, Kewirausahaan, and Pengabdian Masyarakat schemes.",
    deadline: new Date("2027-01-25T23:59:59Z"),
    sourceUrl: "https://simbelmawa.kemdikbud.go.id",
    lastVerifiedAt: new Date("2026-11-16T00:00:00Z"),
    isPrototype: true,
    highlights: [
      "Project funding Rp 6M–10M per accepted proposal",
      "Pathway to PIMNAS national finals",
    ],
    rule: {
      minSemester: 2,
      maxSemester: 7,
      minGpa: 3.0,
      minExperienceMonths: 0,
      allowedExperienceCategories: [],
      targetDegrees: ["D3", "D4", "S1"],
      eligibleMajors: ["ALL"],
      requiredCertificates: [],
    },
  },
  {
    id: "opp-amikom-lab-assistant",
    slug: "asisten-praktikum-lab-amikom-2027",
    title: "Forum Asisten Praktikum Lab AMIKOM",
    organizer: "UPT Laboratorium · AMIKOM Yogyakarta",
    category: "Internship",
    summary:
      "Paid on-campus teaching assistantship supporting programming, networking, and multimedia laboratory sessions for junior cohorts.",
    deadline: new Date("2027-01-08T23:59:59Z"),
    sourceUrl: "https://amikom.ac.id",
    lastVerifiedAt: new Date("2026-11-19T00:00:00Z"),
    isPrototype: true,
    highlights: [
      "Monthly honorarium + official teaching experience certificate",
      "Requires minimum Semester 3 and GPA >= 3.30",
    ],
    rule: {
      minSemester: 3,
      maxSemester: 7,
      minGpa: 3.3,
      minExperienceMonths: 0,
      allowedExperienceCategories: [],
      targetDegrees: ["D3", "S1"],
      eligibleMajors: ["ALL"],
      requiredCertificates: [],
    },
  },
  {
    id: "opp-goto-intern-2027",
    slug: "goto-software-engineering-intern-2027",
    title: "Software Engineering Intern — Campus Hire",
    organizer: "GoTo Group (Remote / Jakarta)",
    category: "Internship",
    summary:
      "6-month paid engineering internship working alongside product squads with potential SKS conversion through Kampus Merdeka.",
    deadline: new Date("2027-02-28T23:59:59Z"),
    sourceUrl: "https://www.gotocompany.com/careers",
    lastVerifiedAt: new Date("2026-11-14T00:00:00Z"),
    isPrototype: true,
    highlights: [
      "Paid monthly stipend + laptop & mentoring",
      "Requires >= 3 months prior project or internship experience",
    ],
    rule: {
      minSemester: 5,
      maxSemester: 7,
      minGpa: 3.2,
      minExperienceMonths: 3,
      allowedExperienceCategories: ["INTERNSHIP", "RESEARCH_PROJECT", "FREELANCE_WORK"],
      targetDegrees: ["D4", "S1"],
      eligibleMajors: ["ALL"],
      requiredCertificates: [],
    },
  },
  {
    id: "opp-bangkit-2027",
    slug: "bangkit-academy-google-2027",
    title: "Bangkit Academy Career Readiness",
    organizer: "Google, GoTo & Traveloka",
    category: "Training",
    summary:
      "Intensive 900-hour industry-led curriculum in Machine Learning, Cloud Computing, or Mobile Development with global certification voucher.",
    deadline: new Date("2026-12-20T23:59:59Z"),
    sourceUrl: "https://grow.google/intl/id_id/bangkit/",
    lastVerifiedAt: new Date("2026-11-18T00:00:00Z"),
    isPrototype: true,
    highlights: [
      "Up to 20 SKS credit conversion (MBKM)",
      "Free Google Associate Cloud / TensorFlow exam voucher",
    ],
    rule: {
      minSemester: 5,
      maxSemester: 7,
      minGpa: 3.0,
      minExperienceMonths: 0,
      allowedExperienceCategories: [],
      targetDegrees: ["D4", "S1"],
      eligibleMajors: ["ALL"],
      requiredCertificates: [],
    },
  },
  {
    id: "opp-aws-restart-2027",
    slug: "aws-cloud-architecting-bootcamp-2027",
    title: "AWS Cloud Practitioner Intensive Track",
    organizer: "AWS Academy · AMIKOM Partner Hub",
    category: "Training",
    summary:
      "Hands-on cloud infrastructure training preparing students for AWS Certified Cloud Practitioner and Solutions Architect Associate exams.",
    deadline: new Date("2027-01-30T23:59:59Z"),
    sourceUrl: "https://aws.amazon.com/training/awsacademy/",
    lastVerifiedAt: new Date("2026-11-11T00:00:00Z"),
    isPrototype: true,
    highlights: [
      "100% subsidized certification voucher for top cohort finishers",
      "Open to Semester 3–7 students with basic English reading",
    ],
    rule: {
      minSemester: 3,
      maxSemester: 7,
      minGpa: 2.8,
      minExperienceMonths: 0,
      allowedExperienceCategories: [],
      targetDegrees: ["D3", "D4", "S1"],
      eligibleMajors: ["ALL"],
      requiredCertificates: [
        {
          id: "basic-english",
          category: "ENGLISH_PROFICIENCY",
          label: "English Certificate (TOEFL / IELTS / EPT)",
          acceptedCodes: [
            { code: "TOEFL_ITP", displayName: "TOEFL ITP", minScore: 450 },
            { code: "TOEFL_IBT", displayName: "TOEFL iBT", minScore: 55 },
            { code: "IELTS", displayName: "IELTS", minScore: 5.5 },
            { code: "EPT_AMIKOM", displayName: "AMIKOM EPT", minScore: 450 },
          ],
          mustBeValidUntilDaysAfterDeadline: 0,
          estPrepAndResultDays: 21,
        },
      ],
    },
  },
  {
    id: "opp-bank-indonesia-genbi-2027",
    slug: "beasiswa-bank-indonesia-genbi-2027",
    title: "Beasiswa Bank Indonesia (GenBI)",
    organizer: "Bank Indonesia · Yogyakarta",
    category: "Scholarship",
    summary:
      "Monthly financial scholarship and leadership community (Generasi Baru Indonesia) for active students across partner universities in DIY.",
    deadline: new Date("2027-02-18T23:59:59Z"),
    sourceUrl: "https://www.bi.go.id",
    lastVerifiedAt: new Date("2026-11-17T00:00:00Z"),
    isPrototype: true,
    highlights: [
      "Rp 1,000,000/month living allowance for 2 semesters",
      "Requires minimum 6 months organization or volunteer activity",
    ],
    rule: {
      minSemester: 4,
      maxSemester: 6,
      minGpa: 3.25,
      minExperienceMonths: 6,
      allowedExperienceCategories: ["ORGANIZATION", "VOLUNTEER"],
      targetDegrees: ["S1"],
      eligibleMajors: ["ALL"],
      requiredCertificates: [],
    },
  },
];

export function getOpportunityById(id: string): PrototypeOpportunity | undefined {
  return PROTOTYPE_OPPORTUNITIES.find(
    (opp) => opp.id === id || opp.slug === id
  );
}
