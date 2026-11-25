import type { CertificateRequirementRule } from "../db/types";
import type {
  CertificateGapReason,
  EngineCertificate,
  EngineOpportunityTarget,
  EngineStudentProfile,
  GapReport,
  GapReportItem,
} from "./schema";

const MS_PER_DAY = 24 * 60 * 60 * 1000;

function roundToTwo(value: number): number {
  return Math.round((value + Number.EPSILON) * 100) / 100;
}

function toUtcDayMs(date: Date): number {
  return Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate());
}

function addUtcDays(date: Date, days: number): Date {
  return new Date(toUtcDayMs(date) + days * MS_PER_DAY);
}

function formatDateIso(date: Date): string {
  return date.toISOString().slice(0, 10);
}

function evaluateCertificateRule(
  certRule: CertificateRequirementRule,
  certificates: EngineCertificate[],
  deadline: Date
): GapReportItem {
  const acceptedMap = new Map(
    certRule.acceptedCodes.map((c) => [c.code.toUpperCase(), c])
  );

  const requiredValidUntil = addUtcDays(
    deadline,
    certRule.mustBeValidUntilDaysAfterDeadline
  );
  const requiredValidDayMs = toUtcDayMs(requiredValidUntil);

  const requiredSummary = certRule.acceptedCodes
    .map((c) =>
      c.minScore !== undefined ? `${c.displayName} (>= ${c.minScore})` : c.displayName
    )
    .join(" / ");

  const matchingCerts = certificates.filter((cert) =>
    acceptedMap.has(cert.standardCode.toUpperCase())
  );

  if (matchingCerts.length === 0) {
    return {
      id: `cert-${certRule.id}`,
      type: "CERTIFICATE",
      label: `Missing ${certRule.label}`,
      status: "NOT_MET",
      actualDisplay: "None",
      requiredDisplay: `${requiredSummary}, valid on ${formatDateIso(requiredValidUntil)}`,
      gapDetail: `${requiredSummary}, valid on ${formatDateIso(requiredValidUntil)}`,
      meta: {
        certificateReason: "MISSING",
        certificateRule: certRule,
      },
    };
  }

  let hasScorePassingCert = false;
  let bestLowScoreCert: { cert: EngineCertificate; minScore: number } | null = null;
  let expiredPassingCert: EngineCertificate | null = null;

  for (const cert of matchingCerts) {
    const ruleDef = acceptedMap.get(cert.standardCode.toUpperCase())!;
    const minScore = ruleDef.minScore;
    const certScore = cert.score ?? null;

    const scoreMet =
      minScore === undefined || (certScore !== null && certScore >= minScore);
    const expiryMet = toUtcDayMs(cert.expiryDate) >= requiredValidDayMs;

    if (scoreMet && expiryMet) {
      return {
        id: `cert-${certRule.id}`,
        type: "CERTIFICATE",
        label: `${cert.name}${certScore !== null ? ` ${certScore}` : ""} / Valid`,
        status: "MET",
        actualDisplay: `${cert.name}${certScore !== null ? ` (${certScore})` : ""} • Exp ${formatDateIso(cert.expiryDate)}`,
        requiredDisplay: `${requiredSummary}, valid on ${formatDateIso(requiredValidUntil)}`,
        gapDetail: `Valid through ${formatDateIso(cert.expiryDate)}`,
        meta: {
          certificateRule: certRule,
          matchedCertificateName: cert.name,
        },
      };
    }

    if (scoreMet && !expiryMet) {
      hasScorePassingCert = true;
      if (
        !expiredPassingCert ||
        cert.expiryDate.getTime() > expiredPassingCert.expiryDate.getTime()
      ) {
        expiredPassingCert = cert;
      }
    } else if (!scoreMet && minScore !== undefined) {
      if (
        !bestLowScoreCert ||
        (certScore ?? 0) > (bestLowScoreCert.cert.score ?? 0)
      ) {
        bestLowScoreCert = { cert, minScore };
      }
    }
  }

  let reason: CertificateGapReason = "LOW_SCORE";
  let label = `Missing ${certRule.label}`;
  let actualDisplay = "";
  let gapDetail = "";
  let matchedName: string | undefined;

  if (hasScorePassingCert && expiredPassingCert) {
    reason = "EXPIRED_BEFORE_DEADLINE";
    matchedName = expiredPassingCert.name;
    label = `${expiredPassingCert.name} expires before deadline`;
    actualDisplay = `${expiredPassingCert.name}${expiredPassingCert.score != null ? ` (${expiredPassingCert.score})` : ""} • Exp ${formatDateIso(expiredPassingCert.expiryDate)}`;
    gapDetail = `Expired on ${formatDateIso(expiredPassingCert.expiryDate)}; must be valid on ${formatDateIso(requiredValidUntil)}.`;
  } else if (bestLowScoreCert) {
    reason = "LOW_SCORE";
    matchedName = bestLowScoreCert.cert.name;
    const actualScore = bestLowScoreCert.cert.score;
    label = `${bestLowScoreCert.cert.name} ${actualScore ?? "N/A"} / Min ${bestLowScoreCert.minScore}`;
    actualDisplay = `${bestLowScoreCert.cert.name} (${actualScore ?? "no score"})`;
    gapDetail =
      actualScore !== null && actualScore !== undefined
        ? `Score ${actualScore} is below minimum ${bestLowScoreCert.minScore} (need +${roundToTwo(bestLowScoreCert.minScore - actualScore)}).`
        : `Score is required (minimum ${bestLowScoreCert.minScore}).`;
  }

  return {
    id: `cert-${certRule.id}`,
    type: "CERTIFICATE",
    label,
    status: "NOT_MET",
    actualDisplay,
    requiredDisplay: `${requiredSummary}, valid on ${formatDateIso(requiredValidUntil)}`,
    gapDetail,
    meta: {
      certificateReason: reason,
      certificateRule: certRule,
      matchedCertificateName: matchedName,
    },
  };
}

/**
 * Deterministically evaluates a student's profile against opportunity rules.
 * Pairs actual values with minimum requirements per docs/design.md Section 4.5.
 */
export function evaluateEligibility(
  profile: EngineStudentProfile,
  target: EngineOpportunityTarget,
  evaluatedAt: Date = new Date()
): GapReport {
  const { rule } = target;
  const items: GapReportItem[] = [];

  // 1. Degree Level Check
  if (rule.targetDegrees.length > 0) {
    const degreeMet = rule.targetDegrees.includes(profile.degreeLevel);
    items.push({
      id: "degree",
      type: "DEGREE",
      label: `Degree ${profile.degreeLevel} / ${rule.targetDegrees.join(" or ")}`,
      status: degreeMet ? "MET" : "NOT_MET",
      actualDisplay: profile.degreeLevel,
      requiredDisplay: rule.targetDegrees.join(" / "),
      gapDetail: degreeMet
        ? "Degree eligibility"
        : `Open only to ${rule.targetDegrees.join(" / ")} students.`,
    });
  }

  // 2. Major / Study Program Check
  const allowsAllMajors =
    rule.eligibleMajors.length === 0 ||
    rule.eligibleMajors.some((m) => m.trim().toUpperCase() === "ALL");

  if (!allowsAllMajors) {
    const studentMajor = (profile.major ?? "").trim().toLowerCase();
    const majorMet =
      studentMajor.length > 0 &&
      rule.eligibleMajors.some((allowed) => {
        const normalized = allowed.trim().toLowerCase();
        return (
          studentMajor === normalized ||
          studentMajor.includes(normalized) ||
          normalized.includes(studentMajor)
        );
      });

    items.push({
      id: "major",
      type: "MAJOR",
      label: majorMet
        ? `Major ${profile.major}`
        : `Major ${profile.major?.trim() || "Unset"} / Eligible list`,
      status: majorMet ? "MET" : "NOT_MET",
      actualDisplay: profile.major?.trim() || "Unset",
      requiredDisplay: rule.eligibleMajors.join(", "),
      gapDetail: majorMet
        ? "Eligible study program"
        : profile.major?.trim()
          ? `Restricted to: ${rule.eligibleMajors.join(", ")}.`
          : "Add your major to verify eligibility.",
    });
  }

  // 3. Semester Range Check
  const semesterMet =
    profile.currentSemester >= rule.minSemester &&
    profile.currentSemester <= rule.maxSemester;
  const semRangeLabel =
    rule.minSemester === rule.maxSemester
      ? `${rule.minSemester}`
      : `${rule.minSemester}–${rule.maxSemester}`;

  let semesterGapDetail = "Semester standing";
  if (profile.currentSemester < rule.minSemester) {
    semesterGapDetail = `Need ${rule.minSemester - profile.currentSemester} more semester(s) (Min Sem ${rule.minSemester}).`;
  } else if (profile.currentSemester > rule.maxSemester) {
    semesterGapDetail = `Exceeds maximum semester ${rule.maxSemester}.`;
  }

  items.push({
    id: "semester",
    type: "SEMESTER",
    label: `Sem ${profile.currentSemester} / Min ${semRangeLabel}`,
    status: semesterMet ? "MET" : "NOT_MET",
    actualDisplay: `Sem ${profile.currentSemester}`,
    requiredDisplay: `Sem ${semRangeLabel}`,
    gapDetail: semesterGapDetail,
  });

  // 4. Cumulative GPA Check
  const actualGpa = roundToTwo(profile.cumulativeGpa);
  const requiredGpa = roundToTwo(rule.minGpa);
  const gpaMet = actualGpa >= requiredGpa;
  const gpaDelta = roundToTwo(Math.max(0, requiredGpa - actualGpa));

  items.push({
    id: "gpa",
    type: "GPA",
    label: `GPA ${actualGpa.toFixed(2)} / Min ${requiredGpa.toFixed(2)}`,
    status: gpaMet ? "MET" : "NOT_MET",
    actualDisplay: actualGpa.toFixed(2),
    requiredDisplay: `Min ${requiredGpa.toFixed(2)}`,
    gapDetail: gpaMet
      ? "Academic standing"
      : `Short by ${gpaDelta.toFixed(2)} GPA (minimum ${requiredGpa.toFixed(2)}).`,
    meta: {
      gpaDelta,
      targetGpa: requiredGpa,
    },
  });

  // 5. Certificates & Expiry Validity Check
  for (const certRule of rule.requiredCertificates) {
    items.push(
      evaluateCertificateRule(certRule, profile.certificates, target.deadline)
    );
  }

  // 6. Experience Duration Check
  if (rule.minExperienceMonths > 0) {
    const allowedCats = rule.allowedExperienceCategories;
    const totalRelevantMonths = profile.experiences
      .filter(
        (exp) => allowedCats.length === 0 || allowedCats.includes(exp.category)
      )
      .reduce((sum, exp) => sum + Math.max(0, exp.durationMonths), 0);

    const expMet = totalRelevantMonths >= rule.minExperienceMonths;
    const missingMonths = Math.max(
      0,
      rule.minExperienceMonths - totalRelevantMonths
    );

    items.push({
      id: "experience",
      type: "EXPERIENCE",
      label: `Exp ${totalRelevantMonths} mo / Min ${rule.minExperienceMonths} mo`,
      status: expMet ? "MET" : "NOT_MET",
      actualDisplay: `${totalRelevantMonths} months`,
      requiredDisplay: `Min ${rule.minExperienceMonths} months`,
      gapDetail: expMet
        ? "Relevant experience duration"
        : `Missing ${missingMonths} month(s)${allowedCats.length > 0 ? ` (${allowedCats.join(", ")})` : ""}.`,
      meta: {
        missingMonths,
      },
    });
  }

  const metCount = items.filter((item) => item.status === "MET").length;
  const totalCount = items.length;
  const readinessPercent =
    totalCount > 0 ? Math.round((metCount / totalCount) * 100) : 100;

  return {
    opportunityId: target.id,
    opportunityTitle: target.title,
    deadline: target.deadline,
    isEligible: metCount === totalCount,
    metCount,
    totalCount,
    readinessPercent,
    items,
    evaluatedAt,
  };
}
