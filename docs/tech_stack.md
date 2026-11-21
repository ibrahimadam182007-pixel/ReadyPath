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

### Core Entities
1. **User**: `id`, `email`, `name`, `created_at`
2. **StudentProfile**:
   - `user_id` (FK)
   - `current_semester` (Int)
   - `cumulative_gpa` (Float)
   - `certificates`: Array of `{ name, score, issue_date, expiry_date }`
   - `experiences`: Array of `{ role, category, duration_months }`
3. **Opportunity**:
   - `id`, `slug`, `title`, `provider`, `category`
   - `deadline` (DateTime)
   - `source_url` (String)
   - `last_verified_at` (DateTime)
   - `is_prototype` (Boolean, default: true)
   - `rules` (JSONB): e.g. `{ min_gpa: 3.5, eligible_semesters: [4, 5, 6], required_certs: [...] }`
4. **TargetPlan (Countdown Plan)**:
   - `id`, `user_id`, `opportunity_id`
   - `target_deadline` (DateTime)
   - `milestones` (JSONB): Calculated checkpoints (e.g. date to take exam, target term GPA)
   - `reminders_enabled` (Boolean)
   - `notification_frequency` (String)

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
