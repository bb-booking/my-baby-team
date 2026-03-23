import { useState, useCallback } from "react";
import { useDiary } from "@/context/DiaryContext";
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

function fireConfetti() {
  confetti({
    particleCount: 45,
    spread: 60,
    startVelocity: 20,
    gravity: 0.8,
    ticks: 120,
    origin: { y: 0.7 },
    colors: ["#8fae7e", "#c4a77d", "#e8dfd0", "#a3c293", "#d4b896"],
    scalar: 0.8,
  });
}

export function QuickLog() {
  const { nursingLogs, addNursing, diaperLogs, addDiaper, todayNursingCount, todayDiaperCount, activeSleep, addSleep, endSleep } = useDiary();
  const { babyAgeWeeks } = useFamily();
  const ageDays = babyAgeWeeks * 7;
  const rec = getRecommended(ageDays);

  const [nursingSide, setNursingSide] = useState<"left" | "right">("left");
  const [showNursingPicker, setShowNursingPicker] = useState(false);
  const [lastAction, setLastAction] = useState<string | null>(null);

  // Today's wet/dirty counts
  const today = new Date().toDateString();
  const todayWet = diaperLogs.filter(l => new Date(l.timestamp).toDateString() === today && (l.type === "wet" || l.type === "both")).length;
  const todayDirty = diaperLogs.filter(l => new Date(l.timestamp).toDateString() === today && (l.type === "dirty" || l.type === "both")).length;

  const handleNursing = useCallback((side: "left" | "right") => {
    addNursing(side);
    fireConfetti();
    setLastAction(`Amning (${side === "left" ? "venstre" : "højre"}) registreret ✨`);
    setShowNursingPicker(false);
    setTimeout(() => setLastAction(null), 3000);
  }, [addNursing]);

  const handleDiaper = useCallback((type: "wet" | "dirty" | "both") => {
    addDiaper(type);
    fireConfetti();
    const labels = { wet: "Tisseble", dirty: "Afføringsble", both: "Tisse + afføring" };
    setLastAction(`${labels[type]} registreret ✨`);
    setTimeout(() => setLastAction(null), 3000);
  }, [addDiaper]);

  const handleSleep = useCallback(() => {
    if (activeSleep) {
      endSleep(activeSleep.id);
      setLastAction("Søvn afsluttet ✨");
    } else {
      addSleep("nap", new Date().toISOString());
      setLastAction("Lur startet 💤");
    }
    setTimeout(() => setLastAction(null), 3000);
  }, [activeSleep, addSleep, endSleep]);

  // Nursing progress
  const nursingPct = Math.min((todayNursingCount / rec.nursing) * 100, 100);
  const nursingDone = todayNursingCount >= rec.nursing;

  // Diaper progress
  const diaperPct = Math.min((todayDiaperCount / (rec.wetDiapers + rec.dirtyDiapers)) * 100, 100);

  // Get last nursing side for display
  const lastNursing = nursingLogs.find(l => new Date(l.timestamp).toDateString() === today);
  const lastSideHint = lastNursing ? (lastNursing.side === "left" ? "Sidst: venstre → prøv højre" : "Sidst: højre → prøv venstre") : null;

  return (
    <div className="space-y-3 section-fade-in">
      <p className="text-[1rem] font-semibold">Hurtig log</p>

      {/* Success toast */}
      {lastAction && (
        <div
          className="rounded-2xl px-4 py-2.5 text-[0.82rem] font-medium animate-fade-in"
          style={{ background: "hsl(var(--sage-light))", color: "hsl(var(--moss))" }}
        >
          {lastAction}
        </div>
      )}

      {/* Quick action buttons */}
      <div className="grid grid-cols-3 gap-2.5">
        {/* Nursing */}
        <button
          onClick={() => setShowNursingPicker(!showNursingPicker)}
          className="flex flex-col items-center gap-2 py-4 px-2 rounded-2xl border transition-all active:scale-95 hover:-translate-y-0.5 hover:shadow-md relative"
          style={{ borderColor: "hsl(var(--stone-light))", background: "hsl(var(--warm-white))" }}
        >
          <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="16" cy="10" r="5" fill="hsl(var(--clay-light))" stroke="hsl(var(--clay))" strokeWidth="1.2"/>
            <path d="M8 26c0-4 3.5-7 8-7s8 3 8 7" fill="hsl(var(--clay-light))" stroke="hsl(var(--clay))" strokeWidth="1.2" strokeLinecap="round"/>
            <circle cx="22" cy="18" r="3.5" fill="hsl(var(--sage-light))" stroke="hsl(var(--sage))" strokeWidth="1"/>
            <path d="M22 16v4M20 18h4" stroke="hsl(var(--moss))" strokeWidth="1" strokeLinecap="round"/>
          </svg>
          <span className="text-[0.62rem] tracking-[0.06em] uppercase text-muted-foreground">Amning</span>
          <span className="absolute -top-1 -right-1 text-[0.6rem] font-bold w-5 h-5 rounded-full flex items-center justify-center" style={{ background: nursingDone ? "hsl(var(--sage))" : "hsl(var(--clay-light))", color: nursingDone ? "white" : "hsl(var(--bark))" }}>
            {todayNursingCount}
          </span>
        </button>

        {/* Diaper */}
        <button
          onClick={() => handleDiaper("wet")}
          className="flex flex-col items-center gap-2 py-4 px-2 rounded-2xl border transition-all active:scale-95 hover:-translate-y-0.5 hover:shadow-md relative"
          style={{ borderColor: "hsl(var(--stone-light))", background: "hsl(var(--warm-white))" }}
        >
          <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M8 10h16v4c0 5-3 10-8 10s-8-5-8-10V10z" fill="hsl(var(--cream))" stroke="hsl(var(--stone))" strokeWidth="1.2"/>
            <path d="M10 10c2-2 4-3 6-3s4 1 6 3" stroke="hsl(var(--stone))" strokeWidth="1.2" strokeLinecap="round"/>
            <circle cx="14" cy="17" r="1" fill="hsl(var(--sage))"/>
            <circle cx="18" cy="16" r="1" fill="hsl(var(--sage))"/>
            <circle cx="16" cy="19" r="1" fill="hsl(var(--sage))"/>
          </svg>
          <span className="text-[0.62rem] tracking-[0.06em] uppercase text-muted-foreground">Ble</span>
          <span className="absolute -top-1 -right-1 text-[0.6rem] font-bold w-5 h-5 rounded-full flex items-center justify-center" style={{ background: "hsl(var(--clay-light))", color: "hsl(var(--bark))" }}>
            {todayDiaperCount}
          </span>
        </button>

        {/* Sleep */}
        <button
          onClick={handleSleep}
          className="flex flex-col items-center gap-2 py-4 px-2 rounded-2xl border transition-all active:scale-95 hover:-translate-y-0.5 hover:shadow-md relative"
          style={{
            borderColor: activeSleep ? "hsl(var(--sage))" : "hsl(var(--stone-light))",
            background: activeSleep ? "hsl(var(--sage-light))" : "hsl(var(--warm-white))",
          }}
        >
          <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M22 8c-5.5 0-10 4.5-10 10s4.5 10 10 10" stroke="hsl(var(--sage))" strokeWidth="1.2" strokeLinecap="round"/>
            <path d="M18 6c-6 1-10 6-10 12s5 10 10 10" fill="hsl(var(--sage-light))" stroke="hsl(var(--sage))" strokeWidth="1.2"/>
            <circle cx="14" cy="14" r="1" fill="hsl(var(--sage))"/>
            <circle cx="11" cy="18" r="0.8" fill="hsl(var(--sage))"/>
            <circle cx="16" cy="20" r="0.6" fill="hsl(var(--sage))"/>
          </svg>
          <span className="text-[0.62rem] tracking-[0.06em] uppercase text-muted-foreground">
            {activeSleep ? "Stop søvn" : "Søvn"}
          </span>
          {activeSleep && (
            <span className="absolute -top-1 -right-1">
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-50" style={{ background: "hsl(var(--sage))" }} />
                <span className="relative inline-flex rounded-full h-3 w-3" style={{ background: "hsl(var(--moss))" }} />
              </span>
            </span>
          )}
        </button>
      </div>

      {/* Nursing side picker */}
      {showNursingPicker && (
        <div className="card-soft animate-fade-in space-y-3">
          {lastSideHint && (
            <p className="text-[0.72rem] text-muted-foreground">💡 {lastSideHint}</p>
          )}
          <div className="flex gap-2">
            <button
              onClick={() => handleNursing("left")}
              className="flex-1 py-3 rounded-2xl text-[0.82rem] font-medium border transition-all active:scale-[0.97]"
              style={{ background: "hsl(var(--sage-light))", borderColor: "hsl(var(--sage))", color: "hsl(var(--sage-dark))" }}
            >
              ← Venstre
            </button>
            <button
              onClick={() => handleNursing("right")}
              className="flex-1 py-3 rounded-2xl text-[0.82rem] font-medium border transition-all active:scale-[0.97]"
              style={{ background: "hsl(var(--sage-light))", borderColor: "hsl(var(--sage))", color: "hsl(var(--sage-dark))" }}
            >
              Højre →
            </button>
          </div>
        </div>
      )}

      {/* Progress trackers */}
      <div className="grid grid-cols-2 gap-2.5">
        {/* Nursing tracker */}
        <div className="card-soft !p-3">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[0.6rem] tracking-[0.12em] uppercase text-muted-foreground">Amning</span>
            <span className="text-[0.78rem] font-semibold" style={{ color: nursingDone ? "hsl(var(--moss))" : "hsl(var(--bark))" }}>
              {todayNursingCount}/{rec.nursing}
            </span>
          </div>
          <div className="h-1.5 rounded-full overflow-hidden" style={{ background: "hsl(var(--stone-lighter))" }}>
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{
                width: `${nursingPct}%`,
                background: nursingDone ? "hsl(var(--sage))" : "hsl(var(--clay))",
              }}
            />
          </div>
          {nursingDone ? (
            <p className="text-[0.62rem] mt-1.5" style={{ color: "hsl(var(--moss))" }}>
              ✓ Flot klaret! Anbefalet antal nået
            </p>
          ) : (
            <p className="text-[0.62rem] text-muted-foreground mt-1.5">
              {rec.nursing - todayNursingCount} mere anbefalet
            </p>
          )}
        </div>

        {/* Diaper tracker */}
        <div className="card-soft !p-3">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[0.6rem] tracking-[0.12em] uppercase text-muted-foreground">Bleer</span>
            <span className="text-[0.78rem] font-semibold" style={{ color: "hsl(var(--bark))" }}>
              {todayDiaperCount}/{rec.wetDiapers + rec.dirtyDiapers}
            </span>
          </div>
          <div className="h-1.5 rounded-full overflow-hidden" style={{ background: "hsl(var(--stone-lighter))" }}>
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{
                width: `${diaperPct}%`,
                background: diaperPct >= 100 ? "hsl(var(--sage))" : "hsl(var(--clay))",
              }}
            />
          </div>
          <p className="text-[0.62rem] text-muted-foreground mt-1.5">
            💧 {todayWet} tisse · 💩 {todayDirty} afføring
          </p>
        </div>
      </div>

      {/* Gentle advice if behind */}
      {!nursingDone && todayNursingCount > 0 && todayNursingCount < rec.nursing - 2 && (
        <div
          className="rounded-2xl px-4 py-3 text-[0.78rem] leading-relaxed animate-fade-in"
          style={{ background: "hsl(var(--cream))", border: "1px solid hsl(var(--clay) / 0.15)" }}
        >
          <p className="font-medium text-[0.8rem] mb-1">💛 Helt i orden</p>
          <p className="text-muted-foreground text-[0.72rem]">
            {ageDays < 3
              ? "I de første dage er det normalt at baby sover meget. Prøv at lægge baby til brystet når I ser tidlige tegn på sult — suttebevægelser, hænder til mund."
              : "Hyppig amning stimulerer mælkeproduktionen. Prøv at have baby hud-mod-hud — det fremmer jeres bånd og naturlig amning."
            }
          </p>
        </div>
      )}
    </div>
  );
}
