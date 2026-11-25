import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/server/db";
import { HttpError, handle } from "@/server/http";
import { serializeOpportunity } from "@/server/serializers";

export const dynamic = "force-dynamic";

const CategorySchema = z.enum(["SCHOLARSHIP", "INTERNSHIP", "COMPETITION", "TRAINING", "EXCHANGE", "FELLOWSHIP"]);

/** Public catalog of active opportunities, soonest deadline first. */
export const GET = handle(async (req) => {
  const raw = new URL(req.url).searchParams.get("category");
  let category: z.infer<typeof CategorySchema> | undefined;
  if (raw) {
    const parsed = CategorySchema.safeParse(raw.toUpperCase());
    if (!parsed.success) throw new HttpError(422, "Unknown category");
    category = parsed.data;
  }
  const rows = await db.opportunity.findMany({
    where: { isActive: true, ...(category ? { category } : {}) },
    include: { rule: true },
    orderBy: { deadline: "asc" },
  });
  return NextResponse.json({ items: rows.map(serializeOpportunity) });
});
