import { NextResponse } from "next/server";
import { z } from "zod";
import {
  EngineCertificateSchema,
  EngineExperienceSchema,
  EngineStudentProfileSchema,
} from "@/lib/engine";
import { db } from "@/server/db";
import { handle, readJson, requireUser } from "@/server/http";
import { PROFILE_INCLUDE, refreshPlansForUser } from "@/server/plan-service";
import { serializeProfile } from "@/server/serializers";

export const dynamic = "force-dynamic";

const ProfileInputSchema = EngineStudentProfileSchema.extend({
  certificates: z.array(EngineCertificateSchema).max(20).default([]),
  experiences: z.array(EngineExperienceSchema).max(20).default([]),
});

export const GET = handle(async () => {
  const user = await requireUser();
  const row = await db.studentProfile.findUnique({
    where: { userId: user.id },
    include: PROFILE_INCLUDE,
  });
  return NextResponse.json({ profile: row ? serializeProfile(row) : null });
});

/** Replaces the whole profile (simple and predictable for a form that submits everything). */
export const PUT = handle(async (req) => {
  const user = await requireUser();
  const input = await readJson(req, ProfileInputSchema);

  const fields = {
    degreeLevel: input.degreeLevel,
    major: input.major ?? null,
    currentSemester: input.currentSemester,
    cumulativeGpa: Math.round(input.cumulativeGpa * 100) / 100,
    totalCreditsCompleted: input.totalCreditsCompleted ?? null,
  };

  const profile = await db.studentProfile.upsert({
    where: { userId: user.id },
    update: fields,
    create: { userId: user.id, ...fields },
  });

  await db.$transaction([
    db.studentCertificate.deleteMany({ where: { profileId: profile.id } }),
    db.studentExperience.deleteMany({ where: { profileId: profile.id } }),
    db.studentCertificate.createMany({
      data: input.certificates.map((c) => ({
        profileId: profile.id,
        name: c.name,
        standardCode: c.standardCode,
        category: c.category,
        score: c.score ?? null,
        issueDate: c.issueDate ?? null,
        expiryDate: c.expiryDate,
      })),
    }),
    db.studentExperience.createMany({
      data: input.experiences.map((e) => ({
        profileId: profile.id,
        role: e.role,
        organization: e.organization,
        category: e.category,
        durationMonths: e.durationMonths,
      })),
    }),
  ]);

  await refreshPlansForUser(user.id);

  const saved = await db.studentProfile.findUnique({
    where: { userId: user.id },
    include: PROFILE_INCLUDE,
  });
  return NextResponse.json({ profile: serializeProfile(saved) });
});
