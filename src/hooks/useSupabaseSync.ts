import { useEffect, useCallback, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";
import type { FamilyProfile } from "@/context/FamilyContext";
import type { NursingLog, DiaperLog, SleepLog, NightShift } from "@/context/DiaryContext";

export async function upsertProfile(userId: string, profile: FamilyProfile) {
  await supabase.from("profiles").upsert({
    user_id: userId,
    phase: profile.phase,
    role: profile.role,
    due_or_birth_date: profile.dueOrBirthDate,
    parent_name: profile.parentName,
    partner_name: profile.partnerName,
    children: profile.children as any,
    onboarded: profile.onboarded,
    mor_health: profile.morHealth as any,
    parental_leave: profile.parentalLeave as any,
    languages: profile.languages as any,
    // family linking fields — require migration: 20260416_family_linking.sql
    ...(profile.hasPartner !== undefined && { has_partner: profile.hasPartner }),
    ...(profile.familyId && { family_id: profile.familyId }),
    ...(profile.inviteCode && { invite_code: profile.inviteCode }),
    ...(profile.partnerUserId && { partner_user_id: profile.partnerUserId }),
    updated_at: new Date().toISOString(),
  }, { onConflict: "user_id" });
}

export async function fetchProfile(userId: string): Promise<FamilyProfile | null> {
  const { data, error } = await supabase.from("profiles").select("*").eq("user_id", userId).maybeSingle();
  if (error || !data) return null;
  return {
    phase: data.phase as any,
    role: data.role as any,
    dueOrBirthDate: data.due_or_birth_date,
    parentName: data.parent_name,
    partnerName: data.partner_name,
    children: (data.children as any) || [],
    onboarded: data.onboarded,
    morHealth: data.mor_health as any,
    parentalLeave: (data.parental_leave as any) || { mor: true, far: false },
    languages: (data.languages as any) || { mor: "da", far: "da" },
    hasPartner: (data as any).has_partner ?? true,
    familyId: (data as any).family_id ?? undefined,
    inviteCode: (data as any).invite_code ?? undefined,
    partnerUserId: (data as any).partner_user_id ?? undefined,
  };
}

export async function syncTasks(userId: string, tasks: any[]) {
  await supabase.from("tasks").delete().eq("user_id", userId);
  if (tasks.length > 0) {
    const rows = tasks.map(t => ({
      id: t.id, user_id: userId, title: t.title, assignee: t.assignee,
      category: t.category, completed: t.completed, recurrence: t.recurrence,
      due_date: t.dueDate, created_at: t.createdAt,
    }));
    const { error } = await supabase.from("tasks").insert(rows);
    // sync errors handled silently
  }
}

export async function fetchTasks(userId: string) {
  const { data, error } = await supabase.from("tasks").select("*").eq("user_id", userId);
  if (error || !data) return null;
  return data.map(t => ({
    id: t.id, title: t.title, assignee: t.assignee as any, category: t.category as any,
    completed: t.completed, createdAt: t.created_at, recurrence: t.recurrence as any, dueDate: t.due_date,
  }));
}

export async function syncCheckIns(userId: string, checkIns: any[]) {
  await supabase.from("check_ins").delete().eq("user_id", userId);
  if (checkIns.length > 0) {
    const rows = checkIns.map(c => ({ user_id: userId, date: c.date, mood: c.mood, role: c.role }));
    await supabase.from("check_ins").insert(rows);
  }
}

export async function fetchCheckIns(userId: string) {
  const { data } = await supabase.from("check_ins").select("*").eq("user_id", userId);
  return data?.map(c => ({ date: c.date, mood: c.mood, role: c.role as any })) || null;
}

export async function syncNursingLogs(userId: string, logs: NursingLog[]) {
  await supabase.from("nursing_logs").delete().eq("user_id", userId);
  if (logs.length > 0) {
    const rows = logs.map(l => ({ id: l.id, user_id: userId, side: l.side, timestamp: l.timestamp }));
    await supabase.from("nursing_logs").insert(rows);
  }
}

export async function fetchNursingLogs(userId: string): Promise<NursingLog[] | null> {
  const { data } = await supabase.from("nursing_logs").select("*").eq("user_id", userId).order("timestamp", { ascending: false });
  return data?.map(l => ({ id: l.id, side: l.side as any, timestamp: l.timestamp })) || null;
}

export async function syncDiaperLogs(userId: string, logs: DiaperLog[]) {
  await supabase.from("diaper_logs").delete().eq("user_id", userId);
  if (logs.length > 0) {
    const rows = logs.map(l => ({
      id: l.id, user_id: userId, type: l.type,
      stool_color: l.stoolColor, stool_consistency: l.stoolConsistency, timestamp: l.timestamp,
    }));
    await supabase.from("diaper_logs").insert(rows);
  }
}

export async function fetchDiaperLogs(userId: string): Promise<DiaperLog[] | null> {
  const { data } = await supabase.from("diaper_logs").select("*").eq("user_id", userId).order("timestamp", { ascending: false });
  return data?.map(l => ({
    id: l.id, type: l.type as any,
    stoolColor: l.stool_color as any, stoolConsistency: l.stool_consistency as any, timestamp: l.timestamp,
  })) || null;
}

export async function syncSleepLogs(userId: string, logs: SleepLog[]) {
  await supabase.from("sleep_logs").delete().eq("user_id", userId);
  if (logs.length > 0) {
    const rows = logs.map(l => ({
      id: l.id, user_id: userId, type: l.type,
      start_time: l.startTime, end_time: l.endTime || null, source: l.source,
    }));
    await supabase.from("sleep_logs").insert(rows);
  }
}

export async function fetchSleepLogs(userId: string): Promise<SleepLog[] | null> {
  const { data } = await supabase.from("sleep_logs").select("*").eq("user_id", userId).order("start_time", { ascending: false });
  return data?.map(l => ({
    id: l.id, type: l.type as any,
    startTime: l.start_time, endTime: l.end_time || undefined, source: l.source as any,
  })) || null;
}

export async function syncNightShifts(userId: string, shifts: NightShift[]) {
  await supabase.from("night_shifts").delete().eq("user_id", userId);
  if (shifts.length > 0) {
    const rows = shifts.map(s => ({ user_id: userId, date: s.date, assignee: s.assignee }));
    await supabase.from("night_shifts").insert(rows);
  }
}

export async function fetchNightShifts(userId: string): Promise<NightShift[] | null> {
  const { data } = await supabase.from("night_shifts").select("*").eq("user_id", userId);
  return data?.map(s => ({ date: s.date, assignee: s.assignee as any })) || null;
}

export function useDebouncedSync(data: any, syncFn: (userId: string, data: any) => Promise<void>, delay = 1000) {
  const { user } = useAuth();
  const timeoutRef = useRef<ReturnType<typeof setTimeout>>();
  const isInitialLoad = useRef(true);

  useEffect(() => {
    if (isInitialLoad.current) { isInitialLoad.current = false; return; }
    if (!user) return;
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => { syncFn(user.id, data); }, delay);
    return () => { if (timeoutRef.current) clearTimeout(timeoutRef.current); };
  }, [data, user, syncFn, delay]);
}
