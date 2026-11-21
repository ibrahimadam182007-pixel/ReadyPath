# ReadyPath - Implementation Todo List (From Scratch to Deploy)

This checklist outlines the end-to-end development phases for ReadyPath, from initial repository bootstrapping to production deployment.

---

## Phase 1: Environment Setup & Project Initialization
- [x] Move project documentation into `docs/` directory.
- [x] Set up Git repository initialized with `.gitignore`.
- [x] Set up environment configuration (`.env.example` with DB URL, Auth secrets, Resend API key).
- [x] Initialize Next.js project with TypeScript, ESLint, and Tailwind CSS.
- [x] Configure `shadcn/ui` and mobile-responsive viewport settings.
- [x] Verified optimized production build (`npm run build`).

---

## Phase 2: Database & Data Modeling
- [ ] Configure PostgreSQL instance (Supabase or Neon).
- [ ] Setup Prisma/Drizzle ORM and write schema:
  - [ ] `User` & `Account` (Authentication).
  - [ ] `StudentProfile` (Semester, GPA, Certificates, Experiences).
  - [ ] `Opportunity` (Metadata, Source Link, Last-Verified Date, Rules JSONB).
  - [ ] `CountdownPlan` (User selection, Milestones, Reminder Status).
- [ ] Execute initial database migration.

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
- [ ] **Eligibility Evaluator (`eligibility.ts`)**:
  - [ ] Evaluate semester range eligibility (`min_semester` - `max_semester`).
  - [ ] Evaluate GPA cutoff (`min_gpa`).
  - [ ] Evaluate certificate validity against program deadline (expiry date checking).
  - [ ] Generate structured Gap Report output: `{ met: boolean, items: [{ rule, status, actual, required }] }`.
- [ ] **Backward Planner (`countdown.ts` & `gpa-calculator.ts`)**:
  - [ ] Calculate reverse milestone dates from deadline (e.g., test taking buffer, submission draft).
  - [ ] Calculate required semester GPA for remaining terms to hit minimum threshold.
- [ ] Write comprehensive unit tests for all edge cases (zero certificates, expiring on deadline day, borderline GPA).

---

## Phase 5: Mobile-Friendly Frontend Development
- [ ] **Navigation & Layout**:
  - [ ] Mobile-optimized bottom navigation / responsive header.
  - [ ] Prototype banner ("Prototype data from official announcements for validation").
- [ ] **Student Profile Onboarding**:
  - [ ] Form for Semester, Current GPA.
  - [ ] Certificate adder (Name, Expiry Date picker, Score).
  - [ ] Experience duration input.
  - [ ] Client-side validation with `react-hook-form` and `zod`.
- [ ] **Opportunity Directory**:
  - [ ] Card list view with search and category filter.
  - [ ] Opportunity detail view with source link and last-verified date badge.
- [ ] **Gap Report View**:
  - [ ] Visual badge indicators (Met / Not Met).
  - [ ] Clear numerical difference display (e.g., "-0.15 GPA needed").
- [ ] **Countdown Plan View**:
  - [ ] Timeline component visualizing milestones working backward from target date.
  - [ ] Toggle switch for email reminders.

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
