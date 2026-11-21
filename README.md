# ReadyPath

ReadyPath is a mobile-friendly web application designed to help students bridge the gap between their current profile and competitive opportunities (scholarships, internships, exchange programs).

---

## Project Documentation
- 📄 **[Technical Specification (docs/tech_spec.md)](file:///C:/Users/ThinkPad/Projects/ReadyPath/docs/tech_spec.md)**: Product flow, rule engine mechanics, backward countdown planning logic, and scope for V1.
- 🛠️ **[Tech Stack (docs/tech_stack.md)](file:///C:/Users/ThinkPad/Projects/ReadyPath/docs/tech_stack.md)**: Architecture, recommended frameworks (Next.js, Tailwind, PostgreSQL, Resend), and data schemas.
- 📋 **[Todo Roadmap (docs/todo.md)](file:///C:/Users/ThinkPad/Projects/ReadyPath/docs/todo.md)**: Step-by-step implementation plan from repository setup to production deployment.

---

## V1 Scope Highlights
1. **Target Opportunities**: Curated collection of 15–20 high-value opportunities with verified source links and `last_verified_at` timestamps.
2. **Deterministic Rules**: Eligibility and GPA calculations are evaluated strictly through code logic (no AI/LLM guesswork).
3. **Backward Countdown**: Computes milestone target dates and necessary term GPAs working backward from the application deadline, with automated email reminders.
