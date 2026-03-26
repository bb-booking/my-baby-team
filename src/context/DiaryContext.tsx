import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from "react";
import { useAuth } from "@/context/AuthContext";
import {
  syncNursingLogs, fetchNursingLogs,
  syncDiaperLogs, fetchDiaperLogs,
  syncSleepLogs, fetchSleepLogs,
  syncNightShifts, fetchNightShifts,
  useDebouncedSync,
} from "@/hooks/useSupabaseSync";

export interface NursingLog {
  id: string;
  side: "left" | "right";
  timestamp: string;
}

export type StoolColor = "sort" | "mørkegrøn" | "grøn" | "gulgrøn" | "gul";
export type StoolConsistency = "hård" | "blød" | "flydende" | "grynet" | "slimet";

export interface DiaperLog {
  id: string;
  type: "wet" | "dirty" | "both";
  stoolColor?: StoolColor;
  stoolConsistency?: StoolConsistency;
  timestamp: string;
}

export interface SleepLog {
  id: string;
  type: "nap" | "night";
  startTime: string;
  endTime?: string;
  source: "manual" | "auto";
}

export interface NightShift {
  date: string;
  assignee: "mor" | "far";
}

interface DiaryContextType {
  nursingLogs: NursingLog[];
  addNursing: (side: "left" | "right") => void;
  removeNursingLog: (id: string) => void;
  diaperLogs: DiaperLog[];
  addDiaper: (type: "wet" | "dirty" | "both", color?: StoolColor, consistency?: StoolConsistency) => void;
  removeDiaperLog: (id: string) => void;
  sleepLogs: SleepLog[];
  addSleep: (type: "nap" | "night", start: string, end?: string) => void;
  endSleep: (id: string) => void;
  removeSleepLog: (id: string) => void;
  activeSleep: SleepLog | null;
  nightShifts: NightShift[];
  setNightShift: (date: string, assignee: "mor" | "far") => void;
  getTonightShift: () => NightShift | null;
  todayNursingCount: number;
  todayDiaperCount: number;
  todaySleepMinutes: number;
}

const DiaryContext = createContext<DiaryContextType | null>(null);

function genId() { return Math.random().toString(36).slice(2, 10); }

function isToday(iso: string) {
  return new Date(iso).toDateString() === new Date().toDateString();
}

function todayStr() {
  return new Date().toISOString().slice(0, 10);
}

export function DiaryProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();

  const [nursingLogs, setNursingLogs] = useState<NursingLog[]>(() => {
    try { const s = localStorage.getItem("lille-nursing"); return s ? JSON.parse(s) : []; } catch { return []; }
  });
  const [diaperLogs, setDiaperLogs] = useState<DiaperLog[]>(() => {
    try { const s = localStorage.getItem("lille-diapers"); return s ? JSON.parse(s) : []; } catch { return []; }
  });
  const [sleepLogs, setSleepLogs] = useState<SleepLog[]>(() => {
    try { const s = localStorage.getItem("lille-sleep"); return s ? JSON.parse(s) : []; } catch { return []; }
  });
  const [nightShifts, setNightShifts] = useState<NightShift[]>(() => {
    try { const s = localStorage.getItem("lille-shifts"); return s ? JSON.parse(s) : []; } catch { return []; }
  });

  // Load from database
  useEffect(() => {
    if (!user) return;
    let cancelled = false;

    async function loadFromDb() {
      const [dbNursing, dbDiapers, dbSleep, dbShifts] = await Promise.all([
        fetchNursingLogs(user!.id),
        fetchDiaperLogs(user!.id),
        fetchSleepLogs(user!.id),
        fetchNightShifts(user!.id),
      ]);
      if (cancelled) return;

      if (dbNursing && dbNursing.length > 0) {
        setNursingLogs(dbNursing);
        localStorage.setItem("lille-nursing", JSON.stringify(dbNursing));
      }
      if (dbDiapers && dbDiapers.length > 0) {
        setDiaperLogs(dbDiapers);
        localStorage.setItem("lille-diapers", JSON.stringify(dbDiapers));
      }
      if (dbSleep && dbSleep.length > 0) {
        setSleepLogs(dbSleep);
        localStorage.setItem("lille-sleep", JSON.stringify(dbSleep));
      }
      if (dbShifts && dbShifts.length > 0) {
        setNightShifts(dbShifts);
        localStorage.setItem("lille-shifts", JSON.stringify(dbShifts));
      }
    }

    loadFromDb();
    return () => { cancelled = true; };
  }, [user]);

  // Save to localStorage
  useEffect(() => { localStorage.setItem("lille-nursing", JSON.stringify(nursingLogs)); }, [nursingLogs]);
  useEffect(() => { localStorage.setItem("lille-diapers", JSON.stringify(diaperLogs)); }, [diaperLogs]);
  useEffect(() => { localStorage.setItem("lille-sleep", JSON.stringify(sleepLogs)); }, [sleepLogs]);
  useEffect(() => { localStorage.setItem("lille-shifts", JSON.stringify(nightShifts)); }, [nightShifts]);

  // Sync to database (debounced)
  const syncNursingCb = useCallback(async (uid: string, data: NursingLog[]) => { await syncNursingLogs(uid, data); }, []);
  const syncDiapersCb = useCallback(async (uid: string, data: DiaperLog[]) => { await syncDiaperLogs(uid, data); }, []);
  const syncSleepCb = useCallback(async (uid: string, data: SleepLog[]) => { await syncSleepLogs(uid, data); }, []);
  const syncShiftsCb = useCallback(async (uid: string, data: NightShift[]) => { await syncNightShifts(uid, data); }, []);

  useDebouncedSync(nursingLogs, syncNursingCb);
  useDebouncedSync(diaperLogs, syncDiapersCb);
  useDebouncedSync(sleepLogs, syncSleepCb);
  useDebouncedSync(nightShifts, syncShiftsCb);

  const addNursing = (side: "left" | "right") => {
    setNursingLogs(prev => [{ id: genId(), side, timestamp: new Date().toISOString() }, ...prev]);
  };
  const removeNursingLog = (id: string) => setNursingLogs(prev => prev.filter(l => l.id !== id));

  const addDiaper = (type: "wet" | "dirty" | "both", color?: StoolColor, consistency?: StoolConsistency) => {
    setDiaperLogs(prev => [{ id: genId(), type, stoolColor: color, stoolConsistency: consistency, timestamp: new Date().toISOString() }, ...prev]);
  };
  const removeDiaperLog = (id: string) => setDiaperLogs(prev => prev.filter(l => l.id !== id));

  const addSleep = (type: "nap" | "night", start: string, end?: string) => {
    setSleepLogs(prev => [{ id: genId(), type, startTime: start, endTime: end, source: "manual" }, ...prev]);
  };
  const endSleep = (id: string) => {
    setSleepLogs(prev => prev.map(l => l.id === id ? { ...l, endTime: new Date().toISOString() } : l));
  };
  const removeSleepLog = (id: string) => setSleepLogs(prev => prev.filter(l => l.id !== id));

  const activeSleep = sleepLogs.find(l => !l.endTime) || null;

  const setNightShift = (date: string, assignee: "mor" | "far") => {
    setNightShifts(prev => {
      const filtered = prev.filter(s => s.date !== date);
      return [...filtered, { date, assignee }];
    });
  };
  const getTonightShift = () => nightShifts.find(s => s.date === todayStr()) || null;

  const todayNursingCount = nursingLogs.filter(l => isToday(l.timestamp)).length;
  const todayDiaperCount = diaperLogs.filter(l => isToday(l.timestamp)).length;
  const todaySleepMinutes = sleepLogs
    .filter(l => isToday(l.startTime) && l.endTime)
    .reduce((sum, l) => sum + (new Date(l.endTime!).getTime() - new Date(l.startTime).getTime()) / 60000, 0);

  return (
    <DiaryContext.Provider value={{
      nursingLogs, addNursing, removeNursingLog,
      diaperLogs, addDiaper, removeDiaperLog,
      sleepLogs, addSleep, endSleep, removeSleepLog, activeSleep,
      nightShifts, setNightShift, getTonightShift,
      todayNursingCount, todayDiaperCount, todaySleepMinutes,
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
