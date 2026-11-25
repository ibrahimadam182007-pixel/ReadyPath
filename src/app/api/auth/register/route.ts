import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { db } from "@/server/db";
import { HttpError, handle, readJson } from "@/server/http";
import { isEmailAllowed } from "@/server/auth-policy";
import { clientIp, rateLimit } from "@/server/rate-limit";

export const dynamic = "force-dynamic";

const RegisterSchema = z.object({
  name: z.string().trim().min(2).max(80),
  email: z.string().trim().toLowerCase().email().max(254),
  // bcrypt only uses the first 72 bytes, so cap the length to avoid silent truncation surprises.
  password: z.string().min(8).max(72),
  consent: z.literal(true, {
    errorMap: () => ({ message: "You must accept the data-use notice to create an account." }),
  }),
});

export const POST = handle(async (req) => {
  const limit = rateLimit(`register:${clientIp(req)}`, 10, 60 * 60 * 1000);
  if (!limit.allowed) throw new HttpError(429, "Too many sign-up attempts. Try again later.");

  const body = await readJson(req, RegisterSchema);
  if (!isEmailAllowed(body.email)) {
    throw new HttpError(403, "This email domain is not allowed for the pilot.");
  }

  const passwordHash = await bcrypt.hash(body.password, 12);
  try {
    const user = await db.user.create({
      data: {
        email: body.email,
        name: body.name,
        passwordHash,
        consentedAt: new Date(),
      },
      select: { id: true, email: true, name: true },
    });
    return NextResponse.json({ user }, { status: 201 });
  } catch (error) {
    if ((error as { code?: string }).code === "P2002") {
      throw new HttpError(409, "An account with this email already exists.");
    }
    throw error;
  }
});
