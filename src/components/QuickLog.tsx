import { useState, useCallback } from "react";
import { useDiary, type StoolColor, type StoolConsistency } from "@/context/DiaryContext";
import { useFamily } from "@/context/FamilyContext";
import confetti from "canvas-confetti";

// ── Recommended counts by baby age (from Tjek Baby PDF) ──
function getRecommended(ageDays: number) {
  if (ageDays < 2) return { nursing: 5, wetDiapers: 1, dirtyDiapers: 1 };
  if (ageDays < 3) return { nursing: 8, wetDiapers: 2, dirtyDiapers: 2 };
  if (ageDays < 4) return { nursing: 8, wetDiapers: 3, dirtyDiapers: 3 };
  if (ageDays < 7) return { nursing: 8, wetDiapers: 5, dirtyDiapers: 4 };
  return { nursing: 8, wetDiapers: 6, dirtyDiapers: 4 };
}

function getExpectedStool(ageDays: number): { colors: StoolColor[]; consistencies: StoolConsistency[]; hint: string } {
  if (ageDays < 2) return { colors: ["sort", "mørkegrøn"], consistencies: ["slimet"], hint: "Mekonium — sort/mørkegrøn, klæbrig. Helt normalt." };
  if (ageDays < 4) return { colors: ["mørkegrøn", "grøn"], consistencies: ["blød", "slimet"], hint: "Overgangsafføring — grønlig, blødere. Tegn på god mælkeindtag." };
  if (ageDays < 7) return { colors: ["grøn", "gulgrøn"], consistencies: ["blød", "grynet"], hint: "Farven skifter mod gul — mælken er ved at komme godt i gang." };
  return { colors: ["gulgrøn", "gul"], consistencies: ["blød", "grynet", "flydende"], hint: "Sennepsgul, grynet — helt normalt for ammede babyer." };
}

function fireConfetti() {
  confetti({
    particleCount: 45, spread: 60, startVelocity: 20, gravity: 0.8, ticks: 120,
    origin: { y: 0.7 },
    colors: ["#8fae7e", "#c4a77d", "#e8dfd0", "#a3c293", "#d4b896"],
    scalar: 0.8,
  });
}

const STOOL_COLORS: { value: StoolColor; label: string; swatch: string }[] = [
  { value: "sort", label: "Sort", swatch: "#1a1a1a" },
  { value: "mørkegrøn", label: "Mørkegrøn", swatch: "#2d5a27" },
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

export function QuickLog() {
  const { nursingLogs, addNursing, diaperLogs, addDiaper, todayNursingCount, todayDiaperCount, activeSleep, addSleep, endSleep, todaySleepMinutes } = useDiary();
  const { babyAgeWeeks, babyAgeMonths, profile } = useFamily();
  const feedingMethod = profile.morHealth?.feedingMethod;
  const feedingLabel = feedingMethod === "flaske" ? "Flaske" : feedingMethod === "begge" ? "Amning/Flaske" : "Amning";
  const feedingEmoji = feedingMethod === "flaske" ? "🍼" : feedingMethod === "begge" ? "🍼" : "🤱";
  const ageDays = babyAgeWeeks * 7;
  const rec = getRecommended(ageDays);

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
    const label = feedingMethod === "flaske" ? "Flaske" : feedingMethod === "begge" ? "Måltid" : "Amning";
    flash(`${label}${feedingMethod !== "flaske" ? ` (${side === "left" ? "venstre" : "højre"})` : ""} registreret ✨`);
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

  const nursingPct = Math.min((todayNursingCount / rec.nursing) * 100, 100);
  const nursingDone = todayNursingCount >= rec.nursing;
  const diaperPct = Math.min((todayDiaperCount / (rec.wetDiapers + rec.dirtyDiapers)) * 100, 100);

  return (
    <div className="space-y-3 section-fade-in">
      <p className="text-[1rem] font-semibold">Hurtig log</p>

      {lastAction && (
        <div className="rounded-2xl px-4 py-2.5 text-[0.82rem] font-medium animate-fade-in"
          style={{ background: "hsl(var(--sage-light))", color: "hsl(var(--moss))" }}>
          {lastAction}
        </div>
      )}

      {/* Quick action buttons */}
      <div className="grid grid-cols-3 gap-2.5">
        {/* Nursing / Bottle */}
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

      {/* ── Nursing side picker (not shown for bottle-only) ── */}
      {showNursingPicker && feedingMethod !== "flaske" && (
        <div className="card-soft animate-fade-in space-y-3">
          {feedingMethod === "begge" && (
            <div className="flex gap-2 mb-2">
              <button onClick={() => { handleNursing("left"); }}
                className="flex-1 py-3 rounded-2xl text-[0.82rem] font-medium border transition-all active:scale-[0.97]"
                style={{ background: "hsl(var(--cream))", borderColor: "hsl(var(--clay))", color: "hsl(var(--bark))" }}>
                🍼 Flaske
              </button>
            </div>
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

      {/* ── Diaper picker ── */}
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
          {/* Expected hint */}
          <div className="rounded-xl px-3 py-2 text-[0.7rem] leading-snug"
            style={{ background: "hsl(var(--cream))", border: "1px solid hsl(var(--clay) / 0.15)" }}>
            <span className="font-medium">📋 Forventet i dag {ageDays}: </span>
            <span className="text-muted-foreground">{expected.hint}</span>
          </div>

          {/* Color picker */}
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
                  {expected.colors.includes(c.value) && <span className="text-[0.5rem]" style={{ color: "hsl(var(--moss))" }}>✓ normal</span>}
                </button>
              ))}
            </div>
          </div>

          {/* Consistency picker */}
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

          {/* Confirm */}
          <div className="flex gap-2">
            <button onClick={() => { setDiaperStep("type"); setSelectedColor(null); setSelectedConsistency(null); }}
              className="px-4 py-2.5 rounded-xl text-[0.78rem] border transition-all active:scale-95"
              style={{ borderColor: "hsl(var(--stone))", color: "hsl(var(--bark))" }}>
              ← Tilbage
            </button>
            <button onClick={handleDirtyConfirm}
              className="flex-1 py-2.5 rounded-xl text-[0.78rem] font-medium transition-all active:scale-95"
              style={{ background: "hsl(var(--sage))", color: "white" }}>
              Registrér afføring ✓
            </button>
          </div>
        </div>
      )}

      {/* Progress trackers */}
      <div className="grid grid-cols-3 gap-2">
        {/* Feeding */}
        <div className="card-soft !p-3">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[0.55rem] tracking-[0.1em] uppercase text-muted-foreground">{feedingLabel}</span>
          </div>
          <span className="text-[0.82rem] font-semibold" style={{ color: nursingDone ? "hsl(var(--moss))" : "hsl(var(--bark))" }}>{todayNursingCount}/{rec.nursing}</span>
          <div className="h-1.5 rounded-full overflow-hidden mt-1.5" style={{ background: "hsl(var(--stone-lighter))" }}>
            <div className="h-full rounded-full transition-all duration-500" style={{ width: `${nursingPct}%`, background: nursingDone ? "hsl(var(--sage))" : "hsl(var(--clay))" }} />
          </div>
          {nursingDone
            ? <p className="text-[0.55rem] mt-1" style={{ color: "hsl(var(--moss))" }}>✓ Nået</p>
            : <p className="text-[0.55rem] text-muted-foreground mt-1">{rec.nursing - todayNursingCount} mere</p>}
        </div>
        {/* Diapers */}
        <div className="card-soft !p-3">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[0.55rem] tracking-[0.1em] uppercase text-muted-foreground">Bleer</span>
          </div>
          <span className="text-[0.82rem] font-semibold" style={{ color: "hsl(var(--bark))" }}>{todayDiaperCount}/{rec.wetDiapers + rec.dirtyDiapers}</span>
          <div className="h-1.5 rounded-full overflow-hidden mt-1.5" style={{ background: "hsl(var(--stone-lighter))" }}>
            <div className="h-full rounded-full transition-all duration-500" style={{ width: `${diaperPct}%`, background: diaperPct >= 100 ? "hsl(var(--sage))" : "hsl(var(--clay))" }} />
          </div>
          <p className="text-[0.55rem] text-muted-foreground mt-1">💧{todayWet} · 💩{todayDirty}</p>
        </div>
        {/* Sleep */}
        <SleepOverviewCard />
      </div>

      {!nursingDone && todayNursingCount > 0 && todayNursingCount < rec.nursing - 2 && (
        <div className="rounded-2xl px-4 py-3 text-[0.78rem] leading-relaxed animate-fade-in"
          style={{ background: "hsl(var(--cream))", border: "1px solid hsl(var(--clay) / 0.15)" }}>
          <p className="font-medium text-[0.8rem] mb-1">💛 Helt i orden</p>
          <p className="text-muted-foreground text-[0.72rem]">
            {ageDays < 3
              ? "I de første dage er det normalt at baby sover meget. Prøv at lægge baby til brystet når I ser tidlige tegn på sult."
              : "Hyppig amning stimulerer mælkeproduktionen. Prøv hud-mod-hud — det fremmer jeres bånd og naturlig amning."}
          </p>
        </div>
      )}

      {/* Emoji stats strip (shown when showStatsStrip is true) */}
      {showStatsStrip && (() => {
        const childName = profile.children?.[0]?.name || "Baby";
        const ageLabel = babyAgeMonths >= 1 ? `${babyAgeMonths} mdr.` : `${babyAgeWeeks} uger`;
        const sleepH = Math.floor(todaySleepMinutes / 60);
        const sleepM = Math.round(todaySleepMinutes % 60);
        const sleepStr = sleepH > 0 ? `${sleepH}t ${sleepM}m` : `${sleepM}m`;
        const stats = [
          { emoji: "🌙", value: sleepStr, label: "Søvn" },
          { emoji: feedingEmoji, value: `${todayNursingCount}×`, label: feedingLabel },
          { emoji: "🧷", value: `${todayDiaperCount}×`, label: "Bleer" },
          { emoji: "👶", value: ageLabel, label: childName },
        ];
        return (
          <div className="rounded-2xl border overflow-hidden" style={{ borderColor: "hsl(var(--stone-light))" }}>
            <div className="grid grid-cols-4 divide-x divide-[hsl(var(--stone-lighter))]">
              {stats.map(s => (
                <div key={s.label} className="flex flex-col items-center py-3 px-1.5 gap-0.5">
                  <span className="text-base">{s.emoji}</span>
                  <span className="text-[0.88rem] font-semibold">{s.value}</span>
                  <span className="text-[0.52rem] tracking-[0.12em] uppercase text-muted-foreground">{s.label}</span>
                </div>
              ))}
            </div>
          </div>
        );
      })()}
    </div>
  );
}
