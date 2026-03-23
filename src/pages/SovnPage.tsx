import { useState, useMemo } from "react";
import { useFamily } from "@/context/FamilyContext";
import { useDiary } from "@/context/DiaryContext";
import { format, differenceInMinutes, startOfDay, addHours, isToday, subDays } from "date-fns";
import { da } from "date-fns/locale";
import { Moon, Sun, Clock, Wifi, Plus, Trash2, ChevronRight } from "lucide-react";

// ── Sleep recommendations by age (months) ──
const sleepRecommendations: Record<string, { totalHours: number; naps: number; napDuration: string; wakeWindow: string; bedtime: string; tip: string }> = {
  "0-1": { totalHours: 16, naps: 5, napDuration: "30min–2t", wakeWindow: "45–60 min", bedtime: "Varierer", tip: "Nyfødte sover i korte intervaller og har endnu ikke en fast døgnrytme. Det er helt normalt — følg babyens signaler." },
  "1-2": { totalHours: 15, naps: 4, napDuration: "30min–2t", wakeWindow: "60–90 min", bedtime: "19:00–20:00", tip: "Begyndende mønster dannes. Hold øje med træthedsignaler: gnilder øjne, gaber, ser væk." },
  "2-3": { totalHours: 15, naps: 4, napDuration: "45min–2t", wakeWindow: "75–105 min", bedtime: "19:00–20:00", tip: "Etablér en blid godnatrutine: dæmpet lys, rolig musik, hud-mod-hud." },
  "3-4": { totalHours: 14.5, naps: 3, napDuration: "1–2t", wakeWindow: "1.5–2 timer", bedtime: "18:30–19:30", tip: "Den fjerde lur dropper typisk nu. Baby begynder at skelne dag fra nat tydeligere." },
  "4-6": { totalHours: 14, naps: 3, napDuration: "1–2t", wakeWindow: "2–2.5 timer", bedtime: "18:30–19:00", tip: "Mange babyer er klar til at lære at falde i søvn selv. Konsekvens i rutinen hjælper." },
  "6-9": { totalHours: 14, naps: 2, napDuration: "1–2t", wakeWindow: "2.5–3.5 timer", bedtime: "18:00–19:00", tip: "To-lurs-rytme er typisk nu. Sørg for at den sidste lur ikke er for sent på eftermiddagen." },
  "9-12": { totalHours: 13.5, naps: 2, napDuration: "1–1.5t", wakeWindow: "3–4 timer", bedtime: "18:00–19:00", tip: "Separationsangst kan påvirke søvnen. Ekstra tryghed og nærvær ved sengetid hjælper." },
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

// ── Nap suggestion logic ──
function suggestNextNap(lastWake: Date | null, wakeWindowMin: number): { suggested: Date; label: string } | null {
  if (!lastWake) return null;
  const suggested = new Date(lastWake.getTime() + wakeWindowMin * 60000);
  if (suggested.getTime() < Date.now()) return null;
  return {
    suggested,
    label: format(suggested, "HH:mm"),
  };
}

function parseWakeWindow(ww: string): number {
  // "45–60 min" → avg in minutes, "1.5–2 timer" → avg in minutes
  const match = ww.match(/([\d.]+)[–-]([\d.]+)\s*(min|timer)/);
  if (!match) return 60;
  const lo = parseFloat(match[1]);
  const hi = parseFloat(match[2]);
  const avg = (lo + hi) / 2;
  return match[3] === "timer" ? avg * 60 : avg;
}

export default function SovnPage() {
  const { profile, babyAgeWeeks, babyAgeMonths } = useFamily();
  const { sleepLogs, addSleep, endSleep, removeSleepLog, activeSleep, todaySleepMinutes } = useDiary();
  const childName = profile.children?.[0]?.name || "Baby";

  const [mode, setMode] = useState<"overview" | "manual" | "auto">("overview");
  const [sleepType, setSleepType] = useState<"nap" | "night">("nap");
  const [manualStart, setManualStart] = useState("");
  const [manualEnd, setManualEnd] = useState("");

  const ageKey = getAgeKey(babyAgeMonths);
  const rec = sleepRecommendations[ageKey];
  const wakeWindowMin = parseWakeWindow(rec.wakeWindow);

  // Today's logs
  const todayLogs = useMemo(() =>
    sleepLogs
      .filter(l => isToday(new Date(l.startTime)))
      .sort((a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime()),
    [sleepLogs]
  );

  const todayNaps = todayLogs.filter(l => l.type === "nap" && l.endTime);
  const todayNight = todayLogs.filter(l => l.type === "night" && l.endTime);

  const totalHours = Math.floor(todaySleepMinutes / 60);
  const totalMins = Math.round(todaySleepMinutes % 60);
  const progressPct = Math.min((todaySleepMinutes / (rec.totalHours * 60)) * 100, 100);

  // Last wake time for nap suggestion
  const lastWakeTime = useMemo(() => {
    const lastEnded = todayLogs.find(l => l.endTime);
    return lastEnded ? new Date(lastEnded.endTime!) : null;
  }, [todayLogs]);

  const napSuggestion = suggestNextNap(lastWakeTime, wakeWindowMin);

  // Last 7 days sleep data for mini chart
  const weekData = useMemo(() => {
    return Array.from({ length: 7 }, (_, i) => {
      const day = subDays(new Date(), 6 - i);
      const dayStr = day.toDateString();
      const dayLogs = sleepLogs.filter(l => new Date(l.startTime).toDateString() === dayStr && l.endTime);
      const mins = dayLogs.reduce((sum, l) => sum + differenceInMinutes(new Date(l.endTime!), new Date(l.startTime)), 0);
      return { day: format(day, "EEE", { locale: da }), mins, hours: (mins / 60).toFixed(1) };
    });
  }, [sleepLogs]);

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
    setMode("overview");
  };

  if (profile.phase === "pregnant") {
    return (
      <div className="space-y-5">
        <div className="section-fade-in">
          <h1 className="text-[1.9rem] font-normal">Søvn</h1>
          <p className="label-upper mt-1">TILGÆNGELIG NÅR BARNET ER FØDT</p>
        </div>
        <div className="card-soft text-center py-12 section-fade-in" style={{ animationDelay: "80ms" }}>
          <span className="text-4xl mb-4 block">🌙</span>
          <p className="text-[1rem] font-normal mb-2">Søvntracking venter på jer</p>
          <p className="text-[0.8rem] text-muted-foreground max-w-xs mx-auto leading-relaxed">
            Når baby er født kan I tracke søvn, få luranbefalinger og koble babyalarmer.
          </p>
        </div>
        <div className="h-20 md:h-0" />
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="section-fade-in">
        <h1 className="text-[1.9rem] font-normal">Søvn</h1>
        <p className="label-upper mt-1">{childName.toUpperCase()} · {ageKey} MÅNEDER</p>
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
              {activeSleep.type === "nap" ? "💤 Lur i gang" : "🌙 Nattesøvn i gang"}
            </p>
            <p className="text-[0.7rem]" style={{ color: "hsl(var(--sage-dark))" }}>
              Startede kl. {format(new Date(activeSleep.startTime), "HH:mm")}
            </p>
          </div>
          <button
            onClick={() => endSleep(activeSleep.id)}
            className="px-4 py-2 rounded-full text-[0.78rem] font-medium transition-all active:scale-95"
            style={{ background: "hsl(var(--moss))", color: "white" }}
          >
            Stop
          </button>
        </div>
      )}

      {/* Today's progress */}
      <div className="card-soft section-fade-in" style={{ animationDelay: "80ms" }}>
        <div className="flex items-center justify-between mb-3">
          <p className="label-upper">SØVN I DAG</p>
          <span className="text-[1.3rem] font-semibold" style={{ color: "hsl(var(--moss))" }}>
            {totalHours > 0 ? `${totalHours}t ${totalMins}m` : `${totalMins}m`}
          </span>
        </div>

        {/* Progress bar */}
        <div className="h-2 rounded-full overflow-hidden mb-2" style={{ background: "hsl(var(--stone-lighter))" }}>
          <div
            className="h-full rounded-full transition-all duration-700"
            style={{ width: `${progressPct}%`, background: progressPct >= 90 ? "hsl(var(--sage))" : "hsl(var(--clay))" }}
          />
        </div>
        <p className="text-[0.68rem] text-muted-foreground">
          Anbefalet: ca. {rec.totalHours} timer i døgnet · {todayNaps.length}/{rec.naps} lure
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
            <p className="text-[0.88rem] font-medium">Næste lur ca. kl. {napSuggestion.label}</p>
            <p className="text-[0.68rem] text-muted-foreground">
              Vågenvindue: {rec.wakeWindow} · Anbefalet: {rec.napDuration}
            </p>
          </div>
        </div>
      )}

      {/* Quick actions */}
      <div className="grid grid-cols-2 gap-2.5 section-fade-in" style={{ animationDelay: "160ms" }}>
        {/* Start/stop */}
        <div className="card-soft !p-4 space-y-3">
          <p className="label-upper">HURTIG LOG</p>
          <div className="flex gap-2">
            {([{ key: "nap" as const, icon: Sun, label: "Lur" }, { key: "night" as const, icon: Moon, label: "Nat" }]).map(t => (
              <button
                key={t.key}
                onClick={() => setSleepType(t.key)}
                className={`flex-1 py-2 rounded-xl text-[0.72rem] border transition-all active:scale-[0.97] flex items-center justify-center gap-1 ${
                  sleepType === t.key
                    ? "bg-[hsl(var(--sage-light))] border-[hsl(var(--sage))] font-medium"
                    : "border-[hsl(var(--stone-light))] text-muted-foreground"
                }`}
              >
                <t.icon className="w-3.5 h-3.5" />
                {t.label}
              </button>
            ))}
          </div>
          <button
            onClick={handleQuickStart}
            disabled={!!activeSleep}
            className="btn-moss w-full disabled:opacity-50 text-[0.82rem]"
          >
            {activeSleep ? "Søvn i gang…" : "Start"}
          </button>
        </div>

        {/* Manual entry */}
        <div className="card-soft !p-4 space-y-3">
          <p className="label-upper">MANUEL LOG</p>
          <div className="space-y-2">
            <div>
              <label className="text-[0.56rem] tracking-[0.14em] uppercase text-muted-foreground mb-0.5 block">Start</label>
              <input
                type="time"
                value={manualStart}
                onChange={e => setManualStart(e.target.value)}
                className="w-full rounded-xl border border-[hsl(var(--stone-light))] bg-background px-2.5 py-1.5 text-[0.82rem] focus:outline-none focus:border-[hsl(var(--sage))] transition-colors"
              />
            </div>
            <div>
              <label className="text-[0.56rem] tracking-[0.14em] uppercase text-muted-foreground mb-0.5 block">Slut</label>
              <input
                type="time"
                value={manualEnd}
                onChange={e => setManualEnd(e.target.value)}
                className="w-full rounded-xl border border-[hsl(var(--stone-light))] bg-background px-2.5 py-1.5 text-[0.82rem] focus:outline-none focus:border-[hsl(var(--sage))] transition-colors"
              />
            </div>
          </div>
          <button onClick={handleManualAdd} disabled={!manualStart} className="btn-moss w-full disabled:opacity-50 text-[0.82rem]">
            Tilføj
          </button>
        </div>
      </div>

      {/* Auto tracking / baby monitor */}
      <div
        className="rounded-2xl p-4 section-fade-in"
        style={{ background: "hsl(var(--cream))", border: "1px solid hsl(var(--stone-light))", animationDelay: "200ms" }}
      >
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: "hsl(var(--sage-light))" }}>
            <Wifi className="w-5 h-5" style={{ color: "hsl(var(--moss))" }} />
          </div>
          <div className="flex-1">
            <p className="text-[0.88rem] font-medium">Automatisk søvntracking</p>
            <p className="text-[0.68rem] text-muted-foreground">Tilslut babyalarm for automatisk logning</p>
          </div>
          <ChevronRight className="w-4 h-4 text-muted-foreground" />
        </div>
        <div className="space-y-2">
          {[
            { name: "Owlet Dream Sock", status: "Understøttet", connected: false },
            { name: "Nanit Pro", status: "Understøttet", connected: false },
            { name: "Muse S", status: "Kommer snart", connected: false },
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
                  background: device.status === "Understøttet" ? "hsl(var(--sage-light))" : "hsl(var(--stone-lighter))",
                  color: device.status === "Understøttet" ? "hsl(var(--moss))" : "hsl(var(--stone))",
                }}
              >
                {device.connected ? "Tilsluttet" : device.status}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Recommendations card */}
      <div className="card-soft section-fade-in" style={{ animationDelay: "240ms" }}>
        <p className="label-upper mb-2">📋 ANBEFALINGER — {ageKey.toUpperCase()} MDR.</p>
        <div className="space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="text-[0.78rem] text-muted-foreground">Total søvn</span>
            <span className="text-[0.82rem] font-medium">{rec.totalHours} timer</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-[0.78rem] text-muted-foreground">Antal lure</span>
            <span className="text-[0.82rem] font-medium">{rec.naps} lure</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-[0.78rem] text-muted-foreground">Lurvarighed</span>
            <span className="text-[0.82rem] font-medium">{rec.napDuration}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-[0.78rem] text-muted-foreground">Vågenvindue</span>
            <span className="text-[0.82rem] font-medium">{rec.wakeWindow}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-[0.78rem] text-muted-foreground">Sengetid</span>
            <span className="text-[0.82rem] font-medium">{rec.bedtime}</span>
          </div>
        </div>
        <div className="mt-3 rounded-xl px-4 py-2.5" style={{ background: "hsl(var(--sage-light))" }}>
          <p className="text-[0.78rem] leading-relaxed">💡 {rec.tip}</p>
        </div>
      </div>

      {/* Week overview mini chart */}
      <div className="card-soft section-fade-in" style={{ animationDelay: "280ms" }}>
        <p className="label-upper mb-3">SENESTE 7 DAGE</p>
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
          Mål: {rec.totalHours}t · Grøn = ≥85% af anbefalet
        </p>
      </div>

      {/* Today's log */}
      {todayLogs.length > 0 && (
        <div className="card-soft section-fade-in" style={{ animationDelay: "320ms" }}>
          <p className="label-upper mb-3">I DAG</p>
          {todayLogs.map(l => (
            <div key={l.id} className="flex items-center gap-3 py-2.5 border-b border-foreground/5 last:border-0">
              <span className="text-lg flex-shrink-0">{l.type === "nap" ? "💤" : "🌙"}</span>
              <div className="flex-1 min-w-0">
                <p className="text-[0.84rem]">
                  {l.type === "nap" ? "Lur" : "Nattesøvn"}
                  {!l.endTime && <span className="text-[0.68rem] ml-1" style={{ color: "hsl(var(--moss))" }}>(i gang)</span>}
                </p>
                <p className="text-[0.68rem] text-muted-foreground">
                  {format(new Date(l.startTime), "HH:mm")}
                  {l.endTime && ` — ${format(new Date(l.endTime), "HH:mm")}`}
                  {l.endTime && ` · ${differenceInMinutes(new Date(l.endTime), new Date(l.startTime))} min`}
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
