import { describe, expect, it, beforeEach } from "vitest";
import { buildPlanSnapshot } from "../plan-snapshot";
import {
  codesToOffsets,
  composeReminderEmail,
  escapeHtml,
  offsetsToCodes,
  selectDueOffset,
} from "../reminders";
import { resolveProvider, sendEmail } from "../email";
import { isEmailAllowed } from "../auth-policy";
import { clientIp, rateLimit, resetRateLimits } from "../rate-limit";
import { endOfDayWib, toWib, wibDateString, wibDayDiff } from "../time";
import { num, parseRequiredCertificates, serializeOpportunity, toEngineProfile, toEngineTarget } from "../serializers";
import type { EngineOpportunityTarget, EngineStudentProfile } from "@/lib/engine";

const DEADLINE = endOfDayWib("2027-01-15"); // 23:59:59 WIB

const target: EngineOpportunityTarget = {
  id: "opp-test",
  title: "Beasiswa Test",
  deadline: DEADLINE,
  rule: {
    minSemester: 3,
    maxSemester: 8,
    minGpa: 3.25,
    minExperienceMonths: 0,
    allowedExperienceCategories: [],
    targetDegrees: ["S1"],
    eligibleMajors: [],
    requiredCertificates: [
      {
        id: "req-english",
        category: "ENGLISH_PROFICIENCY",
        label: "English proficiency",
        acceptedCodes: [{ code: "TOEFL_ITP", displayName: "TOEFL ITP", minScore: 500 }],
        mustBeValidUntilDaysAfterDeadline: 0,
        estPrepAndResultDays: 45,
      },
    ],
  },
};

const profile: EngineStudentProfile = {
  degreeLevel: "S1",
  major: "Informatics",
  currentSemester: 3,
  cumulativeGpa: 3.2,
  totalCreditsCompleted: 60,
  certificates: [
    {
      name: "TOEFL ITP",
      standardCode: "TOEFL_ITP",
      category: "ENGLISH_PROFICIENCY",
      score: 480,
      expiryDate: new Date("2028-01-01T00:00:00Z"),
    },
  ],
  experiences: [],
};

describe("time helpers (WIB)", () => {
  it("stores a deadline date as 23:59:59 WIB", () => {
    expect(DEADLINE.toISOString()).toBe("2027-01-15T16:59:59.000Z");
    expect(wibDateString(DEADLINE)).toBe("2027-01-15");
  });

  it("counts calendar days in WIB, not UTC", () => {
    // 05:00 WIB on 21 Nov is still 20 Nov in UTC; the WIB date must win.
    const now = new Date("2026-11-20T22:00:00Z");
    expect(wibDateString(now)).toBe("2026-11-21");
    expect(wibDayDiff(DEADLINE, now)).toBe(55);
  });

  it("is 0 on the deadline day and negative afterwards", () => {
    expect(wibDayDiff(DEADLINE, new Date("2027-01-15T01:00:00Z"))).toBe(0);
    expect(wibDayDiff(DEADLINE, new Date("2027-01-16T01:00:00Z"))).toBe(-1);
  });

  it("rejects malformed dates", () => {
    expect(() => endOfDayWib("15-01-2027")).toThrow();
  });
});

describe("reminder offsets", () => {
  it("round-trips codes and drops unsupported ones", () => {
    expect(codesToOffsets(["H-7", "H-30", "H-14", "H-7"])).toEqual([30, 14, 7]);
    expect(codesToOffsets(["H-3", "7", "hello", "H-30"])).toEqual([30]);
    expect(offsetsToCodes([7, 30, 14])).toEqual(["H-30", "H-14", "H-7"]);
  });

  it("is due only on the exact offset day (WIB) and only for active, enabled plans", () => {
    const plan = { status: "ACTIVE", remindersEnabled: true, reminderOffsets: [30, 14, 7] };
    const dayMinus30 = new Date("2026-12-16T03:00:00Z"); // 10:00 WIB, 30 days before 15 Jan
    expect(selectDueOffset(plan, DEADLINE, dayMinus30)).toBe(30);
    expect(selectDueOffset(plan, DEADLINE, new Date("2026-12-17T03:00:00Z"))).toBeNull();
    expect(selectDueOffset({ ...plan, remindersEnabled: false }, DEADLINE, dayMinus30)).toBeNull();
    expect(selectDueOffset({ ...plan, status: "ARCHIVED" }, DEADLINE, dayMinus30)).toBeNull();
    expect(selectDueOffset({ ...plan, reminderOffsets: [14, 7] }, DEADLINE, dayMinus30)).toBeNull();
  });
});

describe("plan snapshot", () => {
  const now = new Date("2026-11-21T03:00:00Z");

  it("reports unmet requirements and a countdown consistent with the WIB date", () => {
    const snap = buildPlanSnapshot({ profile, target, now });
    expect(snap.isFullyEligible).toBe(false);
    expect(snap.countdown.daysUntilDeadline).toBe(55);
    const unmet = snap.gapReport.items.filter((i) => i.status === "NOT_MET").map((i) => i.type);
    expect(unmet).toEqual(expect.arrayContaining(["GPA", "CERTIFICATE"]));
    expect(snap.gapReport.metCount).toBeLessThan(snap.gapReport.totalCount);
    expect(snap.milestones.length).toBeGreaterThan(0);
  });

  it("keeps requiredNextTermGpa inside Decimal(3,2) range", () => {
    const snap = buildPlanSnapshot({ profile: { ...profile, cumulativeGpa: 0.5 }, target, now });
    if (snap.requiredNextTermGpa !== null) {
      expect(snap.requiredNextTermGpa).toBeGreaterThanOrEqual(0);
      expect(snap.requiredNextTermGpa).toBeLessThanOrEqual(9.99);
    }
  });

  it("is fully eligible when every rule is met", () => {
    const strong: EngineStudentProfile = {
      ...profile,
      cumulativeGpa: 3.7,
      certificates: [{ ...profile.certificates[0], score: 520 }],
    };
    const snap = buildPlanSnapshot({ profile: strong, target, now });
    expect(snap.isFullyEligible).toBe(true);
    expect(snap.gapReport.items.every((i) => i.status === "MET")).toBe(true);
  });
});

describe("reminder email", () => {
  const base = {
    recipientName: "Rina <script>",
    appUrl: "https://readypath.example/",
    opportunity: {
      id: "opp-test",
      title: "Beasiswa Test",
      deadline: DEADLINE,
      sourceUrl: "https://official.example/announcement",
      isPrototype: true,
      lastVerifiedAt: null,
    },
    offset: 30,
    isFullyEligible: false,
    unmetItems: [{ label: "GPA 3.20 / Min 3.25", gapDetail: "Short by 0.05" }],
    upcomingMilestones: [
      { title: "Retake TOEFL ITP", targetDate: new Date("2026-12-20T00:00:00Z"), isPastDue: false },
      { title: "Already late", targetDate: new Date("2026-11-01T00:00:00Z"), isPastDue: true },
    ],
  };

  it("states honestly when the data is unverified and prototype", () => {
    const { subject, text } = composeReminderEmail(base);
    expect(subject).toContain("30 days left");
    expect(text).toContain("NOT been verified");
    expect(text).toContain("competition prototype");
    expect(text).toContain("https://official.example/announcement");
    expect(text).toContain("https://readypath.example/opportunities/opp-test/countdown");
    expect(text).toContain("Retake TOEFL ITP");
    expect(text).not.toContain("Already late");
  });

  it("escapes user-controlled text in HTML", () => {
    const { html } = composeReminderEmail(base);
    expect(html).not.toContain("<script>");
    expect(html).toContain("Rina &lt;script&gt;");
    expect(escapeHtml(`"a" & 'b'`)).toBe("&quot;a&quot; &amp; &#39;b&#39;");
  });

  it("shows the verification date when the team verified it", () => {
    const { text } = composeReminderEmail({
      ...base,
      opportunity: { ...base.opportunity, lastVerifiedAt: new Date("2026-11-25T00:00:00Z") },
    });
    expect(text).toContain("last verified by our team on 25 Nov 2026");
  });
});

describe("email provider", () => {
  const msg = { to: "a@b.c", subject: "s", text: "t", html: "<p>t</p>" };

  it("resolves the provider from env", () => {
    expect(resolveProvider({})).toBe("console");
    expect(resolveProvider({ RESEND_API_KEY: "k" })).toBe("resend");
    expect(resolveProvider({ SMTP_HOST: "smtp.x" })).toBe("smtp");
    expect(resolveProvider({ EMAIL_PROVIDER: "console", RESEND_API_KEY: "k" })).toBe("console");
  });

  it("console provider is a dry run and never reports a real send", async () => {
    const res = await sendEmail(msg, {});
    expect(res).toMatchObject({ ok: true, provider: "console", dryRun: true });
  });

  it("sends through Resend with the bearer key and surfaces API errors", async () => {
    let captured: { url?: string; init?: RequestInit } = {};
    const okFetch = (async (url: string, init: RequestInit) => {
      captured = { url, init };
      return { ok: true, status: 200, json: async () => ({ id: "msg_1" }) };
    }) as unknown as typeof fetch;
    const ok = await sendEmail(msg, { RESEND_API_KEY: "key", EMAIL_FROM: "RP <x@y.z>" }, okFetch);
    expect(ok).toEqual({ ok: true, provider: "resend", id: "msg_1" });
    expect(captured.url).toBe("https://api.resend.com/emails");
    expect((captured.init?.headers as Record<string, string>).Authorization).toBe("Bearer key");
    expect(JSON.parse(String(captured.init?.body)).to).toEqual(["a@b.c"]);

    const badFetch = (async () => ({
      ok: false,
      status: 403,
      json: async () => ({ message: "domain not verified" }),
    })) as unknown as typeof fetch;
    const bad = await sendEmail(msg, { RESEND_API_KEY: "key" }, badFetch);
    expect(bad).toMatchObject({ ok: false, provider: "resend", error: "domain not verified" });
  });

  it("fails clearly when the provider is misconfigured", async () => {
    const res = await sendEmail(msg, { EMAIL_PROVIDER: "resend" });
    expect(res.ok).toBe(false);
    expect(res.error).toContain("RESEND_API_KEY");
  });
});

describe("auth policy and rate limit", () => {
  beforeEach(() => resetRateLimits());

  it("allows any domain unless an allow-list is set", () => {
    expect(isEmailAllowed("x@gmail.com", {})).toBe(true);
    const env = { ALLOWED_EMAIL_DOMAINS: "students.amikom.ac.id, amikom.ac.id" };
    expect(isEmailAllowed("a@students.amikom.ac.id", env)).toBe(true);
    expect(isEmailAllowed("A@AMIKOM.AC.ID", env)).toBe(true);
    expect(isEmailAllowed("x@gmail.com", env)).toBe(false);
    expect(isEmailAllowed("not-an-email", env)).toBe(false);
  });

  it("limits requests per key per window", () => {
    const t0 = 1_000_000;
    expect(rateLimit("k", 2, 1000, t0).allowed).toBe(true);
    expect(rateLimit("k", 2, 1000, t0).allowed).toBe(true);
    expect(rateLimit("k", 2, 1000, t0).allowed).toBe(false);
    expect(rateLimit("other", 2, 1000, t0).allowed).toBe(true);
    expect(rateLimit("k", 2, 1000, t0 + 1001).allowed).toBe(true);
  });

  it("reads the client ip from forwarding headers", () => {
    const req = new Request("http://x", { headers: { "x-forwarded-for": "1.2.3.4, 5.6.7.8" } });
    expect(clientIp(req)).toBe("1.2.3.4");
    expect(clientIp(new Request("http://x"))).toBe("unknown");
  });
});

describe("serializers", () => {
  it("converts decimals and validates certificate rules", () => {
    expect(num("3.55")).toBe(3.55);
    expect(num(null)).toBeNull();
    expect(num("abc")).toBeNull();
    expect(() => parseRequiredCertificates([{ id: "x" }])).toThrow();
    expect(parseRequiredCertificates(null)).toEqual([]);
  });

  it("maps a DB-shaped opportunity to an engine target", () => {
    const row = {
      id: "opp-x",
      title: "X",
      deadline: DEADLINE.toISOString(),
      rule: {
        minSemester: 2,
        maxSemester: 6,
        minGpa: "3.25",
        minExperienceMonths: 0,
        allowedExperienceCategories: [],
        targetDegrees: ["S1"],
        eligibleMajors: [],
        requiredCertificates: [],
      },
    };
    const t = toEngineTarget(row);
    expect(t.rule.minGpa).toBe(3.25);
    expect(t.deadline.getTime()).toBe(DEADLINE.getTime());
    expect(() => toEngineTarget({ ...row, rule: null })).toThrow();
  });

  it("exposes NULL lastVerifiedAt so clients can say 'unverified'", () => {
    const out = serializeOpportunity({
      id: "a", slug: "a", title: "A", provider: "P", category: "SCHOLARSHIP", summary: "s",
      deadline: DEADLINE, sourceUrl: "u", lastVerifiedAt: null, isPrototype: true, rule: null,
    });
    expect(out.lastVerifiedAt).toBeNull();
    expect(out.isPrototype).toBe(true);
  });

  it("maps a DB profile row to the engine profile", () => {
    const p = toEngineProfile({
      degreeLevel: "S1", major: null, currentSemester: 4, cumulativeGpa: "3.45",
      totalCreditsCompleted: null,
      certificates: [{ id: "c1", name: "IELTS", standardCode: "IELTS", category: "ENGLISH_PROFICIENCY", score: "6.50", issueDate: null, expiryDate: "2028-01-01T00:00:00Z" }],
      experiences: [{ id: "e1", role: "Staff", organization: "Org", category: "ORGANIZATION", durationMonths: 6 }],
    });
    expect(p.cumulativeGpa).toBe(3.45);
    expect(p.certificates[0].score).toBe(6.5);
    expect(p.certificates[0].expiryDate).toBeInstanceOf(Date);
  });
});

describe("toWib", () => {
  it("shifts by +7h", () => {
    expect(toWib(new Date("2026-01-01T00:00:00Z")).toISOString()).toBe("2026-01-01T07:00:00.000Z");
  });
});
