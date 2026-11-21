"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  ChevronDown,
  Plus,
  RotateCcw,
  Trash2,
} from "lucide-react";
import { FlowHeader } from "@/components/layout/headers";
import { useReadyPath } from "@/components/providers/readypath-store";
import type {
  DegreeLevel,
  EngineCertificate,
  EngineExperience,
  ExperienceCategory,
} from "@/lib/engine";
import { cn } from "@/lib/utils";

const CERTIFICATE_PRESETS = [
  { code: "TOEFL_ITP", label: "TOEFL ITP", category: "ENGLISH_PROFICIENCY" as const },
  { code: "TOEFL_IBT", label: "TOEFL iBT", category: "ENGLISH_PROFICIENCY" as const },
  { code: "IELTS", label: "IELTS Academic", category: "ENGLISH_PROFICIENCY" as const },
  { code: "DUOLINGO", label: "Duolingo English Test", category: "ENGLISH_PROFICIENCY" as const },
  { code: "EPT_AMIKOM", label: "AMIKOM EPT", category: "ENGLISH_PROFICIENCY" as const },
  { code: "AWS_CCP", label: "AWS Certified Cloud Practitioner", category: "TECHNICAL_CLOUD" as const },
];

interface DraftCertificate {
  localId: string;
  standardCode: string;
  name: string;
  category: EngineCertificate["category"];
  score: string;
  expiryDate: string;
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

export default function StudentProfilePage() {
  const router = useRouter();
  const { profile, updateProfile, isHydrated } = useReadyPath();

  const [degreeLevel, setDegreeLevel] = useState<DegreeLevel>(profile.degreeLevel);
  const [major, setMajor] = useState(profile.major ?? "Informatics");
  const [currentSemester, setCurrentSemester] = useState(String(profile.currentSemester));
  const [cumulativeGpa, setCumulativeGpa] = useState(profile.cumulativeGpa.toFixed(2));
  const [certificates, setCertificates] = useState<DraftCertificate[]>([]);
  const [experiences, setExperiences] = useState<DraftExperience[]>([]);
  const [gpaError, setGpaError] = useState<string | null>(null);
  const [undoStack, setUndoStack] = useState<UndoAction | null>(null);

  useEffect(() => {
    if (!isHydrated) return;
    setDegreeLevel(profile.degreeLevel);
    setMajor(profile.major ?? "Informatics");
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

  const handleAddCertificate = () => {
    const nextYear = new Date();
    nextYear.setUTCFullYear(nextYear.getUTCFullYear() + 1);

    setCertificates((prev) => [
      ...prev,
      {
        localId: `cert-${Date.now()}`,
        standardCode: "TOEFL_ITP",
        name: "TOEFL ITP",
        category: "ENGLISH_PROFICIENCY",
        score: "",
        expiryDate: toDateInputValue(nextYear),
      },
    ]);
  };

  const handleRemoveCertificate = (index: number) => {
    const target = certificates[index];
    if (!target) return;
    setCertificates((prev) => prev.filter((_, i) => i !== index));
    setUndoStack({ kind: "certificate", item: target, index });
  };

  const handleAddExperience = () => {
    setExperiences((prev) => [
      ...prev,
      {
        localId: `exp-${Date.now()}`,
        role: "",
        organization: "",
        category: "ORGANIZATION",
        durationMonths: "3",
      },
    ]);
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

  const handleSave = (e: React.FormEvent) => {
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
        durationMonths: Math.max(0, Number.parseInt(exp.durationMonths, 10) || 0),
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
    <div className="flex-1 flex flex-col min-h-screen bg-rp-bg">
      <FlowHeader
        backHref="/explore"
        title="Your student profile"
        subtitle="These details decide which requirements you already meet."
      />

      <main className="flex-1 px-4 pt-5 pb-6 space-y-6">
        <form id="profile-form" onSubmit={handleSave} noValidate className="space-y-6">
          {/* Academic Standing */}
          <section className="space-y-3">
            <h2 className="text-[15px] font-semibold text-rp-text">
              Academic standing
            </h2>

            <div className="grid grid-cols-2 gap-3">
              {/* Current Semester */}
              <div>
                <label
                  htmlFor="current-semester"
                  className="block text-[12px] font-semibold text-rp-text mb-1.5"
                >
                  Current Semester
                </label>
                <div className="relative">
                  <select
                    id="current-semester"
                    value={currentSemester}
                    onChange={(e) => setCurrentSemester(e.target.value)}
                    className="w-full h-[38px] appearance-none rounded-[8px] bg-rp-surface border border-rp-border pl-3 pr-8 text-[13px] text-rp-text focus:outline-none focus:ring-2 focus:ring-rp-primary"
                  >
                    {Array.from({ length: 12 }, (_, i) => i + 1).map((sem) => (
                      <option key={sem} value={String(sem)}>
                        Semester {sem}
                      </option>
                    ))}
                  </select>
                  <ChevronDown
                    aria-hidden="true"
                    className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-rp-text-muted"
                  />
                </div>
              </div>

              {/* Current GPA */}
              <div>
                <label
                  htmlFor="current-gpa"
                  className="block text-[12px] font-semibold text-rp-text mb-1.5"
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
                      "w-full h-[38px] rounded-[8px] bg-rp-surface border pl-3 pr-12 text-[13px] text-rp-text focus:outline-none focus:ring-2 focus:ring-rp-primary",
                      gpaError ? "border-rp-danger" : "border-rp-border"
                    )}
                  />
                  <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[12px] text-rp-text-muted">
                    /4.00
                  </span>
                </div>
                {gpaError && (
                  <p className="mt-1 text-[11px] font-medium text-rp-danger">
                    {gpaError}
                  </p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <label
                  htmlFor="degree-level"
                  className="block text-[12px] font-semibold text-rp-text mb-1.5"
                >
                  Degree
                </label>
                <div className="relative">
                  <select
                    id="degree-level"
                    value={degreeLevel}
                    onChange={(e) => setDegreeLevel(e.target.value as DegreeLevel)}
                    className="w-full h-[38px] appearance-none rounded-[8px] bg-rp-surface border border-rp-border pl-3 pr-7 text-[13px] text-rp-text focus:outline-none focus:ring-2 focus:ring-rp-primary"
                  >
                    <option value="D3">D3</option>
                    <option value="D4">D4</option>
                    <option value="S1">S1</option>
                    <option value="S2">S2</option>
                  </select>
                  <ChevronDown
                    aria-hidden="true"
                    className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 h-4 w-4 text-rp-text-muted"
                  />
                </div>
              </div>

              <div className="col-span-2">
                <label
                  htmlFor="major-input"
                  className="block text-[12px] font-semibold text-rp-text mb-1.5"
                >
                  Study Program (Major)
                </label>
                <input
                  id="major-input"
                  type="text"
                  value={major}
                  onChange={(e) => setMajor(e.target.value)}
                  placeholder="e.g. Informatics"
                  className="w-full h-[38px] rounded-[8px] bg-rp-surface border border-rp-border px-3 text-[13px] text-rp-text placeholder:text-rp-text-muted focus:outline-none focus:ring-2 focus:ring-rp-primary"
                />
              </div>
            </div>
          </section>

          {/* Certificates Section */}
          <section className="space-y-3">
            <div>
              <h2 className="text-[15px] font-semibold text-rp-text">
                Certificates
              </h2>
              <p className="text-[11px] text-rp-text-muted-bg mt-0.5">
                Add the expiry date to track validity on each opportunity deadline.
              </p>
            </div>

            <div className="space-y-2.5">
              {certificates.map((cert, index) => (
                <div
                  key={cert.localId}
                  className="rounded-[12px] bg-rp-surface p-3 border border-rp-border/70 shadow-rp-flat space-y-2.5"
                >
                  <div className="flex items-center gap-2">
                    <div className="relative flex-1 min-w-0">
                      <select
                        aria-label={`Certificate type ${index + 1}`}
                        value={cert.standardCode}
                        onChange={(e) => {
                          const preset = CERTIFICATE_PRESETS.find(
                            (p) => p.code === e.target.value
                          );
                          setCertificates((prev) =>
                            prev.map((item, i) =>
                              i === index && preset
                                ? {
                                    ...item,
                                    standardCode: preset.code,
                                    name: preset.label,
                                    category: preset.category,
                                  }
                                : item
                            )
                          );
                        }}
                        className="w-full h-[36px] appearance-none rounded-[8px] bg-rp-surface border border-rp-border pl-2.5 pr-7 text-[13px] font-medium text-rp-text focus:outline-none focus:ring-2 focus:ring-rp-primary"
                      >
                        {CERTIFICATE_PRESETS.map((preset) => (
                          <option key={preset.code} value={preset.code}>
                            {preset.label}
                          </option>
                        ))}
                      </select>
                      <ChevronDown
                        aria-hidden="true"
                        className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 h-4 w-4 text-rp-text-muted"
                      />
                    </div>

                    <input
                      aria-label={`Certificate score ${index + 1}`}
                      type="number"
                      step="0.5"
                      value={cert.score}
                      onChange={(e) =>
                        setCertificates((prev) =>
                          prev.map((item, i) =>
                            i === index ? { ...item, score: e.target.value } : item
                          )
                        )
                      }
                      placeholder="Score"
                      className="w-20 h-[36px] rounded-[8px] bg-rp-surface border border-rp-border px-2.5 text-[13px] text-rp-text placeholder:text-rp-text-muted focus:outline-none focus:ring-2 focus:ring-rp-primary"
                    />

                    <button
                      type="button"
                      onClick={() => handleRemoveCertificate(index)}
                      aria-label={`Remove ${cert.name}`}
                      className="inline-flex h-11 w-11 -mr-1.5 items-center justify-center rounded-[8px] text-rp-danger hover:bg-rp-danger-bg transition"
                    >
                      <Trash2 className="h-4 w-4" strokeWidth={1.8} />
                    </button>
                  </div>

                  <div className="flex items-center justify-between gap-2 pt-1 border-t border-rp-border/40">
                    <label
                      htmlFor={`expiry-${cert.localId}`}
                      className="text-[11px] font-medium text-rp-text-muted"
                    >
                      Expires on
                    </label>
                    <div className="relative flex items-center">
                      <input
                        id={`expiry-${cert.localId}`}
                        type="date"
                        value={cert.expiryDate}
                        onChange={(e) =>
                          setCertificates((prev) =>
                            prev.map((item, i) =>
                              i === index
                                ? { ...item, expiryDate: e.target.value }
                                : item
                            )
                          )
                        }
                        className="h-[34px] rounded-[8px] bg-rp-surface border border-rp-border px-2.5 text-[12px] text-rp-text focus:outline-none focus:ring-2 focus:ring-rp-primary"
                      />
                    </div>
                  </div>
                </div>
              ))}

              <button
                type="button"
                onClick={handleAddCertificate}
                className="w-full h-[42px] inline-flex items-center justify-center gap-1.5 rounded-[8px] border-[1.5px] border-dashed border-rp-primary bg-transparent px-4 text-[13px] font-semibold text-rp-primary hover:bg-rp-surface/50 transition"
              >
                <Plus className="h-4 w-4" strokeWidth={2} />
                <span>Add Certificate</span>
              </button>
            </div>
          </section>

          {/* Experience Section */}
          <section className="space-y-3">
            <h2 className="text-[15px] font-semibold text-rp-text">
              Experience
            </h2>

            <div className="space-y-2.5">
              {experiences.map((exp, index) => (
                <div
                  key={exp.localId}
                  className="rounded-[12px] bg-rp-surface p-3 border border-rp-border/70 shadow-rp-flat space-y-2"
                >
                  <div className="flex items-start gap-2">
                    <div className="flex-1 min-w-0 space-y-2">
                      <input
                        aria-label={`Experience role ${index + 1}`}
                        type="text"
                        value={exp.role}
                        onChange={(e) =>
                          setExperiences((prev) =>
                            prev.map((item, i) =>
                              i === index ? { ...item, role: e.target.value } : item
                            )
                          )
                        }
                        placeholder="Role (e.g. Lab Teaching Assistant)"
                        className="w-full h-[36px] rounded-[8px] bg-rp-surface border border-rp-border px-2.5 text-[13px] font-medium text-rp-text placeholder:text-rp-text-muted focus:outline-none focus:ring-2 focus:ring-rp-primary"
                      />
                      <div className="grid grid-cols-3 gap-2">
                        <input
                          aria-label={`Organization ${index + 1}`}
                          type="text"
                          value={exp.organization}
                          onChange={(e) =>
                            setExperiences((prev) =>
                              prev.map((item, i) =>
                                i === index
                                  ? { ...item, organization: e.target.value }
                                  : item
                              )
                            )
                          }
                          placeholder="Place / Org"
                          className="col-span-2 h-[34px] rounded-[8px] bg-rp-surface border border-rp-border px-2.5 text-[12px] text-rp-text placeholder:text-rp-text-muted focus:outline-none focus:ring-2 focus:ring-rp-primary"
                        />
                        <div className="relative">
                          <input
                            aria-label={`Duration in months ${index + 1}`}
                            type="number"
                            min="0"
                            value={exp.durationMonths}
                            onChange={(e) =>
                              setExperiences((prev) =>
                                prev.map((item, i) =>
                                  i === index
                                    ? { ...item, durationMonths: e.target.value }
                                    : item
                                )
                              )
                            }
                            className="w-full h-[34px] rounded-[8px] bg-rp-surface border border-rp-border pl-2.5 pr-7 text-[12px] text-rp-text focus:outline-none focus:ring-2 focus:ring-rp-primary"
                          />
                          <span className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-[11px] text-rp-text-muted">
                            mo
                          </span>
                        </div>
                      </div>
                      <div className="relative">
                        <select
                          aria-label={`Category ${index + 1}`}
                          value={exp.category}
                          onChange={(e) =>
                            setExperiences((prev) =>
                              prev.map((item, i) =>
                                i === index
                                  ? {
                                      ...item,
                                      category: e.target.value as ExperienceCategory,
                                    }
                                  : item
                              )
                            )
                          }
                          className="w-full h-[34px] appearance-none rounded-[8px] bg-rp-surface border border-rp-border pl-2.5 pr-7 text-[12px] text-rp-text focus:outline-none focus:ring-2 focus:ring-rp-primary"
                        >
                          <option value="ORGANIZATION">Campus Organization</option>
                          <option value="INTERNSHIP">Internship / Lab Assistant</option>
                          <option value="VOLUNTEER">Volunteer / Community</option>
                          <option value="RESEARCH_PROJECT">Research / PKM Project</option>
                          <option value="FREELANCE_WORK">Freelance / Work</option>
                        </select>
                        <ChevronDown
                          aria-hidden="true"
                          className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-rp-text-muted"
                        />
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleRemoveExperience(index)}
                      aria-label={`Remove ${exp.role || "experience"}`}
                      className="inline-flex h-11 w-11 -mr-1.5 items-center justify-center rounded-[8px] text-rp-danger hover:bg-rp-danger-bg transition"
                    >
                      <Trash2 className="h-4 w-4" strokeWidth={1.8} />
                    </button>
                  </div>
                </div>
              ))}

              <button
                type="button"
                onClick={handleAddExperience}
                className="w-full h-[42px] inline-flex items-center justify-center gap-1.5 rounded-[8px] border-[1.5px] border-dashed border-rp-primary bg-transparent px-4 text-[13px] font-semibold text-rp-primary hover:bg-rp-surface/50 transition"
              >
                <Plus className="h-4 w-4" strokeWidth={2} />
                <span>Add Experience</span>
              </button>
            </div>
          </section>
        </form>

        {/* Undo Snackbar on Delete */}
        {undoStack && (
          <div
            role="status"
            className="flex items-center justify-between gap-3 rounded-[8px] bg-rp-primary px-3 py-2.5 text-[12px] text-white"
          >
            <span>
              Removed{" "}
              {undoStack.kind === "certificate"
                ? undoStack.item.name
                : undoStack.item.role || "experience"}
            </span>
            <button
              type="button"
              onClick={handleUndo}
              className="inline-flex items-center gap-1 font-semibold underline underline-offset-2"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              Undo
            </button>
          </div>
        )}
      </main>

      {/* Pinned CTA */}
      <footer className="sticky bottom-0 z-10 px-4 pt-2 pb-4 bg-rp-bg">
        <button
          type="submit"
          form="profile-form"
          className="w-full h-[42px] inline-flex items-center justify-center gap-2 rounded-[8px] bg-rp-primary px-4 text-[14px] font-semibold text-rp-primary-on hover:bg-[#123129] active:brightness-90 transition"
        >
          <span>Save &amp; Explore Opportunities</span>
          <ArrowRight className="h-4 w-4" strokeWidth={2} />
        </button>
      </footer>
    </div>
  );
}
