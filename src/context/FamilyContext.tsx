import { createContext, useContext, useState, useEffect, type ReactNode } from "react";

export type LifePhase = "pregnant" | "newborn" | "baby";
export type ParentRole = "mor" | "far";

export interface FamilyProfile {
  phase: LifePhase;
  role: ParentRole;
  dueOrBirthDate: string; // ISO date string
  parentName: string;
  partnerName: string;
  onboarded: boolean;
}

const defaultProfile: FamilyProfile = {
  phase: "pregnant",
  role: "mor",
  dueOrBirthDate: "",
  parentName: "",
  partnerName: "",
  onboarded: false,
};

interface FamilyContextType {
  profile: FamilyProfile;
  setProfile: (p: FamilyProfile) => void;
  resetProfile: () => void;
  currentWeek: number;
  totalWeeks: number;
  trimester: number;
  babyAgeWeeks: number;
  babyAgeMonths: number;
  phaseLabel: string;
}

const FamilyContext = createContext<FamilyContextType | null>(null);

function calcWeeksBetween(from: Date, to: Date): number {
  const diff = to.getTime() - from.getTime();
  return Math.floor(diff / (7 * 24 * 60 * 60 * 1000));
}

export function FamilyProvider({ children }: { children: ReactNode }) {
  const [profile, setProfileState] = useState<FamilyProfile>(() => {
    try {
      const stored = localStorage.getItem("lille-family");
      if (stored) return JSON.parse(stored);
    } catch {}
    return defaultProfile;
  });

  useEffect(() => {
    localStorage.setItem("lille-family", JSON.stringify(profile));
  }, [profile]);

  const setProfile = (p: FamilyProfile) => setProfileState(p);
  const resetProfile = () => {
    localStorage.removeItem("lille-family");
    setProfileState(defaultProfile);
  };

  const now = new Date();
  const date = profile.dueOrBirthDate ? new Date(profile.dueOrBirthDate) : now;

  // Pregnant: weeks since conception (40 - weeks until due)
  // Born: weeks since birth
  let currentWeek = 0;
  let totalWeeks = 40;
  let trimester = 1;
  let babyAgeWeeks = 0;
  let babyAgeMonths = 0;
  let phaseLabel = "";

  if (profile.phase === "pregnant") {
    const weeksUntilDue = calcWeeksBetween(now, date);
    currentWeek = Math.max(1, Math.min(40, 40 - weeksUntilDue));
    trimester = currentWeek <= 12 ? 1 : currentWeek <= 27 ? 2 : 3;
    phaseLabel = `Uge ${currentWeek} af 40`;
  } else {
    babyAgeWeeks = Math.max(0, calcWeeksBetween(date, now));
    babyAgeMonths = Math.floor(babyAgeWeeks / 4.33);
    
    if (babyAgeMonths < 3) {
      phaseLabel = babyAgeWeeks < 1 ? "Nyfødt" : `${babyAgeWeeks} uger gammel`;
    } else {
      phaseLabel = `${babyAgeMonths} måneder gammel`;
    }
  }

  // Auto-determine sub-phase for born babies
  const effectivePhase: LifePhase =
    profile.phase === "pregnant"
      ? "pregnant"
      : babyAgeMonths < 3
      ? "newborn"
      : "baby";

  return (
    <FamilyContext.Provider
      value={{
        profile: { ...profile, phase: effectivePhase },
        setProfile,
        resetProfile,
        currentWeek,
        totalWeeks,
        trimester,
        babyAgeWeeks,
        babyAgeMonths,
        phaseLabel,
      }}
    >
      {children}
    </FamilyContext.Provider>
  );
}

export function useFamily() {
  const ctx = useContext(FamilyContext);
  if (!ctx) throw new Error("useFamily must be used within FamilyProvider");
  return ctx;
}
