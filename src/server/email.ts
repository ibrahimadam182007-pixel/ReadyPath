export type EmailProvider = "resend" | "smtp" | "console";

export interface EmailMessage {
  to: string;
  subject: string;
  text: string;
  html: string;
}

export interface EmailResult {
  ok: boolean;
  provider: EmailProvider;
  /** True when nothing was actually sent (console provider). Callers must not record it as SENT. */
  dryRun?: boolean;
  id?: string;
  error?: string;
}

type Env = Record<string, string | undefined>;

/** EMAIL_PROVIDER wins; otherwise resend if an API key exists, smtp if a host exists, else console. */
export function resolveProvider(env: Env = process.env): EmailProvider {
  const explicit = env.EMAIL_PROVIDER?.toLowerCase();
  if (explicit === "resend" || explicit === "smtp" || explicit === "console") return explicit;
  if (env.RESEND_API_KEY) return "resend";
  if (env.SMTP_HOST) return "smtp";
  return "console";
}

export async function sendEmail(
  message: EmailMessage,
  env: Env = process.env,
  fetchFn: typeof fetch = fetch
): Promise<EmailResult> {
  const provider = resolveProvider(env);
  const from = env.EMAIL_FROM || "ReadyPath <no-reply@localhost>";

  try {
    if (provider === "resend") {
      if (!env.RESEND_API_KEY) throw new Error("RESEND_API_KEY is not set");
      const res = await fetchFn(env.RESEND_API_URL || "https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${env.RESEND_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from,
          to: [message.to],
          subject: message.subject,
          text: message.text,
          html: message.html,
        }),
      });
      const body = (await res.json().catch(() => ({}))) as { id?: string; message?: string };
      if (!res.ok) throw new Error(body.message || `Resend responded ${res.status}`);
      return { ok: true, provider, id: body.id };
    }

    if (provider === "smtp") {
      if (!env.SMTP_HOST) throw new Error("SMTP_HOST is not set");
      const nodemailer = await import("nodemailer");
      const transport = nodemailer.createTransport({
        host: env.SMTP_HOST,
        port: Number(env.SMTP_PORT || 587),
        secure: env.SMTP_SECURE === "true",
        auth: env.SMTP_USER ? { user: env.SMTP_USER, pass: env.SMTP_PASS } : undefined,
      });
      const info = await transport.sendMail({
        from,
        to: message.to,
        subject: message.subject,
        text: message.text,
        html: message.html,
      });
      return { ok: true, provider, id: info.messageId };
    }

    console.info(`[email:console] to=${message.to} subject="${message.subject}"`);
    return { ok: true, provider: "console", dryRun: true };
  } catch (error) {
    return {
      ok: false,
      provider,
      error: error instanceof Error ? error.message : String(error),
    };
  }
}
