import { NextResponse } from "next/server";
import { db } from "@/server/db";
import { resolveProvider } from "@/server/email";

export const dynamic = "force-dynamic";

/** Deployment smoke test: DB reachable and which optional services are configured (no secrets). */
export async function GET() {
  const config = {
    emailProvider: resolveProvider(),
    googleSignIn: !!(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET),
    cronConfigured: !!process.env.CRON_SECRET,
    authSecretConfigured: !!process.env.NEXTAUTH_SECRET,
  };
  try {
    await db.$queryRaw`SELECT 1`;
    return NextResponse.json({ ok: true, database: "up", ...config });
  } catch {
    return NextResponse.json({ ok: false, database: "down", ...config }, { status: 503 });
  }
}
