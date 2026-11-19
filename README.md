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
* **Application:** Responsive / Mobile-Friendly Web App *(adjust with your chosen framework, e.g., Next.js / React)*
* **Database:** Managed Relational/Document Database *(e.g., PostgreSQL / Supabase / Firebase)*
* **Logic Engine:** Deterministic rule-based eligibility & GPA calculation
* **Notifications:** Automated Email Reminders

## Development Roadmap
* **Semifinal Submission (30 November 2026):** Core data model, 15 curated opportunities, and a functional Gap Report prototype.
* **Final Day (16 December 2026):** Full working Countdown Plan integrated with automated email reminders.

## Getting Started
*(Update this section once the initial codebase is pushed)*

1. **Clone the repository**
   ```bash
   git clone [https://github.com/](https://github.com/)[your-username]/readypath.git
   ```

2. **Navigate to the project directory**
   ```bash
   cd readypath
   ```

3. **Install dependencies & run locally**
   ```bash
   npm install
   npm run dev
   ```

## Team Kampus_Ungu
* **Muhammad Jofan Ishlahuddin** — Team Leader
* **Putra Andhika**
* **Danndifadila Arrasikhuuna Herwanto**
* **Muhammad Ibrahim Adam**
