import type { CountdownMilestone, GapReportItem } from "@/lib/engine";
import { wibDayDiff } from "./time";

/** Reminder offsets supported in V1 (days before the deadline). */
export const ALLOWED_OFFSETS = [30, 14, 7] as const;
export const DEFAULT_OFFSETS: number[] = [30, 14, 7];

export function offsetsToCodes(offsets: number[]): string[] {
  return [...new Set(offsets)].sort((a, b) => b - a).map((n) => `H-${n}`);
}

/** ["H-30","H-7"] -> [30,7]; unknown or malformed codes are dropped. */
export function codesToOffsets(codes: string[]): number[] {
  const out = new Set<number>();
  for (const code of codes) {
    const m = /^H-(\d{1,3})$/.exec(code.trim());
    if (!m) continue;
    const n = Number(m[1]);
    if ((ALLOWED_OFFSETS as readonly number[]).includes(n)) out.add(n);
  }
  return [...out].sort((a, b) => b - a);
}

export interface ReminderCandidate {
  status: string;
  remindersEnabled: boolean;
  reminderOffsets: number[];
}

/**
 * Returns the offset (30/14/7) that is due today, or null.
 * "Today" is the WIB calendar date; a reminder is due only when the number of days left
 * is exactly one of the plan's offsets, so each offset fires on one calendar day.
 */
export function selectDueOffset(
  plan: ReminderCandidate,
  deadline: Date,
  now: Date
): number | null {
  if (plan.status !== "ACTIVE" || !plan.remindersEnabled) return null;
  const daysLeft = wibDayDiff(deadline, now);
  return plan.reminderOffsets.includes(daysLeft) ? daysLeft : null;
}

export function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

const DATE_FORMAT = new Intl.DateTimeFormat("en-GB", {
  day: "numeric",
  month: "short",
  year: "numeric",
  timeZone: "Asia/Jakarta",
});

export interface ReminderEmailInput {
  recipientName?: string | null;
  appUrl: string;
  opportunity: {
    id: string;
    title: string;
    deadline: Date;
    sourceUrl: string;
    isPrototype: boolean;
    lastVerifiedAt: Date | null;
  };
  offset: number;
  isFullyEligible: boolean;
  unmetItems: Pick<GapReportItem, "label" | "gapDetail">[];
  upcomingMilestones: Pick<CountdownMilestone, "title" | "targetDate" | "isPastDue">[];
}

export function composeReminderEmail(input: ReminderEmailInput): {
  subject: string;
  text: string;
  html: string;
} {
  const { opportunity: opp, offset } = input;
  const deadlineLabel = DATE_FORMAT.format(opp.deadline);
  const subject = `[ReadyPath] ${offset} days left: ${opp.title}`;
  const greeting = input.recipientName ? `Hi ${input.recipientName},` : "Hi,";
  const planUrl = `${input.appUrl.replace(/\/$/, "")}/opportunities/${encodeURIComponent(opp.id)}/countdown`;

  const verification = opp.lastVerifiedAt
    ? `Requirements last verified by our team on ${DATE_FORMAT.format(opp.lastVerifiedAt)}.`
    : "Requirements have NOT been verified against the official announcement yet.";
  const prototype = opp.isPrototype
    ? "ReadyPath is a competition prototype. Always confirm the requirements and deadline at the official source."
    : "";

  const status = input.isFullyEligible
    ? "All listed requirements are currently met."
    : `${input.unmetItems.length} listed requirement(s) still need attention.`;

  const unmet = input.unmetItems.map((i) => `- ${i.label}: ${i.gapDetail}`);
  const upcoming = input.upcomingMilestones
    .filter((m) => !m.isPastDue)
    .slice(0, 5)
    .map((m) => `- ${DATE_FORMAT.format(m.targetDate)}: ${m.title}`);

  const text = [
    greeting,
    "",
    `${opp.title} closes on ${deadlineLabel} (${offset} days from now).`,
    status,
    ...(unmet.length ? ["", "Still missing:", ...unmet] : []),
    ...(upcoming.length ? ["", "Next steps:", ...upcoming] : []),
    "",
    `Open your plan: ${planUrl}`,
    `Official source: ${opp.sourceUrl}`,
    "",
    verification,
    prototype,
    "You can turn these reminders off in My Plans.",
  ]
    .filter((line, idx, arr) => !(line === "" && arr[idx - 1] === ""))
    .join("\n");

  const li = (items: string[]) =>
    items.length
      ? `<ul>${items.map((i) => `<li>${escapeHtml(i.replace(/^- /, ""))}</li>`).join("")}</ul>`
      : "";

  const html = [
    `<p>${escapeHtml(greeting)}</p>`,
    `<p><strong>${escapeHtml(opp.title)}</strong> closes on <strong>${escapeHtml(deadlineLabel)}</strong> (${offset} days from now).</p>`,
    `<p>${escapeHtml(status)}</p>`,
    unmet.length ? `<p>Still missing:</p>${li(unmet)}` : "",
    upcoming.length ? `<p>Next steps:</p>${li(upcoming)}` : "",
    `<p><a href="${escapeHtml(planUrl)}">Open your plan</a> &middot; <a href="${escapeHtml(opp.sourceUrl)}">Official source</a></p>`,
    `<p style="color:#666;font-size:12px">${escapeHtml(verification)} ${escapeHtml(prototype)} You can turn these reminders off in My Plans.</p>`,
  ].join("");

  return { subject, text, html };
}
