import { useState, useCallback } from "react";
import { useDiary, type StoolColor, type StoolConsistency } from "@/context/DiaryContext";
import { useFamily } from "@/context/FamilyContext";
import { useTranslation } from "react-i18next";
import confetti from "canvas-confetti";

// ── Recommended counts by baby age (from Tjek Baby PDF) ──
function getRecommended(ageDays: number) {
  if (ageDays < 2) return { nursing: 5, wetDiapers: 1, dirtyDiapers: 1 };
  if (ageDays < 3) return { nursing: 8, wetDiapers: 2, dirtyDiapers: 2 };
  if (ageDays < 4) return { nursing: 8, wetDiapers: 3, dirtyDiapers: 3 };
  if (ageDays < 7) return { nursing: 8, wetDiapers: 5, dirtyDiapers: 4 };
  return { nursing: 8, wetDiapers: 6, dirtyDiapers: 4 };
}

function getExpectedStool(ageDays: number, t: (k: string) => string): { colors: StoolColor[]; consistencies: StoolConsistency[]; hint: string } {
  if (ageDays < 2) return { colors: ["sort", "mørkegrøn"], consistencies: ["slimet"], hint: t("quickLog.stoolHintDay0") };
  if (ageDays < 4) return { colors: ["mørkegrøn", "grøn"], consistencies: ["blød", "slimet"], hint: t("quickLog.stoolHintDay2") };
  if (ageDays < 7) return { colors: ["grøn", "gulgrøn"], consistencies: ["blød", "grynet"], hint: t("quickLog.stoolHintDay4") };
  return { colors: ["gulgrøn", "gul"], consistencies: ["blød", "grynet", "flydende"], hint: t("quickLog.stoolHintDay7") };
}

function fireConfetti() {
  confetti({
    particleCount: 45, spread: 60, startVelocity: 20, gravity: 0.8, ticks: 120,
    origin: { y: 0.7 },
    colors: ["#8fae7e", "#c4a77d", "#e8dfd0", "#a3c293", "#d4b896"],
    scalar: 0.8,
  });
}

function useStoolLabels(t: (k: string) => string) {
  const STOOL_COLORS: { value: StoolColor; label: string; swatch: string }[] = [
    { value: "sort", label: t("quickLog.colorBlack"), swatch: "#1a1a1a" },
    { value: "mørkegrøn", label: t("quickLog.colorDarkGreen"), swatch: "#2d5a27" },
    { value: "grøn", label: t("quickLog.colorGreen"), swatch: "#4a8c3f" },
    { value: "gulgrøn", label: t("quickLog.colorYellowGreen"), swatch: "#a8b84c" },
    { value: "gul", label: t("quickLog.colorYellow"), swatch: "#d4a843" },
  ];

  const STOOL_CONSISTENCIES: { value: StoolConsistency; label: string; icon: string }[] = [
    { value: "hård", label: t("quickLog.consHard"), icon: "●" },
    { value: "blød", label: t("quickLog.consSoft"), icon: "◉" },
    { value: "flydende", label: t("quickLog.consLiquid"), icon: "≋" },
    { value: "grynet", label: t("quickLog.consGranular"), icon: "⁘" },
    { value: "slimet", label: t("quickLog.consMucus"), icon: "◎" },
  ];

  return { STOOL_COLORS, STOOL_CONSISTENCIES };
}

export function QuickLog() {
  const { nursingLogs, addNursing, diaperLogs, addDiaper, todayNursingCount, todayDiaperCount, activeSleep, addSleep, endSleep, todaySleepMinutes } = useDiary();
  const { babyAgeWeeks, babyAgeMonths, profile } = useFamily();
  const { t } = useTranslation();
  const childName = profile.children?.[0]?.name || "Baby";
  const feedingMethod = profile.morHealth?.feedingMethod;
  const feedingLabel = feedingMethod === "flaske" ? t("quickLog.bottle") : feedingMethod === "begge" ? t("quickLog.nursingBottle") : t("quickLog.nursing");
  const ageDays = babyAgeWeeks * 7;
  const rec = getRecommended(ageDays);
  const { STOOL_COLORS, STOOL_CONSISTENCIES } = useStoolLabels(t);

  const [showNursingPicker, setShowNursingPicker] = useState(false);
  const [feedingStep, setFeedingStep] = useState<"type" | "nursing" | "bottle">("type");
  const [bottleMl, setBottleMl] = useState<string>("");
  const [showDiaperPicker, setShowDiaperPicker] = useState(false);
  const [diaperStep, setDiaperStep] = useState<"type" | "details">("type");
  const [selectedColor, setSelectedColor] = useState<StoolColor | null>(null);
  const [selectedConsistency, setSelectedConsistency] = useState<StoolConsistency | null>(null);
  const [lastAction, setLastAction] = useState<string | null>(null);

  const today = new Date().toDateString();
  const todayWet = diaperLogs.filter(l => new Date(l.timestamp).toDateString() === today && (l.type === "wet" || l.type === "both")).length;
  const todayDirty = diaperLogs.filter(l => new Date(l.timestamp).toDateString() === today && (l.type === "dirty" || l.type === "both")).length;

  const expected = getExpectedStool(ageDays, t);
  const lastNursing = nursingLogs.find(l => new Date(l.timestamp).toDateString() === today && l.side !== "bottle");
  const suggestedSide: "left" | "right" = lastNursing ? (lastNursing.side === "left" ? "right" : "left") : "left";
  const lastSideHint = lastNursing
    ? t("quickLog.lastSide", { side: lastNursing.side === "left" ? t("quickLog.sideLeft") : t("quickLog.sideRight"), suggested: suggestedSide === "left" ? t("quickLog.sideLeft") : t("quickLog.sideRight") })
    : null;

  const flash = (msg: string) => { setLastAction(msg); setTimeout(() => setLastAction(null), 3000); };

  const handleNursing = useCallback((side: "left" | "right") => {
    addNursing(side);
    fireConfetti();
    flash(t("quickLog.mealLogged"));
    setShowNursingPicker(false);
    setFeedingStep("type");
  }, [addNursing, t]);

  const handleBottle = useCallback((ml: number) => {
    addNursing("bottle", ml);
    fireConfetti();
    flash(`${ml} ml logget`);
    setShowNursingPicker(false);
    setFeedingStep("type");
    setBottleMl("");
  }, [addNursing]);

  const handleWet = useCallback(() => {
    addDiaper("wet");
    fireConfetti();
    flash(t("quickLog.wetDiaperLogged"));
    setShowDiaperPicker(false);
    setDiaperStep("type");
  }, [addDiaper, t]);

  const handleDirtyConfirm = useCallback(() => {
    addDiaper("dirty", selectedColor || undefined, selectedConsistency || undefined);
    fireConfetti();
    flash(t("quickLog.dirtyDiaperLogged"));
    setShowDiaperPicker(false);
    setDiaperStep("type");
    setSelectedColor(null);
    setSelectedConsistency(null);
  }, [addDiaper, selectedColor, selectedConsistency, t]);

  const handleSleep = useCallback(() => {
    if (activeSleep) { endSleep(activeSleep.id); flash(t("quickLog.sleepEnded")); }
    else { addSleep("nap", new Date().toISOString()); flash(t("quickLog.napStarted")); }
  }, [activeSleep, addSleep, endSleep, t]);

  const nursingPct = Math.min((todayNursingCount / rec.nursing) * 100, 100);
  const nursingDone = todayNursingCount >= rec.nursing;
  const diaperPct = Math.min((todayDiaperCount / (rec.wetDiapers + rec.dirtyDiapers)) * 100, 100);

  return (
    <div className="space-y-3 section-fade-in">
      <p className="text-[1rem] font-semibold">{t("quickLog.title")}</p>

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
          if (feedingMethod === "flaske") { handleBottle(0); return; }
          const next = !showNursingPicker;
          setShowNursingPicker(next);
          if (next) setFeedingStep(feedingMethod === "begge" ? "type" : "nursing");
          setShowDiaperPicker(false);
        }}
          className="flex flex-col items-center gap-2 py-4 px-2 rounded-2xl border transition-all active:scale-95 hover:-translate-y-0.5 hover:shadow-md relative"
          style={{ borderColor: showNursingPicker ? "hsl(var(--sage))" : "hsl(var(--stone-light))", background: showNursingPicker ? "hsl(var(--sage-light))" : "hsl(var(--warm-white))" }}>
          <span className="text-2xl">🍼</span>
          <span className="text-[0.62rem] tracking-[0.06em] uppercase text-muted-foreground">{feedingLabel}</span>
          <span className="absolute -top-1 -right-1 text-[0.6rem] font-bold w-5 h-5 rounded-full flex items-center justify-center"
            style={{ background: nursingDone ? "hsl(var(--sage))" : "hsl(var(--clay-light))", color: nursingDone ? "hsl(var(--moss))" : "hsl(var(--bark))" }}>
            {todayNursingCount}
          </span>
        </button>

        {/* Diaper */}
        <button onClick={() => { setShowDiaperPicker(!showDiaperPicker); setShowNursingPicker(false); setDiaperStep("type"); }}
          className="flex flex-col items-center gap-2 py-4 px-2 rounded-2xl border transition-all active:scale-95 hover:-translate-y-0.5 hover:shadow-md relative"
          style={{ borderColor: showDiaperPicker ? "hsl(var(--clay))" : "hsl(var(--stone-light))", background: showDiaperPicker ? "hsl(var(--cream))" : "hsl(var(--warm-white))" }}>
          <img src="/diaper.png" alt="ble" style={{ width: 36, height: 36, objectFit: "contain" }} />
          <span className="text-[0.62rem] tracking-[0.06em] uppercase text-muted-foreground">{t("quickLog.diaper")}</span>
          <span className="absolute -top-1 -right-1 text-[0.6rem] font-bold w-5 h-5 rounded-full flex items-center justify-center"
            style={{ background: "hsl(var(--clay-light))", color: "hsl(var(--bark))" }}>
            {todayDiaperCount}
          </span>
        </button>

        {/* Sleep */}
        <button onClick={handleSleep}
          className="flex flex-col items-center gap-2 py-4 px-2 rounded-2xl border transition-all active:scale-95 hover:-translate-y-0.5 hover:shadow-md relative"
          style={{ borderColor: activeSleep ? "hsl(var(--sage))" : "hsl(var(--stone-light))", background: activeSleep ? "hsl(var(--sage-light))" : "hsl(var(--warm-white))" }}>
          <span className="text-2xl">🌙</span>
          <span className="text-[0.62rem] tracking-[0.06em] uppercase text-muted-foreground">{activeSleep ? t("quickLog.stopSleep") : t("quickLog.sleep")}</span>
          {activeSleep && (
            <span className="absolute -top-1 -right-1"><span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-50" style={{ background: "hsl(var(--sage))" }} />
              <span className="relative inline-flex rounded-full h-3 w-3" style={{ background: "hsl(var(--moss))" }} />
            </span></span>
          )}
        </button>
      </div>

      {/* ── Feeding picker ── */}
      {showNursingPicker && feedingMethod !== "flaske" && (
        <div className="card-soft animate-fade-in space-y-3">

          {/* Step 1 (begge only): choose nursing or bottle */}
          {feedingStep === "type" && feedingMethod === "begge" && (
            <div className="flex gap-2">
              <button onClick={() => setFeedingStep("nursing")}
                className="flex-1 py-3 rounded-2xl text-[0.82rem] font-medium border transition-all active:scale-[0.97]"
                style={{ background: "hsl(var(--sage-light))", borderColor: "hsl(var(--sage))", color: "hsl(var(--sage-dark))" }}>
                🤱 {t("quickLog.nursing")}
              </button>
              <button onClick={() => setFeedingStep("bottle")}
                className="flex-1 py-3 rounded-2xl text-[0.82rem] font-medium border transition-all active:scale-[0.97]"
                style={{ background: "hsl(var(--cream))", borderColor: "hsl(var(--clay))", color: "hsl(var(--bark))" }}>
                🍼 {t("quickLog.bottle")}
              </button>
            </div>
          )}

          {/* Step 2a: choose breast side */}
          {(feedingStep === "nursing" || (feedingStep === "type" && feedingMethod === "amning")) && (
            <>
              {lastSideHint && <p className="text-[0.72rem] text-muted-foreground">💡 {lastSideHint}</p>}
              <div className="flex gap-2">
                <button onClick={() => handleNursing("left")}
                  className="flex-1 py-3 rounded-2xl text-[0.82rem] font-medium border transition-all active:scale-[0.97]"
                  style={{
                    background: suggestedSide === "left" ? "hsl(var(--moss))" : "hsl(var(--sage-light))",
                    borderColor: "hsl(var(--sage))",
                    color: suggestedSide === "left" ? "white" : "hsl(var(--sage-dark))",
                  }}>
                  ← {t("quickLog.left")} {suggestedSide === "left" && "✦"}
                </button>
                <button onClick={() => handleNursing("right")}
                  className="flex-1 py-3 rounded-2xl text-[0.82rem] font-medium border transition-all active:scale-[0.97]"
                  style={{
                    background: suggestedSide === "right" ? "hsl(var(--moss))" : "hsl(var(--sage-light))",
                    borderColor: "hsl(var(--sage))",
                    color: suggestedSide === "right" ? "white" : "hsl(var(--sage-dark))",
                  }}>
                  {t("quickLog.right")} → {suggestedSide === "right" && "✦"}
                </button>
              </div>
            </>
          )}

          {/* Step 2b: enter ml */}
          {feedingStep === "bottle" && (
            <div className="space-y-3">
              <p className="text-[0.72rem] text-muted-foreground">Hvor mange ml?</p>
              <div className="flex gap-2 flex-wrap">
                {[60, 80, 100, 120, 150, 180].map(ml => (
                  <button key={ml} onClick={() => handleBottle(ml)}
                    className="px-4 py-2.5 rounded-xl text-[0.82rem] font-medium border transition-all active:scale-95"
                    style={{ background: "hsl(var(--cream))", borderColor: "hsl(var(--clay-light))", color: "hsl(var(--bark))" }}>
                    {ml} ml
                  </button>
                ))}
              </div>
              <div className="flex gap-2">
                <input
                  type="number"
                  value={bottleMl}
                  onChange={e => setBottleMl(e.target.value)}
                  placeholder="Andet ml"
                  className="flex-1 rounded-xl border px-3 py-2.5 text-[0.82rem] focus:outline-none"
                  style={{ borderColor: "hsl(var(--stone-light))", fontSize: "16px" }}
                />
                <button
                  onClick={() => { const ml = parseInt(bottleMl); if (ml > 0) handleBottle(ml); }}
                  disabled={!bottleMl || parseInt(bottleMl) <= 0}
                  className="px-4 py-2.5 rounded-xl text-[0.82rem] font-medium transition-all active:scale-95 disabled:opacity-40"
                  style={{ background: "hsl(var(--moss))", color: "white" }}>
                  Log
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── Diaper picker ── */}
      {showDiaperPicker && diaperStep === "type" && (
        <div className="card-soft animate-fade-in space-y-3">
          <p className="text-[0.72rem] text-muted-foreground">{t("quickLog.whatInDiaper")}</p>
          <div className="flex gap-2">
            <button onClick={handleWet}
              className="flex-1 py-3 rounded-2xl text-[0.82rem] font-medium border transition-all active:scale-[0.97]"
              style={{ background: "hsl(var(--cream))", borderColor: "hsl(var(--stone))", color: "hsl(var(--bark))" }}>
              {t("quickLog.wetOnly")}
            </button>
            <button onClick={() => setDiaperStep("details")}
              className="flex-1 py-3 rounded-2xl text-[0.82rem] font-medium border transition-all active:scale-[0.97]"
              style={{ background: "hsl(var(--clay-light))", borderColor: "hsl(var(--clay))", color: "hsl(var(--bark))" }}>
              {t("quickLog.stool")}
            </button>
          </div>
        </div>
      )}

      {showDiaperPicker && diaperStep === "details" && (
        <div className="card-soft animate-fade-in space-y-4">
          <div className="rounded-xl px-3 py-2 text-[0.7rem] leading-snug"
            style={{ background: "hsl(var(--cream))", border: "1px solid hsl(var(--clay) / 0.15)" }}>
            <span className="font-medium">{t("quickLog.expectedToday")}</span>
            <span className="text-muted-foreground">{expected.hint}</span>
          </div>

          <div>
            <p className="text-[0.68rem] font-medium mb-2 text-muted-foreground uppercase tracking-wider">{t("quickLog.color")}</p>
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
                  {expected.colors.includes(c.value) && <span className="text-[0.5rem]" style={{ color: "hsl(var(--moss))" }}>{t("quickLog.normal")}</span>}
                </button>
              ))}
            </div>
          </div>

          <div>
            <p className="text-[0.68rem] font-medium mb-2 text-muted-foreground uppercase tracking-wider">{t("quickLog.consistency")}</p>
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
              {t("quickLog.back")}
            </button>
            <button onClick={handleDirtyConfirm}
              className="flex-1 py-2.5 rounded-xl text-[0.78rem] font-medium transition-all active:scale-95"
              style={{ background: "hsl(var(--moss))", color: "white" }}>
              {t("quickLog.registerStool")}
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
            ? <p className="text-[0.55rem] mt-1" style={{ color: "hsl(var(--moss))" }}>{t("quickLog.reached")}</p>
            : <p className="text-[0.55rem] text-muted-foreground mt-1">{t("quickLog.more", { count: rec.nursing - todayNursingCount })}</p>}
        </div>
        {/* Diapers */}
        <div className="card-soft !p-3">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[0.55rem] tracking-[0.1em] uppercase text-muted-foreground">{t("quickLog.diapers")}</span>
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
          <p className="font-medium text-[0.8rem] mb-1">{t("quickLog.dadTip")}</p>
          <p className="text-muted-foreground text-[0.72rem]">
            {ageDays < 3
              ? t("quickLog.dadTipNewborn", { childName })
              : t("quickLog.partnerTip")}
          </p>
        </div>
      )}

    </div>
  );
}

// ── Sleep overview card ──
function SleepOverviewCard() {
  const { sleepLogs, todaySleepMinutes, activeSleep } = useDiary();
  const { t } = useTranslation();
  const today = new Date().toDateString();
  const todayLogs = sleepLogs.filter(l => new Date(l.startTime).toDateString() === today && l.endTime);
  const napCount = todayLogs.filter(l => l.type === "nap").length;

  const recMinutes = 8 * 60;
  const pct = Math.min((todaySleepMinutes / recMinutes) * 100, 100);
  const done = pct >= 100;
  const sleepH = Math.floor(todaySleepMinutes / 60);
  const sleepM = Math.round(todaySleepMinutes % 60);
  const sleepStr = sleepH > 0 ? `${sleepH}t ${sleepM}m` : `${sleepM}m`;

  return (
    <div className="card-soft !p-3">
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-[0.55rem] tracking-[0.1em] uppercase text-muted-foreground">{t("quickLog.sleepLabel")}</span>
      </div>
      <span className="text-[0.82rem] font-semibold" style={{ color: done ? "hsl(var(--moss))" : "hsl(var(--bark))" }}>
        {sleepStr}
      </span>
      <div className="h-1.5 rounded-full overflow-hidden mt-1.5" style={{ background: "hsl(var(--stone-lighter))" }}>
        <div className="h-full rounded-full transition-all duration-500" style={{ width: `${pct}%`, background: done ? "hsl(var(--sage))" : "hsl(var(--sage))" }} />
      </div>
      <p className="text-[0.55rem] text-muted-foreground mt-1">
        {activeSleep ? t("quickLog.sleepingNow") : (napCount === 1 ? t("quickLog.napsOne", { count: napCount }) : t("quickLog.napsMany", { count: napCount }))}
      </p>
    </div>
  );
}
