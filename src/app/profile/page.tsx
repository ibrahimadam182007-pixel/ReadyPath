"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  Award,
  Briefcase,
  ChevronRight,
  Database,
  GraduationCap,
  LogIn,
  LogOut,
  Pencil,
  ShieldAlert,
  Trash2,
} from "lucide-react";
import { TabHeader } from "@/components/layout/headers";
import { DesktopNavbar } from "@/components/layout/desktop-navbar";
import { BottomNav } from "@/components/layout/bottom-nav";
import { ToggleSwitch } from "@/components/ui/toggle-switch";
import { useReadyPath } from "@/components/providers/readypath-store";

const PREF_REMINDERS_KEY = "readypath_pref_default_reminders";

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "ST";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
}

export default function ProfileSettingsPage() {
  const { account, profile, savedPlans, isServerMode, logout } = useReadyPath();
  const [defaultReminders, setDefaultReminders] = useState(true);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  useEffect(() => {
    try {
      const saved = window.localStorage.getItem(PREF_REMINDERS_KEY);
      if (saved === "false") setDefaultReminders(false);
    } catch {
      // ignore storage error
    }
  }, []);

  const handleToggleDefaultReminders = (next: boolean) => {
    setDefaultReminders(next);
    try {
      window.localStorage.setItem(PREF_REMINDERS_KEY, String(next));
    } catch {
      // ignore storage error
    }
  };

  const handleDeleteAccount = async () => {
    setDeleteError(null);
    setIsDeleting(true);
    try {
      const res = await fetch("/api/account", { method: "DELETE" });
      if (!res.ok) {
        const body = (await res.json().catch(() => ({}))) as { error?: string };
        throw new Error(body.error || "Could not delete account.");
      }
      await logout();
    } catch (err) {
      setDeleteError(
        err instanceof Error ? err.message : "Could not delete account."
      );
      setIsDeleting(false);
    }
  };

  const initials = getInitials(account.fullName || account.email || "ST");
  const expiringSoonCount = profile.certificates.filter((c) => {
    const msLeft = c.expiryDate.getTime() - Date.now();
    return msLeft > 0 && msLeft < 365 * 24 * 60 * 60 * 1000;
  }).length;

  return (
    <div className="min-h-screen bg-rp-bg flex flex-col">
      <TabHeader
        title="Profile"
        subtitle="Academic & account settings"
        rightSlot={
          <div
            aria-label={account.fullName || "Student"}
            className="flex h-9 w-9 items-center justify-center rounded-full bg-rp-sage text-[12px] font-extrabold text-rp-primary"
          >
            {initials}
          </div>
        }
      />

      <div className="flex-1 flex flex-col w-full lg:max-w-[1200px] lg:mx-auto lg:px-6 lg:py-7 lg:gap-5">
        <DesktopNavbar variant="app" />

        {/* Desktop Page Head */}
        <div className="hidden lg:block">
          <h1 className="text-[30px] font-extrabold tracking-tight text-rp-text leading-tight">
            Profile
          </h1>
          <p className="mt-1 text-[12.5px] text-rp-text-muted">
            Academic &amp; account settings
          </p>
        </div>

        <main className="flex-1 px-4 pt-4 pb-6 lg:px-0 lg:pt-0 lg:pb-8 lg:grid lg:grid-cols-[minmax(0,1fr)_396px] lg:gap-6 lg:items-start space-y-4 lg:space-y-0">
          {/* Left Column */}
          <div className="space-y-4">
            {/* Identity Card */}
            <section className="rounded-[16px] bg-rp-surface p-4 lg:p-[22px] border border-rp-border shadow-rp-flat flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3.5 min-w-0">
                <div className="flex h-12 w-12 lg:h-14 lg:w-14 shrink-0 items-center justify-center rounded-full bg-rp-sage text-[15px] lg:text-[18px] font-extrabold text-rp-primary">
                  {initials}
                </div>
                <div className="min-w-0">
                  <h2 className="text-[16px] lg:text-[19px] font-extrabold text-rp-text truncate">
                    {account.fullName || "Guest Student"}
                  </h2>
                  <p className="text-[11.5px] text-rp-text-muted truncate">
                    {account.email || "Not signed in (browser prototype mode)"}
                  </p>
                  <div className="mt-1.5 flex flex-wrap items-center gap-2">
                    <span className="inline-flex items-center rounded-full bg-rp-bg px-2.5 py-0.5 text-[10.5px] font-extrabold text-rp-primary">
                      Semester {profile.currentSemester} · GPA{" "}
                      {profile.cumulativeGpa.toFixed(2)}
                    </span>
                    <span className="inline-flex items-center rounded-full bg-rp-surface-met px-2.5 py-0.5 text-[10.5px] font-bold text-rp-success">
                      {profile.degreeLevel}
                      {profile.major ? ` · ${profile.major}` : ""}
                    </span>
                  </div>
                </div>
              </div>

              <Link
                href="/profile/setup"
                className="shrink-0 inline-flex h-[40px] items-center justify-center gap-1.5 rounded-[10px] bg-rp-primary px-4 text-[12px] font-bold text-white hover:bg-rp-primary-hover transition"
              >
                <Pencil className="h-3.5 w-3.5" strokeWidth={2.2} />
                <span>Edit profile</span>
              </Link>
            </section>

            {/* Academic Data Card */}
            <section className="rounded-[16px] bg-rp-surface p-4 lg:p-[22px] border border-rp-border shadow-rp-flat">
              <div className="flex items-center justify-between mb-2">
                <h2 className="text-[13.5px] font-extrabold text-rp-text">
                  Academic data
                </h2>
                <Link
                  href="/profile/setup"
                  className="text-[11.5px] font-bold text-rp-primary hover:underline underline-offset-2"
                >
                  Manage all
                </Link>
              </div>

              <div className="divide-y divide-rp-hairline">
                <Link
                  href="/profile/setup"
                  className="flex items-center justify-between gap-3 py-3 hover:bg-rp-bg/30 -mx-2 px-2 rounded-[10px] transition"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[10px] bg-rp-bg text-rp-primary">
                      <GraduationCap className="h-4 w-4" strokeWidth={2} />
                    </span>
                    <div className="min-w-0">
                      <p className="text-[12.5px] font-bold text-rp-text">
                        GPA &amp; semester
                      </p>
                      <p className="text-[11px] text-rp-text-muted">
                        {profile.cumulativeGpa.toFixed(2)} / 4.00 · Semester{" "}
                        {profile.currentSemester} ({profile.degreeLevel})
                      </p>
                    </div>
                  </div>
                  <ChevronRight className="h-4 w-4 text-rp-text-muted shrink-0" />
                </Link>

                <Link
                  href="/profile/setup#certificates"
                  className="flex items-center justify-between gap-3 py-3 hover:bg-rp-bg/30 -mx-2 px-2 rounded-[10px] transition"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[10px] bg-rp-bg text-rp-primary">
                      <Award className="h-4 w-4" strokeWidth={2} />
                    </span>
                    <div className="min-w-0">
                      <p className="text-[12.5px] font-bold text-rp-text">
                        Certificates
                      </p>
                      <p className="text-[11px] text-rp-text-muted">
                        {profile.certificates.length} recorded
                        {expiringSoonCount > 0
                          ? ` · ${expiringSoonCount} expiring within 12 months`
                          : ""}
                      </p>
                    </div>
                  </div>
                  <ChevronRight className="h-4 w-4 text-rp-text-muted shrink-0" />
                </Link>

                <Link
                  href="/profile/setup#experiences"
                  className="flex items-center justify-between gap-3 py-3 hover:bg-rp-bg/30 -mx-2 px-2 rounded-[10px] transition"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[10px] bg-rp-bg text-rp-primary">
                      <Briefcase className="h-4 w-4" strokeWidth={2} />
                    </span>
                    <div className="min-w-0">
                      <p className="text-[12.5px] font-bold text-rp-text">
                        Experiences
                      </p>
                      <p className="text-[11px] text-rp-text-muted">
                        {profile.experiences.length} recorded ·{" "}
                        {profile.experiences.reduce(
                          (acc, e) => acc + e.durationMonths,
                          0
                        )}{" "}
                        total months
                      </p>
                    </div>
                  </div>
                  <ChevronRight className="h-4 w-4 text-rp-text-muted shrink-0" />
                </Link>
              </div>
            </section>

            {/* Preferences Card */}
            <section className="rounded-[16px] bg-rp-surface p-4 lg:p-[22px] border border-rp-border shadow-rp-flat space-y-3">
              <h2 className="text-[13.5px] font-extrabold text-rp-text">
                Preferences
              </h2>

              <div className="flex items-center justify-between gap-3 py-1">
                <div>
                  <p className="text-[12.5px] font-bold text-rp-text">
                    Default email reminders
                  </p>
                  <p className="text-[11px] text-rp-text-muted">
                    Pre-enable H-30, H-14, and H-7 reminders on new plans
                  </p>
                </div>
                <ToggleSwitch
                  checked={defaultReminders}
                  onChange={handleToggleDefaultReminders}
                  ariaLabel="Default email reminders"
                />
              </div>
            </section>
          </div>

          {/* Right Column: Account & Danger Zone */}
          <aside className="space-y-4">
            <section className="rounded-[16px] bg-rp-surface p-4 lg:p-[22px] border border-rp-border shadow-rp-flat">
              <h2 className="text-[13.5px] font-extrabold text-rp-text mb-2">
                Account
              </h2>

              <dl className="divide-y divide-rp-hairline text-[12px]">
                <div className="flex items-center justify-between gap-3 py-2.5">
                  <dt className="text-rp-text-muted">Student email</dt>
                  <dd className="font-bold text-rp-text truncate max-w-[200px]">
                    {account.email || "Guest mode"}
                  </dd>
                </div>
                <div className="flex items-center justify-between gap-3 py-2.5">
                  <dt className="text-rp-text-muted">Storage mode</dt>
                  <dd className="inline-flex items-center gap-1.5 font-bold text-rp-primary">
                    <Database className="h-3.5 w-3.5" strokeWidth={2} />
                    <span>{isServerMode ? "Server DB" : "Browser local"}</span>
                  </dd>
                </div>
                <div className="flex items-center justify-between gap-3 py-2.5">
                  <dt className="text-rp-text-muted">Saved targets</dt>
                  <dd className="font-bold text-rp-text">
                    {savedPlans.length} plan{savedPlans.length === 1 ? "" : "s"}
                  </dd>
                </div>
              </dl>
            </section>

            {/* Session & Privacy Actions */}
            <section className="rounded-[16px] bg-rp-surface p-4 lg:p-[22px] border border-rp-border shadow-rp-flat space-y-3">
              {isServerMode ? (
                <>
                  <button
                    type="button"
                    onClick={() => logout()}
                    className="w-full h-[44px] inline-flex items-center justify-center gap-2 rounded-[10px] border border-rp-border bg-rp-surface px-4 text-[13px] font-bold text-rp-text hover:bg-rp-bg/50 transition"
                  >
                    <LogOut className="h-4 w-4" strokeWidth={2} />
                    <span>Log Out</span>
                  </button>

                  {!confirmDelete ? (
                    <button
                      type="button"
                      onClick={() => setConfirmDelete(true)}
                      className="w-full h-[44px] inline-flex items-center justify-center gap-2 rounded-[10px] border border-rp-danger-border bg-rp-surface px-4 text-[13px] font-bold text-rp-danger hover:bg-rp-danger-bg transition"
                    >
                      <Trash2 className="h-4 w-4" strokeWidth={2} />
                      <span>Delete Account &amp; Data</span>
                    </button>
                  ) : (
                    <div className="rounded-[12px] bg-rp-danger-bg border border-rp-danger-border p-3.5 space-y-2.5">
                      <div className="flex items-start gap-2">
                        <ShieldAlert
                          className="h-4 w-4 text-rp-danger shrink-0 mt-0.5"
                          strokeWidth={2.2}
                        />
                        <p className="text-[11.5px] leading-snug text-rp-text">
                          This permanently deletes your account, profile,
                          certificates, experiences, and saved plans from the
                          server.
                        </p>
                      </div>
                      {deleteError && (
                        <p className="text-[11px] font-semibold text-rp-danger">
                          {deleteError}
                        </p>
                      )}
                      <div className="flex gap-2">
                        <button
                          type="button"
                          disabled={isDeleting}
                          onClick={() => setConfirmDelete(false)}
                          className="flex-1 h-[38px] rounded-[8px] bg-rp-surface border border-rp-border text-[12px] font-bold text-rp-text"
                        >
                          Cancel
                        </button>
                        <button
                          type="button"
                          disabled={isDeleting}
                          onClick={handleDeleteAccount}
                          className="flex-1 h-[38px] rounded-[8px] bg-rp-danger text-[12px] font-bold text-white disabled:opacity-50"
                        >
                          {isDeleting ? "Deleting..." : "Confirm Delete"}
                        </button>
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <div className="space-y-2.5">
                  <p className="text-[11.5px] leading-relaxed text-rp-text-muted">
                    Sign in with your student email to sync your profile across
                    devices and enable automated H-30 / H-14 / H-7 email
                    reminders.
                  </p>
                  <Link
                    href="/login"
                    className="w-full h-[44px] inline-flex items-center justify-center gap-2 rounded-[10px] bg-rp-primary px-4 text-[13px] font-bold text-white hover:bg-rp-primary-hover transition"
                  >
                    <LogIn className="h-4 w-4" strokeWidth={2} />
                    <span>Log In</span>
                  </Link>
                  <Link
                    href="/signup"
                    className="w-full h-[42px] inline-flex items-center justify-center rounded-[10px] border border-rp-border bg-rp-surface px-4 text-[12.5px] font-bold text-rp-text hover:bg-rp-bg/40 transition"
                  >
                    Create Student Account
                  </Link>
                </div>
              )}
            </section>
          </aside>
        </main>
      </div>

      <BottomNav />
    </div>
  );
}
