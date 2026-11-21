import { z } from "zod";
import {
  CertificateRequirementRuleSchema,
  type CertificateRequirementRule,
} from "../db/types";

export const DegreeLevelSchema = z.enum(["D3", "D4", "S1", "S2"]);
export type DegreeLevel = z.infer<typeof DegreeLevelSchema>;

export const CertificateCategorySchema = z.enum([
  "ENGLISH_PROFICIENCY",
  "OTHER_LANGUAGE",
  "TECHNICAL_CLOUD",
  "DOMAIN_PROFESSIONAL",
  "COMPETITION_AWARD",
]);
export type CertificateCategory = z.infer<typeof CertificateCategorySchema>;

export const ExperienceCategorySchema = z.enum([
  "INTERNSHIP",
  "ORGANIZATION",
  "VOLUNTEER",
  "RESEARCH_PROJECT",
  "FREELANCE_WORK",
]);
export type ExperienceCategory = z.infer<typeof ExperienceCategorySchema>;

export const MilestoneTypeSchema = z.enum([
  "TARGET_SEMESTER_GPA",
  "CERTIFICATE_ACQUISITION",
  "CERTIFICATE_RENEWAL",
  "EXPERIENCE_BUILDING",
  "DOCUMENT_DRAFT",
  "FINAL_SUBMISSION",
]);
export type MilestoneType = z.infer<typeof MilestoneTypeSchema>;

export const EngineCertificateSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1),
  standardCode: z.string().min(1),
  category: CertificateCategorySchema,
  score: z.number().nullable().optional(),
  issueDate: z.coerce.date().nullable().optional(),
  expiryDate: z.coerce.date(),
});
export type EngineCertificate = z.infer<typeof EngineCertificateSchema>;

export const EngineExperienceSchema = z.object({
  id: z.string().optional(),
  role: z.string().min(1),
  organization: z.string().min(1),
  category: ExperienceCategorySchema,
  durationMonths: z.number().int().nonnegative(),
});
export type EngineExperience = z.infer<typeof EngineExperienceSchema>;

export const EngineStudentProfileSchema = z.object({
  degreeLevel: DegreeLevelSchema,
  major: z.string().nullable().optional(),
  currentSemester: z.number().int().min(1).max(14),
  cumulativeGpa: z.number().min(0).max(4),
  totalCreditsCompleted: z.number().int().nonnegative().nullable().optional(),
  certificates: z.array(EngineCertificateSchema).default([]),
  experiences: z.array(EngineExperienceSchema).default([]),
});
export type EngineStudentProfile = z.infer<typeof EngineStudentProfileSchema>;

export const EngineOpportunityRuleSchema = z.object({
  minSemester: z.number().int().min(1).default(1),
  maxSemester: z.number().int().min(1).default(14),
  minGpa: z.number().min(0).max(4),
  minExperienceMonths: z.number().int().nonnegative().default(0),
  allowedExperienceCategories: z.array(ExperienceCategorySchema).default([]),
  targetDegrees: z.array(DegreeLevelSchema).default([]),
  eligibleMajors: z.array(z.string()).default([]),
  requiredCertificates: z.array(CertificateRequirementRuleSchema).default([]),
});
export type EngineOpportunityRule = z.infer<typeof EngineOpportunityRuleSchema>;

export const EngineOpportunityTargetSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1),
  deadline: z.coerce.date(),
  rule: EngineOpportunityRuleSchema,
});
export type EngineOpportunityTarget = z.infer<typeof EngineOpportunityTargetSchema>;

export type RequirementStatus = "MET" | "NOT_MET";

export type GapItemType =
  | "DEGREE"
  | "MAJOR"
  | "SEMESTER"
  | "GPA"
  | "CERTIFICATE"
  | "EXPERIENCE";

export type CertificateGapReason =
  | "MISSING"
  | "LOW_SCORE"
  | "EXPIRED_BEFORE_DEADLINE";

export interface GapReportItemMeta {
  gpaDelta?: number;
  targetGpa?: number;
  missingMonths?: number;
  certificateReason?: CertificateGapReason;
  certificateRule?: CertificateRequirementRule;
  matchedCertificateName?: string;
}

export interface GapReportItem {
  id: string;
  type: GapItemType;
  label: string;
  status: RequirementStatus;
  actualDisplay: string;
  requiredDisplay: string;
  gapDetail: string;
  meta?: GapReportItemMeta;
}

export interface GapReport {
  opportunityId: string;
  opportunityTitle: string;
  deadline: Date;
  isEligible: boolean;
  metCount: number;
  totalCount: number;
  readinessPercent: number;
  items: GapReportItem[];
  evaluatedAt: Date;
}

export interface ReminderOffsetItem {
  code: string; // e.g. "H-30", "H-14", "H-7"
  daysBeforeDeadline: number;
  sendDate: Date;
}

export interface CountdownMilestone {
  title: string;
  description: string;
  type: MilestoneType;
  targetDate: Date;
  daysBeforeDeadline: number;
  isPastDue: boolean;
}

export interface GpaPlanResult {
  alreadyMet: boolean;
  isAchievable: boolean;
  requiredTermGpa: number | null;
  currentGpa: number;
  targetGpa: number;
  gpaGap: number;
  remainingSemesters: number;
  message: string;
}

export interface CountdownPlanResult {
  opportunityId: string;
  opportunityTitle: string;
  deadline: Date;
  daysUntilDeadline: number;
  isDeadlinePassed: boolean;
  isFullyEligible: boolean;
  gpaPlan: GpaPlanResult | null;
  milestones: CountdownMilestone[];
  reminderSchedule: ReminderOffsetItem[];
}
