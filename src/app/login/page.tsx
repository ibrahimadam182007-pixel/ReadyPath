"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AuthHeader } from "@/components/layout/headers";
import { GoogleIcon } from "@/components/ui/google-icon";
import { useReadyPath } from "@/components/providers/readypath-store";
import { cn } from "@/lib/utils";

export default function LoginPage() {
  const router = useRouter();
  const { updateAccount } = useReadyPath();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
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
    updateAccount({
      email: email.trim(),
      isAuthenticated: true,
    });
    router.push("/explore");
  };

  const handleGoogleSignIn = () => {
    setIsSubmitting(true);
    updateAccount({
      isAuthenticated: true,
    });
    router.push("/explore");
  };

  return (
    <div className="flex-1 flex flex-col min-h-screen bg-rp-bg">
      <AuthHeader
        backHref="/"
        title="Welcome back"
        subtitle="Sign in to view your gap reports and deadline countdowns."
      />

      <main className="flex-1 px-4 pt-5 pb-6">
        <form id="login-form" onSubmit={handleSubmit} noValidate className="space-y-4">
          <div>
            <label
              htmlFor="login-email"
              className="block text-[12px] font-semibold text-rp-text mb-1.5"
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
                "w-full h-[38px] rounded-[8px] bg-rp-surface border px-3 text-[13px] text-rp-text placeholder:text-rp-text-muted focus:outline-none focus:ring-2 focus:ring-rp-primary",
                errors.email ? "border-rp-danger" : "border-rp-border"
              )}
            />
            {errors.email && (
              <p className="mt-1 text-[11px] font-medium text-rp-danger">
                {errors.email}
              </p>
            )}
          </div>

          <div>
            <label
              htmlFor="login-password"
              className="block text-[12px] font-semibold text-rp-text mb-1.5"
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
                "w-full h-[38px] rounded-[8px] bg-rp-surface border px-3 text-[13px] text-rp-text placeholder:text-rp-text-muted focus:outline-none focus:ring-2 focus:ring-rp-primary",
                errors.password ? "border-rp-danger" : "border-rp-border"
              )}
            />
            <div className="mt-1.5 flex items-center justify-between gap-2">
              {errors.password ? (
                <p className="text-[11px] font-medium text-rp-danger">
                  {errors.password}
                </p>
              ) : (
                <span />
              )}
              <Link
                href="/signup"
                className="text-[12px] text-rp-text-muted-bg underline underline-offset-2"
              >
                Forgot Password?
              </Link>
            </div>
          </div>
        </form>
      </main>

      <footer className="px-4 pt-2 pb-5 bg-rp-bg space-y-3">
        <button
          type="submit"
          form="login-form"
          disabled={isSubmitting}
          className="w-full h-[42px] inline-flex items-center justify-center rounded-[8px] bg-rp-primary px-4 text-[14px] font-semibold text-rp-primary-on hover:bg-[#123129] active:brightness-90 disabled:opacity-40 transition"
        >
          {isSubmitting ? "Logging in..." : "Log In"}
        </button>

        <div className="flex items-center gap-3">
          <div className="h-px flex-1 bg-rp-border" />
          <span className="text-[11px] font-medium text-rp-text-muted-bg">or</span>
          <div className="h-px flex-1 bg-rp-border" />
        </div>

        <button
          type="button"
          onClick={handleGoogleSignIn}
          disabled={isSubmitting}
          className="w-full h-[42px] inline-flex items-center justify-center gap-2 rounded-[8px] bg-rp-surface border border-rp-border px-4 text-[13px] font-semibold text-rp-text hover:bg-slate-50 active:brightness-95 disabled:opacity-40 transition"
        >
          <GoogleIcon />
          <span>Sign in with Google</span>
        </button>

        <p className="pt-1 text-center text-[12px] text-rp-text-muted-bg">
          New to ReadyPath?{" "}
          <Link
            href="/signup"
            className="font-semibold text-rp-text underline underline-offset-2"
          >
            Create Account
          </Link>
        </p>
      </footer>
    </div>
  );
}
