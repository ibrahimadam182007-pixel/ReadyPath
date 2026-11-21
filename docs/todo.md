# ReadyPath - Implementation Todo List (From Scratch to Deploy)

This checklist outlines the end-to-end development phases for ReadyPath, from initial repository bootstrapping to production deployment.

---

## Phase 1: Environment Setup & Project Initialization
- [x] Move project documentation into `docs/` directory.
- [x] Set up Git repository initialized with `.gitignore`.
- [x] Set up environment configuration (`.env.example` with DB URL, Auth secrets, Resend API key).
- [x] Initialize Next.js project with TypeScript, ESLint, and Tailwind CSS.
- [x] Configure `shadcn/ui`, mobile-responsive viewport (`390px` portrait frame), and Forest/Sage theme tokens aligned with [`docs/design.md`](file:///C:/Users/ThinkPad/Projects/ReadyPath/docs/design.md).
- [x] Verified optimized production build (`npm run build`).

---

## Phase 2: Database & Data Modeling
- [x] Setup Prisma ORM (`prisma/schema.prisma`) and database singleton client (`src/lib/db/prisma.ts`).
- [x] Build **User & Student Profile Database** schema:
  - [x] `User`, `Account`, `Session`, `VerificationToken` (Authentication).
  - [x] `StudentProfile` (Semester, GPA, Degree Level, University, Major).
  - [x] `StudentCertificate` (Standardized Code, Score, Issue & Expiry Date).
  - [x] `StudentExperience` (Role, Organization, Category, Duration Months).
- [x] Build **Beasiswa & Magang (Opportunity) Database** schema:
  - [x] `Opportunity` (Metadata, Source Link, Last-Verified Date, Prototype Flag).
  - [x] `OpportunityRule` (1-to-1 structured measurable rules + Zod JSONB schema in `src/lib/db/types.ts`).
  - [x] `ScholarshipDetail` (1-to-1 coverage type, tuition fee, monthly allowance, service bond, benefits).
  - [x] `InternshipDetail` (1-to-1 work arrangement, location, stipend, duration, division, skills, MBKM flag).
- [x] Build **Countdown Plan & Reminder Database** schema:
  - [x] `TargetPlan` & `PlanMilestone` (Backward milestones, completion status, email reminder tracking).
- [ ] Configure live PostgreSQL connection string & execute initial database migration (`prisma db push` / `prisma migrate dev`).

---

## Phase 3: Opportunity Catalog & Data Curation (15–20 Datasets)
- [ ] Define JSON schema for structured eligibility rules (`Zod` validation).
- [ ] Curate 15–20 high-value student opportunities (Scholarships, Exchange programs, Internships):
  - [ ] Verify requirements from official announcement sources.
  - [ ] Record official source URL and `last_verified_at` timestamp.
  - [ ] Tag all entries with `is_prototype: true`.
- [ ] Write seed script (`prisma/seed.ts`) to populate the database with the curated opportunities.

---

## Phase 4: Deterministic Engine Development (Pure Code)
- [x] **Schemas & Types (`src/lib/engine/schema.ts`)**:
  - [x] Strict Zod validation & TypeScript contracts for Student Profile, Opportunity Rules, Gap Report, and Countdown Plan.
- [x] **Eligibility Evaluator (`src/lib/engine/eligibility.ts`)**:
  - [x] Evaluate degree level & eligible majors.
  - [x] Evaluate semester range eligibility (`minSemester` - `maxSemester`).
  - [x] Evaluate GPA cutoff (`minGpa`) with exact delta calculation.
  - [x] Evaluate certificate validity against program deadline (UTC calendar-day expiry date checking & score verification).
  - [x] Evaluate relevant experience months (`minExperienceMonths`).
  - [x] Generate structured Gap Report output (`MET` / `NOT_MET` per rule).
- [x] **Backward Planner (`src/lib/engine/countdown.ts` & `src/lib/engine/gpa-calculator.ts`)**:
  - [x] Calculate reverse milestone dates from deadline (test taking buffer, experience start date, document draft H-14, final submission H-3).
  - [x] Calculate required semester GPA for remaining terms to hit minimum threshold (plus achievability check <= 4.00).
- [x] Write comprehensive unit tests (`src/lib/engine/__tests__/engine.test.ts`) for edge cases (expiring on deadline day, 1 day before deadline, low score, borderline GPA, missing experience).

---

## Phase 5: Mobile-Friendly Frontend Development
- [x] **Navigation & Layout**:
  - [x] Mobile-optimized 3-tab bottom navigation (`Explore`, `My Plans`, `Profile`) & Forest/Sage header variants (`src/components/layout/`).
  - [x] Dashed `Prototype Data` badge (`src/components/ui/prototype-badge.tsx`).
- [x] **Welcome & Auth Screens**:
  - [x] Welcome / Onboarding (`/`) with AMIKOM brand header, dotted trajectory, and 3-step guide.
  - [x] Create Account (`/signup`) & Login (`/login`) with inline field validation and Google OAuth button layout.
- [x] **Student Profile Onboarding (`/profile`)**:
  - [x] Form for Semester, Current GPA (`/4.00`), Degree, and Major.
  - [x] Certificate manager (type, score, expiry date picker, undo snackbar on delete).
  - [x] Experience manager (role, organization, category, duration in months, undo snackbar on delete).
- [x] **Opportunity Directory (`/explore`)**:
  - [x] Search input, horizontally scrollable category filter chips (`All`, `Scholarship`, `Competition`, `Internship`, `Training`), Sem/GPA pill.
  - [x] Real-time deterministic gap status chips (`Eligible` / `Missing N Requirements`), skeleton loading, and empty state.
- [x] **Opportunity Detail & Gap Report (`/opportunities/[id]`)**:
  - [x] Program summary card with official source link, last-verified pill, and deadline pill.
  - [x] `GapReportCard` with accessible segmented progress bar, `UNMET REQUIREMENTS`, and `MET REQUIREMENTS`.
- [x] **Countdown Plan & My Plans (`/opportunities/[id]/countdown`, `/plans`)**:
  - [x] Big countdown header (`days until the deadline`), email reminder toggle card (`H-30`, `H-14`, `H-7` chips), and backward timeline.
  - [x] Saved targets list on `/plans` with readiness progress bar, profile summary card, and reminder summary.

---

## Phase 6: Email Reminder & Cron System
- [ ] Integrate **Resend** email SDK.
- [ ] Build responsive email templates with React Email:
  - [ ] Welcome & Initial Gap Report summary.
  - [ ] Milestone reminder email (T-90, T-60, T-30, T-7 days).
- [ ] Implement Cron endpoint (`/api/cron/reminders`):
  - [ ] Secure endpoint with `CRON_SECRET`.
  - [ ] Query plans with milestones due today.
  - [ ] Dispatch email notifications.
- [ ] Configure Vercel Cron (`vercel.json`) to trigger daily execution.

---

## Phase 7: Quality Assurance & Edge Testing
- [ ] Test mobile responsiveness across iOS Safari, Android Chrome, and desktop screens.
- [ ] Verify deterministic calculations across sample student profiles.
- [ ] Test email reminder dispatch workflow with staging mailbox.
- [ ] Perform accessibility (a11y) check for forms and contrast ratios.

---

## Phase 8: Deployment & Production Launch
- [ ] Deploy database to Supabase/Neon production tier.
- [ ] Connect repository to Vercel and configure production environment variables.
- [ ] Execute production seed script for 15–20 curated opportunities.
- [ ] Verify live domain, SSL, Cron job trigger logs, and transactional email deliverability.
- [ ] Document user feedback collection mechanism.
