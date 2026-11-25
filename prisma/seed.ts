/**
 * Seeds the opportunity catalog from src/lib/data/prototype-opportunities.ts.
 *
 * Honesty rule: `lastVerifiedAt` is filled ONLY from prisma/data/verification-log.json, i.e. when a
 * team member recorded a real check against the official source. Everything else stays NULL.
 *
 * Run:  npm run db:seed
 */
import { PrismaClient } from "@prisma/client";
import { PROTOTYPE_OPPORTUNITIES } from "../src/lib/data/prototype-opportunities";
import { endOfDayWib } from "../src/server/time";
import verificationLog from "./data/verification-log.json";

const prisma = new PrismaClient();

const CATEGORY_MAP = {
  Scholarship: "SCHOLARSHIP",
  Competition: "COMPETITION",
  Internship: "INTERNSHIP",
  Training: "TRAINING",
} as const;

interface LogEntry {
  verifiedAt: string;
  verifiedBy: string;
}

function verifiedDate(slug: string): Date | null {
  const entry = (verificationLog as Record<string, unknown>)[slug] as Partial<LogEntry> | undefined;
  if (!entry || !entry.verifiedAt || !entry.verifiedBy) return null;
  const d = new Date(entry.verifiedAt);
  return Number.isNaN(d.getTime()) ? null : d;
}

async function main() {
  let unverified = 0;

  for (const opp of PROTOTYPE_OPPORTUNITIES) {
    // The data file states a calendar date; store it as 23:59:59 WIB of that date.
    const deadline = endOfDayWib(opp.deadline.toISOString().slice(0, 10));
    const lastVerifiedAt = verifiedDate(opp.slug);
    if (!lastVerifiedAt) unverified += 1;

    const rule = {
      minSemester: opp.rule.minSemester,
      maxSemester: opp.rule.maxSemester,
      minGpa: opp.rule.minGpa,
      minExperienceMonths: opp.rule.minExperienceMonths,
      allowedExperienceCategories: opp.rule.allowedExperienceCategories,
      targetDegrees: opp.rule.targetDegrees,
      eligibleMajors: opp.rule.eligibleMajors,
      requiredCertificates: opp.rule.requiredCertificates,
    };

    const base = {
      slug: opp.slug,
      title: opp.title,
      provider: opp.organizer,
      category: CATEGORY_MAP[opp.category],
      summary: opp.summary,
      deadline,
      sourceUrl: opp.sourceUrl,
      lastVerifiedAt,
      isPrototype: true,
      isActive: true,
    };

    await prisma.opportunity.upsert({
      where: { id: opp.id },
      create: { id: opp.id, ...base, rule: { create: rule } },
      update: { ...base, rule: { upsert: { create: rule, update: rule } } },
    });
  }

  console.log(`Seeded ${PROTOTYPE_OPPORTUNITIES.length} opportunities.`);
  if (unverified > 0) {
    console.warn(
      `WARNING: ${unverified} of ${PROTOTYPE_OPPORTUNITIES.length} opportunities have lastVerifiedAt = NULL ` +
        "(not verified against an official source). Record real checks in prisma/data/verification-log.json."
    );
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
