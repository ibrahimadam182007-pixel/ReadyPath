"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { signOut } from "next-auth/react";
import type { EngineStudentProfile } from "@/lib/engine";

export interface StudentAccountInfo {
  fullName: string;
  email: string;
  isAuthenticated: boolean;
}

export interface SavedTargetPlan {
  opportunityId: string;
  remindersEnabled: boolean;
  reminderOffsets: string[]; // e.g. ["H-30", "H-14", "H-7"]
  savedAt: string;
}

interface ReadyPathState {
  account: StudentAccountInfo;
  profile: EngineStudentProfile;
  savedPlans: SavedTargetPlan[];
}

interface ReadyPathContextValue extends ReadyPathState {
  isHydrated: boolean;
  /** True when a signed-in session exists: profile and plans are stored in the database. */
  isServerMode: boolean;
  /** Last failed server sync (shown as a banner); null when everything is saved. */
  syncError: string | null;
  logout: () => Promise<void>;
  updateAccount: (partial: Partial<StudentAccountInfo>) => void;
  updateProfile: (profile: EngineStudentProfile) => void;
  savePlan: (plan: Omit<SavedTargetPlan, "savedAt">) => void;
  togglePlanReminders: (opportunityId: string, enabled: boolean) => void;
  removePlan: (opportunityId: string) => void;
  getSavedPlan: (opportunityId: string) => SavedTargetPlan | undefined;
}

const STORAGE_KEY = "readypath_v1_state";

/** Demo student shown only when NEXT_PUBLIC_DEMO_MODE=true (never for real pilot participants). */
const DEMO_STATE: ReadyPathState = {
  account: {
    fullName: "Naufal Pratama",
    email: "naufal.pratama@students.amikom.ac.id",
    isAuthenticated: true,
  },
  profile: {
    degreeLevel: "S1",
    major: "Informatics",
    currentSemester: 5,
    cumulativeGpa: 3.55,
    totalCreditsCompleted: 96,
    certificates: [
      {
        id: "cert-demo-1",
        name: "TOEFL ITP",
        standardCode: "TOEFL_ITP",
        category: "ENGLISH_PROFICIENCY",
        score: 510,
        expiryDate: new Date("2027-08-15T00:00:00Z"),
      },
    ],
    experiences: [
      {
        id: "exp-demo-1",
        role: "Frontend Web Staff",
        organization: "AMIKOM Computer Club (AMCC)",
        category: "ORGANIZATION",
        durationMonths: 8,
      },
      {
        id: "exp-demo-2",
        role: "Lab Teaching Assistant",
        organization: "UPT Lab AMIKOM",
        category: "INTERNSHIP",
        durationMonths: 4,
      },
    ],
  },
  savedPlans: [
    {
      opportunityId: "opp-dts-komdigi-2026",
      remindersEnabled: true,
      reminderOffsets: ["H-30", "H-14", "H-7"],
      savedAt: "2026-11-20T10:00:00Z",
    },
    {
      opportunityId: "opp-magenta-bumn-2026",
      remindersEnabled: true,
      reminderOffsets: ["H-30", "H-14", "H-7"],
      savedAt: "2026-11-21T08:00:00Z",
    },
  ],
};

const BLANK_STATE: ReadyPathState = {
  account: { fullName: "", email: "", isAuthenticated: false },
  profile: {
    degreeLevel: "S1",
    major: null,
    currentSemester: 1,
    cumulativeGpa: 0,
    totalCreditsCompleted: null,
    certificates: [],
    experiences: [],
  },
  savedPlans: [],
};

const DEFAULT_STATE: ReadyPathState =
  process.env.NEXT_PUBLIC_DEMO_MODE === "true" ? DEMO_STATE : BLANK_STATE;

function reviveProfile(raw: EngineStudentProfile): EngineStudentProfile {
  return {
    ...raw,
    certificates: (raw.certificates ?? []).map((c) => ({
      ...c,
      issueDate: c.issueDate ? new Date(c.issueDate) : undefined,
      expiryDate: new Date(c.expiryDate),
    })),
  };
}

interface ServerPlan {
  opportunityId: string;
  remindersEnabled: boolean;
  reminderOffsets: string[];
  savedAt: string;
}

async function api<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(path, {
    ...init,
    headers: { "Content-Type": "application/json", ...(init?.headers ?? {}) },
  });
  if (res.status === 204) return undefined as T;
  const body = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error((body as { error?: string }).error || `Request failed (${res.status})`);
  return body as T;
}

function reviveState(raw: string): ReadyPathState | null {
  try {
    const parsed = JSON.parse(raw) as ReadyPathState;
    if (!parsed || !parsed.profile) return null;
    return {
      ...parsed,
      profile: {
        ...parsed.profile,
        certificates: (parsed.profile.certificates ?? []).map((c) => ({
          ...c,
          issueDate: c.issueDate ? new Date(c.issueDate) : undefined,
          expiryDate: new Date(c.expiryDate),
        })),
      },
    };
  } catch {
    return null;
  }
}

const ReadyPathContext = createContext<ReadyPathContextValue | null>(null);

export function ReadyPathProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<ReadyPathState>(DEFAULT_STATE);
  const [isHydrated, setIsHydrated] = useState(false);
  const [isServerMode, setIsServerMode] = useState(false);
  const [syncError, setSyncError] = useState<string | null>(null);

  // 1) Signed in -> load profile and plans from the database.
  // 2) Otherwise -> local mode (localStorage), the original prototype behaviour.
  useEffect(() => {
    let cancelled = false;

    async function hydrate() {
      try {
        const res = await fetch("/api/auth/session");
        const session = res.ok ? await res.json() : null;
        if (session?.user?.email) {
          const [{ profile }, { plans }] = await Promise.all([
            api<{ profile: EngineStudentProfile | null }>("/api/profile"),
            api<{ plans: ServerPlan[] }>("/api/plans"),
          ]);
          if (cancelled) return;
          // In server mode personal data lives in the database, not in the browser.
          window.localStorage.removeItem(STORAGE_KEY);
          setState({
            account: {
              fullName: session.user.name ?? "",
              email: session.user.email,
              isAuthenticated: true,
            },
            profile: profile ? reviveProfile(profile) : BLANK_STATE.profile,
            savedPlans: plans.map((p) => ({
              opportunityId: p.opportunityId,
              remindersEnabled: p.remindersEnabled,
              reminderOffsets: p.reminderOffsets,
              savedAt: p.savedAt,
            })),
          });
          setIsServerMode(true);
          setIsHydrated(true);
          return;
        }
      } catch {
        if (!cancelled) setSyncError("Could not reach the server. Working offline in this browser.");
      }

      if (cancelled) return;
      const saved = window.localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const revived = reviveState(saved);
        if (revived) setState(revived);
      }
      setIsHydrated(true);
    }

    hydrate();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!isHydrated || isServerMode) return;
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [state, isHydrated, isServerMode]);

  const sync = (task: () => Promise<unknown>) => {
    if (!isServerMode) return;
    task()
      .then(() => setSyncError(null))
      .catch((error: unknown) =>
        setSyncError(error instanceof Error ? error.message : "Could not save to the server.")
      );
  };

  const updateAccount = (partial: Partial<StudentAccountInfo>) => {
    setState((prev) => ({
      ...prev,
      account: { ...prev.account, ...partial },
    }));
  };

  const updateProfile = (profile: EngineStudentProfile) => {
    setState((prev) => ({ ...prev, profile }));
    sync(async () => {
      const saved = await api<{ profile: EngineStudentProfile }>("/api/profile", {
        method: "PUT",
        body: JSON.stringify(profile),
      });
      // The server replaces certificate/experience rows, so adopt the saved copy (new ids).
      setState((prev) => ({ ...prev, profile: reviveProfile(saved.profile) }));
    });
  };

  const savePlan = (plan: Omit<SavedTargetPlan, "savedAt">) => {
    setState((prev) => {
      const exists = prev.savedPlans.some((p) => p.opportunityId === plan.opportunityId);
      const nextPlan: SavedTargetPlan = { ...plan, savedAt: new Date().toISOString() };
      return {
        ...prev,
        savedPlans: exists
          ? prev.savedPlans.map((p) => (p.opportunityId === plan.opportunityId ? nextPlan : p))
          : [nextPlan, ...prev.savedPlans],
      };
    });
    sync(() =>
      api(`/api/plans/${encodeURIComponent(plan.opportunityId)}`, {
        method: "PUT",
        body: JSON.stringify({
          remindersEnabled: plan.remindersEnabled,
          reminderOffsets: plan.reminderOffsets,
        }),
      })
    );
  };

  const togglePlanReminders = (opportunityId: string, enabled: boolean) => {
    const current = state.savedPlans.find((p) => p.opportunityId === opportunityId);
    setState((prev) => ({
      ...prev,
      savedPlans: prev.savedPlans.map((p) =>
        p.opportunityId === opportunityId ? { ...p, remindersEnabled: enabled } : p
      ),
    }));
    sync(() =>
      api(`/api/plans/${encodeURIComponent(opportunityId)}`, {
        method: "PUT",
        body: JSON.stringify({
          remindersEnabled: enabled,
          reminderOffsets: current?.reminderOffsets ?? ["H-30", "H-14", "H-7"],
        }),
      })
    );
  };

  const removePlan = (opportunityId: string) => {
    setState((prev) => ({
      ...prev,
      savedPlans: prev.savedPlans.filter((p) => p.opportunityId !== opportunityId),
    }));
    sync(() => api(`/api/plans/${encodeURIComponent(opportunityId)}`, { method: "DELETE" }));
  };

  const getSavedPlan = (opportunityId: string) =>
    state.savedPlans.find((p) => p.opportunityId === opportunityId);

  const logout = async () => {
    await signOut({ redirect: false });
    window.localStorage.removeItem(STORAGE_KEY);
    window.location.assign("/login");
  };

  return (
    <ReadyPathContext.Provider
      value={{
        ...state,
        isHydrated,
        isServerMode,
        syncError,
        logout,
        updateAccount,
        updateProfile,
        savePlan,
        togglePlanReminders,
        removePlan,
        getSavedPlan,
      }}
    >
      {children}
      {syncError && (
        <div
          role="alert"
          className="fixed inset-x-3 bottom-20 z-50 mx-auto max-w-[420px] rounded-lg bg-red-700 px-3 py-2 text-[12px] font-medium text-white shadow-lg"
        >
          {syncError}
        </div>
      )}
    </ReadyPathContext.Provider>
  );
}

export function useReadyPath() {
  const ctx = useContext(ReadyPathContext);
  if (!ctx) {
    throw new Error("useReadyPath must be used inside ReadyPathProvider");
  }
  return ctx;
}
