# ReadyPath: A Requirement-Gap Planner for Campus Opportunities

> Developed by **Team Kampus_Ungu** for **Google Developer Group on Campus ITB Hackathon** — *Case 1: Smarter Campus and Learning*

## About The Project
**ReadyPath** is a mobile-friendly web application designed to help undergraduate students (initially targeting Universitas AMIKOM Yogyakarta) evaluate their eligibility for scholarships, competitions, internships, and training programmes before it is too late to act.

Currently, opportunity requirements (such as minimum GPA, required certificates, and deadlines) are scattered across Instagram accounts and WhatsApp group chats, making it difficult for students to compare them against their own academic profiles. ReadyPath solves this by turning scattered announcements into a curated, structured list and generating a personalized **Gap Report** and **Countdown Plan**.

## Key Features
* **Student Profile Input:** Students input their current semester, GPA, certificates (along with expiry dates), and relevant experience.
* **Curated Opportunity List:** A structured database of 15–20 verified campus opportunities complete with official source links and last-verified dates.
* **Rule-Based Gap Report:** Compares the student's profile against structured requirement rules (computed deterministically by code, not AI) to highlight which criteria are already met and what is missing.
* **Backward Countdown Plan & Reminders:** Works backward from the application deadline to map out actionable milestones (e.g., target certificate completion date or target semester GPA) paired with email reminders.

## Planned Tech Stack
* **Application:** Responsive / Mobile-Friendly Web App
* **Database:** Managed Relational/Document Database
* **Logic Engine:** Deterministic rule-based eligibility & GPA calculation
* **Notifications:** Automated Email Reminders

## Development Roadmap
* **Semifinal Submission (30 November 2026):** Core data model, 15 curated opportunities, and a functional Gap Report prototype.
* **Final Day (16 December 2026):** Full working Countdown Plan integrated with automated email reminders.

## Getting Started

1. **Clone the repository**
   ```bash
   git clone https://github.com/ibrahimadam182007-pixel/readypath.git
   ```

2. **Navigate to the project directory**
   ```bash
   cd readypath
   ```

3. **Install dependencies**
   ```bash
   npm install          # also runs `prisma generate`
   ```

4. **Configure the environment** – copy `.env.example` to `.env` and fill in the database URLs,
   `NEXTAUTH_SECRET`, `CRON_SECRET` and (optionally) an email provider. See [BACKEND.md](./BACKEND.md).

5. **Create the tables, seed the catalog and run**
   ```bash
   npx prisma db push
   npm run db:seed
   npm run dev
   ```

6. **Run the tests**
   ```bash
   npm test                                        # unit tests (engine + server logic)
   BASE_URL=http://localhost:3000 node scripts/smoke-test.mjs   # end-to-end API check
   ```

> Without a database the UI still works in local demo mode (data stays in the browser's localStorage).

## Backend status

| Capability | Status |
| --- | --- |
| Account sign-up / login (email + password, NextAuth) | Implemented |
| Student profile and saved plans stored in PostgreSQL | Implemented |
| Server-side Gap Report and Countdown Plan (same engine as the UI) | Implemented |
| Email reminders H-30 / H-14 / H-7 via daily cron | Implemented; needs an email provider configured |
| Opportunity catalog seeded from `src/lib/data/prototype-opportunities.ts` | 10 prototype entries; `lastVerifiedAt` stays NULL until a real check is logged in `prisma/data/verification-log.json` |
| Password reset, email verification, in-app account deletion UI | Not implemented |

## Team Kampus_Ungu
* **Muhammad Jofan Ishlahuddin — Team Leader [Github](https://github.com/Cat010110)**
* **Putra Andhika - [Github](https://github.com/PutraAndhika13)**
* **Danndifadila Arrasikhuuna Herwanto - [Github](https://github.com/seishirou-here)**
* **Muhammad Ibrahim Adam - [Github](https://github.com/ibrahimadam182007-pixel)**
