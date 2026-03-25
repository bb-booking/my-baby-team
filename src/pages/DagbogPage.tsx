import { useState, useCallback } from "react";
import { useFamily } from "@/context/FamilyContext";
import { useDiary, type StoolColor, type StoolConsistency } from "@/context/DiaryContext";
import { Trash2, Clock, TrendingUp } from "lucide-react";
import { format } from "date-fns";
import { da } from "date-fns/locale";
import confetti from "canvas-confetti";

// ── Recommended counts by baby age ──
function getRecommended(ageDays: number) {
  if (ageDays < 2) return { nursing: 5, wetDiapers: 1, dirtyDiapers: 1 };
  if (ageDays < 3) return { nursing: 8, wetDiapers: 2, dirtyDiapers: 2 };
  if (ageDays < 4) return { nursing: 8, wetDiapers: 3, dirtyDiapers: 3 };
  if (ageDays < 7) return { nursing: 8, wetDiapers: 5, dirtyDiapers: 4 };
  return { nursing: 8, wetDiapers: 6, dirtyDiapers: 4 };
}

function getExpectedStool(ageDays: number): { colors: StoolColor[]; consistencies: StoolConsistency[]; hint: string } {
  if (ageDays < 2) return { colors: ["sort", "mørkegrøn"], consistencies: ["slimet"], hint: "Mekonium — sort/mørkegrøn, klæbrig. Helt normalt." };
  if (ageDays < 4) return { colors: ["mørkegrøn", "grøn"], consistencies: ["blød", "slimet"], hint: "Overgangsafføring — grønlig, blødere." };
  if (ageDays < 7) return { colors: ["grøn", "gulgrøn"], consistencies: ["blød", "grynet"], hint: "Farven skifter mod gul." };
  return { colors: ["gulgrøn", "gul"], consistencies: ["blød", "grynet", "flydende"], hint: "Sennepsgul, grynet — helt normalt." };
}

function fireConfetti() {
  confetti({ particleCount: 45, spread: 60, startVelocity: 20, gravity: 0.8, ticks: 120, origin: { y: 0.7 }, colors: ["#8fae7e", "#c4a77d", "#e8dfd0", "#a3c293", "#d4b896"], scalar: 0.8 });
}

const STOOL_COLORS: { value: StoolColor; label: string; swatch: string }[] = [
  { value: "sort", label: "Sort", swatch: "#1a1a1a" },
  { value: "mørkegrøn", label: "Mrkgrøn", swatch: "#2d5a27" },
  { value: "grøn", label: "Grøn", swatch: "#4a8c3f" },
  { value: "gulgrøn", label: "Gulgrøn", swatch: "#a8b84c" },
  { value: "gul", label: "Gul", swatch: "#d4a843" },
];

const STOOL_CONSISTENCIES: { value: StoolConsistency; label: string; icon: string }[] = [
  { value: "hård", label: "Hård", icon: "●" },
  { value: "blød", label: "Blød", icon: "◉" },
  { value: "flydende", label: "Flydende", icon: "≋" },
  { value: "grynet", label: "Grynet", icon: "⁘" },
  { value: "slimet", label: "Slimet", icon: "◎" },
];

type ViewTab = "idag" | "historik";

export default function DagbogPage() {
  const { profile, babyAgeWeeks } = useFamily();
  const [viewTab, setViewTab] = useState<ViewTab>("idag");

  if (profile.phase === "pregnant") {
    return (
      <div className="space-y-5">
        <div className="section-fade-in">
          <h1 className="text-[1.9rem] font-normal">Dagbog</h1>
          <p className="label-upper mt-1">TILGÆNGELIG NÅR BARNET ER FØDT</p>
        </div>
        <div className="card-soft text-center py-12 section-fade-in" style={{ animationDelay: "80ms" }}>
          <span className="text-4xl mb-4 block">📖</span>
          <p className="text-[1rem] font-normal mb-2">Dagbogen venter på jer</p>
          <p className="text-[0.8rem] text-muted-foreground max-w-xs mx-auto leading-relaxed">
            Når baby er født kan I logge amning, bleer, søvn og noter.
          </p>
        </div>
        <div className="h-20 md:h-0" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="section-fade-in">
        <h1 className="text-[1.9rem] font-normal">Dagbog</h1>
        <p className="label-upper mt-1">LOG OG OVERBLIK</p>
      </div>

      {/* Quick log buttons — same as dashboard */}
      <QuickLogButtons />

      {/* Tab switch: Today / History */}
      <div className="flex gap-0 border-b section-fade-in" style={{ borderColor: "hsl(var(--stone-lighter))", animationDelay: "120ms" }}>
        {([
          { key: "idag" as ViewTab, label: "I dag" },
          { key: "historik" as ViewTab, label: "Historik" },
        ]).map(t => (
          <button
            key={t.key}
            onClick={() => setViewTab(t.key)}
            className={`px-5 py-2.5 text-[0.72rem] tracking-[0.13em] uppercase border-b-2 -mb-px transition-all ${
              viewTab === t.key ? "font-medium" : "text-muted-foreground"
            }`}
            style={{
              borderBottomColor: viewTab === t.key ? "hsl(var(--moss))" : "transparent",
              color: viewTab === t.key ? "hsl(var(--moss))" : undefined,
            }}
          >
            {t.label}
          </button>
        ))}
      </div>

      {viewTab === "idag" ? <TodayView /> : <HistoryView />}

      <div className="h-20 md:h-0" />
    </div>
  );
}

// ═══════════════════════════════════════════
// QUICK LOG BUTTONS (reusable, same icons as dashboard)
// ═══════════════════════════════════════════
function QuickLogButtons() {
  const { nursingLogs, addNursing, diaperLogs, addDiaper, todayNursingCount, todayDiaperCount, activeSleep, addSleep, endSleep } = useDiary();
  const { babyAgeWeeks, profile } = useFamily();
  const feedingMethod = profile.morHealth?.feedingMethod;
  const feedingLabel = feedingMethod === "flaske" ? "Flaske" : feedingMethod === "begge" ? "Amning/Flaske" : "Amning";
  const ageDays = babyAgeWeeks * 7;
  const rec = getRecommended(ageDays);
  const nursingDone = todayNursingCount >= rec.nursing;

  const [showNursingPicker, setShowNursingPicker] = useState(false);
  const [showDiaperPicker, setShowDiaperPicker] = useState(false);
  const [diaperStep, setDiaperStep] = useState<"type" | "details">("type");
  const [selectedColor, setSelectedColor] = useState<StoolColor | null>(null);
  const [selectedConsistency, setSelectedConsistency] = useState<StoolConsistency | null>(null);
  const [lastAction, setLastAction] = useState<string | null>(null);

  const today = new Date().toDateString();
  const todayWet = diaperLogs.filter(l => new Date(l.timestamp).toDateString() === today && (l.type === "wet" || l.type === "both")).length;
  const todayDirty = diaperLogs.filter(l => new Date(l.timestamp).toDateString() === today && (l.type === "dirty" || l.type === "both")).length;

  const expected = getExpectedStool(ageDays);
  const lastNursing = nursingLogs.find(l => new Date(l.timestamp).toDateString() === today);
  const suggestedSide: "left" | "right" = lastNursing ? (lastNursing.side === "left" ? "right" : "left") : "left";
  const lastSideHint = lastNursing
    ? `Sidst: ${lastNursing.side === "left" ? "venstre" : "højre"} → prøv ${suggestedSide === "left" ? "venstre" : "højre"}`
    : null;

  const flash = (msg: string) => { setLastAction(msg); setTimeout(() => setLastAction(null), 3000); };

  const handleNursing = useCallback((side: "left" | "right") => {
    addNursing(side);
    fireConfetti();
    flash("Måltid registreret ✨");
    setShowNursingPicker(false);
  }, [addNursing]);

  const handleWet = useCallback(() => {
    addDiaper("wet");
    fireConfetti();
    flash("Tisseble registreret ✨");
    setShowDiaperPicker(false);
    setDiaperStep("type");
  }, [addDiaper]);

  const handleDirtyConfirm = useCallback(() => {
    addDiaper("dirty", selectedColor || undefined, selectedConsistency || undefined);
    fireConfetti();
    flash("Afføringsble registreret ✨");
    setShowDiaperPicker(false);
    setDiaperStep("type");
    setSelectedColor(null);
    setSelectedConsistency(null);
  }, [addDiaper, selectedColor, selectedConsistency]);

  const handleSleep = useCallback(() => {
    if (activeSleep) { endSleep(activeSleep.id); flash("Søvn afsluttet ✨"); }
    else { addSleep("nap", new Date().toISOString()); flash("Lur startet 💤"); }
  }, [activeSleep, addSleep, endSleep]);

  return (
    <div className="space-y-3 section-fade-in" style={{ animationDelay: "80ms" }}>
      {lastAction && (
        <div className="rounded-2xl px-4 py-2.5 text-[0.82rem] font-medium animate-fade-in"
          style={{ background: "hsl(var(--sage-light))", color: "hsl(var(--moss))" }}>
          {lastAction}
        </div>
      )}

      {/* 3 quick-action buttons */}
      <div className="grid grid-cols-3 gap-2.5">
        {/* Nursing */}
        <button onClick={() => {
          if (feedingMethod === "flaske") { handleNursing("left"); return; }
          setShowNursingPicker(!showNursingPicker); setShowDiaperPicker(false);
        }}
          className="flex flex-col items-center gap-2 py-4 px-2 rounded-2xl border transition-all active:scale-95 hover:-translate-y-0.5 hover:shadow-md relative"
          style={{ borderColor: showNursingPicker ? "hsl(var(--sage))" : "hsl(var(--stone-light))", background: showNursingPicker ? "hsl(var(--sage-light))" : "hsl(var(--warm-white))" }}>
          {feedingMethod === "flaske" ? (
            <span className="text-2xl">🍼</span>
          ) : (
            <svg width="32" height="32" viewBox="0 0 32 32" fill="none"><circle cx="16" cy="14" r="9" stroke="hsl(var(--clay))" strokeWidth="1.3" fill="hsl(var(--clay-light))"/><circle cx="16" cy="14" r="2.5" fill="hsl(var(--clay))"/></svg>
          )}
          <span className="text-[0.62rem] tracking-[0.06em] uppercase text-muted-foreground">{feedingLabel}</span>
          <span className="absolute -top-1 -right-1 text-[0.6rem] font-bold w-5 h-5 rounded-full flex items-center justify-center"
            style={{ background: nursingDone ? "hsl(var(--sage))" : "hsl(var(--clay-light))", color: nursingDone ? "white" : "hsl(var(--bark))" }}>
            {todayNursingCount}
          </span>
        </button>

        {/* Diaper */}
        <button onClick={() => { setShowDiaperPicker(!showDiaperPicker); setShowNursingPicker(false); setDiaperStep("type"); }}
          className="flex flex-col items-center gap-2 py-4 px-2 rounded-2xl border transition-all active:scale-95 hover:-translate-y-0.5 hover:shadow-md relative"
          style={{ borderColor: showDiaperPicker ? "hsl(var(--clay))" : "hsl(var(--stone-light))", background: showDiaperPicker ? "hsl(var(--cream))" : "hsl(var(--warm-white))" }}>
          <svg width="32" height="32" viewBox="0 0 32 32" fill="none"><path d="M9 11h14v3c0 5-3 9-7 9s-7-4-7-9V11z" fill="hsl(var(--cream))" stroke="hsl(var(--stone))" strokeWidth="1.2"/><path d="M11 11c2-2 3.5-3 5-3s3 1 5 3" stroke="hsl(var(--stone))" strokeWidth="1.2" strokeLinecap="round"/><circle cx="14" cy="17" r="1.2" fill="hsl(var(--sage))"/><circle cx="18" cy="16.5" r="1.2" fill="hsl(var(--sage))"/></svg>
          <span className="text-[0.62rem] tracking-[0.06em] uppercase text-muted-foreground">Ble</span>
          <span className="absolute -top-1 -right-1 text-[0.6rem] font-bold w-5 h-5 rounded-full flex items-center justify-center"
            style={{ background: "hsl(var(--clay-light))", color: "hsl(var(--bark))" }}>
            {todayDiaperCount}
          </span>
        </button>

        {/* Sleep */}
        <button onClick={handleSleep}
          className="flex flex-col items-center gap-2 py-4 px-2 rounded-2xl border transition-all active:scale-95 hover:-translate-y-0.5 hover:shadow-md relative"
          style={{ borderColor: activeSleep ? "hsl(var(--sage))" : "hsl(var(--stone-light))", background: activeSleep ? "hsl(var(--sage-light))" : "hsl(var(--warm-white))" }}>
          <svg width="32" height="32" viewBox="0 0 32 32" fill="none"><path d="M22 8c-5.5 0-10 4.5-10 10s4.5 10 10 10" stroke="hsl(var(--sage))" strokeWidth="1.2" strokeLinecap="round"/><path d="M18 6c-6 1-10 6-10 12s5 10 10 10" fill="hsl(var(--sage-light))" stroke="hsl(var(--sage))" strokeWidth="1.2"/><circle cx="14" cy="14" r="1" fill="hsl(var(--sage))"/><circle cx="11" cy="18" r="0.8" fill="hsl(var(--sage))"/><circle cx="16" cy="20" r="0.6" fill="hsl(var(--sage))"/></svg>
          <span className="text-[0.62rem] tracking-[0.06em] uppercase text-muted-foreground">{activeSleep ? "Stop søvn" : "Søvn"}</span>
          {activeSleep && (
            <span className="absolute -top-1 -right-1"><span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-50" style={{ background: "hsl(var(--sage))" }} />
              <span className="relative inline-flex rounded-full h-3 w-3" style={{ background: "hsl(var(--moss))" }} />
            </span></span>
          )}
        </button>
      </div>

      {/* Nursing side picker */}
      {showNursingPicker && feedingMethod !== "flaske" && (
        <div className="card-soft animate-fade-in space-y-3">
          {feedingMethod === "begge" && (
            <button onClick={() => handleNursing("left")}
              className="w-full py-3 rounded-2xl text-[0.82rem] font-medium border transition-all active:scale-[0.97]"
              style={{ background: "hsl(var(--cream))", borderColor: "hsl(var(--clay))", color: "hsl(var(--bark))" }}>
              🍼 Flaske
            </button>
          )}
          {lastSideHint && <p className="text-[0.72rem] text-muted-foreground">💡 {lastSideHint}</p>}
          <div className="flex gap-2">
            <button onClick={() => handleNursing("left")}
              className="flex-1 py-3 rounded-2xl text-[0.82rem] font-medium border transition-all active:scale-[0.97]"
              style={{
                background: suggestedSide === "left" ? "hsl(var(--sage))" : "hsl(var(--sage-light))",
                borderColor: "hsl(var(--sage))",
                color: suggestedSide === "left" ? "white" : "hsl(var(--sage-dark))",
              }}>
              ← Venstre {suggestedSide === "left" && "✦"}
            </button>
            <button onClick={() => handleNursing("right")}
              className="flex-1 py-3 rounded-2xl text-[0.82rem] font-medium border transition-all active:scale-[0.97]"
              style={{
                background: suggestedSide === "right" ? "hsl(var(--sage))" : "hsl(var(--sage-light))",
                borderColor: "hsl(var(--sage))",
                color: suggestedSide === "right" ? "white" : "hsl(var(--sage-dark))",
              }}>
              Højre → {suggestedSide === "right" && "✦"}
            </button>
          </div>
        </div>
      )}

      {/* Diaper picker */}
      {showDiaperPicker && diaperStep === "type" && (
        <div className="card-soft animate-fade-in space-y-3">
          <p className="text-[0.72rem] text-muted-foreground">Hvad indeholder bleen?</p>
          <div className="flex gap-2">
            <button onClick={handleWet}
              className="flex-1 py-3 rounded-2xl text-[0.82rem] font-medium border transition-all active:scale-[0.97]"
              style={{ background: "hsl(var(--cream))", borderColor: "hsl(var(--stone))", color: "hsl(var(--bark))" }}>
              💧 Kun tis
            </button>
            <button onClick={() => setDiaperStep("details")}
              className="flex-1 py-3 rounded-2xl text-[0.82rem] font-medium border transition-all active:scale-[0.97]"
              style={{ background: "hsl(var(--clay-light))", borderColor: "hsl(var(--clay))", color: "hsl(var(--bark))" }}>
              💩 Afføring
            </button>
          </div>
        </div>
      )}

      {showDiaperPicker && diaperStep === "details" && (
        <div className="card-soft animate-fade-in space-y-4">
          <div className="rounded-xl px-3 py-2 text-[0.7rem] leading-snug"
            style={{ background: "hsl(var(--cream))", border: "1px solid hsl(var(--clay) / 0.15)" }}>
            <span className="font-medium">📋 Forventet: </span>
            <span className="text-muted-foreground">{expected.hint}</span>
          </div>

          <div>
            <p className="text-[0.68rem] font-medium mb-2 text-muted-foreground uppercase tracking-wider">Farve</p>
            <div className="flex gap-2">
              {STOOL_COLORS.map(c => (
                <button key={c.value} onClick={() => setSelectedColor(c.value)}
                  className="flex flex-col items-center gap-1 flex-1 py-2 rounded-xl border transition-all active:scale-95"
                  style={{
                    borderColor: selectedColor === c.value ? "hsl(var(--bark))" : "hsl(var(--stone-light))",
                    background: selectedColor === c.value ? "hsl(var(--cream))" : "transparent",
                    boxShadow: selectedColor === c.value ? "0 0 0 2px hsl(var(--bark) / 0.2)" : "none",
                  }}>
                  <span className="w-5 h-5 rounded-full border border-black/10" style={{ background: c.swatch }} />
                  <span className="text-[0.55rem]">{c.label}</span>
                  {expected.colors.includes(c.value) && <span className="text-[0.5rem]" style={{ color: "hsl(var(--moss))" }}>✓</span>}
                </button>
              ))}
            </div>
          </div>

          <div>
            <p className="text-[0.68rem] font-medium mb-2 text-muted-foreground uppercase tracking-wider">Konsistens</p>
            <div className="flex gap-2 flex-wrap">
              {STOOL_CONSISTENCIES.map(c => (
                <button key={c.value} onClick={() => setSelectedConsistency(c.value)}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl border text-[0.72rem] transition-all active:scale-95"
                  style={{
                    borderColor: selectedConsistency === c.value ? "hsl(var(--bark))" : "hsl(var(--stone-light))",
                    background: selectedConsistency === c.value ? "hsl(var(--cream))" : "transparent",
                    boxShadow: selectedConsistency === c.value ? "0 0 0 2px hsl(var(--bark) / 0.2)" : "none",
                  }}>
                  <span>{c.icon}</span> {c.label}
                  {expected.consistencies.includes(c.value) && <span className="text-[0.5rem] ml-0.5" style={{ color: "hsl(var(--moss))" }}>✓</span>}
                </button>
              ))}
            </div>
          </div>

          <div className="flex gap-2">
            <button onClick={() => { setDiaperStep("type"); setSelectedColor(null); setSelectedConsistency(null); }}
              className="px-4 py-2.5 rounded-xl text-[0.78rem] border transition-all active:scale-95"
              style={{ borderColor: "hsl(var(--stone))", color: "hsl(var(--bark))" }}>
              ← Tilbage
            </button>
            <button onClick={handleDirtyConfirm}
              className="flex-1 py-2.5 rounded-xl text-[0.78rem] font-medium transition-all active:scale-95"
              style={{ background: "hsl(var(--sage))", color: "white" }}>
              Registrér ✓
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════
// TODAY VIEW — stats + recommendations + log
// ═══════════════════════════════════════════
function TodayView() {
  const { nursingLogs, diaperLogs, sleepLogs, todayNursingCount, todayDiaperCount, todaySleepMinutes, activeSleep, removeNursingLog, removeDiaperLog, removeSleepLog } = useDiary();
  const { babyAgeWeeks, profile } = useFamily();
  const isMor = profile.role === "mor";
  const childName = profile.children?.[0]?.name || "Baby";
  const ageDays = babyAgeWeeks * 7;
  const rec = getRecommended(ageDays);

  const today = new Date().toDateString();
  const todayWet = diaperLogs.filter(l => new Date(l.timestamp).toDateString() === today && (l.type === "wet" || l.type === "both")).length;
  const todayDirty = diaperLogs.filter(l => new Date(l.timestamp).toDateString() === today && (l.type === "dirty" || l.type === "both")).length;

  const nursingPct = Math.min((todayNursingCount / rec.nursing) * 100, 100);
  const nursingDone = todayNursingCount >= rec.nursing;
  const totalDiaperRec = rec.wetDiapers + rec.dirtyDiapers;
  const diaperPct = Math.min((todayDiaperCount / totalDiaperRec) * 100, 100);
  const diaperDone = todayDiaperCount >= totalDiaperRec;

  const sleepH = Math.floor(todaySleepMinutes / 60);
  const sleepM = Math.round(todaySleepMinutes % 60);
  const sleepStr = sleepH > 0 ? `${sleepH}t ${sleepM}m` : `${sleepM}m`;
  const todayNaps = sleepLogs.filter(l => new Date(l.startTime).toDateString() === today && l.endTime && l.type === "nap").length;

  const feedingMethod = profile.morHealth?.feedingMethod;
  const feedingLabel = feedingMethod === "flaske" ? "FLASKE" : feedingMethod === "begge" ? "AMNING/FLASKE" : "AMNING";

  // Build recommendations
  const recommendations: { emoji: string; text: string }[] = [];
  if (!nursingDone && todayNursingCount > 0 && todayNursingCount < rec.nursing - 1) {
    recommendations.push({ emoji: "🍼", text: `${childName} har fået ${todayNursingCount} måltider — anbefalet er mindst ${rec.nursing}.` });
  }
  if (todayWet < rec.wetDiapers && todayDiaperCount > 0) {
    recommendations.push({ emoji: "💧", text: `Kun ${todayWet} tissebleer — forventet er ${rec.wetDiapers}+. Hold øje med hydrering.` });
  }
  if (nursingDone && diaperDone) {
    recommendations.push({ emoji: "💚", text: `${childName} har fået nok mad og bleskift i dag. I klarer det!` });
  }

  // All today logs merged and sorted
  const todayNursingLogs = nursingLogs.filter(l => new Date(l.timestamp).toDateString() === today);
  const todayDiaperLogs = diaperLogs.filter(l => new Date(l.timestamp).toDateString() === today);
  const todaySleepLogs = sleepLogs.filter(l => new Date(l.startTime).toDateString() === today);

  const allLogs: { id: string; emoji: string; title: string; time: string; timestamp: number; type: "nursing" | "diaper" | "sleep" }[] = [
    ...todayNursingLogs.map(l => ({
      id: l.id, emoji: feedingMethod === "flaske" ? "🍼" : "🤱",
      title: feedingMethod === "flaske" ? "Flaske" : `Amning — ${l.side === "left" ? "venstre" : "højre"}`,
      time: format(new Date(l.timestamp), "HH:mm"), timestamp: new Date(l.timestamp).getTime(), type: "nursing" as const,
    })),
    ...todayDiaperLogs.map(l => ({
      id: l.id, emoji: l.type === "wet" ? "💧" : l.type === "dirty" ? "💩" : "💧💩",
      title: `${l.type === "wet" ? "Tisse" : l.type === "dirty" ? "Afføring" : "Tisse + afføring"}${l.stoolColor ? ` · ${l.stoolColor}` : ""}`,
      time: format(new Date(l.timestamp), "HH:mm"), timestamp: new Date(l.timestamp).getTime(), type: "diaper" as const,
    })),
    ...todaySleepLogs.map(l => ({
      id: l.id, emoji: l.type === "nap" ? "💤" : "🌙",
      title: `${l.type === "nap" ? "Lur" : "Nattesøvn"}${l.endTime ? "" : " (i gang)"}`,
      time: `${format(new Date(l.startTime), "HH:mm")}${l.endTime ? ` — ${format(new Date(l.endTime), "HH:mm")}` : ""}`,
      timestamp: new Date(l.startTime).getTime(), type: "sleep" as const,
    })),
  ].sort((a, b) => b.timestamp - a.timestamp);

  const handleRemove = (id: string, type: "nursing" | "diaper" | "sleep") => {
    if (type === "nursing") removeNursingLog(id);
    else if (type === "diaper") removeDiaperLog(id);
    else removeSleepLog(id);
  };

  return (
    <div className="space-y-3">
      {/* Stats cards */}
      <div className="grid grid-cols-3 gap-2 section-fade-in" style={{ animationDelay: "160ms" }}>
        {/* Feeding */}
        <div className="card-soft !p-3">
          <span className="text-[0.55rem] tracking-[0.1em] uppercase text-muted-foreground">{feedingLabel}</span>
          <p className="text-[1.1rem] font-semibold mt-1" style={{ color: nursingDone ? "hsl(var(--moss))" : "hsl(var(--bark))" }}>
            {todayNursingCount}/{rec.nursing}
          </p>
          <div className="h-1.5 rounded-full overflow-hidden mt-1.5" style={{ background: "hsl(var(--stone-lighter))" }}>
            <div className="h-full rounded-full transition-all duration-500" style={{ width: `${nursingPct}%`, background: nursingDone ? "hsl(var(--sage))" : "hsl(var(--clay))" }} />
          </div>
          <p className="text-[0.55rem] mt-1" style={{ color: nursingDone ? "hsl(var(--moss))" : undefined }}>
            {nursingDone ? "✓ Nået" : `${rec.nursing - todayNursingCount} mere`}
          </p>
        </div>

        {/* Diapers */}
        <div className="card-soft !p-3">
          <span className="text-[0.55rem] tracking-[0.1em] uppercase text-muted-foreground">BLEER</span>
          <p className="text-[1.1rem] font-semibold mt-1" style={{ color: diaperDone ? "hsl(var(--moss))" : "hsl(var(--bark))" }}>
            {todayDiaperCount}/{totalDiaperRec}
          </p>
          <div className="h-1.5 rounded-full overflow-hidden mt-1.5" style={{ background: "hsl(var(--stone-lighter))" }}>
            <div className="h-full rounded-full transition-all duration-500" style={{ width: `${diaperPct}%`, background: diaperDone ? "hsl(var(--sage))" : "hsl(var(--clay))" }} />
          </div>
          <p className="text-[0.55rem] text-muted-foreground mt-1">💧{todayWet} · 💩{todayDirty}</p>
        </div>

        {/* Sleep */}
        <div className="card-soft !p-3">
          <span className="text-[0.55rem] tracking-[0.1em] uppercase text-muted-foreground">SØVN</span>
          <p className="text-[1.1rem] font-semibold mt-1" style={{ color: "hsl(var(--bark))" }}>
            {sleepStr}
          </p>
          <div className="h-1.5 rounded-full overflow-hidden mt-1.5" style={{ background: "hsl(var(--stone-lighter))" }}>
            <div className="h-full rounded-full transition-all duration-500" style={{ width: `${Math.min((todaySleepMinutes / (8 * 60)) * 100, 100)}%`, background: "hsl(var(--sage))" }} />
          </div>
          <p className="text-[0.55rem] text-muted-foreground mt-1">
            {activeSleep ? "💤 Sover nu" : `${todayNaps} lur${todayNaps !== 1 ? "e" : ""}`}
          </p>
        </div>
      </div>

      {/* Recommendations */}
      {recommendations.length > 0 && (
        <div className="space-y-2 section-fade-in" style={{ animationDelay: "200ms" }}>
          {recommendations.map((r, i) => (
            <div key={i} className="rounded-2xl px-4 py-3 flex items-start gap-3" style={{
              background: "hsl(var(--cream))", border: "1px solid hsl(var(--stone-light))",
            }}>
              <span className="text-lg flex-shrink-0">{r.emoji}</span>
              <p className="text-[0.78rem] text-foreground/70 leading-relaxed">{r.text}</p>
            </div>
          ))}
        </div>
      )}

      {/* Combined log */}
      {allLogs.length > 0 && (
        <div className="card-soft section-fade-in" style={{ animationDelay: "240ms" }}>
          <p className="label-upper mb-3">DAGENS LOG</p>
          {allLogs.map((item) => (
            <div key={item.id} className="flex items-center gap-3 py-2.5 border-b border-foreground/5 last:border-0">
              <span className="text-lg flex-shrink-0">{item.emoji}</span>
              <div className="flex-1 min-w-0">
                <p className="text-[0.84rem] truncate">{item.title}</p>
              </div>
              <span className="text-[0.68rem] text-muted-foreground flex-shrink-0">{item.time}</span>
              <button onClick={() => handleRemove(item.id, item.type)} className="p-1 rounded hover:bg-destructive/10 transition-colors flex-shrink-0">
                <Trash2 className="w-3.5 h-3.5 text-muted-foreground" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════
// HISTORY VIEW — last 7 days summary
// ═══════════════════════════════════════════
function HistoryView() {
  const { nursingLogs, diaperLogs, sleepLogs } = useDiary();
  const { profile } = useFamily();
  const feedingMethod = profile.morHealth?.feedingMethod;
  const feedingLabel = feedingMethod === "flaske" ? "Flaske" : feedingMethod === "begge" ? "Amn/Fl" : "Amning";

  // Build last 7 days
  const days: { date: Date; label: string; nursing: number; diapers: number; sleepMin: number }[] = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const dateStr = d.toDateString();
    const nursing = nursingLogs.filter(l => new Date(l.timestamp).toDateString() === dateStr).length;
    const diapers = diaperLogs.filter(l => new Date(l.timestamp).toDateString() === dateStr).length;
    const sleepMin = sleepLogs
      .filter(l => new Date(l.startTime).toDateString() === dateStr && l.endTime)
      .reduce((sum, l) => sum + (new Date(l.endTime!).getTime() - new Date(l.startTime).getTime()) / 60000, 0);
    days.push({
      date: d,
      label: i === 0 ? "I dag" : i === 1 ? "I går" : format(d, "EEE d/M", { locale: da }),
      nursing, diapers, sleepMin,
    });
  }

  return (
    <div className="space-y-2 section-fade-in" style={{ animationDelay: "160ms" }}>
      <div className="flex items-center gap-2 mb-1">
        <TrendingUp className="w-4 h-4 text-muted-foreground" />
        <p className="text-[0.7rem] text-muted-foreground uppercase tracking-wider">Sidste 7 dage</p>
      </div>

      {days.map((day, i) => {
        const sleepH = Math.floor(day.sleepMin / 60);
        const sleepM = Math.round(day.sleepMin % 60);
        return (
          <div key={i} className="rounded-xl px-4 py-3 flex items-center gap-4" style={{
            background: i === 0 ? "hsl(var(--sage-light) / 0.3)" : "hsl(var(--warm-white))",
            border: `1px solid ${i === 0 ? "hsl(var(--sage) / 0.15)" : "hsl(var(--stone-light))"}`,
          }}>
            <div className="w-14 flex-shrink-0">
              <p className={`text-[0.78rem] ${i === 0 ? "font-semibold" : "font-medium text-foreground/70"}`}>{day.label}</p>
            </div>
            <div className="flex-1 flex items-center gap-3 text-[0.72rem] text-muted-foreground">
              <span title={feedingLabel}>🤱 {day.nursing}</span>
              <span title="Bleer">👶 {day.diapers}</span>
              <span title="Søvn">💤 {sleepH > 0 ? `${sleepH}t${sleepM > 0 ? ` ${sleepM}m` : ""}` : `${sleepM}m`}</span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
