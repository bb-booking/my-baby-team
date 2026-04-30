import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from "react";
import i18n from "@/i18n";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { getTasksForPhase } from "@/lib/phaseData";
import {
  upsertProfile, fetchProfile, syncTasks, fetchTasks,
  syncCheckIns, fetchCheckIns, useDebouncedSync,
} from "@/hooks/useSupabaseSync";

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
  takenBy?: ParentRole;
  takenFrom?: ParentRole;
  takenAt?: string;
  takenReaction?: string;
}

export interface DailyCheckIn {
  date: string;
  mood: string;
  role: ParentRole;
}

export interface ActiveNeed {
  key: string;
  emoji: string;
  label: string;
  setAt: string;
}

export interface Memory {
  id: string;
  date: string;
  role: ParentRole;
  text: string;
}

export interface Appreciation {
  id: string;
  date: string;
  from: ParentRole;
  text: string;
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
  activeNeed?: {
    mor?: ActiveNeed | null;
    far?: ActiveNeed | null;
  };
  hasPartner?: boolean;
  familyId?: string;
  inviteCode?: string;
  partnerUserId?: string;
  dateNightIdeas?: { mor?: string; far?: string };
}

function generateInviteCode(): string {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
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
  hasPartner: true,
  inviteCode: generateInviteCode(),
  familyId: Math.random().toString(36).substring(2, 18),
};

interface FamilyContextType {
  profile: FamilyProfile;
  profileLoading: boolean;
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
  memories: Memory[];
  appreciations: Appreciation[];
  setNeed: (need: ActiveNeed | null) => void;
  addMemory: (text: string) => void;
  addAppreciation: (text: string) => void;
  takeTask: (id: string) => void;
  reactToTakenTask: (id: string, reaction: string) => void;
  joinFamilyByCode: (code: string) => Promise<{ success: boolean; partnerName?: string; error?: string }>;
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
        if (parsed.hasPartner === undefined) parsed.hasPartner = true;
        if (!parsed.inviteCode) parsed.inviteCode = generateInviteCode();
        if (!parsed.familyId) parsed.familyId = Math.random().toString(36).substring(2, 18);
        // Always derive phase from date so the date is the single source of truth
        if (parsed.dueOrBirthDate) {
          const d = new Date(parsed.dueOrBirthDate);
          const n = new Date();
          const isFuture = d > n;
          const weeksOld = Math.max(0, Math.floor((n.getTime() - d.getTime()) / (1000 * 60 * 60 * 24 * 7)));
          const monthsOld = Math.floor(weeksOld / 4.33);
          parsed.phase = isFuture ? "pregnant" : monthsOld < 3 ? "newborn" : "baby";
        }
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

  const [memories, setMemories] = useState<Memory[]>(() => {
    try {
      const stored = localStorage.getItem("melo-memories");
      if (stored) return JSON.parse(stored);
    } catch {}
    return [];
  });

  const [appreciations, setAppreciations] = useState<Appreciation[]>(() => {
    try {
      const stored = localStorage.getItem("melo-appreciations");
      if (stored) return JSON.parse(stored);
    } catch {}
    return [];
  });

  // Start loading immediately — we always fetch from Supabase on mount
  const [profileLoading, setProfileLoading] = useState(true);

  // Save to localStorage on every change
  useEffect(() => { localStorage.setItem("lille-family", JSON.stringify(profile)); }, [profile]);
  useEffect(() => { localStorage.setItem("lille-tasks", JSON.stringify(tasks)); }, [tasks]);
  useEffect(() => { localStorage.setItem("melo-checkins", JSON.stringify(checkIns)); }, [checkIns]);
  useEffect(() => { localStorage.setItem("melo-memories", JSON.stringify(memories)); }, [memories]);
  useEffect(() => { localStorage.setItem("melo-appreciations", JSON.stringify(appreciations)); }, [appreciations]);

  // Sync i18n language
  useEffect(() => {
    const lang = profile.languages?.[profile.role] || "da";
    if (i18n.language !== lang) i18n.changeLanguage(lang);
  }, [profile.role, profile.languages]);

  // Load from Supabase when user is available
  useEffect(() => {
    if (!user) { setProfileLoading(false); return; }
    let cancelled = false;
    setProfileLoading(true);

    async function loadFromDb() {
      const [dbProfile, dbTasks, dbCheckIns] = await Promise.all([
        fetchProfile(user!.id),
        fetchTasks(user!.id),
        fetchCheckIns(user!.id),
      ]);
      if (cancelled) return;
      if (dbProfile) {
        // Always derive phase from date so the date is the single source of truth
        if (dbProfile.dueOrBirthDate) {
          const d = new Date(dbProfile.dueOrBirthDate);
          const n = new Date();
          const isFuture = d > n;
          const weeksOld = Math.max(0, Math.floor((n.getTime() - d.getTime()) / (1000 * 60 * 60 * 24 * 7)));
          const monthsOld = Math.floor(weeksOld / 4.33);
          dbProfile.phase = isFuture ? "pregnant" : monthsOld < 3 ? "newborn" : "baby";
        }
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
      setProfileLoading(false);
    }

    loadFromDb();
    return () => { cancelled = true; };
  }, [user]);

  // Debounced sync to Supabase
  const syncProfileCb = useCallback(async (userId: string, data: FamilyProfile) => {
    await upsertProfile(userId, data);
  }, []);
  const syncTasksCb = useCallback(async (userId: string, data: any[]) => {
    await syncTasks(userId, data);
  }, []);
  const syncCheckInsCb = useCallback(async (userId: string, data: any[]) => {
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
    setTasks((prev) => [...prev, {
      id: generateId(), title, assignee, category: "custom", completed: false,
      createdAt: new Date().toISOString(), recurrence,
      dueDate: dueDate || new Date().toISOString().split("T")[0],
    }]);
  };

  const toggleTask = (id: string) => setTasks((prev) => prev.map((t) => t.id === id ? { ...t, completed: !t.completed } : t));
  const removeTask = (id: string) => setTasks((prev) => prev.filter((t) => t.id !== id));
  const reassignTask = (id: string, newAssignee: TaskAssignee) => setTasks((prev) => prev.map((t) => t.id === id ? { ...t, assignee: newAssignee } : t));
  const editTaskTitle = (id: string, newTitle: string) => setTasks((prev) => prev.map((t) => t.id === id ? { ...t, title: newTitle } : t));
  const moveTaskToDate = (id: string, newDate: string) => setTasks((prev) => prev.map((t) => t.id === id ? { ...t, dueDate: newDate } : t));

  const setNeed = (need: ActiveNeed | null) => {
    setProfileState(prev => ({
      ...prev,
      activeNeed: { ...prev.activeNeed, [prev.role]: need },
    }));
  };

  const addMemory = (text: string) => {
    setMemories(prev => [...prev, {
      id: generateId(), date: new Date().toISOString(), role: profile.role, text,
    }]);
  };

  const addAppreciation = (text: string) => {
    setAppreciations(prev => [...prev, {
      id: generateId(), date: new Date().toISOString(), from: profile.role, text,
    }]);
  };

  const takeTask = (id: string) => {
    const task = tasks.find(t => t.id === id);
    if (!task) return;
    const takerRole = profile.role;
    const fromRole = task.assignee as ParentRole;
    setTasks(prev => prev.map(t =>
      t.id === id
        ? { ...t, assignee: takerRole, takenBy: takerRole, takenFrom: fromRole, takenAt: new Date().toISOString() }
        : t
    ));
    // Auto-log to Memory Keeper
    const takerName = profile.parentName;
    setMemories(prev => [...prev, {
      id: generateId(),
      date: new Date().toISOString(),
      role: takerRole,
      text: `${takerName} tog opgaven "${task.title}" 💚`,
    }]);
  };

  const reactToTakenTask = (id: string, reaction: string) => {
    setTasks(prev => prev.map(t => t.id === id ? { ...t, takenReaction: reaction } : t));
  };

  const joinFamilyByCode = async (code: string): Promise<{ success: boolean; partnerName?: string; error?: string }> => {
    const { data, error } = await supabase
      .from("profiles")
      .select("user_id, parent_name, family_id, invite_code")
      .eq("invite_code", code.toUpperCase())
      .maybeSingle();
    if (error || !data) return { success: false, error: "Koden blev ikke fundet. Tjek at du har tastet korrekt." };
    if (data.user_id === user?.id) return { success: false, error: "Det er din egen kode — del den med din partner." };
    const partnerUserId = data.user_id;
    const sharedFamilyId = data.family_id || data.user_id;
    setProfileState(prev => ({
      ...prev,
      partnerUserId,
      familyId: sharedFamilyId,
      partnerName: prev.partnerName || data.parent_name,
    }));
    return { success: true, partnerName: data.parent_name };
  };

  const addChild = (name: string, birthDate: string) => {
    setProfileState((prev) => ({ ...prev, children: [...prev.children, { id: generateId(), name, birthDate }] }));
  };
  const removeChild = (id: string) => {
    setProfileState((prev) => ({ ...prev, children: prev.children.filter((c) => c.id !== id) }));
  };

  useEffect(() => {
    if (profile.onboarded && tasks.length === 0) {
      const week = effectivePhase === "pregnant" ? currentWeek : babyAgeWeeks;
      const phaseTasks = getTasksForPhase(effectivePhase, week);
      const today = new Date().toISOString().split("T")[0];
      setTasks(phaseTasks.map((t) => ({
        ...t, completed: false, category: t.category || "custom",
        createdAt: new Date().toISOString(), recurrence: "never" as TaskRecurrence, dueDate: today,
      })));
    }
  }, [profile.onboarded, effectivePhase]);

  return (
    <FamilyContext.Provider value={{
      profile: { ...profile, phase: effectivePhase },
      profileLoading,
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
      moveTaskToDate,
      addChild,
      removeChild,
      morName,
      farName,
      checkIns,
      addCheckIn,
      todayCheckIn,
      isOnLeave,
      partnerOnLeave,
      currentUserOnLeave,
      memories,
      appreciations,
      setNeed,
      addMemory,
      addAppreciation,
      takeTask,
      reactToTakenTask,
      joinFamilyByCode,
    }}>
      {children}
    </FamilyContext.Provider>
  );
}

export function useFamily() {
  const ctx = useContext(FamilyContext);
  if (!ctx) throw new Error("useFamily must be used within FamilyProvider");
  return ctx;
}
