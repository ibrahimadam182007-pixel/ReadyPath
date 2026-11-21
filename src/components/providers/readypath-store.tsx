"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
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
  updateAccount: (partial: Partial<StudentAccountInfo>) => void;
  updateProfile: (profile: EngineStudentProfile) => void;
  savePlan: (plan: Omit<SavedTargetPlan, "savedAt">) => void;
  togglePlanReminders: (opportunityId: string, enabled: boolean) => void;
  removePlan: (opportunityId: string) => void;
  getSavedPlan: (opportunityId: string) => SavedTargetPlan | undefined;
}

const STORAGE_KEY = "readypath_v1_state";

const DEFAULT_STATE: ReadyPathState = {
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
      opportunityId: "opp-beasiswa-unggulan-2027",
      remindersEnabled: true,
      reminderOffsets: ["H-30", "H-14", "H-7"],
      savedAt: "2026-11-20T10:00:00Z",
    },
    {
      opportunityId: "opp-iisma-2027",
      remindersEnabled: true,
      reminderOffsets: ["H-30", "H-14", "H-7"],
      savedAt: "2026-11-21T08:00:00Z",
    },
  ],
};

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

  useEffect(() => {
    const saved = window.localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const revived = reviveState(saved);
      if (revived) {
        setState(revived);
      }
    }
    setIsHydrated(true);
  }, []);

  useEffect(() => {
    if (!isHydrated) return;
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [state, isHydrated]);

  const updateAccount = (partial: Partial<StudentAccountInfo>) => {
    setState((prev) => ({
      ...prev,
      account: { ...prev.account, ...partial },
    }));
  };

  const updateProfile = (profile: EngineStudentProfile) => {
    setState((prev) => ({
      ...prev,
      profile,
    }));
  };

  const savePlan = (plan: Omit<SavedTargetPlan, "savedAt">) => {
    setState((prev) => {
      const exists = prev.savedPlans.some(
        (p) => p.opportunityId === plan.opportunityId
      );
      const nextPlan: SavedTargetPlan = {
        ...plan,
        savedAt: new Date().toISOString(),
      };
      return {
        ...prev,
        savedPlans: exists
          ? prev.savedPlans.map((p) =>
              p.opportunityId === plan.opportunityId ? nextPlan : p
            )
          : [nextPlan, ...prev.savedPlans],
      };
    });
  };

  const togglePlanReminders = (opportunityId: string, enabled: boolean) => {
    setState((prev) => ({
      ...prev,
      savedPlans: prev.savedPlans.map((p) =>
        p.opportunityId === opportunityId
          ? { ...p, remindersEnabled: enabled }
          : p
      ),
    }));
  };

  const removePlan = (opportunityId: string) => {
    setState((prev) => ({
      ...prev,
      savedPlans: prev.savedPlans.filter(
        (p) => p.opportunityId !== opportunityId
      ),
    }));
  };

  const getSavedPlan = (opportunityId: string) =>
    state.savedPlans.find((p) => p.opportunityId === opportunityId);

  return (
    <ReadyPathContext.Provider
      value={{
        ...state,
        isHydrated,
        updateAccount,
        updateProfile,
        savePlan,
        togglePlanReminders,
        removePlan,
        getSavedPlan,
      }}
    >
      {children}
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
