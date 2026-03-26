import { useState, useMemo } from "react";
import { useFamily } from "@/context/FamilyContext";
import { useDiary } from "@/context/DiaryContext";
import { format, differenceInMinutes, isToday, subDays } from "date-fns";
import { da, enUS } from "date-fns/locale";
import { Moon, Sun, Clock, Wifi, Trash2, ChevronRight } from "lucide-react";
import { AISleepGuidance } from "@/components/AISleepGuidance";
import { useTranslation } from "react-i18next";

// ── Sleep recommendations by age (months) ──
const sleepRecommendations: Record<string, { totalHours: number; naps: number; napDuration: string; wakeWindow: string; bedtime: string; tipKey: string }> = {
  "0-1": { totalHours: 16, naps: 5, napDuration: "30min–2h", wakeWindow: "45–60 min", bedtime: "Varies", tipKey: "tip0_1" },
  "1-2": { totalHours: 15, naps: 4, napDuration: "30min–2h", wakeWindow: "60–90 min", bedtime: "19:00–20:00", tipKey: "tip1_2" },
  "2-3": { totalHours: 15, naps: 4, napDuration: "45min–2h", wakeWindow: "75–105 min", bedtime: "19:00–20:00", tipKey: "tip2_3" },
  "3-4": { totalHours: 14.5, naps: 3, napDuration: "1–2h", wakeWindow: "1.5–2h", bedtime: "18:30–19:30", tipKey: "tip3_4" },
  "4-6": { totalHours: 14, naps: 3, napDuration: "1–2h", wakeWindow: "2–2.5h", bedtime: "18:30–19:00", tipKey: "tip4_6" },
  "6-9": { totalHours: 14, naps: 2, napDuration: "1–2h", wakeWindow: "2.5–3.5h", bedtime: "18:00–19:00", tipKey: "tip6_9" },
  "9-12": { totalHours: 13.5, naps: 2, napDuration: "1–1.5h", wakeWindow: "3–4h", bedtime: "18:00–19:00", tipKey: "tip9_12" },
};

function getAgeKey(months: number): string {
  if (months < 1) return "0-1";
  if (months < 2) return "1-2";
  if (months < 3) return "2-3";
  if (months < 4) return "3-4";
  if (months < 6) return "4-6";
  if (months < 9) return "6-9";
  return "9-12";
}

function suggestNextNap(lastWake: Date | null, wakeWindowMin: number): { suggested: Date; label: string } | null {
  if (!lastWake) return null;
  const suggested = new Date(lastWake.getTime() + wakeWindowMin * 60000);
  if (suggested.getTime() < Date.now()) return null;
  return { suggested, label: format(suggested, "HH:mm") };
}

function parseWakeWindow(ww: string): number {
  const match = ww.match(/([\d.]+)[–-]([\d.]+)\s*(min|h|timer)/);
  if (!match) return 60;
  const lo = parseFloat(match[1]);
  const hi = parseFloat(match[2]);
  const avg = (lo + hi) / 2;
  return (match[3] === "h" || match[3] === "timer") ? avg * 60 : avg;
}

export default function SovnPage() {
  const { profile, babyAgeWeeks, babyAgeMonths } = useFamily();
  const { sleepLogs, addSleep, endSleep, removeSleepLog, activeSleep, todaySleepMinutes } = useDiary();
  const { t, i18n } = useTranslation();
  const dateFnsLocale = i18n.language === "en" ? enUS : da;
  const childName = profile.children?.[0]?.name || "Baby";

  const [sleepType, setSleepType] = useState<"nap" | "night">("nap");
  const [manualStart, setManualStart] = useState("");
  const [manualEnd, setManualEnd] = useState("");

  const ageKey = getAgeKey(babyAgeMonths);
  const rec = sleepRecommendations[ageKey];
  const wakeWindowMin = parseWakeWindow(rec.wakeWindow);

  const todayLogs = useMemo(() =>
    sleepLogs
      .filter(l => isToday(new Date(l.startTime)))
      .sort((a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime()),
    [sleepLogs]
  );

  const todayNaps = todayLogs.filter(l => l.type === "nap" && l.endTime);
  const totalHours = Math.floor(todaySleepMinutes / 60);
  const totalMins = Math.round(todaySleepMinutes % 60);
  const progressPct = Math.min((todaySleepMinutes / (rec.totalHours * 60)) * 100, 100);

  const lastWakeTime = useMemo(() => {
    const lastEnded = todayLogs.find(l => l.endTime);
    return lastEnded ? new Date(lastEnded.endTime!) : null;
  }, [todayLogs]);

  const napSuggestion = suggestNextNap(lastWakeTime, wakeWindowMin);

  const weekData = useMemo(() => {
    return Array.from({ length: 7 }, (_, i) => {
      const day = subDays(new Date(), 6 - i);
      const dayStr = day.toDateString();
      const dayLogs = sleepLogs.filter(l => new Date(l.startTime).toDateString() === dayStr && l.endTime);
      const mins = dayLogs.reduce((sum, l) => sum + differenceInMinutes(new Date(l.endTime!), new Date(l.startTime)), 0);
      return { day: format(day, "EEE", { locale: dateFnsLocale }), mins, hours: (mins / 60).toFixed(1) };
    });
  }, [sleepLogs, dateFnsLocale]);

  const handleQuickStart = () => {
    addSleep(sleepType, new Date().toISOString());
  };

  const handleManualAdd = () => {
    if (!manualStart) return;
    const today = new Date().toISOString().slice(0, 10);
    const start = new Date(`${today}T${manualStart}`).toISOString();
    const end = manualEnd ? new Date(`${today}T${manualEnd}`).toISOString() : undefined;
    addSleep(sleepType, start, end);
    setManualStart("");
    setManualEnd("");
  };

  if (profile.phase === "pregnant") {
    return (
      <div className="space-y-5">
        <div className="section-fade-in">
          <h1 className="text-[1.9rem] font-normal">{t("sleep.title")}</h1>
          <p className="label-upper mt-1">{t("sleep.availableAfterBirth")}</p>
        </div>
        <div className="card-soft text-center py-12 section-fade-in" style={{ animationDelay: "80ms" }}>
          <span className="text-4xl mb-4 block">🌙</span>
          <p className="text-[1rem] font-normal mb-2">{t("sleep.sleepWaiting")}</p>
          <p className="text-[0.8rem] text-muted-foreground max-w-xs mx-auto leading-relaxed">
            {t("sleep.sleepWaitingDesc")}
          </p>
        </div>
        <div className="h-20 md:h-0" />
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div className="section-fade-in">
        <h1 className="text-[1.9rem] font-normal">{t("sleep.title")}</h1>
        <p className="label-upper mt-1">{childName.toUpperCase()} · {ageKey} {t("sleep.months")}</p>
      </div>

      {/* Active sleep banner */}
      {activeSleep && (
        <div
          className="rounded-2xl px-5 py-4 flex items-center gap-4 section-fade-in"
          style={{
            background: "linear-gradient(135deg, hsl(var(--sage-light)), hsl(var(--sage) / 0.35))",
            border: "1px solid hsl(var(--sage) / 0.25)",
          }}
        >
          <span className="relative flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-50" style={{ background: "hsl(var(--sage))" }} />
            <span className="relative inline-flex rounded-full h-3 w-3" style={{ background: "hsl(var(--moss))" }} />
          </span>
          <div className="flex-1">
            <p className="text-[0.95rem] font-semibold" style={{ color: "hsl(var(--moss))" }}>
              {activeSleep.type === "nap" ? t("sleep.napInProgress") : t("sleep.nightInProgress")}
            </p>
            <p className="text-[0.7rem]" style={{ color: "hsl(var(--sage-dark))" }}>
              {t("sleep.startedAt", { time: format(new Date(activeSleep.startTime), "HH:mm") })}
            </p>
          </div>
          <button
            onClick={() => endSleep(activeSleep.id)}
            className="px-4 py-2 rounded-full text-[0.78rem] font-medium transition-all active:scale-95"
            style={{ background: "hsl(var(--moss))", color: "white" }}
          >
            {t("sleep.stop")}
          </button>
        </div>
      )}

      {/* Today's progress */}
      <div className="card-soft section-fade-in" style={{ animationDelay: "80ms" }}>
        <div className="flex items-center justify-between mb-3">
          <p className="label-upper">{t("sleep.sleepToday")}</p>
          <span className="text-[1.3rem] font-semibold" style={{ color: "hsl(var(--moss))" }}>
            {totalHours > 0 ? `${totalHours}t ${totalMins}m` : `${totalMins}m`}
          </span>
        </div>
        <div className="h-2 rounded-full overflow-hidden mb-2" style={{ background: "hsl(var(--stone-lighter))" }}>
          <div
            className="h-full rounded-full transition-all duration-700"
            style={{ width: `${progressPct}%`, background: progressPct >= 90 ? "hsl(var(--sage))" : "hsl(var(--clay))" }}
          />
        </div>
        <p className="text-[0.68rem] text-muted-foreground">
          {t("sleep.recommended", { hours: rec.totalHours, naps: todayNaps.length, maxNaps: rec.naps })}
        </p>
      </div>

      {/* Nap suggestion */}
      {napSuggestion && !activeSleep && (
        <div
          className="rounded-2xl p-4 flex items-center gap-3 section-fade-in"
          style={{ background: "hsl(var(--cream))", border: "1px solid hsl(var(--clay) / 0.2)", animationDelay: "120ms" }}
        >
          <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: "hsl(var(--clay-light))" }}>
            <Sun className="w-5 h-5" style={{ color: "hsl(var(--clay))" }} />
          </div>
          <div className="flex-1">
            <p className="text-[0.88rem] font-medium">{t("sleep.nextNap", { time: napSuggestion.label })}</p>
            <p className="text-[0.68rem] text-muted-foreground">
              {t("sleep.wakeWindow", { window: rec.wakeWindow, duration: rec.napDuration })}
            </p>
          </div>
        </div>
      )}

      {!activeSleep && <AISleepGuidance />}

      {/* Quick actions */}
      <div className="grid grid-cols-2 gap-2.5 section-fade-in" style={{ animationDelay: "160ms" }}>
        <div className="card-soft !p-4 space-y-3">
          <p className="label-upper">{t("sleep.quickLog")}</p>
          <div className="flex gap-2">
            {([{ key: "nap" as const, icon: Sun, label: t("sleep.nap") }, { key: "night" as const, icon: Moon, label: t("sleep.night") }]).map(st => (
              <button
                key={st.key}
                onClick={() => setSleepType(st.key)}
                className={`flex-1 py-2 rounded-xl text-[0.72rem] border transition-all active:scale-[0.97] flex items-center justify-center gap-1 ${
                  sleepType === st.key
                    ? "bg-[hsl(var(--sage-light))] border-[hsl(var(--sage))] font-medium"
                    : "border-[hsl(var(--stone-light))] text-muted-foreground"
                }`}
              >
                <st.icon className="w-3.5 h-3.5" />
                {st.label}
              </button>
            ))}
          </div>
          <button
            onClick={handleQuickStart}
            disabled={!!activeSleep}
            className="btn-moss w-full disabled:opacity-50 text-[0.82rem]"
          >
            {activeSleep ? t("sleep.sleepInProgress") : t("sleep.start")}
          </button>
        </div>

        <div className="card-soft !p-4 space-y-3">
          <p className="label-upper">{t("sleep.manualLog")}</p>
          <div className="space-y-2">
            <div>
              <label className="text-[0.56rem] tracking-[0.14em] uppercase text-muted-foreground mb-0.5 block">{t("sleep.startTime")}</label>
              <input
                type="time"
                value={manualStart}
                onChange={e => setManualStart(e.target.value)}
                className="w-full rounded-xl border border-[hsl(var(--stone-light))] bg-background px-2.5 py-1.5 text-[0.82rem] focus:outline-none focus:border-[hsl(var(--sage))] transition-colors"
              />
            </div>
            <div>
              <label className="text-[0.56rem] tracking-[0.14em] uppercase text-muted-foreground mb-0.5 block">{t("sleep.endTime")}</label>
              <input
                type="time"
                value={manualEnd}
                onChange={e => setManualEnd(e.target.value)}
                className="w-full rounded-xl border border-[hsl(var(--stone-light))] bg-background px-2.5 py-1.5 text-[0.82rem] focus:outline-none focus:border-[hsl(var(--sage))] transition-colors"
              />
            </div>
          </div>
          <button onClick={handleManualAdd} disabled={!manualStart} className="btn-moss w-full disabled:opacity-50 text-[0.82rem]">
            {t("sleep.addBtn")}
          </button>
        </div>
      </div>

      {/* Auto tracking */}
      <div
        className="rounded-2xl p-4 section-fade-in"
        style={{ background: "hsl(var(--cream))", border: "1px solid hsl(var(--stone-light))", animationDelay: "200ms" }}
      >
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: "hsl(var(--sage-light))" }}>
            <Wifi className="w-5 h-5" style={{ color: "hsl(var(--moss))" }} />
          </div>
          <div className="flex-1">
            <p className="text-[0.88rem] font-medium">{t("sleep.autoTracking")}</p>
            <p className="text-[0.68rem] text-muted-foreground">{t("sleep.connectMonitor")}</p>
          </div>
          <ChevronRight className="w-4 h-4 text-muted-foreground" />
        </div>
        <div className="space-y-2">
          {[
            { name: "Owlet Dream Sock", statusKey: "supported", connected: false },
            { name: "Nanit Pro", statusKey: "supported", connected: false },
            { name: "Muse S", statusKey: "comingSoon", connected: false },
          ].map(device => (
            <div
              key={device.name}
              className="flex items-center justify-between px-3 py-2.5 rounded-xl border"
              style={{ borderColor: "hsl(var(--stone-light))" }}
            >
              <div className="flex items-center gap-2">
                <Wifi className="w-3.5 h-3.5 text-muted-foreground" />
                <span className="text-[0.78rem]">{device.name}</span>
              </div>
              <span
                className="text-[0.62rem] px-2 py-0.5 rounded-full"
                style={{
                  background: device.statusKey === "supported" ? "hsl(var(--sage-light))" : "hsl(var(--stone-lighter))",
                  color: device.statusKey === "supported" ? "hsl(var(--moss))" : "hsl(var(--stone))",
                }}
              >
                {device.connected ? t("sleep.connected") : t(`sleep.${device.statusKey}`)}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Recommendations */}
      <div className="card-soft section-fade-in" style={{ animationDelay: "240ms" }}>
        <p className="label-upper mb-2">{t("sleep.recommendations", { ageKey: ageKey.toUpperCase() })}</p>
        <div className="space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="text-[0.78rem] text-muted-foreground">{t("sleep.totalSleep")}</span>
            <span className="text-[0.82rem] font-medium">{rec.totalHours} {t("sleep.hours")}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-[0.78rem] text-muted-foreground">{t("sleep.napCount")}</span>
            <span className="text-[0.82rem] font-medium">{rec.naps} {t("sleep.naps")}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-[0.78rem] text-muted-foreground">{t("sleep.napDuration")}</span>
            <span className="text-[0.82rem] font-medium">{rec.napDuration}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-[0.78rem] text-muted-foreground">{t("sleep.wakeWindowLabel")}</span>
            <span className="text-[0.82rem] font-medium">{rec.wakeWindow}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-[0.78rem] text-muted-foreground">{t("sleep.bedtime")}</span>
            <span className="text-[0.82rem] font-medium">{rec.bedtime}</span>
          </div>
        </div>
        <div className="mt-3 rounded-xl px-4 py-2.5" style={{ background: "hsl(var(--sage-light))" }}>
          <p className="text-[0.78rem] leading-relaxed">💡 {t(`sleep.${rec.tipKey}`)}</p>
        </div>
      </div>

      {/* Week chart */}
      <div className="card-soft section-fade-in" style={{ animationDelay: "280ms" }}>
        <p className="label-upper mb-3">{t("sleep.last7days")}</p>
        <div className="flex items-end gap-1.5 h-20">
          {weekData.map((d, i) => {
            const maxMins = rec.totalHours * 60;
            const h = Math.max((d.mins / maxMins) * 100, 4);
            const isGood = d.mins >= maxMins * 0.85;
            return (
              <div key={i} className="flex-1 flex flex-col items-center gap-1">
                <div
                  className="w-full rounded-t-lg transition-all"
                  style={{
                    height: `${h}%`,
                    background: isGood ? "hsl(var(--sage))" : "hsl(var(--clay) / 0.5)",
                    minHeight: "3px",
                  }}
                />
                <span className="text-[0.5rem] text-muted-foreground">{d.day}</span>
              </div>
            );
          })}
        </div>
        <p className="text-[0.6rem] text-muted-foreground mt-2 text-center">
          {t("sleep.goal", { hours: rec.totalHours })}
        </p>
      </div>

      {/* Today's log */}
      {todayLogs.length > 0 && (
        <div className="card-soft section-fade-in" style={{ animationDelay: "320ms" }}>
          <p className="label-upper mb-3">{t("sleep.todayLog")}</p>
          {todayLogs.map(l => (
            <div key={l.id} className="flex items-center gap-3 py-2.5 border-b border-foreground/5 last:border-0">
              <span className="text-lg flex-shrink-0">{l.type === "nap" ? "💤" : "🌙"}</span>
              <div className="flex-1 min-w-0">
                <p className="text-[0.84rem]">
                  {l.type === "nap" ? t("sleep.napLog") : t("sleep.nightLog")}
                  {!l.endTime && <span className="text-[0.68rem] ml-1" style={{ color: "hsl(var(--moss))" }}>({t("diary.inProgress")})</span>}
                </p>
                <p className="text-[0.68rem] text-muted-foreground">
                  {format(new Date(l.startTime), "HH:mm")}
                  {l.endTime && ` — ${format(new Date(l.endTime), "HH:mm")}`}
                  {l.endTime && ` · ${differenceInMinutes(new Date(l.endTime), new Date(l.startTime))} ${t("sleep.min")}`}
                </p>
              </div>
              <button onClick={() => removeSleepLog(l.id)} className="p-1.5 rounded-lg hover:bg-destructive/10 transition-colors">
                <Trash2 className="w-3.5 h-3.5 text-muted-foreground" />
              </button>
            </div>
          ))}
        </div>
      )}

      <div className="h-20 md:h-0" />
    </div>
  );
}
