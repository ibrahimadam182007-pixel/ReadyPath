import { prisma } from "@/lib/db/prisma";

/**
 * Loose structural type for the Prisma delegates used by the API layer.
 *
 * Why not use the generated types directly? They only exist after `prisma generate`.
 * Keeping the delegates loosely typed lets the project type-check on a fresh clone;
 * all payloads that cross the HTTP boundary are validated with zod instead.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Delegate = any;

export interface Db {
  user: Delegate;
  studentProfile: Delegate;
  studentCertificate: Delegate;
  studentExperience: Delegate;
  opportunity: Delegate;
  targetPlan: Delegate;
  planMilestone: Delegate;
  reminderDispatch: Delegate;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  $transaction: (ops: any[]) => Promise<any[]>;
  $queryRaw: (strings: TemplateStringsArray, ...values: unknown[]) => Promise<unknown>;
}

export const db = prisma as unknown as Db;
