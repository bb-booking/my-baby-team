import { createContext, useContext, useState, useEffect, type ReactNode } from "react";

// ── Types ──

export interface NursingLog {
  id: string;
  side: "left" | "right";
  timestamp: string; // ISO
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
  startTime: string; // ISO
  endTime?: string; // ISO — undefined = ongoing
  source: "manual" | "auto";
}

export interface NightShift {
  date: string; // YYYY-MM-DD
  assignee: "mor" | "far";
}

interface DiaryContextType {
  // Nursing
  nursingLogs: NursingLog[];
  addNursing: (side: "left" | "right") => void;
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
  // Night shifts
  nightShifts: NightShift[];
  setNightShift: (date: string, assignee: "mor" | "far") => void;
  getTonightShift: () => NightShift | null;
  // Today stats
  todayNursingCount: number;
  todayDiaperCount: number;
  todaySleepMinutes: number;
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

export function DiaryProvider({ children }: { children: ReactNode }) {
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

  useEffect(() => { localStorage.setItem("lille-nursing", JSON.stringify(nursingLogs)); }, [nursingLogs]);
  useEffect(() => { localStorage.setItem("lille-diapers", JSON.stringify(diaperLogs)); }, [diaperLogs]);
  useEffect(() => { localStorage.setItem("lille-sleep", JSON.stringify(sleepLogs)); }, [sleepLogs]);
  useEffect(() => { localStorage.setItem("lille-shifts", JSON.stringify(nightShifts)); }, [nightShifts]);

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
