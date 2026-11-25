"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Check } from "lucide-react";
import { AuthHeader } from "@/components/layout/headers";
import { DesktopNavbar } from "@/components/layout/desktop-navbar";
import { BrandLogo } from "@/components/ui/brand-logo";
import { GoogleIcon } from "@/components/ui/google-icon";
import { signIn } from "next-auth/react";
import { cn } from "@/lib/utils";

const SIGNUP_BENEFITS = [
  "Matched to @students.amikom.ac.id",
  "Gap report on every requirement",
  "Reminders before each deadline",
];

export default function SignUpPage() {
  const googleEnabled = process.env.NEXT_PUBLIC_GOOGLE_ENABLED === "true";

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [consent, setConsent] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const nextErrors: Record<string, string> = {};

    if (!fullName.trim()) {
      nextErrors.fullName = "Please enter your full name.";
    }
    if (!email.trim() || !email.includes("@")) {
      nextErrors.email = "Enter a valid student email address.";
    }
    if (password.length < 8) {
      nextErrors.password = "Password must be at least 8 characters.";
    }
    if (confirmPassword !== password) {
      nextErrors.confirmPassword = "Passwords do not match.";
    }
    if (!consent) {
      nextErrors.consent = "Please accept the data-use notice to continue.";
    }

    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      return;
    }

    setErrors({});
    setIsSubmitting(true);
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: fullName.trim(),
          email: email.trim(),
          password,
          consent: true,
        }),
      });
      if (!res.ok) {
        const body = (await res.json().catch(() => ({}))) as { error?: string };
        const message =
          body.error || "Could not create the account. Please try again.";
        setErrors(
          res.status === 409 || res.status === 403
            ? { email: message }
            : { form: message }
        );
        setIsSubmitting(false);
        return;
      }
      const result = await signIn("credentials", {
        email: email.trim(),
        password,
        redirect: false,
      });
      if (!result || result.error) {
        setErrors({
          form: "Account created, but automatic sign-in failed. Please log in.",
        });
        setIsSubmitting(false);
        return;
      }
      window.location.assign("/profile/setup");
    } catch {
      setErrors({ form: "Network error. Please try again." });
      setIsSubmitting(false);
    }
  };

  const handleGoogleSignUp = () => {
    setIsSubmitting(true);
    signIn("google", { callbackUrl: "/profile/setup" });
  };

  return (
    <div className="min-h-screen bg-rp-bg flex flex-col">
      <AuthHeader
        backHref="/"
        title="Create your account"
        subtitle="Use your student email so we can match campus opportunities to you."
      />

      <div className="flex-1 flex flex-col w-full lg:max-w-[1200px] lg:mx-auto lg:px-6 lg:py-7 lg:gap-5">
        <DesktopNavbar variant="public" />

        <main className="flex-1 px-4 pt-5 pb-6 lg:px-0 lg:pt-0 lg:pb-0 lg:grid lg:grid-cols-[430px_minmax(0,1fr)] lg:gap-6 lg:items-stretch">
          {/* Desktop Left Brand Panel */}
          <aside className="hidden lg:flex flex-col justify-between rounded-[20px] bg-rp-primary p-9 text-rp-primary-on">
            <div className="space-y-7">
              <BrandLogo onDark />
              <div className="space-y-5">
                <h2 className="text-[28px] font-extrabold leading-[1.18] tracking-tight text-white">
                  One profile. Every opportunity you already qualify for.
                </h2>
                <ul className="space-y-3">
                  {SIGNUP_BENEFITS.map((item) => (
                    <li
                      key={item}
                      className="flex items-center gap-2.5 text-[12.5px] text-rp-primary-on-muted"
                    >
                      <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-rp-sage/20 text-rp-sage">
                        <Check className="h-3.5 w-3.5" strokeWidth={2.5} />
                      </span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
            <p className="text-[11px] text-[#8FAFA2]">
              Built for Universitas AMIKOM Yogyakarta
            </p>
          </aside>

          {/* Form Card (Seamless on Mobile, White Card on Desktop) */}
          <section className="flex flex-col justify-between lg:rounded-[20px] lg:bg-rp-surface lg:border lg:border-rp-border lg:px-9 lg:py-8 lg:shadow-rp-flat">
            <div>
              <div className="hidden lg:block mb-6">
                <h1 className="text-[26px] font-extrabold tracking-tight text-rp-text">
                  Create your account
                </h1>
                <p className="mt-1 text-[13px] text-rp-text-muted">
                  Use your student email so we can match campus opportunities to
                  you.
                </p>
              </div>

              <form
                id="signup-form"
                onSubmit={handleSubmit}
                noValidate
                className="space-y-4"
              >
                <div>
                  <label
                    htmlFor="full-name"
                    className="block text-[11.5px] font-bold text-rp-sage-strong mb-1.5"
                  >
                    Full Name
                  </label>
                  <input
                    id="full-name"
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="e.g. Naufal Pratama"
                    className={cn(
                      "w-full h-[46px] rounded-[10px] bg-rp-surface border px-3.5 text-[13.5px] text-rp-text placeholder:text-rp-text-muted/70 focus:outline-none focus:ring-2 focus:ring-rp-primary",
                      errors.fullName ? "border-rp-danger" : "border-rp-border"
                    )}
                  />
                  {errors.fullName && (
                    <p className="mt-1 text-[11px] font-semibold text-rp-danger">
                      {errors.fullName}
                    </p>
                  )}
                </div>

                <div>
                  <label
                    htmlFor="student-email"
                    className="block text-[11.5px] font-bold text-rp-sage-strong mb-1.5"
                  >
                    Student Email
                  </label>
                  <input
                    id="student-email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@students.amikom.ac.id"
                    className={cn(
                      "w-full h-[46px] rounded-[10px] bg-rp-surface border px-3.5 text-[13.5px] text-rp-text placeholder:text-rp-text-muted/70 focus:outline-none focus:ring-2 focus:ring-rp-primary",
                      errors.email ? "border-rp-danger" : "border-rp-border"
                    )}
                  />
                  {errors.email && (
                    <p className="mt-1 text-[11px] font-semibold text-rp-danger">
                      {errors.email}
                    </p>
                  )}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-3">
                  <div>
                    <label
                      htmlFor="password"
                      className="block text-[11.5px] font-bold text-rp-sage-strong mb-1.5"
                    >
                      Password
                    </label>
                    <input
                      id="password"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Minimum 8 characters"
                      className={cn(
                        "w-full h-[46px] rounded-[10px] bg-rp-surface border px-3.5 text-[13.5px] text-rp-text placeholder:text-rp-text-muted/70 focus:outline-none focus:ring-2 focus:ring-rp-primary",
                        errors.password
                          ? "border-rp-danger"
                          : "border-rp-border"
                      )}
                    />
                    {errors.password && (
                      <p className="mt-1 text-[11px] font-semibold text-rp-danger">
                        {errors.password}
                      </p>
                    )}
                  </div>

                  <div>
                    <label
                      htmlFor="confirm-password"
                      className="block text-[11.5px] font-bold text-rp-sage-strong mb-1.5"
                    >
                      Confirm Password
                    </label>
                    <input
                      id="confirm-password"
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Re-enter your password"
                      className={cn(
                        "w-full h-[46px] rounded-[10px] bg-rp-surface border px-3.5 text-[13.5px] text-rp-text placeholder:text-rp-text-muted/70 focus:outline-none focus:ring-2 focus:ring-rp-primary",
                        errors.confirmPassword
                          ? "border-rp-danger"
                          : "border-rp-border"
                      )}
                    />
                    {errors.confirmPassword && (
                      <p className="mt-1 text-[11px] font-semibold text-rp-danger">
                        {errors.confirmPassword}
                      </p>
                    )}
                  </div>
                </div>

                <div className="pt-1">
                  <label className="flex items-start gap-2.5 text-[11.5px] leading-snug text-rp-text cursor-pointer">
                    <input
                      id="consent"
                      type="checkbox"
                      checked={consent}
                      onChange={(e) => setConsent(e.target.checked)}
                      className="mt-0.5 h-4 w-4 shrink-0 rounded accent-rp-primary"
                    />
                    <span>
                      I understand ReadyPath stores my email, semester, GPA,
                      certificates and experience to compute my gap reports and
                      send deadline reminders. This is a competition prototype;
                      I can delete my data at any time.
                    </span>
                  </label>
                  {errors.consent && (
                    <p className="mt-1.5 text-[11px] font-semibold text-rp-danger">
                      {errors.consent}
                    </p>
                  )}
                  {errors.form && (
                    <p className="mt-2 text-[11.5px] font-semibold text-rp-danger">
                      {errors.form}
                    </p>
                  )}
                </div>

                {/* Actions */}
                <div className="pt-2 space-y-3">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full h-[48px] inline-flex items-center justify-center rounded-[10px] bg-rp-primary px-4 text-[14.5px] font-bold text-rp-primary-on hover:bg-rp-primary-hover active:brightness-95 disabled:opacity-40 transition"
                  >
                    {isSubmitting ? "Creating account..." : "Create Account"}
                  </button>

                  {googleEnabled && (
                    <>
                      <div className="flex items-center gap-3">
                        <div className="h-px flex-1 bg-rp-hairline" />
                        <span className="text-[11.5px] font-medium text-rp-text-muted">
                          or
                        </span>
                        <div className="h-px flex-1 bg-rp-hairline" />
                      </div>

                      <button
                        type="button"
                        onClick={handleGoogleSignUp}
                        disabled={isSubmitting}
                        className="w-full h-[46px] inline-flex items-center justify-center gap-2 rounded-[10px] bg-rp-surface border border-rp-border px-4 text-[13px] font-bold text-rp-text hover:bg-rp-bg/40 active:brightness-95 disabled:opacity-40 transition"
                      >
                        <GoogleIcon />
                        <span>Sign up with Google</span>
                      </button>
                    </>
                  )}
                </div>
              </form>
            </div>

            <p className="mt-5 text-center text-[12.3px] text-rp-text-muted">
              Already have an account?{" "}
              <Link
                href="/login"
                className="font-extrabold text-rp-primary underline underline-offset-2"
              >
                Log in
              </Link>
            </p>
          </section>
        </main>
      </div>
    </div>
  );
}
