import { createContext, useContext, useState, useEffect, type ReactNode } from "react";

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

export interface Child {
  id: string;
  name: string;
  birthDate: string; // ISO
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
  dueDate: string; // ISO date string YYYY-MM-DD
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
}

const defaultProfile: FamilyProfile = {
  phase: "pregnant",
  role: "mor",
  dueOrBirthDate: "",
  parentName: "",
  partnerName: "",
  children: [],
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
  // Tasks
  tasks: FamilyTask[];
  addTask: (title: string, assignee: TaskAssignee, recurrence?: TaskRecurrence, dueDate?: string) => void;
  toggleTask: (id: string) => void;
  removeTask: (id: string) => void;
  reassignTask: (id: string, newAssignee: TaskAssignee) => void;
  editTaskTitle: (id: string, newTitle: string) => void;
  moveTaskToDate: (id: string, newDate: string) => void;
  // Children
  addChild: (name: string, birthDate: string) => void;
  removeChild: (id: string) => void;
  // Helpers
  morName: string;
  farName: string;
}

const FamilyContext = createContext<FamilyContextType | null>(null);

function calcWeeksBetween(from: Date, to: Date): number {
  const diff = to.getTime() - from.getTime();
  return Math.floor(diff / (7 * 24 * 60 * 60 * 1000));
}

function generateId() {
  return Math.random().toString(36).substring(2, 10);
}

// Default tasks seeded from phase
function getDefaultTasks(phase: LifePhase, week: number): FamilyTask[] {
  const { getTasksForPhase } = require("@/lib/phaseData");
  const phaseTasks = getTasksForPhase(phase, week);
  return phaseTasks.map((t: any) => ({
    ...t,
    completed: false,
    category: t.category || "custom",
    createdAt: new Date().toISOString(),
  }));
}

export function FamilyProvider({ children }: { children: ReactNode }) {
  const [profile, setProfileState] = useState<FamilyProfile>(() => {
    try {
      const stored = localStorage.getItem("lille-family");
      if (stored) {
        const parsed = JSON.parse(stored);
        // Migrate old profiles without children
        if (!parsed.children) parsed.children = [];
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

  useEffect(() => {
    localStorage.setItem("lille-family", JSON.stringify(profile));
  }, [profile]);

  useEffect(() => {
    localStorage.setItem("lille-tasks", JSON.stringify(tasks));
  }, [tasks]);

  const setProfile = (p: FamilyProfile) => setProfileState(p);
  const resetProfile = () => {
    localStorage.removeItem("lille-family");
    localStorage.removeItem("lille-tasks");
    setProfileState(defaultProfile);
    setTasks([]);
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
    profile.phase === "pregnant"
      ? "pregnant"
      : babyAgeMonths < 3
      ? "newborn"
      : "baby";

  // Helper: who is mor/far
  const morName = profile.role === "mor" ? profile.parentName : profile.partnerName;
  const farName = profile.role === "far" ? profile.parentName : profile.partnerName;

  // Task management
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
    setTasks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t))
    );
  };

  const removeTask = (id: string) => {
    setTasks((prev) => prev.filter((t) => t.id !== id));
  };

  const reassignTask = (id: string, newAssignee: TaskAssignee) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, assignee: newAssignee } : t))
    );
  };

  const editTaskTitle = (id: string, newTitle: string) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, title: newTitle } : t))
    );
  };

  const moveTaskToDate = (id: string, newDate: string) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, dueDate: newDate } : t))
    );
  };

  // Children management
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

  // Seed default tasks if empty and onboarded
  useEffect(() => {
    if (profile.onboarded && tasks.length === 0) {
      import("@/lib/phaseData").then(({ getTasksForPhase }) => {
        const week = effectivePhase === "pregnant" ? currentWeek : babyAgeWeeks;
        const phaseTasks = getTasksForPhase(effectivePhase, week);
        setTasks(
          phaseTasks.map((t) => ({
            ...t,
            completed: false,
            category: t.category || "custom",
            createdAt: new Date().toISOString(),
            recurrence: "never" as TaskRecurrence,
            dueDate: new Date().toISOString().split("T")[0],
          }))
        );
      });
    }
  }, [profile.onboarded]);

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
        tasks,
        addTask,
        toggleTask,
        removeTask,
        reassignTask,
        editTaskTitle,
        addChild,
        removeChild,
        morName,
        farName,
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
