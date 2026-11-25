import { NextResponse } from "next/server";
import { db } from "@/server/db";
import { HttpError, handle } from "@/server/http";
import { serializeOpportunity } from "@/server/serializers";

export const dynamic = "force-dynamic";

export const GET = handle(async (_req, { params }: { params: { id: string } }) => {
  const row = await db.opportunity.findFirst({
    where: { isActive: true, OR: [{ id: params.id }, { slug: params.id }] },
    include: { rule: true },
  });
  if (!row) throw new HttpError(404, "Opportunity not found");
  return NextResponse.json({ item: serializeOpportunity(row) });
});
