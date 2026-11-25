import { NextResponse } from "next/server";
import { db } from "@/server/db";
import { handle, requireUser } from "@/server/http";

export const dynamic = "force-dynamic";

/** Deletes the account and, through cascading relations, profile, certificates, experiences and plans. */
export const DELETE = handle(async () => {
  const user = await requireUser();
  await db.user.delete({ where: { id: user.id } });
  return new NextResponse(null, { status: 204 });
});
