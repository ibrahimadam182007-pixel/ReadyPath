import { describe, it, expect } from "vitest";
import {
  calculateRequiredNextTermGpa,
  evaluateEligibility,
  generateCountdownPlan,
  type EngineOpportunityTarget,
  type EngineStudentProfile,
} from "../index";

const sampleTarget: EngineOpportunityTarget = {
  id: "opp-iisma-2027",
  title: "IISMA 2027 Prototype",
  deadline: new Date("2027-03-31T23:59:59Z"),
  rule: {
    minSemester: 4,
    maxSemester: 6,
    minGpa: 3.0,
    minExperienceMonths: 6,
    allowedExperienceCategories: [],
    targetDegrees: ["D4", "S1"],
    eligibleMajors: ["ALL"],
    requiredCertificates: [
      {
        id: "english-proficiency",
        category: "ENGLISH_PROFICIENCY",
        label: "Sertifikat Bahasa Inggris",
        acceptedCodes: [
          { code: "TOEFL_IBT", displayName: "TOEFL iBT", minScore: 78 },
          { code: "IELTS", displayName: "IELTS", minScore: 6.0 },
        ],
        mustBeValidUntilDaysAfterDeadline: 0,
        estPrepAndResultDays: 45,
      },
    ],
  },
};

describe("GPA Calculator (Deterministic)", () => {
  it("mengembalikan alreadyMet jika IPK saat ini sudah memenuhi syarat", () => {
    const result = calculateRequiredNextTermGpa({
      currentGpa: 3.5,
      completedSemesters: 4,
      targetGpa: 3.5,
      remainingSemesters: 1,
    });

    expect(result.alreadyMet).toBe(true);
    expect(result.isAchievable).toBe(true);
    expect(result.requiredTermGpa).toBeNull();
    expect(result.gpaGap).toBe(0);
  });

  it("menghitung IPS semester depan secara akurat dengan rumus berbasis semester", () => {
    // Completed 3 semesters with 3.00, want 3.20 after 1 more semester: (3.20*4 - 3.00*3) / 1 = 3.80
    const result = calculateRequiredNextTermGpa({
      currentGpa: 3.0,
      completedSemesters: 3,
      targetGpa: 3.2,
      remainingSemesters: 1,
    });

    expect(result.alreadyMet).toBe(false);
    expect(result.isAchievable).toBe(true);
    expect(result.requiredTermGpa).toBe(3.8);
    expect(result.gpaGap).toBe(0.2);
  });

  it("mendeteksi target IPS yang melebihi batas maksimal 4.00", () => {
    // Completed 4 semesters with 2.80, want 3.30 in 1 semester: (3.30*5 - 2.80*4) = 16.5 - 11.2 = 5.30
    const result = calculateRequiredNextTermGpa({
      currentGpa: 2.8,
      completedSemesters: 4,
      targetGpa: 3.3,
      remainingSemesters: 1,
    });

    expect(result.isAchievable).toBe(false);
    expect(result.requiredTermGpa).toBe(5.3);
  });

  it("menangani remainingSemesters = 0 ketika deadline sudah terlalu dekat", () => {
    const result = calculateRequiredNextTermGpa({
      currentGpa: 2.9,
      completedSemesters: 4,
      targetGpa: 3.0,
      remainingSemesters: 0,
    });

    expect(result.isAchievable).toBe(false);
    expect(result.requiredTermGpa).toBeNull();
  });
});

describe("Eligibility & Gap Report Evaluator", () => {
  it("menyatakan ELIGIBLE penuh ketika semua kriteria terpenuhi", () => {
    const profile: EngineStudentProfile = {
      degreeLevel: "S1",
      major: "Teknik Informatika",
      currentSemester: 5,
      cumulativeGpa: 3.45,
      certificates: [
        {
          name: "IELTS Academic",
          standardCode: "IELTS",
          category: "ENGLISH_PROFICIENCY",
          score: 7.0,
          expiryDate: new Date("2028-01-10T00:00:00Z"),
        },
      ],
      experiences: [
        {
          role: "Backend Intern",
          organization: "Startup A",
          category: "INTERNSHIP",
          durationMonths: 4,
        },
        {
          role: "Staf Divisi",
          organization: "Himpunan Mahasiswa",
          category: "ORGANIZATION",
          durationMonths: 3,
        },
      ],
    };

    const report = evaluateEligibility(
      profile,
      sampleTarget,
      new Date("2026-11-21T00:00:00Z")
    );

    expect(report.isEligible).toBe(true);
    expect(report.metCount).toBe(report.totalCount);
    expect(report.readinessPercent).toBe(100);
  });

  it("menerima sertifikat yang kedaluwarsa tepat pada hari deadline (buffer = 0)", () => {
    const profile: EngineStudentProfile = {
      degreeLevel: "S1",
      major: "Teknik Informatika",
      currentSemester: 4,
      cumulativeGpa: 3.2,
      certificates: [
        {
          name: "TOEFL iBT",
          standardCode: "TOEFL_IBT",
          category: "ENGLISH_PROFICIENCY",
          score: 85,
          expiryDate: new Date("2027-03-31T00:00:00Z"),
        },
      ],
      experiences: [
        {
          role: "Panitia",
          organization: "BEM",
          category: "ORGANIZATION",
          durationMonths: 6,
        },
      ],
    };

    const report = evaluateEligibility(profile, sampleTarget);
    const certItem = report.items.find((i) => i.type === "CERTIFICATE");
    expect(certItem?.status).toBe("MET");
  });

  it("menolak sertifikat yang kedaluwarsa 1 hari sebelum deadline", () => {
    const profile: EngineStudentProfile = {
      degreeLevel: "S1",
      major: "Teknik Informatika",
      currentSemester: 4,
      cumulativeGpa: 3.2,
      certificates: [
        {
          name: "TOEFL iBT",
          standardCode: "TOEFL_IBT",
          category: "ENGLISH_PROFICIENCY",
          score: 90,
          expiryDate: new Date("2027-03-30T23:59:59Z"),
        },
      ],
      experiences: [],
    };

    const report = evaluateEligibility(profile, sampleTarget);
    const certItem = report.items.find((i) => i.type === "CERTIFICATE");
    expect(certItem?.status).toBe("NOT_MET");
    expect(certItem?.meta?.certificateReason).toBe("EXPIRED_BEFORE_DEADLINE");
  });

  it("mendeteksi skor sertifikat kurang dan profil tanpa sertifikat", () => {
    const lowScoreProfile: EngineStudentProfile = {
      degreeLevel: "S1",
      major: "Sistem Informasi",
      currentSemester: 4,
      cumulativeGpa: 2.85,
      certificates: [
        {
          name: "IELTS Academic",
          standardCode: "IELTS",
          category: "ENGLISH_PROFICIENCY",
          score: 5.5,
          expiryDate: new Date("2028-05-01T00:00:00Z"),
        },
      ],
      experiences: [],
    };

    const report = evaluateEligibility(lowScoreProfile, sampleTarget);
    expect(report.isEligible).toBe(false);

    const gpaItem = report.items.find((i) => i.type === "GPA");
    expect(gpaItem?.status).toBe("NOT_MET");
    expect(gpaItem?.meta?.gpaDelta).toBe(0.15);

    const certItem = report.items.find((i) => i.type === "CERTIFICATE");
    expect(certItem?.status).toBe("NOT_MET");
    expect(certItem?.meta?.certificateReason).toBe("LOW_SCORE");

    const expItem = report.items.find((i) => i.type === "EXPERIENCE");
    expect(expItem?.status).toBe("NOT_MET");
    expect(expItem?.meta?.missingMonths).toBe(6);
  });
});

describe("Backward Countdown Planner", () => {
  it("menghasilkan milestone hitung mundur terurut dari deadline", () => {
    const profile: EngineStudentProfile = {
      degreeLevel: "S1",
      major: "Teknik Informatika",
      currentSemester: 4,
      cumulativeGpa: 2.85,
      certificates: [],
      experiences: [
        {
          role: "Volunteer",
          organization: "Komunitas",
          category: "VOLUNTEER",
          durationMonths: 3,
        },
      ],
    };

    const plan = generateCountdownPlan({
      profile,
      target: sampleTarget,
      referenceDate: new Date("2026-11-21T00:00:00Z"),
      remainingSemestersBeforeDeadline: 1,
    });

    expect(plan.isFullyEligible).toBe(false);
    expect(plan.isDeadlinePassed).toBe(false);
    expect(plan.gpaPlan).not.toBeNull();
    expect(plan.gpaPlan?.requiredTermGpa).toBe(3.45);

    // Harus ada milestone: EXPERIENCE_BUILDING (H-90), CERTIFICATE_ACQUISITION (H-45), TARGET_SEMESTER_GPA (H-30), DOCUMENT_DRAFT (H-14), FINAL_SUBMISSION (H-3)
    const types = plan.milestones.map((m) => m.type);
    expect(types).toEqual([
      "EXPERIENCE_BUILDING",
      "CERTIFICATE_ACQUISITION",
      "TARGET_SEMESTER_GPA",
      "DOCUMENT_DRAFT",
      "FINAL_SUBMISSION",
    ]);

    // Verifikasi H-45 sertifikat untuk deadline 2027-03-31 -> 2027-02-14
    const certMilestone = plan.milestones.find(
      (m) => m.type === "CERTIFICATE_ACQUISITION"
    );
    expect(certMilestone?.targetDate.toISOString().slice(0, 10)).toBe(
      "2027-02-14"
    );
    expect(certMilestone?.isPastDue).toBe(false);
    expect(plan.reminderSchedule.map((r) => r.code)).toEqual([
      "H-30",
      "H-14",
      "H-7",
    ]);
  });

  it("melewati offset reminder yang sudah lewat di masa lalu", () => {
    const profile: EngineStudentProfile = {
      degreeLevel: "S1",
      major: "Informatika",
      currentSemester: 5,
      cumulativeGpa: 3.5,
      certificates: [],
      experiences: [],
    };

    // Deadline 2027-03-31, referenceDate 2027-03-20 (hanya tersisa 11 hari -> H-30 dan H-14 dilewati, hanya H-7)
    const plan = generateCountdownPlan({
      profile,
      target: sampleTarget,
      referenceDate: new Date("2027-03-20T00:00:00Z"),
    });

    expect(plan.reminderSchedule.map((r) => r.code)).toEqual(["H-7"]);
  });

  it("berhasil memvalidasi seluruh 15 peluang resmi dari katalog 2026", async () => {
    const { PROTOTYPE_OPPORTUNITIES } = await import(
      "../../data/prototype-opportunities"
    );
    expect(PROTOTYPE_OPPORTUNITIES).toHaveLength(15);

    const testProfile: EngineStudentProfile = {
      degreeLevel: "S1",
      major: "Informatika",
      currentSemester: 4,
      cumulativeGpa: 3.45,
      certificates: [
        {
          name: "UKBI",
          standardCode: "UKBI",
          category: "OTHER_LANGUAGE",
          score: 600,
          expiryDate: new Date("2027-12-31T23:59:59Z"),
        },
      ],
      experiences: [
        {
          role: "Staff Humas",
          organization: "BEM Kampus",
          category: "ORGANIZATION",
          durationMonths: 8,
        },
      ],
    };

    for (const opp of PROTOTYPE_OPPORTUNITIES) {
      const report = evaluateEligibility(testProfile, opp);
      expect(report.totalCount).toBeGreaterThan(0);
      expect(report.metCount).toBeGreaterThanOrEqual(0);
      expect(report.metCount).toBeLessThanOrEqual(report.totalCount);

      const plan = generateCountdownPlan({
        profile: testProfile,
        target: opp,
        referenceDate: new Date("2026-11-22T00:00:00Z"),
      });
      expect(plan.milestones.length).toBeGreaterThan(0);
    }
  });
});
