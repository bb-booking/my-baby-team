import { useState, useEffect, useCallback, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface Contraction {
  id: string;
  startedAt: string;   // ISO
  endedAt: string | null;
  durationMs: number | null;
  intervalMs: number | null; // ms since previous contraction STARTED
}

const STORAGE_KEY = "melo-contractions";

function loadContractions(): Contraction[] {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]"); } catch { return []; }
}
function saveContractions(c: Contraction[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(c.slice(0, 50)));
}

export type TimerState = "idle" | "active" | "stopped";

export function useContractionTimer(familyId: string, isPartnerView = false) {
  const [contractions, setContractions] = useState<Contraction[]>(loadContractions);
  const [activeStart, setActiveStart] = useState<string | null>(null);
  const [elapsed, setElapsed] = useState(0); // ms since current contraction started
  const [partnerActive, setPartnerActive] = useState(false);
  const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);
  const tickRef = useRef<number | null>(null);

  // ── Live elapsed timer ──────────────────────────────────────────────────
  useEffect(() => {
    if (activeStart && !isPartnerView) {
      tickRef.current = window.setInterval(() => {
        setElapsed(Date.now() - new Date(activeStart).getTime());
      }, 100);
    } else {
      if (tickRef.current) clearInterval(tickRef.current);
      if (!activeStart) setElapsed(0);
    }
    return () => { if (tickRef.current) clearInterval(tickRef.current); };
  }, [activeStart, isPartnerView]);

  // ── Supabase Broadcast setup ────────────────────────────────────────────
  useEffect(() => {
    if (!familyId) return;
    const channel = supabase.channel(`contractions-${familyId}`, {
      config: { broadcast: { self: false } },
    });

    channel.on("broadcast", { event: "state" }, ({ payload }: { payload: any }) => {
      if (isPartnerView || payload.from !== "self") {
        setContractions(payload.contractions ?? []);
        setActiveStart(payload.activeStart ?? null);
        setPartnerActive(!!payload.activeStart);
        if (payload.activeStart) {
          setElapsed(Date.now() - new Date(payload.activeStart).getTime());
        } else {
          setElapsed(0);
        }
      }
    });

    channel.subscribe();
    channelRef.current = channel;

    return () => { supabase.removeChannel(channel); };
  }, [familyId, isPartnerView]);

  // ── Broadcast helper ───────────────────────────────────────────────────
  const broadcast = useCallback((c: Contraction[], start: string | null) => {
    channelRef.current?.send({
      type: "broadcast",
      event: "state",
      payload: { contractions: c, activeStart: start },
    });
  }, []);

  // ── Start contraction ──────────────────────────────────────────────────
  const startContraction = useCallback(() => {
    if (isPartnerView) return;
    const now = new Date().toISOString();
    setActiveStart(now);
    setElapsed(0);
    broadcast(contractions, now);
  }, [contractions, broadcast, isPartnerView]);

  // ── Stop contraction ───────────────────────────────────────────────────
  const stopContraction = useCallback(() => {
    if (!activeStart || isPartnerView) return;
    const now = new Date();
    const started = new Date(activeStart);
    const durationMs = now.getTime() - started.getTime();

    // Calculate interval from last contraction start
    const prev = contractions[0];
    const intervalMs = prev?.startedAt
      ? started.getTime() - new Date(prev.startedAt).getTime()
      : null;

    const newContraction: Contraction = {
      id: Date.now().toString(),
      startedAt: activeStart,
      endedAt: now.toISOString(),
      durationMs,
      intervalMs,
    };

    const next = [newContraction, ...contractions];
    saveContractions(next);
    setContractions(next);
    setActiveStart(null);
    setElapsed(0);
    broadcast(next, null);
  }, [activeStart, contractions, broadcast, isPartnerView]);

  // ── Clear session ─────────────────────────────────────────────────────
  const clearSession = useCallback(() => {
    if (isPartnerView) return;
    saveContractions([]);
    setContractions([]);
    setActiveStart(null);
    setElapsed(0);
    broadcast([], null);
  }, [broadcast, isPartnerView]);

  // ── Alert level ───────────────────────────────────────────────────────
  const alertLevel = (() => {
    const completed = contractions.filter(c => c.endedAt);
    if (completed.length < 3) return "none" as const;
    const last3 = completed.slice(0, 3);
    const intervals = last3.map(c => c.intervalMs).filter(Boolean) as number[];
    if (intervals.length < 2) return "none" as const;
    const avgInterval = intervals.reduce((a, b) => a + b, 0) / intervals.length;
    if (avgInterval < 2 * 60 * 1000) return "urgent" as const;   // < 2 min
    if (avgInterval < 5 * 60 * 1000) return "warn" as const;     // < 5 min
    return "none" as const;
  })();

  const timerState: TimerState = activeStart ? "active" : contractions.length > 0 ? "stopped" : "idle";

  return {
    contractions,
    activeStart,
    elapsed,
    timerState,
    alertLevel,
    partnerActive,
    startContraction,
    stopContraction,
    clearSession,
  };
}

// ── Format helpers ─────────────────────────────────────────────────────────────
export function fmtMs(ms: number | null): string {
  if (ms === null) return "--";
  const totalSec = Math.floor(ms / 1000);
  const min = Math.floor(totalSec / 60);
  const sec = totalSec % 60;
  return min > 0 ? `${min}m ${sec.toString().padStart(2, "0")}s` : `${sec}s`;
}

export function fmtTime(iso: string): string {
  return new Date(iso).toLocaleTimeString("da-DK", { hour: "2-digit", minute: "2-digit", second: "2-digit" });
}
