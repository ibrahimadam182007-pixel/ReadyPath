"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  Award,
  Briefcase,
  ChevronDown,
  ChevronLeft,
  Plus,
  RotateCcw,
  Trash2,
  X,
} from "lucide-react";
import { FlowHeader } from "@/components/layout/headers";
import { DesktopNavbar } from "@/components/layout/desktop-navbar";
import { ToggleSwitch } from "@/components/ui/toggle-switch";
import { useReadyPath } from "@/components/providers/readypath-store";
import type {
  DegreeLevel,
  EngineCertificate,
  EngineExperience,
  ExperienceCategory,
} from "@/lib/engine";
import { formatMediumDate } from "@/lib/utils/date-format";
import { cn } from "@/lib/utils";

const CERTIFICATE_PRESETS = [
  { code: "UKBI", label: "UKBI Kemendikbud", category: "OTHER_LANGUAGE" as const },
  { code: "TOEFL_ITP", label: "TOEFL ITP", category: "ENGLISH_PROFICIENCY" as const },
  { code: "TOEFL_IBT", label: "TOEFL iBT", category: "ENGLISH_PROFICIENCY" as const },
  { code: "IELTS", label: "IELTS Academic", category: "ENGLISH_PROFICIENCY" as const },
  { code: "PTE_ACADEMIC", label: "PTE Academic", category: "ENGLISH_PROFICIENCY" as const },
  { code: "DUOLINGO", label: "Duolingo English Test", category: "ENGLISH_PROFICIENCY" as const },
  { code: "EPT_AMIKOM", label: "AMIKOM EPT", category: "ENGLISH_PROFICIENCY" as const },
  { code: "AWS_CCP", label: "AWS Certified Cloud Practitioner", category: "TECHNICAL_CLOUD" as const },
  { code: "CUSTOM", label: "Other Certificate", category: "COMPETITION_AWARD" as const },
];

const EXPERIENCE_CATEGORY_LABELS: Record<ExperienceCategory, string> = {
  ORGANIZATION: "Campus Organization",
  INTERNSHIP: "Internship / Lab Assistant",
  VOLUNTEER: "Volunteer / Community",
  RESEARCH_PROJECT: "Research / PKM Project",
  FREELANCE_WORK: "Freelance / Work",
};

interface DraftCertificate {
  localId: string;
  standardCode: string;
  name: string;
  category: EngineCertificate["category"];
  score: string;
  expiryDate: string;
  doesNotExpire?: boolean;
}

interface DraftExperience {
  localId: string;
  role: string;
  organization: string;
  category: ExperienceCategory;
  durationMonths: string;
}

type UndoAction =
  | { kind: "certificate"; item: DraftCertificate; index: number }
  | { kind: "experience"; item: DraftExperience; index: number };

function toDateInputValue(date: Date): string {
  return date.toISOString().slice(0, 10);
}

function defaultNextYearDate(): string {
  const nextYear = new Date();
  nextYear.setUTCFullYear(nextYear.getUTCFullYear() + 1);
  return toDateInputValue(nextYear);
}

export default function StudentProfileSetupPage() {
  const router = useRouter();
  const { profile, updateProfile, isHydrated } = useReadyPath();

  const [degreeLevel, setDegreeLevel] = useState<DegreeLevel>(profile.degreeLevel);
  const [major, setMajor] = useState(profile.major ?? "Informatika");
  const [currentSemester, setCurrentSemester] = useState(
    String(profile.currentSemester)
  );
  const [cumulativeGpa, setCumulativeGpa] = useState(
    profile.cumulativeGpa.toFixed(2)
  );
  const [certificates, setCertificates] = useState<DraftCertificate[]>([]);
  const [experiences, setExperiences] = useState<DraftExperience[]>([]);
  const [gpaError, setGpaError] = useState<string | null>(null);
  const [undoStack, setUndoStack] = useState<UndoAction | null>(null);

  // Add Certificate Modal/Sheet State (RP 10 / D11)
  const [certModalOpen, setCertModalOpen] = useState(false);
  const [certCode, setCertCode] = useState("TOEFL_ITP");
  const [certName, setCertName] = useState("TOEFL ITP");
  const [certCategory, setCertCategory] =
    useState<EngineCertificate["category"]>("ENGLISH_PROFICIENCY");
  const [certScore, setCertScore] = useState("");
  const [certExpiry, setCertExpiry] = useState(defaultNextYearDate);
  const [certNoExpiry, setCertNoExpiry] = useState(false);
  const [certError, setCertError] = useState<string | null>(null);

  // Add Experience Modal/Sheet State (RP 13 / D12)
  const [expModalOpen, setExpModalOpen] = useState(false);
  const [expRole, setExpRole] = useState("");
  const [expOrg, setExpOrg] = useState("");
  const [expCategory, setExpCategory] =
    useState<ExperienceCategory>("ORGANIZATION");
  const [expMonths, setExpMonths] = useState("6");
  const [expError, setExpError] = useState<string | null>(null);

  useEffect(() => {
    if (!isHydrated) return;
    setDegreeLevel(profile.degreeLevel);
    setMajor(profile.major ?? "Informatika");
    setCurrentSemester(String(profile.currentSemester));
    setCumulativeGpa(profile.cumulativeGpa.toFixed(2));
    setCertificates(
      profile.certificates.map((c, idx) => ({
        localId: c.id ?? `cert-${idx}`,
        standardCode: c.standardCode,
        name: c.name,
        category: c.category,
        score: c.score != null ? String(c.score) : "",
        expiryDate: toDateInputValue(c.expiryDate),
        doesNotExpire: c.expiryDate.getUTCFullYear() >= 2090,
      }))
    );
    setExperiences(
      profile.experiences.map((e, idx) => ({
        localId: e.id ?? `exp-${idx}`,
        role: e.role,
        organization: e.organization,
        category: e.category,
        durationMonths: String(e.durationMonths),
      }))
    );
  }, [isHydrated, profile]);

  const openCertModal = () => {
    setCertCode("TOEFL_ITP");
    setCertName("TOEFL ITP");
    setCertCategory("ENGLISH_PROFICIENCY");
    setCertScore("");
    setCertExpiry(defaultNextYearDate());
    setCertNoExpiry(false);
    setCertError(null);
    setCertModalOpen(true);
  };

  const handleSaveCertificate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!certName.trim()) {
      setCertError("Enter a certificate name.");
      return;
    }
    if (!certNoExpiry && !certExpiry) {
      setCertError("Select an expiry date or toggle 'Does not expire'.");
      return;
    }
    setCertificates((prev) => [
      ...prev,
      {
        localId: `cert-${Date.now()}`,
        standardCode: certCode,
        name: certName.trim(),
        category: certCategory,
        score: certScore.trim(),
        expiryDate: certNoExpiry ? "2099-12-31" : certExpiry,
        doesNotExpire: certNoExpiry,
      },
    ]);
    setCertModalOpen(false);
  };

  const openExpModal = () => {
    setExpRole("");
    setExpOrg("");
    setExpCategory("ORGANIZATION");
    setExpMonths("6");
    setExpError(null);
    setExpModalOpen(true);
  };

  const handleSaveExperience = (e: React.FormEvent) => {
    e.preventDefault();
    if (!expRole.trim() || !expOrg.trim()) {
      setExpError("Enter both your role title and organization.");
      return;
    }
    const months = Number.parseInt(expMonths, 10);
    if (Number.isNaN(months) || months < 1) {
      setExpError("Duration must be at least 1 month.");
      return;
    }
    setExperiences((prev) => [
      ...prev,
      {
        localId: `exp-${Date.now()}`,
        role: expRole.trim(),
        organization: expOrg.trim(),
        category: expCategory,
        durationMonths: String(months),
      },
    ]);
    setExpModalOpen(false);
  };

  const handleRemoveCertificate = (index: number) => {
    const target = certificates[index];
    if (!target) return;
    setCertificates((prev) => prev.filter((_, i) => i !== index));
    setUndoStack({ kind: "certificate", item: target, index });
  };

  const handleRemoveExperience = (index: number) => {
    const target = experiences[index];
    if (!target) return;
    setExperiences((prev) => prev.filter((_, i) => i !== index));
    setUndoStack({ kind: "experience", item: target, index });
  };

  const handleUndo = () => {
    if (!undoStack) return;
    if (undoStack.kind === "certificate") {
      setCertificates((prev) => {
        const next = [...prev];
        next.splice(undoStack.index, 0, undoStack.item);
        return next;
      });
    } else {
      setExperiences((prev) => {
        const next = [...prev];
        next.splice(undoStack.index, 0, undoStack.item);
        return next;
      });
    }
    setUndoStack(null);
  };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    const parsedGpa = Number.parseFloat(cumulativeGpa);
    if (Number.isNaN(parsedGpa) || parsedGpa < 0 || parsedGpa > 4) {
      setGpaError("Enter a GPA between 0.00 and 4.00.");
      return;
    }
    setGpaError(null);

    const parsedCerts: EngineCertificate[] = certificates
      .filter((c) => c.name.trim() && c.expiryDate)
      .map((c) => ({
        id: c.localId,
        name: c.name.trim(),
        standardCode: c.standardCode,
        category: c.category,
        score: c.score.trim() ? Number.parseFloat(c.score) : null,
        expiryDate: new Date(`${c.expiryDate}T00:00:00Z`),
      }));

    const parsedExperiences: EngineExperience[] = experiences
      .filter((exp) => exp.role.trim() || exp.organization.trim())
      .map((exp) => ({
        id: exp.localId,
        role: exp.role.trim() || "Member",
        organization: exp.organization.trim() || "Campus Organization",
        category: exp.category,
        durationMonths: Math.max(
          0,
          Number.parseInt(exp.durationMonths, 10) || 0
        ),
      }));

    updateProfile({
      degreeLevel,
      major: major.trim() || null,
      currentSemester: Number.parseInt(currentSemester, 10) || 1,
      cumulativeGpa: Math.round(parsedGpa * 100) / 100,
      totalCreditsCompleted: profile.totalCreditsCompleted,
      certificates: parsedCerts,
      experiences: parsedExperiences,
    });

    router.push("/explore");
  };

  return (
    <div className="min-h-screen bg-rp-bg flex flex-col">
      <FlowHeader
        backHref="/profile"
        title="Your student profile"
        subtitle="These details decide which requirements you already meet."
      />

      <div className="flex-1 flex flex-col w-full lg:max-w-[1200px] lg:mx-auto lg:px-6 lg:py-7 lg:gap-5">
        <DesktopNavbar variant="app" />

        {/* Desktop Page Head with Save CTA */}
        <div className="hidden lg:flex items-end justify-between gap-4">
          <div className="space-y-1">
            <Link
              href="/profile"
              className="inline-flex items-center gap-1.5 text-[11.5px] font-bold text-rp-sage-strong hover:text-rp-primary transition"
            >
              <ChevronLeft className="h-3.5 w-3.5" strokeWidth={2.4} />
              <span>Back to Profile &amp; Settings</span>
            </Link>
            <h1 className="text-[30px] font-extrabold tracking-tight text-rp-text leading-tight">
              Your student profile
            </h1>
            <p className="text-[12.5px] text-rp-text-muted">
              These details decide which requirements you already meet.
            </p>
          </div>

          <button
            type="submit"
            form="profile-setup-form"
            className="inline-flex h-[46px] items-center justify-center gap-2 rounded-[10px] bg-rp-primary px-6 text-[13px] font-bold text-white hover:bg-rp-primary-hover transition"
          >
            <span>Save &amp; Explore Opportunities</span>
            <ArrowRight className="h-4 w-4" strokeWidth={2.2} />
          </button>
        </div>

        <main className="flex-1 px-4 pt-5 pb-6 lg:px-0 lg:pt-0 lg:pb-8 space-y-5">
          <form
            id="profile-setup-form"
            onSubmit={handleSaveProfile}
            noValidate
            className="space-y-5"
          >
            {/* Academic Details Card */}
            <section className="rounded-[16px] bg-rp-surface p-4 lg:p-[22px] border border-rp-border shadow-rp-flat space-y-4">
              <div>
                <h2 className="text-[14.5px] font-extrabold text-rp-text">
                  Academic details
                </h2>
                <p className="text-[11.5px] text-rp-text-muted mt-0.5">
                  Used to check GPA, degree level, and semester requirements
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
                {/* Current Semester */}
                <div>
                  <label
                    htmlFor="current-semester"
                    className="block text-[11px] font-bold text-rp-sage-strong mb-1.5"
                  >
                    Current Semester
                  </label>
                  <div className="relative">
                    <select
                      id="current-semester"
                      value={currentSemester}
                      onChange={(e) => setCurrentSemester(e.target.value)}
                      className="w-full h-[46px] appearance-none rounded-[10px] bg-rp-surface border border-rp-border pl-3.5 pr-9 text-[13px] font-semibold text-rp-text focus:outline-none focus:ring-2 focus:ring-rp-primary"
                    >
                      {Array.from({ length: 12 }, (_, i) => i + 1).map((sem) => (
                        <option key={sem} value={String(sem)}>
                          Semester {sem}
                        </option>
                      ))}
                    </select>
                    <ChevronDown
                      aria-hidden="true"
                      className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-rp-text-muted"
                    />
                  </div>
                </div>

                {/* Current GPA */}
                <div>
                  <label
                    htmlFor="current-gpa"
                    className="block text-[11px] font-bold text-rp-sage-strong mb-1.5"
                  >
                    Current GPA
                  </label>
                  <div className="relative">
                    <input
                      id="current-gpa"
                      type="number"
                      step="0.01"
                      min="0"
                      max="4"
                      value={cumulativeGpa}
                      onChange={(e) => setCumulativeGpa(e.target.value)}
                      className={cn(
                        "w-full h-[46px] rounded-[10px] bg-rp-surface border pl-3.5 pr-14 text-[13px] font-semibold text-rp-text focus:outline-none focus:ring-2 focus:ring-rp-primary",
                        gpaError ? "border-rp-danger" : "border-rp-border"
                      )}
                    />
                    <span className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-[12px] font-medium text-rp-text-muted">
                      / 4.00
                    </span>
                  </div>
                  {gpaError && (
                    <p className="mt-1 text-[11px] font-semibold text-rp-danger">
                      {gpaError}
                    </p>
                  )}
                </div>

                {/* Degree */}
                <div>
                  <label
                    htmlFor="degree-level"
                    className="block text-[11px] font-bold text-rp-sage-strong mb-1.5"
                  >
                    Degree Level
                  </label>
                  <div className="relative">
                    <select
                      id="degree-level"
                      value={degreeLevel}
                      onChange={(e) =>
                        setDegreeLevel(e.target.value as DegreeLevel)
                      }
                      className="w-full h-[46px] appearance-none rounded-[10px] bg-rp-surface border border-rp-border pl-3.5 pr-9 text-[13px] font-semibold text-rp-text focus:outline-none focus:ring-2 focus:ring-rp-primary"
                    >
                      <option value="D3">D3</option>
                      <option value="D4">D4</option>
                      <option value="S1">S1</option>
                      <option value="S2">S2</option>
                    </select>
                    <ChevronDown
                      aria-hidden="true"
                      className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-rp-text-muted"
                    />
                  </div>
                </div>

                {/* Study Program */}
                <div>
                  <label
                    htmlFor="major-input"
                    className="block text-[11px] font-bold text-rp-sage-strong mb-1.5"
                  >
                    Study Program (Major)
                  </label>
                  <input
                    id="major-input"
                    type="text"
                    value={major}
                    onChange={(e) => setMajor(e.target.value)}
                    placeholder="e.g. Informatika"
                    className="w-full h-[46px] rounded-[10px] bg-rp-surface border border-rp-border px-3.5 text-[13px] font-semibold text-rp-text placeholder:text-rp-text-muted/70 focus:outline-none focus:ring-2 focus:ring-rp-primary"
                  />
                </div>
              </div>
            </section>

            {/* 2-Column Grid on Desktop for Certificates & Experience */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
              {/* Certificates Card */}
              <section
                id="certificates"
                className="rounded-[16px] bg-rp-surface p-4 lg:p-[22px] border border-rp-border shadow-rp-flat flex flex-col justify-between gap-4"
              >
                <div className="space-y-3.5">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h2 className="text-[14.5px] font-extrabold text-rp-text">
                        Certificates
                      </h2>
                      <p className="text-[11.5px] text-rp-text-muted mt-0.5">
                        Add the expiry date to track validity on deadlines
                      </p>
                    </div>
                    <span className="inline-flex rounded-full bg-rp-bg px-2.5 py-0.5 text-[10.5px] font-bold text-rp-primary shrink-0">
                      {certificates.length} active
                    </span>
                  </div>

                  {certificates.length === 0 ? (
                    <div className="rounded-[12px] bg-rp-bg/40 border border-dashed border-rp-border p-4 text-center">
                      <Award className="mx-auto h-6 w-6 text-rp-sage-strong mb-1.5" />
                      <p className="text-[12px] font-semibold text-rp-text-muted">
                        No certificates added yet (e.g. UKBI, TOEFL, IELTS)
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-2.5">
                      {certificates.map((cert, index) => (
                        <div
                          key={cert.localId}
                          className="flex items-center justify-between gap-3 rounded-[12px] bg-rp-bg/45 border border-rp-hairline px-3.5 py-3"
                        >
                          <div className="min-w-0 flex-1">
                            <p className="text-[13px] font-bold text-rp-text truncate">
                              {cert.name}
                              {cert.score ? ` · Score ${cert.score}` : ""}
                            </p>
                            <p className="text-[11px] text-rp-text-muted mt-0.5">
                              {cert.doesNotExpire ||
                              cert.expiryDate.startsWith("2099")
                                ? "Does not expire"
                                : `Expires on: ${formatMediumDate(
                                    new Date(`${cert.expiryDate}T00:00:00Z`)
                                  )}`}
                            </p>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleRemoveCertificate(index)}
                            aria-label={`Remove ${cert.name}`}
                            className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-[8px] text-rp-danger hover:bg-rp-danger-bg transition"
                          >
                            <Trash2 className="h-4 w-4" strokeWidth={2} />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <button
                  type="button"
                  onClick={openCertModal}
                  className="w-full h-[44px] inline-flex items-center justify-center gap-1.5 rounded-[10px] border-[1.5px] border-dashed border-rp-primary bg-rp-surface px-4 text-[12.5px] font-bold text-rp-primary hover:bg-rp-surface-met transition"
                >
                  <Plus className="h-4 w-4" strokeWidth={2.4} />
                  <span>Add Certificate</span>
                </button>
              </section>

              {/* Experience Card */}
              <section
                id="experiences"
                className="rounded-[16px] bg-rp-surface p-4 lg:p-[22px] border border-rp-border shadow-rp-flat flex flex-col justify-between gap-4"
              >
                <div className="space-y-3.5">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h2 className="text-[14.5px] font-extrabold text-rp-text">
                        Experience
                      </h2>
                      <p className="text-[11.5px] text-rp-text-muted mt-0.5">
                        Internships, campus organizations, committees and projects
                      </p>
                    </div>
                    <span className="inline-flex rounded-full bg-rp-bg px-2.5 py-0.5 text-[10.5px] font-bold text-rp-primary shrink-0">
                      {experiences.length} recorded
                    </span>
                  </div>

                  {experiences.length === 0 ? (
                    <div className="rounded-[12px] bg-rp-bg/40 border border-dashed border-rp-border p-4 text-center">
                      <Briefcase className="mx-auto h-6 w-6 text-rp-sage-strong mb-1.5" />
                      <p className="text-[12px] font-semibold text-rp-text-muted">
                        No experiences recorded yet
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-2.5">
                      {experiences.map((exp, index) => (
                        <div
                          key={exp.localId}
                          className="flex items-center justify-between gap-3 rounded-[12px] bg-rp-bg/45 border border-rp-hairline px-3.5 py-3"
                        >
                          <div className="min-w-0 flex-1">
                            <p className="text-[13px] font-bold text-rp-text truncate">
                              {exp.role}
                            </p>
                            <p className="text-[11px] text-rp-text-muted mt-0.5 truncate">
                              {exp.organization} · {exp.durationMonths}{" "}
                              {Number(exp.durationMonths) === 1
                                ? "month"
                                : "months"}{" "}
                              · {EXPERIENCE_CATEGORY_LABELS[exp.category]}
                            </p>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleRemoveExperience(index)}
                            aria-label={`Remove ${exp.role || "experience"}`}
                            className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-[8px] text-rp-danger hover:bg-rp-danger-bg transition"
                          >
                            <Trash2 className="h-4 w-4" strokeWidth={2} />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <button
                  type="button"
                  onClick={openExpModal}
                  className="w-full h-[44px] inline-flex items-center justify-center gap-1.5 rounded-[10px] border-[1.5px] border-dashed border-rp-primary bg-rp-surface px-4 text-[12.5px] font-bold text-rp-primary hover:bg-rp-surface-met transition"
                >
                  <Plus className="h-4 w-4" strokeWidth={2.4} />
                  <span>Add Experience</span>
                </button>
              </section>
            </div>
          </form>

          {/* Undo Snackbar on Delete */}
          {undoStack && (
            <div
              role="status"
              className="flex items-center justify-between gap-3 rounded-[12px] bg-rp-primary px-4 py-3 text-[12.5px] text-white shadow-rp-card"
            >
              <span>
                Removed{" "}
                <strong>
                  {undoStack.kind === "certificate"
                    ? undoStack.item.name
                    : undoStack.item.role || "experience"}
                </strong>
              </span>
              <button
                type="button"
                onClick={handleUndo}
                className="inline-flex items-center gap-1.5 font-bold underline underline-offset-2"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                Undo
              </button>
            </div>
          )}
        </main>
      </div>

      {/* Mobile Sticky Save CTA */}
      <footer className="lg:hidden sticky bottom-0 z-10 px-4 pt-2.5 pb-[max(1rem,env(safe-area-inset-bottom))] bg-rp-surface border-t border-rp-border">
        <button
          type="submit"
          form="profile-setup-form"
          className="w-full h-[48px] inline-flex items-center justify-center gap-2 rounded-[10px] bg-rp-primary px-4 text-[14.5px] font-bold text-rp-primary-on hover:bg-rp-primary-hover active:brightness-95 transition"
        >
          <span>Save &amp; Explore Opportunities</span>
          <ArrowRight className="h-4 w-4" strokeWidth={2.2} />
        </button>
      </footer>

      {/* RP 10 / D11: Add Certificate Bottom Sheet (Mobile) & Centered Modal (Desktop) */}
      {certModalOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="add-cert-title"
          className="fixed inset-0 z-50 flex items-end lg:items-center justify-center bg-[#112F29]/65 p-0 lg:p-6"
        >
          <div className="w-full lg:max-w-[580px] rounded-t-[24px] lg:rounded-[18px] bg-rp-surface p-5 lg:p-7 shadow-rp-modal space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h2
                  id="add-cert-title"
                  className="text-[19px] lg:text-[20px] font-extrabold text-rp-text"
                >
                  Add Certificate
                </h2>
                <p className="text-[11.5px] text-rp-text-muted mt-0.5">
                  Saved to your academic profile and checked against opportunity
                  deadlines.
                </p>
              </div>
              <button
                type="button"
                aria-label="Close modal"
                onClick={() => setCertModalOpen(false)}
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-rp-bg text-rp-primary hover:bg-rp-border/70 transition"
              >
                <X className="h-4 w-4" strokeWidth={2.4} />
              </button>
            </div>

            <form onSubmit={handleSaveCertificate} className="space-y-3.5">
              <div>
                <label
                  htmlFor="modal-cert-preset"
                  className="block text-[11.5px] font-bold text-rp-sage-strong mb-1.5"
                >
                  Certificate Type
                </label>
                <div className="relative">
                  <select
                    id="modal-cert-preset"
                    value={certCode}
                    onChange={(e) => {
                      const preset = CERTIFICATE_PRESETS.find(
                        (p) => p.code === e.target.value
                      );
                      setCertCode(e.target.value);
                      if (preset) {
                        setCertCategory(preset.category);
                        if (preset.code !== "CUSTOM") setCertName(preset.label);
                        else setCertName("");
                      }
                    }}
                    className="w-full h-[46px] appearance-none rounded-[10px] bg-rp-surface border border-rp-border pl-3.5 pr-9 text-[13px] font-semibold text-rp-text focus:outline-none focus:ring-2 focus:ring-rp-primary"
                  >
                    {CERTIFICATE_PRESETS.map((preset) => (
                      <option key={preset.code} value={preset.code}>
                        {preset.label}
                      </option>
                    ))}
                  </select>
                  <ChevronDown
                    aria-hidden="true"
                    className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-rp-text-muted"
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="modal-cert-name"
                  className="block text-[11.5px] font-bold text-rp-sage-strong mb-1.5"
                >
                  Certificate Name
                </label>
                <input
                  id="modal-cert-name"
                  type="text"
                  value={certName}
                  onChange={(e) => setCertName(e.target.value)}
                  placeholder="e.g. TOEFL ITP, UKBI Kemendikbud"
                  className="w-full h-[46px] rounded-[10px] bg-rp-surface border border-rp-border px-3.5 text-[13px] text-rp-text focus:outline-none focus:ring-2 focus:ring-rp-primary"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label
                    htmlFor="modal-cert-score"
                    className="block text-[11.5px] font-bold text-rp-sage-strong mb-1.5"
                  >
                    Score (Optional)
                  </label>
                  <input
                    id="modal-cert-score"
                    type="number"
                    step="0.5"
                    value={certScore}
                    onChange={(e) => setCertScore(e.target.value)}
                    placeholder="e.g. 550 or 6.5"
                    className="w-full h-[46px] rounded-[10px] bg-rp-surface border border-rp-border px-3.5 text-[13px] text-rp-text focus:outline-none focus:ring-2 focus:ring-rp-primary"
                  />
                </div>

                <div>
                  <label
                    htmlFor="modal-cert-expiry"
                    className="block text-[11.5px] font-bold text-rp-sage-strong mb-1.5"
                  >
                    Expiry Date
                  </label>
                  <input
                    id="modal-cert-expiry"
                    type="date"
                    disabled={certNoExpiry}
                    value={certExpiry}
                    onChange={(e) => setCertExpiry(e.target.value)}
                    className="w-full h-[46px] rounded-[10px] bg-rp-surface border border-rp-border px-3.5 text-[13px] text-rp-text disabled:opacity-45 focus:outline-none focus:ring-2 focus:ring-rp-primary"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between pt-1">
                <span className="text-[12.5px] font-semibold text-rp-text">
                  Does not expire
                </span>
                <ToggleSwitch
                  checked={certNoExpiry}
                  onChange={setCertNoExpiry}
                  ariaLabel="Certificate does not expire"
                />
              </div>

              {certError && (
                <p className="text-[11.5px] font-semibold text-rp-danger">
                  {certError}
                </p>
              )}

              <button
                type="submit"
                className="w-full h-[48px] rounded-[10px] bg-rp-primary text-[14px] font-bold text-white hover:bg-rp-primary-hover transition"
              >
                Save Certificate
              </button>
            </form>
          </div>
        </div>
      )}

      {/* RP 13 / D12: Add Experience Bottom Sheet (Mobile) & Centered Modal (Desktop) */}
      {expModalOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="add-exp-title"
          className="fixed inset-0 z-50 flex items-end lg:items-center justify-center bg-[#112F29]/65 p-0 lg:p-6"
        >
          <div className="w-full lg:max-w-[580px] rounded-t-[24px] lg:rounded-[18px] bg-rp-surface p-5 lg:p-7 shadow-rp-modal space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h2
                  id="add-exp-title"
                  className="text-[19px] lg:text-[20px] font-extrabold text-rp-text"
                >
                  Add Experience
                </h2>
                <p className="text-[11.5px] text-rp-text-muted mt-0.5">
                  Saved to your academic profile and counted toward organization
                  &amp; internship rules.
                </p>
              </div>
              <button
                type="button"
                aria-label="Close modal"
                onClick={() => setExpModalOpen(false)}
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-rp-bg text-rp-primary hover:bg-rp-border/70 transition"
              >
                <X className="h-4 w-4" strokeWidth={2.4} />
              </button>
            </div>

            <form onSubmit={handleSaveExperience} className="space-y-3.5">
              <div>
                <label
                  htmlFor="modal-exp-role"
                  className="block text-[11.5px] font-bold text-rp-sage-strong mb-1.5"
                >
                  Role Title
                </label>
                <input
                  id="modal-exp-role"
                  type="text"
                  value={expRole}
                  onChange={(e) => setExpRole(e.target.value)}
                  placeholder="e.g. Web Developer Intern, Division Coordinator"
                  className="w-full h-[46px] rounded-[10px] bg-rp-surface border border-rp-border px-3.5 text-[13px] text-rp-text focus:outline-none focus:ring-2 focus:ring-rp-primary"
                />
              </div>

              <div>
                <label
                  htmlFor="modal-exp-org"
                  className="block text-[11.5px] font-bold text-rp-sage-strong mb-1.5"
                >
                  Organization
                </label>
                <input
                  id="modal-exp-org"
                  type="text"
                  value={expOrg}
                  onChange={(e) => setExpOrg(e.target.value)}
                  placeholder="e.g. AMCC, Lab Multimedia AMIKOM, BEM"
                  className="w-full h-[46px] rounded-[10px] bg-rp-surface border border-rp-border px-3.5 text-[13px] text-rp-text focus:outline-none focus:ring-2 focus:ring-rp-primary"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label
                    htmlFor="modal-exp-category"
                    className="block text-[11.5px] font-bold text-rp-sage-strong mb-1.5"
                  >
                    Category
                  </label>
                  <div className="relative">
                    <select
                      id="modal-exp-category"
                      value={expCategory}
                      onChange={(e) =>
                        setExpCategory(e.target.value as ExperienceCategory)
                      }
                      className="w-full h-[46px] appearance-none rounded-[10px] bg-rp-surface border border-rp-border pl-3.5 pr-9 text-[13px] font-semibold text-rp-text focus:outline-none focus:ring-2 focus:ring-rp-primary"
                    >
                      {(
                        Object.entries(EXPERIENCE_CATEGORY_LABELS) as Array<
                          [ExperienceCategory, string]
                        >
                      ).map(([val, label]) => (
                        <option key={val} value={val}>
                          {label}
                        </option>
                      ))}
                    </select>
                    <ChevronDown
                      aria-hidden="true"
                      className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-rp-text-muted"
                    />
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="modal-exp-months"
                    className="block text-[11.5px] font-bold text-rp-sage-strong mb-1.5"
                  >
                    Duration (Months)
                  </label>
                  <input
                    id="modal-exp-months"
                    type="number"
                    min="1"
                    max="60"
                    value={expMonths}
                    onChange={(e) => setExpMonths(e.target.value)}
                    className="w-full h-[46px] rounded-[10px] bg-rp-surface border border-rp-border px-3.5 text-[13px] text-rp-text focus:outline-none focus:ring-2 focus:ring-rp-primary"
                  />
                </div>
              </div>

              {expError && (
                <p className="text-[11.5px] font-semibold text-rp-danger">
                  {expError}
                </p>
              )}

              <button
                type="submit"
                className="w-full h-[48px] rounded-[10px] bg-rp-primary text-[14px] font-bold text-white hover:bg-rp-primary-hover transition"
              >
                Save Experience
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
