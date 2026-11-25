import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import type { z } from "zod";
import { authOptions } from "@/lib/auth";

export class HttpError extends Error {
  constructor(
    public status: number,
    message: string,
    public details?: unknown
  ) {
    super(message);
  }
}

export interface AuthedUser {
  id: string;
  email: string;
  name: string | null;
}

export async function requireUser(): Promise<AuthedUser> {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id || !session.user.email) {
    throw new HttpError(401, "Authentication required");
  }
  return { id: session.user.id, email: session.user.email, name: session.user.name ?? null };
}

export async function readJson<T>(req: Request, schema: z.ZodType<T, z.ZodTypeDef, unknown>): Promise<T> {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    throw new HttpError(400, "Request body must be valid JSON");
  }
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    throw new HttpError(422, "Validation failed", parsed.error.flatten());
  }
  return parsed.data;
}

/** Wraps a route handler so thrown HttpErrors become JSON responses and anything else becomes a 500. */
export function handle<Ctx = unknown>(fn: (req: Request, ctx: Ctx) => Promise<Response>) {
  return async (req: Request, ctx: Ctx): Promise<Response> => {
    try {
      return await fn(req, ctx);
    } catch (error) {
      if (error instanceof HttpError) {
        return NextResponse.json(
          { error: error.message, details: error.details },
          { status: error.status }
        );
      }
      console.error("[api] unhandled error", error);
      return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
  };
}
