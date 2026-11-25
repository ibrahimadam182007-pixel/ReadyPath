/** Optional allow-list, e.g. ALLOWED_EMAIL_DOMAINS="students.amikom.ac.id,amikom.ac.id". Empty = anyone. */
export function isEmailAllowed(
  email: string,
  env: Record<string, string | undefined> = process.env
): boolean {
  const list = (env.ALLOWED_EMAIL_DOMAINS ?? "")
    .split(",")
    .map((d) => d.trim().toLowerCase())
    .filter(Boolean);
  if (list.length === 0) return true;
  const domain = email.toLowerCase().split("@")[1];
  return !!domain && list.includes(domain);
}
