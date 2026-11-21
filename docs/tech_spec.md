# ReadyPath - Technical Specification (Tech Spec)

## 1. Product Overview
**ReadyPath** is a mobile-friendly responsive web application designed to evaluate and bridge the gap between a student’s academic/extracurricular profile and target opportunity requirements (e.g., scholarships, internships, student exchange programs, and fellowship grants).

Version 1 (V1) is strictly deterministic:
- **No AI guessing or hallucinated rules**: Eligibility and GPA calculations are evaluated deterministically in code via structured rule definitions.
- **Measurable requirements only**: Evaluates explicit quantitative and verifiable criteria (GPA, semester level, active certificates with expiry dates, verified years of experience).
- **Scope**: Curated catalog of 15–20 high-value opportunities with prototype data.

---

## 2. Core User Flow

```
[ 1. Profile Setup ]
       │
       ▼
  - Current Semester
  - Cumulative GPA
  - Certificates (Issue & Expiry Dates)
  - Experience Log (Roles & Months)
       │
       ▼
[ 2. Select Opportunity ] ──> Browses curated list (15–20 opportunities)
       │
       ▼
[ 3. Gap Report ] ──────────> Evaluates eligibility (Met vs. Not Met per rule)
       │
       ▼
[ 4. Countdown Plan ] ──────> Works backward from deadline:
                              - Milestone targets (certifications, required term GPA)
                              - Automated email reminders scheduled
```

### Detailed Flow Steps
1. **Student Profile Input**:
   - Academic standing: Current semester (e.g., Semester 4) and Cumulative GPA (e.g., 3.45 / 4.00).
   - Certificates: Type, issuing body, validity date, expiry date.
   - Experience: Type (work, organization, project), duration (months).
2. **Opportunity Selection**:
   - Filterable catalog of 15–20 opportunities.
   - Each opportunity shows deadline, eligibility constraints, source announcement link, last-verified date, and "Prototype Data" badge.
3. **Gap Report (Eligibility Engine)**:
   - Compares profile against target rules.
   - Displays clear pass/fail status per requirement (e.g., GPA requirement: 3.50 vs actual: 3.45 -> **Not Met (-0.05)**; Certificate: English proficiency valid through deadline -> **Met**).
4. **Countdown Plan (Backward Planner)**:
   - Calculates time remaining until official application deadline.
   - Computes required minimum GPA in remaining semester(s) to reach the threshold before deadline.
   - Highlights certificate renewal or acquisition deadlines (e.g., "Must take IELTS by Month X to receive results 2 weeks before submission").
   - Schedules automated email reminders at key milestones (e.g., T-90 days, T-60 days, T-30 days, T-7 days).

---

## 3. Rule Engine & Deterministic Logic

All opportunity requirements are represented as deterministic, structured rule sets.

### 3.1 Supported Measurable Criteria (V1)
- `MIN_SEMESTER` & `MAX_SEMESTER`: Integer range check.
- `MIN_GPA`: Minimum cumulative GPA required.
- `TARGET_GPA_CALCULATOR`:
  $$\text{GPA}_{\text{required\_next\_term}} = \frac{\text{GPA}_{\text{target}} \times (N + 1) - \text{GPA}_{\text{current}} \times N}{1}$$
  *(Where $N$ is total completed semesters).*
- `REQUIRED_CERTIFICATE`:
  - Category (e.g., Language, Cloud, Domain).
  - Minimum score (e.g., TOEFL iBT $\ge$ 80, IELTS $\ge$ 6.5).
  - Expiry date verification: `expiry_date > opportunity_deadline + buffer_days`.
- `MIN_EXPERIENCE_MONTHS`: Integer sum of relevant experience durations.

### 3.2 Non-Scope for V1
- Subjective evaluation (essay quality, motivation letter scoring, subjective interview assessment).
- Unverifiable or ambiguous criteria.

---

## 4. Opportunity Data Model & Governance

Each opportunity record must include:
- `id`: Unique identifier (slug/UUID).
- `title`: Program title.
- `organizer`: Organization/sponsor name.
- `category`: Scholarship | Internship | Exchange | Fellowship.
- `application_deadline`: ISO 8601 Timestamp.
- `source_url`: Link to official announcement.
- `last_verified_at`: Date when criteria were verified by the team.
- `is_prototype`: Flag set to `true` with UI disclaimer.
- `rules`: Structured JSON rule object.

---

## 5. Notification & Email Reminder Engine

- **Trigger Strategy**: Scheduled cron worker runs daily.
- **Evaluation**:
  - Finds active Countdown Plans for registered users.
  - Checks if today matches milestone triggers ($T - X$ days from deadline or upcoming target certificate date).
  - Sends email alert with checklist items and current countdown status.
