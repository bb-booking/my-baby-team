import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from "react";
import { useAuth } from "@/context/AuthContext";
import {
  upsertProfile, fetchProfile, syncTasks, fetchTasks,
  syncCheckIns, fetchCheckIns, useDebouncedSync,
} from "@/hooks/useSupabaseSync";

// Re-export for convenience — keep the same import paths working
export { upsertProfile } from "@/hooks/useSupabaseSync";

export type LifePhase = "pregnant" | "newborn" | "baby";
export type ParentRole = "mor" | "far";
export type TaskAssignee = "mor" | "far" | "fælles";
export type BirthType = "vaginal" | "kejsersnit";
export type FeedingMethod = "amning" | "flaske" | "begge";

export interface MorHealth {
  birthType?: BirthType;
  complications?: string[];
  feedingMethod?: FeedingMethod;
}

export interface ParentalLeave {
  mor: boolean;
  far: boolean;
}

export interface Child {
  id: string;
  name: string;
  birthDate: string;
}

export type TaskRecurrence = "never" | "daily" | "weekly" | "monthly";

export interface FamilyTask {
  id: string;
  title: string;
  assignee: TaskAssignee;
  category: "health" | "preparation" | "admin" | "relationship" | "custom";
  completed: boolean;
  createdAt: string;
  recurrence: TaskRecurrence;
  dueDate: string;
}

export interface DailyCheckIn {
  date: string;
  mood: string;
  role: ParentRole;
}

export type AppLanguage = "da" | "en";

export interface LanguagePrefs {
  mor: AppLanguage;
  far: AppLanguage;
}

export interface FamilyProfile {
  phase: LifePhase;
  role: ParentRole;
  dueOrBirthDate: string;
  parentName: string;
  partnerName: string;
  children: Child[];
  onboarded: boolean;
  morHealth?: MorHealth;
  parentalLeave?: ParentalLeave;
  languages?: LanguagePrefs;
}

const defaultProfile: FamilyProfile = {
  phase: "pregnant",
  role: "mor",
  dueOrBirthDate: "",
  parentName: "",
  partnerName: "",
  children: [],
  onboarded: false,
  parentalLeave: { mor: true, far: false },
  languages: { mor: "da", far: "da" },
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
  tasks: FamilyTask[];
  addTask: (title: string, assignee: TaskAssignee, recurrence?: TaskRecurrence, dueDate?: string) => void;
  toggleTask: (id: string) => void;
  removeTask: (id: string) => void;
  reassignTask: (id: string, newAssignee: TaskAssignee) => void;
  editTaskTitle: (id: string, newTitle: string) => void;
  moveTaskToDate: (id: string, newDate: string) => void;
  addChild: (name: string, birthDate: string) => void;
  removeChild: (id: string) => void;
  morName: string;
  farName: string;
  checkIns: DailyCheckIn[];
  addCheckIn: (mood: string) => void;
  todayCheckIn: DailyCheckIn | null;
  isOnLeave: (role: ParentRole) => boolean;
  partnerOnLeave: boolean;
  currentUserOnLeave: boolean;
}

const FamilyContext = createContext<FamilyContextType | null>(null);

function calcWeeksBetween(from: Date, to: Date): number {
  const diff = to.getTime() - from.getTime();
  return Math.floor(diff / (7 * 24 * 60 * 60 * 1000));
}

function generateId() {
  return Math.random().toString(36).substring(2, 10);
}

export function FamilyProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();

  const [profile, setProfileState] = useState<FamilyProfile>(() => {
    try {
      const stored = localStorage.getItem("lille-family");
      if (stored) {
        const parsed = JSON.parse(stored);
        if (!parsed.children) parsed.children = [];
        if (!parsed.parentalLeave) parsed.parentalLeave = { mor: true, far: false };
        return parsed;
      }
    } catch {}
    return defaultProfile;
  });

  const [tasks, setTasks] = useState<FamilyTask[]>(() => {
    try {
      const stored = localStorage.getItem("lille-tasks");
      if (stored) return JSON.parse(stored);
    } catch {}
    return [];
  });

  const [checkIns, setCheckIns] = useState<DailyCheckIn[]>(() => {
    try {
      const stored = localStorage.getItem("melo-checkins");
      if (stored) return JSON.parse(stored);
    } catch {}
    return [];
  });

  const [dbLoaded, setDbLoaded] = useState(false);

  // Load from database when user authenticates
  useEffect(() => {
    if (!user) { setDbLoaded(false); return; }
    let cancelled = false;

    async function loadFromDb() {
      const [dbProfile, dbTasks, dbCheckIns] = await Promise.all([
        fetchProfile(user!.id),
        fetchTasks(user!.id),
        fetchCheckIns(user!.id),
      ]);

      if (cancelled) return;

      if (dbProfile) {
        setProfileState(dbProfile);
        localStorage.setItem("lille-family", JSON.stringify(dbProfile));
      }
      if (dbTasks && dbTasks.length > 0) {
        setTasks(dbTasks);
        localStorage.setItem("lille-tasks", JSON.stringify(dbTasks));
      }
      if (dbCheckIns && dbCheckIns.length > 0) {
        setCheckIns(dbCheckIns);
        localStorage.setItem("melo-checkins", JSON.stringify(dbCheckIns));
      }
      setDbLoaded(true);
    }

    loadFromDb();
    return () => { cancelled = true; };
  }, [user]);

  // Save to localStorage (always)
  useEffect(() => { localStorage.setItem("lille-family", JSON.stringify(profile)); }, [profile]);
  useEffect(() => { localStorage.setItem("lille-tasks", JSON.stringify(tasks)); }, [tasks]);
  useEffect(() => { localStorage.setItem("melo-checkins", JSON.stringify(checkIns)); }, [checkIns]);

  // Sync to database (debounced)
  const syncProfileCb = useCallback(async (userId: string, data: FamilyProfile) => {
    await upsertProfile(userId, data);
  }, []);
  const syncTasksCb = useCallback(async (userId: string, data: FamilyTask[]) => {
    await syncTasks(userId, data);
  }, []);
  const syncCheckInsCb = useCallback(async (userId: string, data: DailyCheckIn[]) => {
    await syncCheckIns(userId, data);
  }, []);

  useDebouncedSync(profile, syncProfileCb);
  useDebouncedSync(tasks, syncTasksCb);
  useDebouncedSync(checkIns, syncCheckInsCb);

  const setProfile = (p: FamilyProfile) => setProfileState(p);
  const resetProfile = () => {
    localStorage.removeItem("lille-family");
    localStorage.removeItem("lille-tasks");
    localStorage.removeItem("melo-checkins");
    setProfileState(defaultProfile);
    setTasks([]);
    setCheckIns([]);
  };

  const now = new Date();
  const date = profile.dueOrBirthDate ? new Date(profile.dueOrBirthDate) : now;

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

  const effectivePhase: LifePhase =
    profile.phase === "pregnant" ? "pregnant" : babyAgeMonths < 3 ? "newborn" : "baby";

  const morName = profile.role === "mor" ? profile.parentName : profile.partnerName;
  const farName = profile.role === "far" ? profile.parentName : profile.partnerName;

  const leave = profile.parentalLeave || { mor: true, far: false };
  const isOnLeave = (role: ParentRole) => role === "mor" ? leave.mor : leave.far;
  const partnerOnLeave = profile.role === "mor" ? leave.far : leave.mor;
  const currentUserOnLeave = profile.role === "mor" ? leave.mor : leave.far;

  const todayStr = new Date().toISOString().slice(0, 10);
  const todayCheckIn = checkIns.find(c => c.date === todayStr && c.role === profile.role) || null;

  const addCheckIn = (mood: string) => {
    setCheckIns(prev => {
      const filtered = prev.filter(c => !(c.date === todayStr && c.role === profile.role));
      return [...filtered, { date: todayStr, mood, role: profile.role }];
    });
  };

  const addTask = (title: string, assignee: TaskAssignee, recurrence: TaskRecurrence = "never", dueDate?: string) => {
    setTasks((prev) => [
      ...prev,
      {
        id: generateId(),
        title,
        assignee,
        category: "custom",
        completed: false,
        createdAt: new Date().toISOString(),
        recurrence,
        dueDate: dueDate || new Date().toISOString().split("T")[0],
      },
    ]);
  };

  const toggleTask = (id: string) => {
    setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t)));
  };

  const removeTask = (id: string) => {
    setTasks((prev) => prev.filter((t) => t.id !== id));
  };

  const reassignTask = (id: string, newAssignee: TaskAssignee) => {
    setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, assignee: newAssignee } : t)));
  };

  const editTaskTitle = (id: string, newTitle: string) => {
    setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, title: newTitle } : t)));
  };

  const moveTaskToDate = (id: string, newDate: string) => {
    setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, dueDate: newDate } : t)));
  };

  const addChild = (name: string, birthDate: string) => {
    setProfileState((prev) => ({
      ...prev,
      children: [...prev.children, { id: generateId(), name, birthDate }],
    }));
  };

  const removeChild = (id: string) => {
    setProfileState((prev) => ({
      ...prev,
      children: prev.children.filter((c) => c.id !== id),
    }));
  };

  useEffect(() => {
    if (profile.onboarded && tasks.length === 0 && dbLoaded) {
      import("@/lib/phaseData").then(({ getTasksForPhase }) => {
        const week = effectivePhase === "pregnant" ? currentWeek : babyAgeWeeks;
        const phaseTasks = getTasksForPhase(effectivePhase, week);
        const today = new Date().toISOString().split("T")[0];
        setTasks(
          phaseTasks.map((t) => ({
            ...t,
            completed: false,
            category: t.category || "custom",
            createdAt: new Date().toISOString(),
            recurrence: "never" as TaskRecurrence,
            dueDate: today,
          }))
        );
      });
    }
  }, [profile.onboarded, effectivePhase, dbLoaded]);

  return (
    <FamilyContext.Provider
      value={{
        profile: { ...profile, phase: effectivePhase },
        setProfile, resetProfile,
        currentWeek, totalWeeks, trimester, babyAgeWeeks, babyAgeMonths, phaseLabel,
        tasks, addTask, toggleTask, removeTask, reassignTask, editTaskTitle, moveTaskToDate,
        addChild, removeChild, morName, farName,
        checkIns, addCheckIn, todayCheckIn,
        isOnLeave, partnerOnLeave, currentUserOnLeave,
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
