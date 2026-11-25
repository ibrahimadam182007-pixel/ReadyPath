# ReadyPath backend

Next.js route handlers (`src/app/api`) + Prisma/PostgreSQL + NextAuth (email and password) + a daily cron that sends reminder emails. The deterministic eligibility and countdown engine in `src/lib/engine` is reused on the server; no AI is involved in any eligibility decision.

## Architecture

```
Browser (Next.js UI)
  └─ readypath-store.tsx ── signed in? ── yes ──> /api/profile, /api/plans   (database)
                                          └─ no ──> localStorage (demo mode)
API routes (src/app/api)         thin: auth + zod validation + call services
Services (src/server)            pure logic, unit-tested (reminders, time, snapshot, email)
Engine (src/lib/engine)          Gap Report + Countdown Plan (shared with the UI)
Prisma (prisma/schema.prisma)    User, StudentProfile, Opportunity(+Rule), TargetPlan, PlanMilestone, ReminderDispatch
Vercel Cron  ── daily 01:00 UTC (08:00 WIB) ──> /api/cron/reminders ──> email provider
```

## Endpoints

| Method and path | Auth | Purpose |
| --- | --- | --- |
| `POST /api/auth/register` | public (rate limited) | Create account; requires `consent: true` and a password of 8-72 chars |
| `/api/auth/*` | NextAuth | Sign-in (credentials), session, sign-out |
| `GET /api/opportunities?category=` | public | Active catalog, soonest deadline first |
| `GET /api/opportunities/:id` | public | One opportunity with its rules (`id` or `slug`) |
| `GET /api/opportunities/:id/report` | user | Server-side Gap Report + Countdown Plan for the saved profile |
| `GET` / `PUT /api/profile` | user | Read / replace the student profile (certificates and experiences included) |
| `GET /api/plans` | user | Saved plans with fresh readiness and milestones |
| `PUT` / `DELETE /api/plans/:opportunityId` | user | Create/update (idempotent) or remove a plan; reminders: `["H-30","H-14","H-7"]` |
| `DELETE /api/account` | user | Delete the account and everything linked to it |
| `GET` / `POST /api/cron/reminders` | `Authorization: Bearer $CRON_SECRET` | Send due reminders |
| `GET /api/health` | public | DB reachable + which optional services are configured (no secrets) |

## Setup

1. **Database.** Create a PostgreSQL database (Neon or Supabase free tier). Put the pooled URL in `DATABASE_URL` and the direct URL in `DIRECT_URL`.
2. **Environment.** `cp .env.example .env`, then set `NEXTAUTH_SECRET` (`openssl rand -base64 32`), `NEXTAUTH_URL`, `CRON_SECRET` (`openssl rand -hex 32`) and `NEXT_PUBLIC_APP_URL`.
3. **Tables and data.** `npx prisma db push` then `npm run db:seed`.
4. **Run.** `npm run dev`, then `BASE_URL=http://localhost:3000 node scripts/smoke-test.mjs`.
5. **Deploy (Vercel).** Import the repo, copy every variable from `.env`, deploy. `vercel.json` registers the daily cron; Vercel sends `CRON_SECRET` as the bearer token automatically. Run `BASE_URL=https://<your-app> node scripts/smoke-test.mjs` afterwards.

### Email provider

- `EMAIL_PROVIDER=console` (default) only logs; nothing is sent and nothing is recorded as sent.
- **Resend:** set `RESEND_API_KEY` and `EMAIL_FROM`. Resend only delivers to arbitrary recipients from a **verified domain**; without one it can only email the account owner.
- **SMTP** (no domain needed): `EMAIL_PROVIDER=smtp`, `SMTP_HOST`, `SMTP_PORT`, `SMTP_SECURE`, `SMTP_USER`, `SMTP_PASS`. For Gmail use an app password (`smtp.gmail.com`, 465, `SMTP_SECURE=true`).
- Test the cron manually: `curl -H "Authorization: Bearer $CRON_SECRET" https://<app>/api/cron/reminders`. A reminder is due only when the days left (WIB calendar date) equal one of the plan's offsets, and each (plan, offset) is sent once (`ReminderDispatch`).

## Data honesty rules (important for the competition)

- `Opportunity.lastVerifiedAt` is **NULL** unless a team member records a real check in `prisma/data/verification-log.json` (`verifiedAt` + `verifiedBy`) and re-runs `npm run db:seed`. The API returns `null` and reminder emails say the requirements are *not verified*.
- Seeded rows are flagged `isPrototype = true`. Reminder emails tell the student to confirm everything at the official source.
- Deadlines are stored as 23:59:59 WIB of the stated calendar date; all "days left" calculations on the server use the WIB calendar date.

## Privacy and security

- Passwords: bcrypt (cost 12). Sessions: signed JWT cookie (NextAuth). No password is ever returned or logged.
- Consent is required at sign-up and stored as `consentedAt`. `DELETE /api/account` removes the user and, by cascade, profile, certificates, experiences, plans and reminder logs.
- Data minimisation: only email, name, semester, GPA, certificates and experience are stored.
- Sign-up is rate limited per IP with an in-memory counter. On serverless this is only a speed bump; it is not a security boundary.
- Optional `ALLOWED_EMAIL_DOMAINS` restricts sign-ups to specific domains.

## Known limitations

- No password reset and no email verification yet. Login errors do not reveal whether an email exists.
- The catalog pages in the UI still read `src/lib/data/prototype-opportunities.ts`; the database copy (same ids) is what the API and reminders use. Re-run the seed after editing the data file.
- Profile saves replace all certificate and experience rows (simple and predictable; ids change after each save).
- The cron loads all active reminder plans in one query. This is fine for a pilot of tens of users.

## Tests

- `npm test`: engine tests plus server-logic tests (time and WIB maths, reminder selection and de-duplication rules, email composition and provider handling, serializers, rate limit, allow-list).
- `node scripts/smoke-test.mjs`: end-to-end API flow against a running instance (register, login, profile, plan, report, delete account).

## AI assistance disclosure (copy into the proposal and product README)

The backend layer (API routes, server modules, seed script, tests and this document) was written with the help of an AI coding assistant (Claude, Anthropic) and then reviewed by the team. State here, in your own words, which parts each member reviewed, ran and can explain.
