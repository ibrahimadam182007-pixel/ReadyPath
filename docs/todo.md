# ReadyPath - Implementation Todo List (From Scratch to Deploy)

This checklist outlines the end-to-end development phases for ReadyPath, from initial repository bootstrapping to production deployment.

---

## Phase 1: Environment Setup & Project Initialization
- [x] Move project documentation into `docs/` directory.
- [x] Set up Git repository initialized with `.gitignore`.
- [x] Set up environment configuration (`.env.example` with DB URL, Auth secrets, Email & Cron config).
- [x] Initialize Next.js project with TypeScript, ESLint, and Tailwind CSS.
- [x] Configure Calm Forest & Mint theme tokens aligned with [`docs/design.md`](file:///C:/Users/ThinkPad/Projects/ReadyPath/docs/design.md).
- [x] Verified optimized production build (`npm run build`).

---

## Phase 2: Database & Data Modeling
- [x] Setup Prisma ORM (`prisma/schema.prisma`) and database singleton client (`src/lib/db/prisma.ts`).
- [x] Build **User & Student Profile Database** schema (`User` with `passwordHash`/`consentedAt`, `StudentProfile`, `StudentCertificate`, `StudentExperience`).
- [x] Build **Beasiswa & Magang (Opportunity) Database** schema (`Opportunity`, `OpportunityRule`, `ScholarshipDetail`, `InternshipDetail`).
- [x] Build **Countdown Plan & Reminder Database** schema (`TargetPlan`, `PlanMilestone`, `ReminderDispatch`).
- [ ] Configure live PostgreSQL connection string & execute initial database migration (`prisma db push` / `prisma migrate dev`).

---

## Phase 3: Opportunity Catalog & Data Curation (15 Datasets)
- [x] Define JSON schema for structured eligibility rules (`Zod` validation).
- [x] Curate 15 official 2026 student opportunities (`src/lib/data/prototype-opportunities.ts`) with `isPrototype: true`.
- [x] Write seed script (`prisma/seed.ts`) reading directly from `PROTOTYPE_OPPORTUNITIES` + `prisma/data/verification-log.json`.
- [ ] Record team verification entries in `prisma/data/verification-log.json` and execute `npm run db:seed` on live DB.

---

## Phase 4: Deterministic Engine Development (Pure Code)
- [x] **Schemas & Types (`src/lib/engine/schema.ts`)**
- [x] **Eligibility Evaluator (`src/lib/engine/eligibility.ts`)**
- [x] **Backward Planner (`src/lib/engine/countdown.ts` & `src/lib/engine/gpa-calculator.ts`)**
- [x] Unit tests (`src/lib/engine/__tests__/engine.test.ts` — 11 tests including all 15 curated opportunities) + Server logic tests (`src/server/__tests__/server-logic.test.ts` — 24 tests).

---

## Phase 5: Responsive Mobile & Desktop Frontend (`readypath-mobile.pen` v3.0)
- [x] **Design Tokens & Shell**: Calm Forest (`#112F29`) + Mint (`#DCEEE5`) palette, `Plus Jakarta Sans` (400–800), `BrandLogo`, `DesktopNavbar` (Public + App variants), mobile `BottomNav` & Forest headers.
- [x] **Landing & Auth (`/`, `/signup`, `/login`)**: Responsive 2-col desktop hero with Featured Opportunity card, split-panel auth cards, required privacy consent checkbox, NextAuth wiring.
- [x] **Explore (`/explore`)**: Search + Category Chips + Sort dropdown + responsive 3-col desktop grid / 1-col mobile list with deterministic status chips.
- [x] **Detail & Gap Report (`/opportunities/[id]`)**: 2-col desktop layout with sticky Readiness Action Rail + `GapReportCard`.
- [x] **Countdown Plan (`/opportunities/[id]/countdown`)**: Forest Countdown Strip, interactive H-30/H-14/H-7 reminder toggles, backward timeline, Plan Summary rail.
- [x] **My Plans & Tracker (`/plans`, `/plans/[opportunityId]`)**: Profile strip, 3 KPI stat cards, 3-col targets grid, Global Reminder Bar, Saved Plan Tracker with Action Checklist & Remove Plan.
- [x] **Profile Hub & Setup (`/profile`, `/profile/setup`)**: Profile & Settings 2-col hub (Identity, Academic Data, Preferences, Account, Log Out, Delete Account) + Setup editor with responsive Sheet/Modal for Add Certificate & Add Experience.

---

## Phase 6: Backend API, Email Reminder & Cron System
- [x] NextAuth Credentials + optional Google OAuth (`/api/auth/*`, `/api/auth/register`).
- [x] Student Profile & Plans API (`/api/profile`, `/api/plans`, `/api/plans/[opportunityId]`, `/api/account`).
- [x] Opportunities & Server Gap Report API (`/api/opportunities`, `/api/opportunities/[id]`, `/api/opportunities/[id]/report`, `/api/health`).
- [x] Email provider layer (Resend + SMTP + Console dry-run) & Cron endpoint (`/api/cron/reminders`, `vercel.json`).
- [ ] Stage 2: Add `PATCH` milestone checklist endpoint (`PlanMilestone.isCompleted`) and wire Saved Plan Tracker persistence.

---

## Phase 7 & 8: Live Database, QA & Production Launch (Stage 3)
- [ ] Connect Neon/Supabase PostgreSQL (`DATABASE_URL` & `DIRECT_URL`), run `prisma db push` + `npm run db:seed`.
- [ ] Run `scripts/smoke-test.mjs` end-to-end against live DB & configure SMTP/Resend email delivery.
- [ ] Deploy to Vercel with production environment variables & verify live Cron + mobile/desktop responsiveness.
