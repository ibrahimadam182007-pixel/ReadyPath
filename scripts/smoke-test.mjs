#!/usr/bin/env node
/**
 * End-to-end smoke test for a running ReadyPath backend (local or deployed).
 *
 *   BASE_URL=http://localhost:3000 node scripts/smoke-test.mjs
 *
 * It creates a throwaway account, exercises the whole flow
 * (register -> login -> profile -> plan -> report -> delete account) and cleans up after itself.
 * Requires Node 20+.
 */
const BASE = (process.env.BASE_URL || "http://localhost:3000").replace(/\/$/, "");
const jar = new Map();
let failures = 0;

function check(name, condition, extra = "") {
  if (condition) console.log(`  PASS  ${name}`);
  else {
    failures += 1;
    console.log(`  FAIL  ${name} ${extra}`);
  }
}

function storeCookies(res) {
  for (const line of res.headers.getSetCookie?.() ?? []) {
    const [pair] = line.split(";");
    const idx = pair.indexOf("=");
    const name = pair.slice(0, idx).trim();
    const value = pair.slice(idx + 1);
    if (value === "" || /expires=Thu, 01 Jan 1970/i.test(line)) jar.delete(name);
    else jar.set(name, value);
  }
}

async function call(path, { method = "GET", json, form, auth = true } = {}) {
  const headers = {};
  if (auth && jar.size) headers.cookie = [...jar].map(([k, v]) => `${k}=${v}`).join("; ");
  let body;
  if (json !== undefined) {
    headers["content-type"] = "application/json";
    body = JSON.stringify(json);
  } else if (form) {
    headers["content-type"] = "application/x-www-form-urlencoded";
    body = new URLSearchParams(form).toString();
  }
  const res = await fetch(BASE + path, { method, headers, body, redirect: "manual" });
  storeCookies(res);
  const text = await res.text();
  let data = null;
  try { data = text ? JSON.parse(text) : null; } catch { /* not JSON */ }
  return { status: res.status, data };
}

async function login(email, password) {
  const csrf = await call("/api/auth/csrf");
  const res = await call("/api/auth/callback/credentials", {
    method: "POST",
    form: { csrfToken: csrf.data.csrfToken, email, password, json: "true" },
  });
  const session = await call("/api/auth/session");
  return { res, session };
}

const stamp = Date.now();
const email = `smoke.${stamp}@example.com`;
const password = "smoke-test-pw-123";

console.log(`ReadyPath smoke test against ${BASE}`);

console.log("\n[health]");
const health = await call("/api/health", { auth: false });
check("database reachable", health.status === 200 && health.data?.database === "up", JSON.stringify(health.data));
check("NEXTAUTH_SECRET configured", health.data?.authSecretConfigured === true);

console.log("\n[auth guard]");
check("profile requires login", (await call("/api/profile", { auth: false })).status === 401);
check("plans require login", (await call("/api/plans", { auth: false })).status === 401);
check("cron rejects anonymous calls", [401, 503].includes((await call("/api/cron/reminders", { auth: false })).status));

console.log("\n[register]");
const noConsent = await call("/api/auth/register", { method: "POST", auth: false, json: { name: "Smoke Test", email, password, consent: false } });
check("consent is required", noConsent.status === 422);
const shortPw = await call("/api/auth/register", { method: "POST", auth: false, json: { name: "Smoke Test", email, password: "short", consent: true } });
check("weak password rejected", shortPw.status === 422);
const reg = await call("/api/auth/register", { method: "POST", auth: false, json: { name: "Smoke Test", email, password, consent: true } });
check("account created", reg.status === 201 && reg.data?.user?.email === email, JSON.stringify(reg.data));
const dup = await call("/api/auth/register", { method: "POST", auth: false, json: { name: "Smoke Test", email, password, consent: true } });
check("duplicate email rejected", dup.status === 409);

console.log("\n[login]");
const bad = await login(email, "wrong-password");
check("wrong password rejected", !bad.session.data?.user);
jar.clear();
const ok = await login(email, password);
check("login succeeds", ok.session.data?.user?.email === email, JSON.stringify(ok.session.data));

console.log("\n[catalog]");
const catalog = await call("/api/opportunities", { auth: false });
check("catalog has opportunities", catalog.status === 200 && catalog.data?.items?.length > 0);
const first = catalog.data?.items?.[0];
check("unverified data is reported as null", first && "lastVerifiedAt" in first);
check("rejects unknown category", (await call("/api/opportunities?category=NOPE", { auth: false })).status === 422);

console.log("\n[profile]");
check("no profile yet", (await call("/api/profile")).data?.profile === null);
const noProfilePlan = await call(`/api/plans/${first.id}`, { method: "PUT", json: {} });
check("plan needs a profile first (409)", noProfilePlan.status === 409);
const profile = {
  degreeLevel: "S1",
  major: "Informatics",
  currentSemester: 3,
  cumulativeGpa: 3.2,
  totalCreditsCompleted: 60,
  certificates: [{ name: "TOEFL ITP", standardCode: "TOEFL_ITP", category: "ENGLISH_PROFICIENCY", score: 480, expiryDate: "2028-01-01T00:00:00.000Z" }],
  experiences: [{ role: "Committee member", organization: "Campus event", category: "ORGANIZATION", durationMonths: 4 }],
};
const saved = await call("/api/profile", { method: "PUT", json: profile });
check("profile saved", saved.status === 200 && saved.data?.profile?.cumulativeGpa === 3.2, JSON.stringify(saved.data)?.slice(0, 200));
check("certificates and experiences saved", saved.data?.profile?.certificates?.length === 1 && saved.data?.profile?.experiences?.length === 1);
check("invalid GPA rejected", (await call("/api/profile", { method: "PUT", json: { ...profile, cumulativeGpa: 9 } })).status === 422);

console.log("\n[report and plan]");
const report = await call(`/api/opportunities/${first.id}/report`);
check("server-side gap report", report.status === 200 && Array.isArray(report.data?.gapReport?.items), JSON.stringify(report.data)?.slice(0, 160));
const plan = await call(`/api/plans/${first.id}`, { method: "PUT", json: { remindersEnabled: true, reminderOffsets: ["H-30", "H-14", "H-7"] } });
check("plan saved with milestones", plan.status === 200 && plan.data?.plan?.milestones?.length > 0, JSON.stringify(plan.data)?.slice(0, 200));
check("reminder email is the account email", plan.data?.plan?.reminderEmail === email);
check("bad reminder offsets rejected", (await call(`/api/plans/${first.id}`, { method: "PUT", json: { reminderOffsets: ["H-3"] } })).status === 422);
const toggled = await call(`/api/plans/${first.id}`, { method: "PUT", json: { remindersEnabled: false, reminderOffsets: ["H-7"] } });
check("reminders can be switched off", toggled.data?.plan?.remindersEnabled === false && toggled.data?.plan?.reminderOffsets?.join() === "H-7");
const plans = await call("/api/plans");
check("plans list contains the plan", plans.data?.plans?.length === 1 && plans.data.plans[0].opportunityId === first.id);
check("readiness is computed", typeof plans.data?.plans?.[0]?.readinessPercent === "number");

console.log("\n[profile change refreshes plans]");
await call("/api/profile", { method: "PUT", json: { ...profile, cumulativeGpa: 3.9, certificates: [{ ...profile.certificates[0], score: 600 }] } });
const after = await call("/api/plans");
check("readiness improves after profile update", after.data?.plans?.[0]?.readinessPercent >= plans.data?.plans?.[0]?.readinessPercent);

console.log("\n[cleanup]");
check("plan deleted", (await call(`/api/plans/${first.id}`, { method: "DELETE" })).status === 204);
check("account deleted", (await call("/api/account", { method: "DELETE" })).status === 204);
jar.clear();
const gone = await login(email, password);
check("deleted account can no longer log in", !gone.session.data?.user);

console.log(failures === 0 ? "\nAll checks passed." : `\n${failures} check(s) FAILED.`);
process.exit(failures === 0 ? 0 : 1);
