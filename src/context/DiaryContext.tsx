import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from "react";
import { useAuth } from "@/context/AuthContext";
import { useFamily } from "@/context/FamilyContext";
import { supabase } from "@/integrations/supabase/client";
import { notifyPartner } from "@/lib/pushNotify";
import { startSleepActivity, endSleepActivity } from "@/plugins/liveActivity";
import {
  syncNursingLogs, fetchNursingLogs,
  syncDiaperLogs, fetchDiaperLogs,
  syncSleepLogs, fetchSleepLogs,
  syncNightShifts, fetchNightShifts,
  useDebouncedSync,
} from "@/hooks/useSupabaseSync";

// ── Types ──────────────────────────────────────────────────────────────────────

export interface LogReactions {
  mor?: string;
  far?: string;
}

export interface NursingLog {
  id: string;
  side: "left" | "right" | "bottle";
  ml?: number;
  timestamp: string;
  reactions?: LogReactions;
  fromPartner?: boolean;
}

export type StoolColor = "sort" | "mørkegrøn" | "grøn" | "gulgrøn" | "gul";
export type StoolConsistency = "hård" | "blød" | "flydende" | "grynet" | "slimet";

export interface DiaperLog {
  id: string;
  type: "wet" | "dirty" | "both";
  stoolColor?: StoolColor;
  stoolConsistency?: StoolConsistency;
  timestamp: string;
  reactions?: LogReactions;
  fromPartner?: boolean;
}

export interface SleepLog {
  id: string;
  type: "nap" | "night";
  startTime: string;
  endTime?: string;
  source: "manual" | "auto";
  reactions?: LogReactions;
  fromPartner?: boolean;
}

export interface NightShift {
  date: string;
  assignee: "mor" | "far";
}

interface DiaryContextType {
  // Nursing
  nursingLogs: NursingLog[];
  addNursing: (side: "left" | "right" | "bottle", ml?: number) => void;
  removeNursingLog: (id: string) => void;
  // Diapers
  diaperLogs: DiaperLog[];
  addDiaper: (type: "wet" | "dirty" | "both", color?: StoolColor, consistency?: StoolConsistency) => void;
  removeDiaperLog: (id: string) => void;
  // Sleep
  sleepLogs: SleepLog[];
  addSleep: (type: "nap" | "night", start: string, end?: string) => void;
  endSleep: (id: string) => void;
  removeSleepLog: (id: string) => void;
  activeSleep: SleepLog | null;
  // Reactions
  addReaction: (type: "nursing" | "diaper" | "sleep", id: string, role: "mor" | "far", emoji: string) => void;
  // Night shifts
  nightShifts: NightShift[];
  setNightShift: (date: string, assignee: "mor" | "far") => void;
  getTonightShift: () => NightShift | null;
  // Today stats
  todayNursingCount: number;
  todayDiaperCount: number;
  todaySleepMinutes: number;
  // Sync state
  partnerOnline: boolean;
}

const DiaryContext = createContext<DiaryContextType | null>(null);

function genId() { return Math.random().toString(36).slice(2, 10); }

function isToday(iso: string) {
  const d = new Date(iso);
  const now = new Date();
  return d.toDateString() === now.toDateString();
}

function todayStr() {
  return new Date().toISOString().slice(0, 10);
}

// Merge own + partner logs, sorted newest first
function mergeLogs<T extends { timestamp?: string; startTime?: string; fromPartner?: boolean }>(
  own: T[], partner: T[]
): T[] {
  const partnerTagged = partner.map(l => ({ ...l, fromPartner: true }));
  const all = [...own, ...partnerTagged];
  return all.sort((a, b) => {
    const aTime = a.timestamp ?? a.startTime ?? "";
    const bTime = b.timestamp ?? b.startTime ?? "";
    return new Date(bTime).getTime() - new Date(aTime).getTime();
  });
}

export function DiaryProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const { profile } = useFamily();
  const partnerUserId = profile.partnerUserId;

  // ── Own logs (localStorage + Supabase) ──────────────────────────────────────
  const [myNursingLogs, setMyNursingLogs] = useState<NursingLog[]>(() => {
    try { const s = localStorage.getItem("lille-nursing"); return s ? JSON.parse(s) : []; } catch { return []; }
  });
  const [myDiaperLogs, setMyDiaperLogs] = useState<DiaperLog[]>(() => {
    try { const s = localStorage.getItem("lille-diapers"); return s ? JSON.parse(s) : []; } catch { return []; }
  });
  const [mySleepLogs, setMySleepLogs] = useState<SleepLog[]>(() => {
    try { const s = localStorage.getItem("lille-sleep"); return s ? JSON.parse(s) : []; } catch { return []; }
  });
  const [nightShifts, setNightShiftsState] = useState<NightShift[]>(() => {
    try { const s = localStorage.getItem("lille-shifts"); return s ? JSON.parse(s) : []; } catch { return []; }
  });

  // ── Partner logs (Supabase only) ─────────────────────────────────────────────
  const [partnerNursingLogs, setPartnerNursingLogs] = useState<NursingLog[]>([]);
  const [partnerDiaperLogs, setPartnerDiaperLogs] = useState<DiaperLog[]>([]);
  const [partnerSleepLogs, setPartnerSleepLogs] = useState<SleepLog[]>([]);
  const [partnerOnline, setPartnerOnline] = useState(false);

  // ── Persist own logs to localStorage ─────────────────────────────────────────
  useEffect(() => { localStorage.setItem("lille-nursing", JSON.stringify(myNursingLogs)); }, [myNursingLogs]);
  useEffect(() => { localStorage.setItem("lille-diapers", JSON.stringify(myDiaperLogs)); }, [myDiaperLogs]);
  useEffect(() => { localStorage.setItem("lille-sleep", JSON.stringify(mySleepLogs)); }, [mySleepLogs]);
  useEffect(() => { localStorage.setItem("lille-shifts", JSON.stringify(nightShifts)); }, [nightShifts]);

  // ── Load own data from Supabase on mount ─────────────────────────────────────
  useEffect(() => {
    if (!user) return;
    Promise.all([
      fetchNursingLogs(user.id),
      fetchDiaperLogs(user.id),
      fetchSleepLogs(user.id),
      fetchNightShifts(user.id),
    ]).then(([nursing, diaper, sleep, shifts]) => {
      if (nursing && nursing.length > 0) { setMyNursingLogs(nursing); localStorage.setItem("lille-nursing", JSON.stringify(nursing)); }
      if (diaper && diaper.length > 0) { setMyDiaperLogs(diaper); localStorage.setItem("lille-diapers", JSON.stringify(diaper)); }
      if (sleep && sleep.length > 0) { setMySleepLogs(sleep); localStorage.setItem("lille-sleep", JSON.stringify(sleep)); }
      if (shifts && shifts.length > 0) { setNightShiftsState(shifts); localStorage.setItem("lille-shifts", JSON.stringify(shifts)); }
    });
  }, [user]);

  // ── Load partner data + real-time subscription ───────────────────────────────
  useEffect(() => {
    if (!user || !partnerUserId) return;

    // Initial partner load
    Promise.all([
      fetchNursingLogs(partnerUserId),
      fetchDiaperLogs(partnerUserId),
      fetchSleepLogs(partnerUserId),
    ]).then(([nursing, diaper, sleep]) => {
      if (nursing) setPartnerNursingLogs(nursing);
      if (diaper) setPartnerDiaperLogs(diaper);
      if (sleep) setPartnerSleepLogs(sleep);
      if (nursing || diaper || sleep) setPartnerOnline(true);
    });

    // Real-time subscription on partner's diary changes
    const channel = supabase
      .channel(`partner-${partnerUserId}`)
      .on("postgres_changes", {
        event: "*", schema: "public", table: "nursing_logs",
        filter: `user_id=eq.${partnerUserId}`,
      }, async () => {
        const logs = await fetchNursingLogs(partnerUserId);
        if (logs) { setPartnerNursingLogs(logs); setPartnerOnline(true); }
      })
      .on("postgres_changes", {
        event: "*", schema: "public", table: "diaper_logs",
        filter: `user_id=eq.${partnerUserId}`,
      }, async () => {
        const logs = await fetchDiaperLogs(partnerUserId);
        if (logs) { setPartnerDiaperLogs(logs); setPartnerOnline(true); }
      })
      .on("postgres_changes", {
        event: "*", schema: "public", table: "sleep_logs",
        filter: `user_id=eq.${partnerUserId}`,
      }, async () => {
        const logs = await fetchSleepLogs(partnerUserId);
        if (logs) { setPartnerSleepLogs(logs); setPartnerOnline(true); }
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [user, partnerUserId]);

  // ── Debounced sync own data to Supabase ──────────────────────────────────────
  const syncNursingCb = useCallback(async (userId: string, data: any) => syncNursingLogs(userId, data), []);
  const syncDiaperCb = useCallback(async (userId: string, data: any) => syncDiaperLogs(userId, data), []);
  const syncSleepCb = useCallback(async (userId: string, data: any) => syncSleepLogs(userId, data), []);
  const syncShiftsCb = useCallback(async (userId: string, data: any) => syncNightShifts(userId, data), []);

  useDebouncedSync(myNursingLogs, syncNursingCb);
  useDebouncedSync(myDiaperLogs, syncDiaperCb);
  useDebouncedSync(mySleepLogs, syncSleepCb);
  useDebouncedSync(nightShifts, syncShiftsCb);

  // ── Merged views (own + partner) ─────────────────────────────────────────────
  const nursingLogs = mergeLogs(myNursingLogs, partnerNursingLogs) as NursingLog[];
  const diaperLogs = mergeLogs(myDiaperLogs, partnerDiaperLogs) as DiaperLog[];
  const sleepLogs = mergeLogs(mySleepLogs, partnerSleepLogs) as SleepLog[];

  // ── Mutations (own data only) ────────────────────────────────────────────────
  const myName = profile.parentName || (profile.role === "mor" ? "Mor" : "Far");

  const addNursing = (side: "left" | "right" | "bottle", ml?: number) => {
    setMyNursingLogs(prev => [{ id: genId(), side, ml, timestamp: new Date().toISOString() }, ...prev]);
    if (partnerUserId) {
      const label = side === "left" ? "venstre bryst" : side === "right" ? "højre bryst" : ml ? `flaske (${ml} ml)` : "flaske";
      notifyPartner(partnerUserId, `${myName} har logget amning 🍼`, label);
    }
  };
  const removeNursingLog = (id: string) => setMyNursingLogs(prev => prev.filter(l => l.id !== id));

  const addDiaper = (type: "wet" | "dirty" | "both", color?: StoolColor, consistency?: StoolConsistency) => {
    setMyDiaperLogs(prev => [{ id: genId(), type, stoolColor: color, stoolConsistency: consistency, timestamp: new Date().toISOString() }, ...prev]);
    if (partnerUserId) {
      const label = type === "wet" ? "våd ble" : type === "dirty" ? "beskidt ble" : "våd + beskidt ble";
      notifyPartner(partnerUserId, `${myName} har skiftet ble 👶`, label);
    }
  };
  const removeDiaperLog = (id: string) => setMyDiaperLogs(prev => prev.filter(l => l.id !== id));

  const addSleep = (type: "nap" | "night", start: string, end?: string) => {
    setMySleepLogs(prev => [{ id: genId(), type, startTime: start, endTime: end, source: "manual" }, ...prev]);
    if (!end) {
      const childName = profile.children?.[0]?.name || "Baby";
      startSleepActivity({ childName, startTime: new Date(start).getTime(), sleepType: type });
    }
    if (partnerUserId) {
      const label = type === "nap" ? "lur startet" : "nattesøvn startet";
      notifyPartner(partnerUserId, `${myName} har logget søvn 🌙`, label);
    }
  };
  const endSleep = (id: string) => {
    setMySleepLogs(prev => prev.map(l => l.id === id ? { ...l, endTime: new Date().toISOString() } : l));
    endSleepActivity();
    if (partnerUserId) {
      notifyPartner(partnerUserId, `${myName} stoppede søvn 😊`, "Søvnen er afsluttet");
    }
  };
  const removeSleepLog = (id: string) => setMySleepLogs(prev => prev.filter(l => l.id !== id));

  const addReaction = (type: "nursing" | "diaper" | "sleep", id: string, role: "mor" | "far", emoji: string) => {
    const updater = (prev: any[]) => prev.map((l: any) =>
      l.id === id ? { ...l, reactions: { ...l.reactions, [role]: emoji || undefined } } : l
    );
    if (type === "nursing") setMyNursingLogs(updater);
    else if (type === "diaper") setMyDiaperLogs(updater);
    else setMySleepLogs(updater);
    // Notify partner if adding (not removing) a reaction to their log
    if (emoji && partnerUserId) {
      const allLogs = [...nursingLogs, ...diaperLogs, ...sleepLogs] as any[];
      const log = allLogs.find(l => l.id === id);
      if (log?.fromPartner) {
        notifyPartner(partnerUserId, `${myName} sendte en reaktion ${emoji}`, "Se dagbogen");
      }
    }
  };

  const setNightShift = (date: string, assignee: "mor" | "far") => {
    setNightShiftsState(prev => {
      const filtered = prev.filter(s => s.date !== date);
      return [...filtered, { date, assignee }];
    });
  };
  const getTonightShift = () => nightShifts.find(s => s.date === todayStr()) || null;

  // ── Today stats (from merged logs) ──────────────────────────────────────────
  const todayNursingCount = nursingLogs.filter(l => isToday(l.timestamp)).length;
  const todayDiaperCount = diaperLogs.filter(l => isToday(l.timestamp)).length;
  const todaySleepMinutes = mySleepLogs
    .filter(l => isToday(l.startTime) && l.endTime)
    .reduce((sum, l) => sum + (new Date(l.endTime!).getTime() - new Date(l.startTime).getTime()) / 60000, 0);

  const activeSleep = mySleepLogs.find(l => !l.endTime) || null;

  return (
    <DiaryContext.Provider value={{
      nursingLogs, addNursing, removeNursingLog,
      diaperLogs, addDiaper, removeDiaperLog,
      sleepLogs, addSleep, endSleep, removeSleepLog, activeSleep,
      addReaction,
      nightShifts, setNightShift, getTonightShift,
      todayNursingCount, todayDiaperCount, todaySleepMinutes,
      partnerOnline,
    }}>
      {children}
    </DiaryContext.Provider>
  );
}

export function useDiary() {
  const ctx = useContext(DiaryContext);
  if (!ctx) throw new Error("useDiary must be used within DiaryProvider");
  return ctx;
}
