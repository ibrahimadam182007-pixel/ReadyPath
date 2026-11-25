"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Quote } from "lucide-react";
import { AuthHeader } from "@/components/layout/headers";
import { DesktopNavbar } from "@/components/layout/desktop-navbar";
import { GoogleIcon } from "@/components/ui/google-icon";
import { signIn } from "next-auth/react";
import { cn } from "@/lib/utils";

export default function LoginPage() {
  const googleEnabled = process.env.NEXT_PUBLIC_GOOGLE_ENABLED === "true";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const nextErrors: Record<string, string> = {};

    if (!email.trim() || !email.includes("@")) {
      nextErrors.email = "Enter your registered email address.";
    }
    if (!password) {
      nextErrors.password = "Enter your password.";
    }

    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      return;
    }

    setErrors({});
    setIsSubmitting(true);
    const result = await signIn("credentials", {
      email: email.trim(),
      password,
      redirect: false,
    });
    if (!result || result.error) {
      setErrors({ password: "Incorrect email or password." });
      setIsSubmitting(false);
      return;
    }
    // Full navigation so the store re-hydrates from the new session.
    window.location.assign("/explore");
  };

  const handleGoogleSignIn = () => {
    setIsSubmitting(true);
    signIn("google", { callbackUrl: "/explore" });
  };

  return (
    <div className="min-h-screen bg-rp-bg flex flex-col">
      <AuthHeader
        backHref="/"
        title="Welcome back"
        subtitle="Log in to see your plans, gaps and upcoming deadlines."
      />

      <div className="flex-1 flex flex-col w-full lg:max-w-[1200px] lg:mx-auto lg:px-6 lg:py-7 lg:gap-5">
        <DesktopNavbar variant="public" />

        <main className="flex-1 px-4 pt-5 pb-6 lg:px-0 lg:pt-0 lg:pb-0 lg:grid lg:grid-cols-[minmax(0,1fr)_430px] lg:gap-6 lg:items-stretch">
          {/* Form Card */}
          <section className="flex flex-col justify-between lg:rounded-[20px] lg:bg-rp-surface lg:border lg:border-rp-border lg:px-9 lg:py-8 lg:shadow-rp-flat">
            <div>
              <div className="hidden lg:block mb-6">
                <h1 className="text-[26px] font-extrabold tracking-tight text-rp-text">
                  Welcome back
                </h1>
                <p className="mt-1 text-[13px] text-rp-text-muted">
                  Log in to see your plans, gaps and upcoming deadlines.
                </p>
              </div>

              <form
                id="login-form"
                onSubmit={handleSubmit}
                noValidate
                className="space-y-4"
              >
                <div>
                  <label
                    htmlFor="login-email"
                    className="block text-[11.5px] font-bold text-rp-sage-strong mb-1.5"
                  >
                    Student Email
                  </label>
                  <input
                    id="login-email"
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

                <div>
                  <label
                    htmlFor="login-password"
                    className="block text-[11.5px] font-bold text-rp-sage-strong mb-1.5"
                  >
                    Password
                  </label>
                  <input
                    id="login-password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    className={cn(
                      "w-full h-[46px] rounded-[10px] bg-rp-surface border px-3.5 text-[13.5px] text-rp-text placeholder:text-rp-text-muted/70 focus:outline-none focus:ring-2 focus:ring-rp-primary",
                      errors.password ? "border-rp-danger" : "border-rp-border"
                    )}
                  />
                  {errors.password && (
                    <p className="mt-1 text-[11px] font-semibold text-rp-danger">
                      {errors.password}
                    </p>
                  )}
                </div>

                <div className="pt-2 space-y-3">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full h-[48px] inline-flex items-center justify-center rounded-[10px] bg-rp-primary px-4 text-[14.5px] font-bold text-rp-primary-on hover:bg-rp-primary-hover active:brightness-95 disabled:opacity-40 transition"
                  >
                    {isSubmitting ? "Logging in..." : "Log In"}
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
                        onClick={handleGoogleSignIn}
                        disabled={isSubmitting}
                        className="w-full h-[46px] inline-flex items-center justify-center gap-2 rounded-[10px] bg-rp-surface border border-rp-border px-4 text-[13px] font-bold text-rp-text hover:bg-rp-bg/40 active:brightness-95 disabled:opacity-40 transition"
                      >
                        <GoogleIcon />
                        <span>Sign in with Google</span>
                      </button>
                    </>
                  )}
                </div>
              </form>
            </div>

            <p className="mt-6 text-center text-[12.3px] text-rp-text-muted">
              New to ReadyPath?{" "}
              <Link
                href="/signup"
                className="font-extrabold text-rp-primary underline underline-offset-2"
              >
                Create Account
              </Link>
            </p>
          </section>

          {/* Desktop Right Quote Panel */}
          <aside className="hidden lg:flex flex-col justify-between rounded-[20px] bg-rp-primary p-9 text-rp-primary-on">
            <div className="space-y-5">
              <Quote className="h-7 w-7 text-rp-sage" strokeWidth={2} />
              <p className="text-[20px] font-bold leading-[1.4] text-white">
                ReadyPath showed me a scholarship I had already qualified for —
                I only had to close two gaps before the deadline.
              </p>
              <div className="flex items-center gap-3 pt-1">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-rp-sage text-[11px] font-extrabold text-rp-primary">
                  AM
                </div>
                <div>
                  <p className="text-[12.5px] font-bold text-white">
                    AMIKOM Student Prototype
                  </p>
                  <p className="text-[10.5px] text-rp-primary-on-muted">
                    Semester 5 · Informatika
                  </p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 border-t border-white/15 pt-5">
              <div>
                <p className="text-[18px] font-extrabold text-white">H-30 / 14 / 7</p>
                <p className="text-[10.5px] text-rp-primary-on-muted">
                  Automated email reminders
                </p>
              </div>
              <div>
                <p className="text-[18px] font-extrabold text-white">0% AI Guess</p>
                <p className="text-[10.5px] text-rp-primary-on-muted">
                  Exact rule-based gap check
                </p>
              </div>
            </div>
          </aside>
        </main>
      </div>
    </div>
  );
}
