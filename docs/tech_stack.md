# ReadyPath - Tech Stack Architecture

## 1. Architectural Philosophy
ReadyPath is built with a focus on simplicity, responsiveness, deterministic execution, and low operational overhead:
- **Mobile-First Responsive Web**: Accessible on any smartphone browser without requiring native app install.
- **Deterministic Compute (No AI)**: Eligibility and GPA calculations are executed purely in TypeScript/code logic for 100% predictability, reliability, and zero hallucination risk.
- **Curated Prototype Data**: Managed dataset of 15–20 verified opportunities stored in a relational schema.
- **Reliable Email Pipeline**: Transactional email service coupled with a scheduled cron worker.

---

## 2. Recommended Tech Stack

| Layer | Recommended Technology | Rationale |
|---|---|---|
| **Frontend Framework** | **Next.js (React, TypeScript, App Router)** | Server-side rendering, SEO-ready, built-in API routes, excellent mobile performance. |
| **Styling & UI** | **Tailwind CSS + shadcn/ui** | Rapid, mobile-first responsive design, lightweight accessible components. |
| **Backend & API** | **Next.js Route Handlers / Server Actions** | Unified codebase, type safety from DB to UI, zero-setup serverless endpoints. |
| **Database** | **PostgreSQL (Supabase or Neon)** | Fully managed relational database, ACID compliance, native JSONB support for flexible rule definitions. |
| **ORM / Query Builder** | **Prisma ORM** or **Drizzle ORM** | Type-safe schema migrations, clear relational models for users, profiles, opportunities, and milestones. |
| **Authentication** | **NextAuth.js (Auth.js) / Supabase Auth** | Passwordless Magic Link / Google OAuth, minimal friction for students. |
| **Email Service** | **Resend** (or SendGrid) | Developer-friendly transactional email delivery with React Email template support. |
| **Background Jobs / Cron** | **Vercel Cron** or **Upstash QStash** | Automated daily triggers to evaluate milestone dates and dispatch reminder emails. |
| **Deployment & Hosting** | **Vercel** | Seamless Next.js deployment, edge routing, automated CI/CD from Git. |

---

## 3. Data Schema Overview

Detailed implementation resides in [`prisma/schema.prisma`](file:///C:/Users/ThinkPad/Projects/ReadyPath/prisma/schema.prisma) and [`src/lib/db/types.ts`](file:///C:/Users/ThinkPad/Projects/ReadyPath/src/lib/db/types.ts).

### 3.1 User & Student Profile Database
1. **User / Account / Session / VerificationToken**: Standard Authentication tables (OAuth & Passwordless Magic Link).
2. **StudentProfile**:
   - `userId` (1-to-1 FK), `university`, `major`, `degreeLevel` (`D3` | `D4` | `S1` | `S2`)
   - `currentSemester` (Int)
   - `cumulativeGpa` (Decimal 3,2)
   - `totalCreditsCompleted` (Int, optional)
3. **StudentCertificate**:
   - `profileId` (FK), `name`, `standardCode` (e.g., `TOEFL_IBT`, `IELTS`, `AWS_CCP`), `category`, `issuer`
   - `score` (Decimal 6,2), `issueDate`, `expiryDate` (DateTime - checked deterministically against opportunity deadlines)
4. **StudentExperience**:
   - `profileId` (FK), `role`, `organization`, `category` (`INTERNSHIP` | `ORGANIZATION` | `VOLUNTEER` | `RESEARCH_PROJECT` | `FREELANCE_WORK`)
   - `durationMonths` (Int)

### 3.2 Beasiswa & Magang (Opportunity) Database
1. **Opportunity (Core Catalog Table)**:
   - `id`, `slug`, `title`, `provider`, `category` (`SCHOLARSHIP` | `INTERNSHIP` | `EXCHANGE` | `FELLOWSHIP`)
   - `openDate`, `deadline`, `announcementDate`
   - `sourceUrl`, `lastVerifiedAt`, `isPrototype` (Boolean, default: `true`)
2. **OpportunityRule (1-to-1 Deterministic Rules)**:
   - `minSemester`, `maxSemester`, `minGpa`, `minExperienceMonths`
   - `allowedExperienceCategories`, `targetDegrees`, `eligibleMajors`
   - `requiredCertificates` (JSONB validated via `RequiredCertificatesJsonSchema` in `src/lib/db/types.ts`)
3. **ScholarshipDetail (1-to-1 Specific to Scholarships/Exchange)**:
   - `coverageType` (`FULL` | `PARTIAL` | `ALLOWANCE_ONLY`), `coversTuitionFee`, `allowancePerMonth`, `currency`
   - `fundingDurationMonths`, `destinationCountry`, `hasServiceBond`, `serviceBondDetails`, `benefitsList`
4. **InternshipDetail (1-to-1 Specific to Internships)**:
   - `workArrangement` (`REMOTE` | `HYBRID` | `ONSITE`), `location`, `stipendType` (`PAID` | `UNPAID` | `SKS_CONVERSION`), `stipendAmount`
   - `durationMonths`, `division`, `requiredSkills`, `isMbkmEligible`

### 3.3 Countdown Plan & Reminder Database
1. **TargetPlan**:
   - `userId`, `opportunityId`, `status` (`ACTIVE` | `COMPLETED` | `ARCHIVED`)
   - `isFullyEligible`, `requiredNextTermGpa`
   - `remindersEnabled`, `reminderEmail`
2. **PlanMilestone**:
   - `planId`, `title`, `description`, `type` (`TARGET_SEMESTER_GPA` | `CERTIFICATE_ACQUISITION` | `CERTIFICATE_RENEWAL` | `EXPERIENCE_BUILDING` | `DOCUMENT_DRAFT` | `FINAL_SUBMISSION`)
   - `targetDate`, `daysBeforeDeadline`, `isCompleted`, `reminderSentAt`

---

## 4. Deterministic Engine Structure

```
/src/lib/engine/
├── eligibility.ts      # Pure functions evaluating profile against opportunity rules
├── gpa-calculator.ts   # Backward GPA target formulas
├── countdown.ts        # Milestone date generator working backward from deadline
└── schema.ts           # Zod validation schemas for profile and rules
```

**Key Guarantee**: Zero third-party LLM or heuristics used in the calculation path. Every output status (Met / Not Met / At Risk) is backed by direct mathematical or logical operations.
