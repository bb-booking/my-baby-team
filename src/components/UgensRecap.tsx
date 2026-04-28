import { useState, useEffect } from "react";
import { useDiary } from "@/context/DiaryContext";
import { useFamily } from "@/context/FamilyContext";
import { supabase } from "@/integrations/supabase/client";
import { upsertWeeklyRitual, fetchWeeklyRitual, type WeeklyRitualRow } from "@/hooks/useSupabaseSync";
import { useTranslation } from "react-i18next";

// ── Helpers ───────────────────────────────────────────────────────────────────

function getLast7DaysStart(): Date {
  const d = new Date();
  d.setDate(d.getDate() - 6);
  d.setHours(0, 0, 0, 0);
  return d;
}

function getThisWeekMonday(): string {
  const d = new Date();
  const day = d.getDay();
  const diff = (day === 0 ? -6 : 1 - day);
  d.setDate(d.getDate() + diff);
  return d.toISOString().slice(0, 10);
}

function isSunday(): boolean {
  return new Date().getDay() === 0;
}

function minutesToStr(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = Math.round(minutes % 60);
  if (h === 0) return `${m}m`;
  if (m === 0) return `${h}t`;
  return `${h}t ${m}m`;
}

// ── Stats ─────────────────────────────────────────────────────────────────────

function useWeekStats() {
  const { nursingLogs, diaperLogs, sleepLogs } = useDiary();
  const start = getLast7DaysStart();

  const feeds = nursingLogs.filter(l => new Date(l.timestamp) >= start).length;
  const diapers = diaperLogs.filter(l => new Date(l.timestamp) >= start).length;
  const sleepMin = sleepLogs
    .filter(l => new Date(l.startTime) >= start && l.endTime)
    .reduce((sum, l) => sum + (new Date(l.endTime!).getTime() - new Date(l.startTime).getTime()) / 60000, 0);

  const allTimeMilestone = (() => {
    if (nursingLogs.length >= 100 && nursingLogs.length < 110) return "milestone100meals";
    if (diaperLogs.length >= 100 && diaperLogs.length < 110) return "milestone100diapers";
    if (nursingLogs.length >= 50 && nursingLogs.length < 55) return "milestone50meals";
    return null;
  })();

  return { feeds, diapers, sleepMin, allTimeMilestone };
}

// ── Ritual ────────────────────────────────────────────────────────────────────

const RITUAL_QUESTION_KEYS = [
  { key: "good", tKey: "recap.ritualGood" },
  { key: "hard", tKey: "recap.ritualHard" },
  { key: "next", tKey: "recap.ritualNext" },
] as const;

type RitualKey = "good" | "hard" | "next";

function useRitual() {
  const { profile } = useFamily();
  const isMor = profile.role === "mor";
  const familyId = profile.familyId;
  const weekStart = getThisWeekMonday();
  const { t, i18n } = useTranslation();
  const partnerName = profile.partnerName || (i18n.language === "en" ? (isMor ? "Dad" : "Mom") : (isMor ? "Far" : "Mor"));

  const [ritual, setRitual] = useState<WeeklyRitualRow | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!familyId) return;
    setLoading(true);
    fetchWeeklyRitual(familyId, weekStart).then(row => {
      setRitual(row);
      setLoading(false);
    });
  }, [familyId, weekStart]);

  // Real-time subscription
  useEffect(() => {
    if (!familyId) return;
    const channel = supabase
      .channel(`ritual-${familyId}-${weekStart}`)
      .on("postgres_changes", {
        event: "*", schema: "public", table: "weekly_rituals",
        filter: `family_id=eq.${familyId}`,
      }, async () => {
        const row = await fetchWeeklyRitual(familyId, weekStart);
        setRitual(row);
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [familyId, weekStart]);

  const saveAnswer = async (key: RitualKey, value: string) => {
    if (!familyId) return;
    const prefix = isMor ? "mor" : "far";
    const field = `${prefix}_${key}` as keyof WeeklyRitualRow;
    const updated: WeeklyRitualRow = {
      family_id: familyId,
      week_start: weekStart,
      ...(ritual || {}),
      [field]: value,
    };
    setRitual(updated);
    await upsertWeeklyRitual(updated);
  };

  const myAnswers = {
    good: isMor ? ritual?.mor_good : ritual?.far_good,
    hard: isMor ? ritual?.mor_hard : ritual?.far_hard,
    next: isMor ? ritual?.mor_next : ritual?.far_next,
  };
  const partnerAnswers = {
    good: isMor ? ritual?.far_good : ritual?.mor_good,
    hard: isMor ? ritual?.far_hard : ritual?.mor_hard,
    next: isMor ? ritual?.far_next : ritual?.mor_next,
  };

  const myDone = !!(myAnswers.good && myAnswers.hard && myAnswers.next);
  const partnerDone = !!(partnerAnswers.good && partnerAnswers.hard && partnerAnswers.next);

  return { myAnswers, partnerAnswers, myDone, partnerDone, partnerName, saveAnswer, loading, familyId };
}

function RitualSection() {
  const { profile } = useFamily();
  const { t, i18n } = useTranslation();
  const isMor = profile.role === "mor";
  const hasPartner = profile.hasPartner !== false;
  const { myAnswers, partnerAnswers, myDone, partnerDone, partnerName, saveAnswer, loading, familyId } = useRitual();

  const [step, setStep] = useState<RitualKey | "done">("good");
  const [inputs, setInputs] = useState({ good: "", hard: "", next: "" });
  const [showPartner, setShowPartner] = useState(false);
  const [open, setOpen] = useState(false);

  const accentBg = isMor ? "hsl(var(--clay-light))" : "hsl(var(--sage-light))";
  const accentText = isMor ? "hsl(var(--bark))" : "hsl(var(--moss))";
  const accentSolid = isMor ? "hsl(var(--clay))" : "hsl(var(--moss))";
  const accentSolidText = isMor ? "hsl(var(--bark))" : "white";
  const today = isSunday();

  const RITUAL_QUESTIONS = RITUAL_QUESTION_KEYS.map(q => ({ key: q.key, label: t(q.tKey) }));

  if (!hasPartner && !familyId) return null;

  const handleAnswer = async () => {
    const value = inputs[step as RitualKey]?.trim();
    if (!value) return;
    await saveAnswer(step as RitualKey, value);
    if (step === "good") setStep("hard");
    else if (step === "hard") setStep("next");
    else setStep("done");
  };

  const currentQuestion = RITUAL_QUESTIONS.find(q => q.key === step);

  return (
    <div className="border-t pt-4" style={{ borderColor: "hsl(var(--stone-lighter))" }}>
      {!open ? (
        <button
          onClick={() => setOpen(true)}
          className="w-full flex items-center justify-between py-1 transition-all active:scale-[0.98]"
        >
          <div className="flex items-center gap-2">
            <span className="text-base">🤝</span>
            <div className="text-left">
              <p className="text-[0.82rem] font-medium" style={{ color: "hsl(var(--bark))" }}>{t("recap.ritual")}</p>
              <p className="text-[0.65rem] text-muted-foreground">
                {today ? t("recap.ritualSunday") : t("recap.ritualAvailable")}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1.5">
            {myDone && <span className="text-[0.65rem] px-2 py-0.5 rounded-full" style={{ background: accentBg, color: accentText }}>{t("recap.done")}</span>}
            {partnerDone && <span className="text-[0.65rem] px-2 py-0.5 rounded-full" style={{ background: "hsl(var(--cream))", color: "hsl(var(--bark))" }}>{partnerName} ✓</span>}
            <span className="text-muted-foreground text-sm">›</span>
          </div>
        </button>
      ) : (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-[0.78rem] font-medium" style={{ color: "hsl(var(--bark))" }}>🤝 {t("recap.ritual")}</p>
            <button onClick={() => setOpen(false)} className="text-[0.7rem] text-muted-foreground">{t("recap.close")}</button>
          </div>

          {!myDone && step !== "done" ? (
            <div className="space-y-3">
              <div className="flex gap-1 mb-1">
                {RITUAL_QUESTIONS.map((q, i) => (
                  <div key={q.key} className="flex-1 h-1 rounded-full"
                    style={{ background: RITUAL_QUESTIONS.indexOf(RITUAL_QUESTIONS.find(r => r.key === step)!) > i || step === "done" ? accentSolid : "hsl(var(--stone-lighter))" }} />
                ))}
              </div>
              <p className="text-[0.88rem] font-medium" style={{ color: "hsl(var(--bark))" }}>{currentQuestion?.label}</p>
              <textarea
                value={inputs[step as RitualKey] || ""}
                onChange={e => setInputs(prev => ({ ...prev, [step]: e.target.value }))}
                placeholder={t("recap.placeholder")}
                rows={2}
                className="w-full rounded-xl px-3 py-2.5 text-[0.82rem] resize-none outline-none"
                style={{ background: "hsl(var(--cream))", border: "1px solid hsl(var(--stone-light))", color: "hsl(var(--bark))", fontSize: "16px" }}
              />
              <button
                onClick={handleAnswer}
                disabled={!inputs[step as RitualKey]?.trim()}
                className="w-full py-2.5 rounded-full text-[0.82rem] font-medium transition-all active:scale-95 disabled:opacity-40"
                style={{ background: accentSolid, color: accentSolidText }}
              >
                {step === "next" ? t("recap.finish") : t("recap.next")}
              </button>
            </div>
          ) : (
            <div className="space-y-2">
              <div className="rounded-xl px-3 py-2.5" style={{ background: accentBg }}>
                <p className="text-[0.6rem] tracking-[0.1em] uppercase text-muted-foreground mb-1.5">{t("recap.yourAnswers")}</p>
                {RITUAL_QUESTIONS.map(q => {
                  const answer = myAnswers[q.key];
                  return answer ? (
                    <div key={q.key} className="mb-1.5">
                      <p className="text-[0.62rem] text-muted-foreground">{q.label}</p>
                      <p className="text-[0.78rem]" style={{ color: accentText }}>{answer}</p>
                    </div>
                  ) : null;
                })}
              </div>

              {hasPartner && (
                partnerDone ? (
                  showPartner ? (
                    <div className="rounded-xl px-3 py-2.5" style={{ background: "hsl(var(--cream))", border: "1px solid hsl(var(--stone-light))" }}>
                      <p className="text-[0.6rem] tracking-[0.1em] uppercase text-muted-foreground mb-1.5">{t("recap.partnerAnswers", { name: partnerName })}</p>
                      {RITUAL_QUESTIONS.map(q => {
                        const answer = partnerAnswers[q.key];
                        return answer ? (
                          <div key={q.key} className="mb-1.5">
                            <p className="text-[0.62rem] text-muted-foreground">{q.label}</p>
                            <p className="text-[0.78rem]" style={{ color: "hsl(var(--bark))" }}>{answer}</p>
                          </div>
                        ) : null;
                      })}
                    </div>
                  ) : (
                    <button
                      onClick={() => setShowPartner(true)}
                      className="w-full py-2.5 rounded-full text-[0.82rem] font-medium transition-all active:scale-95"
                      style={{ background: "hsl(var(--cream))", border: "1px solid hsl(var(--stone-light))", color: "hsl(var(--bark))" }}
                    >
                      {t("recap.seePartnerAnswers", { name: partnerName })}
                    </button>
                  )
                ) : (
                  <p className="text-[0.72rem] text-muted-foreground text-center py-1">
                    {t("recap.waitingPartner", { name: partnerName })}
                  </p>
                )
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ── Main component ─────────────────────────────────────────────────────────────

export function UgensRecap() {
  const { feeds, diapers, sleepMin, allTimeMilestone } = useWeekStats();
  const { profile } = useFamily();
  const { t } = useTranslation();
  const isMor = profile.role === "mor";

  if (feeds === 0 && diapers === 0 && sleepMin === 0) return null;

  const accentBg = isMor ? "hsl(var(--clay-light))" : "hsl(var(--sage-light))";
  const accentText = isMor ? "hsl(var(--bark))" : "hsl(var(--moss))";

  const parts: string[] = [];
  if (feeds > 0) parts.push(t("recap.mealsCount", { count: feeds }));
  if (diapers > 0) parts.push(t("recap.diapersCount", { count: diapers }));
  if (sleepMin > 0) parts.push(t("recap.sleepTime", { time: minutesToStr(sleepMin) }));

  return (
    <div className="card-soft section-fade-in space-y-3">
      <div className="flex items-center gap-2">
        <span className="text-base">📊</span>
        <p className="text-[0.55rem] tracking-[0.14em] uppercase text-muted-foreground">{t("recap.title")}</p>
      </div>

      <div className="grid grid-cols-3 gap-2">
        {[
          { labelKey: "recap.meals", value: feeds, icon: "🍼" },
          { labelKey: "recap.diapers", value: diapers, icon: "👶" },
          { labelKey: "recap.sleep", value: sleepMin > 0 ? minutesToStr(sleepMin) : "—", icon: "🌙" },
        ].map(stat => (
          <div key={stat.labelKey} className="rounded-xl py-3 px-2 flex flex-col items-center gap-1"
            style={{ background: accentBg }}>
            <span className="text-lg">{stat.icon}</span>
            <p className="text-[1rem] font-semibold" style={{ color: accentText }}>{stat.value}</p>
            <p className="text-[0.58rem] tracking-[0.08em] uppercase text-muted-foreground">{t(stat.labelKey)}</p>
          </div>
        ))}
      </div>

      <p className="text-[0.78rem] leading-relaxed text-muted-foreground">
        {parts.join(", ")} {t("recap.summaryEnd")}
      </p>

      {allTimeMilestone && (
        <div className="rounded-xl px-3 py-2.5" style={{ background: accentBg }}>
          <p className="text-[0.82rem] font-medium" style={{ color: accentText }}>{t(`recap.${allTimeMilestone}`)}</p>
        </div>
      )}

      <RitualSection />
    </div>
  );
}
