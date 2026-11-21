import { evaluateEligibility } from "./eligibility";
import { calculateRequiredNextTermGpa } from "./gpa-calculator";
import type {
  CountdownMilestone,
  CountdownPlanResult,
  EngineOpportunityTarget,
  EngineStudentProfile,
  GapReport,
  GpaPlanResult,
  ReminderOffsetItem,
} from "./schema";

const MS_PER_DAY = 24 * 60 * 60 * 1000;
const STANDARD_REMINDER_OFFSETS = [30, 14, 7] as const;

function toUtcDayMs(date: Date): number {
  return Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate());
}

function subtractDays(date: Date, days: number): Date {
  return new Date(toUtcDayMs(date) - days * MS_PER_DAY);
}

function diffDays(future: Date, past: Date): number {
  return Math.ceil((toUtcDayMs(future) - toUtcDayMs(past)) / MS_PER_DAY);
}

export interface GenerateCountdownPlanInput {
  profile: EngineStudentProfile;
  target: EngineOpportunityTarget;
  gapReport?: GapReport;
  referenceDate?: Date;
  remainingSemestersBeforeDeadline?: number;
}

/**
 * Generates a Countdown Plan working backward from the opportunity deadline.
 * Produces actionable milestones tied to unmet requirements plus H-30, H-14, H-7 email reminders
 * (skipping any offset already in the past per docs/design.md Section 6).
 */
export function generateCountdownPlan(
  input: GenerateCountdownPlanInput
): CountdownPlanResult {
  const referenceDate = input.referenceDate ?? new Date();
  const { profile, target } = input;
  const gapReport =
    input.gapReport ?? evaluateEligibility(profile, target, referenceDate);

  const daysUntilDeadline = diffDays(target.deadline, referenceDate);
  const isDeadlinePassed = daysUntilDeadline < 0;

  const milestones: CountdownMilestone[] = [];
  let gpaPlan: GpaPlanResult | null = null;

  // 1. GPA gap -> Target Semester GPA milestone
  const gpaItem = gapReport.items.find((item) => item.type === "GPA");
  if (gpaItem && gpaItem.meta?.targetGpa !== undefined) {
    const estimatedRemainingTerms =
      input.remainingSemestersBeforeDeadline ??
      (daysUntilDeadline > 210 ? 2 : daysUntilDeadline > 30 ? 1 : 0);

    const completedSemesters = Math.max(0, profile.currentSemester - 1);

    gpaPlan = calculateRequiredNextTermGpa({
      currentGpa: profile.cumulativeGpa,
      completedSemesters,
      targetGpa: gpaItem.meta.targetGpa,
      remainingSemesters: estimatedRemainingTerms,
      totalCreditsCompleted: profile.totalCreditsCompleted,
    });

    if (gpaItem.status === "NOT_MET") {
      const gpaCheckDaysBefore = Math.min(
        30,
        Math.max(14, Math.floor(daysUntilDeadline / 2))
      );
      const gpaTargetDate = subtractDays(target.deadline, gpaCheckDaysBefore);

      milestones.push({
        title:
          gpaPlan.isAchievable && gpaPlan.requiredTermGpa !== null
            ? `Reach ${gpaPlan.requiredTermGpa.toFixed(2)} term GPA`
            : `Review GPA gap (${profile.cumulativeGpa.toFixed(2)} / Min ${gpaItem.meta.targetGpa.toFixed(2)})`,
        description: gpaPlan.message,
        type: "TARGET_SEMESTER_GPA",
        targetDate: gpaTargetDate,
        daysBeforeDeadline: gpaCheckDaysBefore,
        isPastDue: toUtcDayMs(gpaTargetDate) < toUtcDayMs(referenceDate),
      });
    }
  }

  // 2. Certificate gaps -> backward test/renewal dates
  const certGapItems = gapReport.items.filter(
    (item) => item.type === "CERTIFICATE" && item.status === "NOT_MET"
  );

  for (const certItem of certGapItems) {
    const certRule = certItem.meta?.certificateRule;
    if (!certRule) continue;

    const prepDays = certRule.estPrepAndResultDays ?? 45;
    const targetDate = subtractDays(target.deadline, prepDays);
    const isRenewal =
      certItem.meta?.certificateReason === "EXPIRED_BEFORE_DEADLINE";

    const acceptedNames = certRule.acceptedCodes
      .map((c) =>
        c.minScore !== undefined
          ? `${c.displayName} (min ${c.minScore})`
          : c.displayName
      )
      .join(" or ");

    milestones.push({
      title: isRenewal
        ? `Renew ${certRule.label}`
        : `Take ${certRule.label} test`,
      description: isRenewal
        ? `Your certificate expires before the deadline. Retake (${acceptedNames}) by H-${prepDays} so official results arrive in time.`
        : `Take ${acceptedNames} by H-${prepDays} so official results are issued before the deadline.`,
      type: isRenewal ? "CERTIFICATE_RENEWAL" : "CERTIFICATE_ACQUISITION",
      targetDate,
      daysBeforeDeadline: prepDays,
      isPastDue: toUtcDayMs(targetDate) < toUtcDayMs(referenceDate),
    });
  }

  // 3. Experience gap -> start date calculated backward from deadline
  const expItem = gapReport.items.find(
    (item) => item.type === "EXPERIENCE" && item.status === "NOT_MET"
  );
  if (expItem && expItem.meta?.missingMonths && expItem.meta.missingMonths > 0) {
    const missingMonths = expItem.meta.missingMonths;
    const daysNeeded = missingMonths * 30;
    const startTargetDate = subtractDays(target.deadline, daysNeeded);

    milestones.push({
      title: `Start relevant experience (${missingMonths} mo needed)`,
      description: `Missing ${missingMonths} month(s) of experience. Begin a qualifying role or activity by H-${daysNeeded} to meet the duration before submission.`,
      type: "EXPERIENCE_BUILDING",
      targetDate: startTargetDate,
      daysBeforeDeadline: daysNeeded,
      isPastDue: toUtcDayMs(startTargetDate) < toUtcDayMs(referenceDate),
    });
  }

  // 4. Standard backward checkpoints (H-14 Document Draft & H-3 Final Submission)
  const docDaysBefore = 14;
  const docTargetDate = subtractDays(target.deadline, docDaysBefore);
  milestones.push({
    title: "Finalize application documents",
    description:
      "Prepare and review your CV, official transcript, recommendation letters, and supporting essays.",
    type: "DOCUMENT_DRAFT",
    targetDate: docTargetDate,
    daysBeforeDeadline: docDaysBefore,
    isPastDue: toUtcDayMs(docTargetDate) < toUtcDayMs(referenceDate),
  });

  const submitDaysBefore = 3;
  const submitTargetDate = subtractDays(target.deadline, submitDaysBefore);
  milestones.push({
    title: "Submit application on official portal",
    description:
      "Upload all verified files and complete final submission at least 3 days early to avoid portal congestion.",
    type: "FINAL_SUBMISSION",
    targetDate: submitTargetDate,
    daysBeforeDeadline: submitDaysBefore,
    isPastDue: toUtcDayMs(submitTargetDate) < toUtcDayMs(referenceDate),
  });

  milestones.sort((a, b) => a.targetDate.getTime() - b.targetDate.getTime());

  // 5. Reminder schedule (H-30, H-14, H-7), skipping offsets already in the past
  const refDayMs = toUtcDayMs(referenceDate);
  const reminderSchedule: ReminderOffsetItem[] = STANDARD_REMINDER_OFFSETS
    .map((days) => ({
      code: `H-${days}`,
      daysBeforeDeadline: days,
      sendDate: subtractDays(target.deadline, days),
    }))
    .filter((item) => toUtcDayMs(item.sendDate) >= refDayMs);

  return {
    opportunityId: target.id,
    opportunityTitle: target.title,
    deadline: target.deadline,
    daysUntilDeadline,
    isDeadlinePassed,
    isFullyEligible: gapReport.isEligible,
    gpaPlan,
    milestones,
    reminderSchedule,
  };
}
