import {
  RequiredCertificatesJsonSchema,
  type CertificateRequirementRule,
} from "@/lib/db/types";
import type {
  EngineOpportunityTarget,
  EngineStudentProfile,
} from "@/lib/engine";

/** Prisma Decimal | number | string | null -> number | null. */
export function num(value: unknown): number | null {
  if (value === null || value === undefined) return null;
  const n = Number(value);
  return Number.isFinite(n) ? n : null;
}

/* eslint-disable @typescript-eslint/no-explicit-any */

export function toEngineProfile(row: any): EngineStudentProfile {
  return {
    degreeLevel: row.degreeLevel,
    major: row.major ?? null,
    currentSemester: row.currentSemester,
    cumulativeGpa: num(row.cumulativeGpa) ?? 0,
    totalCreditsCompleted: row.totalCreditsCompleted ?? null,
    certificates: (row.certificates ?? []).map((c: any) => ({
      id: c.id,
      name: c.name,
      standardCode: c.standardCode,
      category: c.category,
      score: num(c.score),
      issueDate: c.issueDate ? new Date(c.issueDate) : null,
      expiryDate: new Date(c.expiryDate),
    })),
    experiences: (row.experiences ?? []).map((e: any) => ({
      id: e.id,
      role: e.role,
      organization: e.organization,
      category: e.category,
      durationMonths: e.durationMonths,
    })),
  };
}

export function parseRequiredCertificates(json: unknown): CertificateRequirementRule[] {
  const parsed = RequiredCertificatesJsonSchema.safeParse(json ?? []);
  if (!parsed.success) {
    throw new Error("Opportunity rule has invalid requiredCertificates JSON");
  }
  return parsed.data;
}

export function toEngineTarget(opp: any): EngineOpportunityTarget {
  if (!opp.rule) throw new Error(`Opportunity ${opp.id} has no rule`);
  return {
    id: opp.id,
    title: opp.title,
    deadline: new Date(opp.deadline),
    rule: {
      minSemester: opp.rule.minSemester,
      maxSemester: opp.rule.maxSemester,
      minGpa: num(opp.rule.minGpa) ?? 0,
      minExperienceMonths: opp.rule.minExperienceMonths,
      allowedExperienceCategories: opp.rule.allowedExperienceCategories ?? [],
      targetDegrees: opp.rule.targetDegrees ?? [],
      eligibleMajors: opp.rule.eligibleMajors ?? [],
      requiredCertificates: parseRequiredCertificates(opp.rule.requiredCertificates),
    },
  };
}

/** Public JSON shape of an opportunity (no internal timestamps). */
export function serializeOpportunity(opp: any) {
  return {
    id: opp.id,
    slug: opp.slug,
    title: opp.title,
    provider: opp.provider,
    category: opp.category,
    summary: opp.summary,
    openDate: opp.openDate ?? null,
    deadline: opp.deadline,
    announcementDate: opp.announcementDate ?? null,
    sourceUrl: opp.sourceUrl,
    /** null means "not verified by the team yet" - clients must show that honestly. */
    lastVerifiedAt: opp.lastVerifiedAt ?? null,
    isPrototype: opp.isPrototype,
    rule: opp.rule
      ? {
          minSemester: opp.rule.minSemester,
          maxSemester: opp.rule.maxSemester,
          minGpa: num(opp.rule.minGpa),
          minExperienceMonths: opp.rule.minExperienceMonths,
          allowedExperienceCategories: opp.rule.allowedExperienceCategories ?? [],
          targetDegrees: opp.rule.targetDegrees ?? [],
          eligibleMajors: opp.rule.eligibleMajors ?? [],
          requiredCertificates: parseRequiredCertificates(opp.rule.requiredCertificates),
        }
      : null,
  };
}

export function serializeProfile(row: any) {
  return toEngineProfile(row);
}
