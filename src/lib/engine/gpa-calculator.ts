import type { GpaPlanResult } from "./schema";

export interface CalculateGpaInput {
  currentGpa: number;
  completedSemesters: number;
  targetGpa: number;
  remainingSemesters?: number;
  totalCreditsCompleted?: number | null;
  upcomingCreditsPerSemester?: number;
}

function roundToTwo(value: number): number {
  return Math.round((value + Number.EPSILON) * 100) / 100;
}

/**
 * Computes the minimum required term GPA (IPS) for remaining semesters
 * to reach the target cumulative GPA before the deadline. Pure deterministic math.
 */
export function calculateRequiredNextTermGpa(
  input: CalculateGpaInput
): GpaPlanResult {
  const currentGpa = roundToTwo(input.currentGpa);
  const targetGpa = roundToTwo(input.targetGpa);
  const remainingSemesters = Math.max(0, Math.floor(input.remainingSemesters ?? 1));
  const completedSemesters = Math.max(0, Math.floor(input.completedSemesters));
  const gpaGap = roundToTwo(Math.max(0, targetGpa - currentGpa));

  if (currentGpa >= targetGpa) {
    return {
      alreadyMet: true,
      isAchievable: true,
      requiredTermGpa: null,
      currentGpa,
      targetGpa,
      gpaGap: 0,
      remainingSemesters,
      message: `Current GPA (${currentGpa.toFixed(2)}) already meets the minimum ${targetGpa.toFixed(2)}.`,
    };
  }

  if (remainingSemesters === 0) {
    return {
      alreadyMet: false,
      isAchievable: false,
      requiredTermGpa: null,
      currentGpa,
      targetGpa,
      gpaGap,
      remainingSemesters: 0,
      message: `Short by ${gpaGap.toFixed(2)} GPA with no remaining semesters before the deadline.`,
    };
  }

  let rawRequiredTermGpa: number;

  if (
    input.totalCreditsCompleted != null &&
    input.totalCreditsCompleted > 0
  ) {
    const creditsDone = input.totalCreditsCompleted;
    const creditsPerNextTerm = input.upcomingCreditsPerSemester ?? 20;
    const futureCredits = creditsPerNextTerm * remainingSemesters;
    rawRequiredTermGpa =
      (targetGpa * (creditsDone + futureCredits) - currentGpa * creditsDone) /
      futureCredits;
  } else {
    rawRequiredTermGpa =
      (targetGpa * (completedSemesters + remainingSemesters) -
        currentGpa * completedSemesters) /
      remainingSemesters;
  }

  const requiredTermGpa = roundToTwo(Math.max(0, rawRequiredTermGpa));
  const isAchievable = requiredTermGpa <= 4.0;

  const message = isAchievable
    ? `Need at least ${requiredTermGpa.toFixed(2)} term GPA over the next ${remainingSemesters} semester(s) to reach ${targetGpa.toFixed(2)}.`
    : `Required term GPA (${requiredTermGpa.toFixed(2)}) exceeds the 4.00 scale for ${remainingSemesters} remaining semester(s).`;

  return {
    alreadyMet: false,
    isAchievable,
    requiredTermGpa,
    currentGpa,
    targetGpa,
    gpaGap,
    remainingSemesters,
    message,
  };
}
