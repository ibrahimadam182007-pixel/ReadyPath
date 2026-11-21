"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AuthHeader } from "@/components/layout/headers";
import { GoogleIcon } from "@/components/ui/google-icon";
import { useReadyPath } from "@/components/providers/readypath-store";
import { cn } from "@/lib/utils";

export default function SignUpPage() {
  const router = useRouter();
  const { updateAccount } = useReadyPath();

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
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

    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      return;
    }

    setErrors({});
    setIsSubmitting(true);
    updateAccount({
      fullName: fullName.trim(),
      email: email.trim(),
      isAuthenticated: true,
    });
    router.push("/profile");
  };

  const handleGoogleSignUp = () => {
    setIsSubmitting(true);
    updateAccount({
      fullName: fullName.trim() || "Naufal Pratama",
      email: email.trim() || "naufal.pratama@students.amikom.ac.id",
      isAuthenticated: true,
    });
    router.push("/profile");
  };

  return (
    <div className="flex-1 flex flex-col min-h-screen bg-rp-bg">
      <AuthHeader
        backHref="/"
        title="Create your account"
        subtitle="Use your student email for AMIKOM campus matching and reminders."
      />

      <main className="flex-1 px-4 pt-5 pb-6">
        <form id="signup-form" onSubmit={handleSubmit} noValidate className="space-y-4">
          <div>
            <label
              htmlFor="full-name"
              className="block text-[12px] font-semibold text-rp-text mb-1.5"
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
                "w-full h-[38px] rounded-[8px] bg-rp-surface border px-3 text-[13px] text-rp-text placeholder:text-rp-text-muted focus:outline-none focus:ring-2 focus:ring-rp-primary",
                errors.fullName ? "border-rp-danger" : "border-rp-border"
              )}
            />
            {errors.fullName && (
              <p className="mt-1 text-[11px] font-medium text-rp-danger">
                {errors.fullName}
              </p>
            )}
          </div>

          <div>
            <label
              htmlFor="student-email"
              className="block text-[12px] font-semibold text-rp-text mb-1.5"
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
              htmlFor="password"
              className="block text-[12px] font-semibold text-rp-text mb-1.5"
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
                "w-full h-[38px] rounded-[8px] bg-rp-surface border px-3 text-[13px] text-rp-text placeholder:text-rp-text-muted focus:outline-none focus:ring-2 focus:ring-rp-primary",
                errors.password ? "border-rp-danger" : "border-rp-border"
              )}
            />
            {errors.password && (
              <p className="mt-1 text-[11px] font-medium text-rp-danger">
                {errors.password}
              </p>
            )}
          </div>

          <div>
            <label
              htmlFor="confirm-password"
              className="block text-[12px] font-semibold text-rp-text mb-1.5"
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
                "w-full h-[38px] rounded-[8px] bg-rp-surface border px-3 text-[13px] text-rp-text placeholder:text-rp-text-muted focus:outline-none focus:ring-2 focus:ring-rp-primary",
                errors.confirmPassword ? "border-rp-danger" : "border-rp-border"
              )}
            />
            {errors.confirmPassword && (
              <p className="mt-1 text-[11px] font-medium text-rp-danger">
                {errors.confirmPassword}
              </p>
            )}
          </div>
        </form>
      </main>

      {/* Pinned CTA + Google Option */}
      <footer className="px-4 pt-2 pb-5 bg-rp-bg space-y-3">
        <button
          type="submit"
          form="signup-form"
          disabled={isSubmitting}
          className="w-full h-[42px] inline-flex items-center justify-center rounded-[8px] bg-rp-primary px-4 text-[14px] font-semibold text-rp-primary-on hover:bg-[#123129] active:brightness-90 disabled:opacity-40 transition"
        >
          {isSubmitting ? "Creating account..." : "Create Account"}
        </button>

        <div className="flex items-center gap-3">
          <div className="h-px flex-1 bg-rp-border" />
          <span className="text-[11px] font-medium text-rp-text-muted-bg">or</span>
          <div className="h-px flex-1 bg-rp-border" />
        </div>

        <button
          type="button"
          onClick={handleGoogleSignUp}
          disabled={isSubmitting}
          className="w-full h-[42px] inline-flex items-center justify-center gap-2 rounded-[8px] bg-rp-surface border border-rp-border px-4 text-[13px] font-semibold text-rp-text hover:bg-slate-50 active:brightness-95 disabled:opacity-40 transition"
        >
          <GoogleIcon />
          <span>Sign up with Google</span>
        </button>

        <p className="pt-1 text-center text-[12px] text-rp-text-muted-bg">
          Already have an account?{" "}
          <Link
            href="/login"
            className="font-semibold text-rp-text underline underline-offset-2"
          >
            Log in
          </Link>
        </p>
      </footer>
    </div>
  );
}
