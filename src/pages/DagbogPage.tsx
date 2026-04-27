import { useState, useCallback } from "react";
import { useFamily } from "@/context/FamilyContext";
import { useDiary, type StoolColor, type StoolConsistency } from "@/context/DiaryContext";
import { Trash2, Clock, TrendingUp } from "lucide-react";
import { format, formatDistanceToNow } from "date-fns";
import { da as daLocale, enUS } from "date-fns/locale";
import confetti from "canvas-confetti";
import { useTranslation } from "react-i18next";

function getRecommended(ageDays: number) {
  if (ageDays < 2) return { nursing: 5, wetDiapers: 1, dirtyDiapers: 1 };
  if (ageDays < 3) return { nursing: 8, wetDiapers: 2, dirtyDiapers: 2 };
  if (ageDays < 4) return { nursing: 8, wetDiapers: 3, dirtyDiapers: 3 };
  if (ageDays < 7) return { nursing: 8, wetDiapers: 5, dirtyDiapers: 4 };
  return { nursing: 8, wetDiapers: 6, dirtyDiapers: 4 };
}

function getExpectedStool(ageDays: number, t: any): { colors: StoolColor[]; consistencies: StoolConsistency[]; hint: string } {
  if (ageDays < 2) return { colors: ["sort", "mørkegrøn"], consistencies: ["slimet"], hint: t("quickLog.stoolHintDay0") };
  if (ageDays < 4) return { colors: ["mørkegrøn", "grøn"], consistencies: ["blød", "slimet"], hint: t("quickLog.stoolHintDay2") };
  if (ageDays < 7) return { colors: ["grøn", "gulgrøn"], consistencies: ["blød", "grynet"], hint: t("quickLog.stoolHintDay4") };
  return { colors: ["gulgrøn", "gul"], consistencies: ["blød", "grynet", "flydende"], hint: t("quickLog.stoolHintDay7") };
}

function fireConfetti() {
  confetti({ particleCount: 45, spread: 60, startVelocity: 20, gravity: 0.8, ticks: 120, origin: { y: 0.7 }, colors: ["#8fae7e", "#c4a77d", "#e8dfd0", "#a3c293", "#d4b896"], scalar: 0.8 });
}

type ViewTab = "idag" | "historik";

export default function DagbogPage() {
  const { profile } = useFamily();
  const { t } = useTranslation();
  const [viewTab, setViewTab] = useState<ViewTab>("idag");

  if (profile.phase === "pregnant") {
    return (
      <div className="space-y-5">
        <div className="section-fade-in">
          <h1 className="text-[1.9rem] font-normal">{t("diary.title")}</h1>
          <p className="label-upper mt-1">{t("diary.availableAfterBirth")}</p>
        </div>
        <div className="card-soft text-center py-12 section-fade-in" style={{ animationDelay: "80ms" }}>
          <span className="text-4xl mb-4 block">📖</span>
          <p className="text-[1rem] font-normal mb-2">{t("diary.diaryWaiting")}</p>
          <p className="text-[0.8rem] text-muted-foreground max-w-xs mx-auto leading-relaxed">
            {t("diary.diaryWaitingDesc")}
          </p>
        </div>
  
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="section-fade-in">
        <h1 className="text-[1.9rem] font-normal">{t("diary.title")}</h1>
        <p className="label-upper mt-1">{t("diary.logAndOverview")}</p>
      </div>

      <QuickLogButtons />

      <div className="flex gap-0 border-b section-fade-in" style={{ borderColor: "hsl(var(--stone-lighter))", animationDelay: "120ms" }}>
        {([
          { key: "idag" as ViewTab, label: t("diary.today") },
          { key: "historik" as ViewTab, label: t("diary.history") },
        ]).map(tab => (
          <button
            key={tab.key}
            onClick={() => setViewTab(tab.key)}
            className={`px-5 py-2.5 text-[0.72rem] tracking-[0.13em] uppercase border-b-2 -mb-px transition-all ${
              viewTab === tab.key ? "font-medium" : "text-muted-foreground"
            }`}
            style={{
              borderBottomColor: viewTab === tab.key ? "hsl(var(--moss))" : "transparent",
              color: viewTab === tab.key ? "hsl(var(--moss))" : undefined,
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {viewTab === "idag" ? <TodayView /> : <HistoryView />}


    </div>
  );
}

// ═══════════════════════════════════════════
// QUICK LOG BUTTONS
// ═══════════════════════════════════════════
function QuickLogButtons() {
  const { nursingLogs, addNursing, diaperLogs, addDiaper, todayNursingCount, todayDiaperCount, activeSleep, addSleep, endSleep } = useDiary();
  const { babyAgeWeeks, profile } = useFamily();
  const { t } = useTranslation();
  const feedingMethod = profile.morHealth?.feedingMethod;
  const feedingLabel = feedingMethod === "flaske" ? t("quickLog.bottle") : feedingMethod === "begge" ? t("quickLog.nursingBottle") : t("quickLog.nursing");
  const ageDays = babyAgeWeeks * 7;
  const rec = getRecommended(ageDays);
  const nursingDone = todayNursingCount >= rec.nursing;

  const [showNursingPicker, setShowNursingPicker] = useState(false);
  const [feedingStep, setFeedingStep] = useState<"type" | "nursing" | "bottle">("type");
  const [bottleMl, setBottleMl] = useState<string>("");
  const [showDiaperPicker, setShowDiaperPicker] = useState(false);
  const [diaperStep, setDiaperStep] = useState<"type" | "details">("type");
  const [selectedColor, setSelectedColor] = useState<StoolColor | null>(null);
  const [selectedConsistency, setSelectedConsistency] = useState<StoolConsistency | null>(null);
  const [lastAction, setLastAction] = useState<string | null>(null);

  const today = new Date().toDateString();
  const expected = getExpectedStool(ageDays, t);
  const lastNursing = nursingLogs.find(l => new Date(l.timestamp).toDateString() === today && l.side !== "bottle");
  const suggestedSide: "left" | "right" = lastNursing ? (lastNursing.side === "left" ? "right" : "left") : "left";
  const lastSideHint = lastNursing
    ? t("quickLog.lastSide", {
        side: lastNursing.side === "left" ? t("quickLog.sideLeft") : t("quickLog.sideRight"),
        suggested: suggestedSide === "left" ? t("quickLog.sideLeft") : t("quickLog.sideRight"),
      })
    : null;

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

  return (
    <div className="space-y-3 section-fade-in" style={{ animationDelay: "80ms" }}>
      {lastAction && (
        <div className="rounded-2xl px-4 py-2.5 text-[0.82rem] font-medium animate-fade-in"
          style={{ background: "hsl(var(--sage-light))", color: "hsl(var(--moss))" }}>
          {lastAction}
        </div>
      )}

      <div className="grid grid-cols-3 gap-2.5">
        {/* Nursing */}
        <button onClick={() => {
          const next = !showNursingPicker;
          setShowNursingPicker(next);
          if (next) setFeedingStep(feedingMethod === "begge" ? "type" : feedingMethod === "flaske" ? "bottle" : "nursing");
          setShowDiaperPicker(false);
        }}
          className="flex flex-col items-center gap-2 py-4 px-2 rounded-2xl border transition-all active:scale-95 hover:-translate-y-0.5 hover:shadow-md relative"
          style={{ borderColor: showNursingPicker ? "hsl(var(--sage))" : "hsl(var(--stone-light))", background: showNursingPicker ? "hsl(var(--sage-light))" : "hsl(var(--warm-white))" }}>
          <span className="text-2xl">🍼</span>
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

      {/* Feeding picker */}
      {showNursingPicker && (
        <div className="card-soft animate-fade-in space-y-3">
          {/* Step 1 (begge): choose nursing or bottle */}
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
          {/* Step 2a: breast side (amning or begge→nursing) */}
          {(feedingStep === "nursing" || (feedingStep === "type" && feedingMethod === "amning")) && (
            <>
              {lastSideHint && <p className="text-[0.72rem] text-muted-foreground">💡 {lastSideHint}</p>}
              <div className="flex gap-2">
                <button onClick={() => handleNursing("left")}
                  className="flex-1 py-3 rounded-2xl text-[0.82rem] font-medium border transition-all active:scale-[0.97]"
                  style={{ background: suggestedSide === "left" ? "hsl(var(--sage))" : "hsl(var(--sage-light))", borderColor: "hsl(var(--sage))", color: suggestedSide === "left" ? "white" : "hsl(var(--sage-dark))" }}>
                  ← {t("quickLog.left")} {suggestedSide === "left" && "✦"}
                </button>
                <button onClick={() => handleNursing("right")}
                  className="flex-1 py-3 rounded-2xl text-[0.82rem] font-medium border transition-all active:scale-[0.97]"
                  style={{ background: suggestedSide === "right" ? "hsl(var(--sage))" : "hsl(var(--sage-light))", borderColor: "hsl(var(--sage))", color: suggestedSide === "right" ? "white" : "hsl(var(--sage-dark))" }}>
                  {t("quickLog.right")} → {suggestedSide === "right" && "✦"}
                </button>
              </div>
            </>
          )}
          {/* Step 2b: ml (flaske or begge→bottle) */}
          {(feedingStep === "bottle" || (feedingStep === "type" && feedingMethod === "flaske")) && (
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
                <input type="number" value={bottleMl} onChange={e => setBottleMl(e.target.value)}
                  placeholder="Andet ml"
                  className="flex-1 rounded-xl border px-3 py-2.5 text-[0.82rem] focus:outline-none"
                  style={{ borderColor: "hsl(var(--stone-light))", fontSize: "16px" }} />
                <button onClick={() => { const ml = parseInt(bottleMl); if (ml > 0) handleBottle(ml); }}
                  disabled={!bottleMl || parseInt(bottleMl) <= 0}
                  className="px-4 py-2.5 rounded-xl text-[0.82rem] font-medium transition-all active:scale-95 disabled:opacity-40"
                  style={{ background: "hsl(var(--sage))", color: "white" }}>
                  Log
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Diaper picker */}
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
                  {expected.colors.includes(c.value) && <span className="text-[0.5rem]" style={{ color: "hsl(var(--moss))" }}>✓</span>}
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
              style={{ background: "hsl(var(--sage))", color: "white" }}>
              {t("diary.register")}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════
// TODAY VIEW
// ═══════════════════════════════════════════
function NursingInsight() {
  const { nursingLogs } = useDiary();
  const { profile, babyAgeWeeks } = useFamily();
  const { i18n } = useTranslation();
  const feedingMethod = profile.morHealth?.feedingMethod;
  const locale = i18n.language === "en" ? enUS : daLocale;

  if (!feedingMethod || feedingMethod === "flaske") return null;

  const lastAny = nursingLogs[0];
  if (!lastAny) return null;

  const lastBreast = nursingLogs.find(l => l.side !== "bottle");

  if (feedingMethod === "amning" && lastBreast) {
    const suggestedSide = lastBreast.side === "left" ? "højre" : "venstre";
    const ago = formatDistanceToNow(new Date(lastBreast.timestamp), { locale, addSuffix: true });
    return (
      <div className="rounded-xl px-3 py-2.5 flex items-center gap-3 section-fade-in" style={{ background: "hsl(var(--sage-light))", border: "1px solid hsl(var(--sage) / 0.2)" }}>
        <span className="text-lg">🤱</span>
        <div>
          <p className="text-[0.78rem] font-medium" style={{ color: "hsl(var(--moss))" }}>
            {lastBreast.side === "left" ? "Venstre" : "Højre"} bryst · {ago}
          </p>
          <p className="text-[0.68rem]" style={{ color: "hsl(var(--moss))" }}>
            Prøv {suggestedSide} side næste gang
          </p>
        </div>
      </div>
    );
  }

  if (feedingMethod === "begge" && lastAny) {
    if (lastAny.side === "bottle") {
      const ago = formatDistanceToNow(new Date(lastAny.timestamp), { locale, addSuffix: true });
      return (
        <div className="rounded-xl px-3 py-2.5 flex items-center gap-3 section-fade-in" style={{ background: "hsl(var(--cream))", border: "1px solid hsl(var(--stone-light))" }}>
          <span className="text-lg">🍼</span>
          <div>
            <p className="text-[0.78rem] font-medium" style={{ color: "hsl(var(--bark))" }}>
              Flaske{lastAny.ml ? ` · ${lastAny.ml} ml` : ""} · {ago}
            </p>
            {lastBreast && (
              <p className="text-[0.68rem] text-muted-foreground">
                Seneste amning: {lastBreast.side === "left" ? "venstre" : "højre"} bryst
              </p>
            )}
          </div>
        </div>
      );
    } else if (lastBreast) {
      const suggestedSide = lastBreast.side === "left" ? "højre" : "venstre";
      const ago = formatDistanceToNow(new Date(lastBreast.timestamp), { locale, addSuffix: true });
      return (
        <div className="rounded-xl px-3 py-2.5 flex items-center gap-3 section-fade-in" style={{ background: "hsl(var(--sage-light))", border: "1px solid hsl(var(--sage) / 0.2)" }}>
          <span className="text-lg">🤱</span>
          <div>
            <p className="text-[0.78rem] font-medium" style={{ color: "hsl(var(--moss))" }}>
              {lastBreast.side === "left" ? "Venstre" : "Højre"} bryst · {ago}
            </p>
            <p className="text-[0.68rem]" style={{ color: "hsl(var(--moss))" }}>
              Prøv {suggestedSide} side næste gang
            </p>
          </div>
        </div>
      );
    }
  }

  return null;
}

function TodayView() {
  const { nursingLogs, diaperLogs, sleepLogs, todayNursingCount, todayDiaperCount, todaySleepMinutes, activeSleep, removeNursingLog, removeDiaperLog, removeSleepLog, addReaction } = useDiary();
  const { babyAgeWeeks, profile } = useFamily();
  const { t, i18n } = useTranslation();
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
  const feedingLabelUpper = feedingMethod === "flaske" ? t("diary.feedingBottle") : feedingMethod === "begge" ? t("diary.feedingCombi") : t("diary.feedingNursing");
  const feedingLabelShort = feedingMethod === "flaske" ? t("diary.feedingBottleShort") : feedingMethod === "begge" ? t("diary.feedingCombiShort") : t("diary.feedingNursingShort");

  const recommendations: { emoji: string; text: string }[] = [];
  if (!nursingDone && todayNursingCount > 0 && todayNursingCount < rec.nursing - 1) {
    recommendations.push({ emoji: "🍼", text: t("diary.mealsLow", { name: childName, count: todayNursingCount, rec: rec.nursing }) });
  }
  if (todayWet < rec.wetDiapers && todayDiaperCount > 0) {
    recommendations.push({ emoji: "💧", text: t("diary.wetLow", { count: todayWet, rec: rec.wetDiapers }) });
  }
  if (nursingDone && diaperDone) {
    recommendations.push({ emoji: "💚", text: t("diary.allGood", { name: childName }) });
  }

  const todayNursingLogs = nursingLogs.filter(l => new Date(l.timestamp).toDateString() === today);
  const todayDiaperLogs = diaperLogs.filter(l => new Date(l.timestamp).toDateString() === today);
  const todaySleepLogs = sleepLogs.filter(l => new Date(l.startTime).toDateString() === today);

  const allLogs: { id: string; emoji: string; title: string; time: string; timestamp: number; type: "nursing" | "diaper" | "sleep" }[] = [
    ...todayNursingLogs.map(l => ({
      id: l.id, emoji: feedingMethod === "flaske" ? "🍼" : "🤱",
      title: feedingMethod === "flaske" ? t("diary.bottleLog") : `${t("diary.nursingLeft").split(" — ")[0]} — ${l.side === "left" ? t("quickLog.sideLeft") : t("quickLog.sideRight")}`,
      time: format(new Date(l.timestamp), "HH:mm"), timestamp: new Date(l.timestamp).getTime(), type: "nursing" as const,
    })),
    ...todayDiaperLogs.map(l => ({
      id: l.id, emoji: l.type === "wet" ? "💧" : l.type === "dirty" ? "💩" : "💧💩",
      title: `${l.type === "wet" ? t("diary.wetDiaper") : l.type === "dirty" ? t("diary.dirtyDiaper") : t("diary.wetAndDirty")}${l.stoolColor ? ` · ${l.stoolColor}` : ""}`,
      time: format(new Date(l.timestamp), "HH:mm"), timestamp: new Date(l.timestamp).getTime(), type: "diaper" as const,
    })),
    ...todaySleepLogs.map(l => ({
      id: l.id, emoji: l.type === "nap" ? "💤" : "🌙",
      title: `${l.type === "nap" ? t("diary.napLabel") : t("diary.nightSleepLabel")}${l.endTime ? "" : ` (${t("diary.inProgress")})`}`,
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
      <NursingInsight />
      <div className="grid grid-cols-3 gap-2 section-fade-in" style={{ animationDelay: "160ms" }}>
        <div className="card-soft !p-3">
          <span className="text-[0.55rem] tracking-[0.1em] uppercase text-muted-foreground">{feedingLabelUpper}</span>
          <p className="text-[1.1rem] font-semibold mt-1" style={{ color: nursingDone ? "hsl(var(--moss))" : "hsl(var(--bark))" }}>
            {todayNursingCount}/{rec.nursing}
          </p>
          <div className="h-1.5 rounded-full overflow-hidden mt-1.5" style={{ background: "hsl(var(--stone-lighter))" }}>
            <div className="h-full rounded-full transition-all duration-500" style={{ width: `${nursingPct}%`, background: nursingDone ? "hsl(var(--sage))" : "hsl(var(--clay))" }} />
          </div>
          <p className="text-[0.55rem] mt-1" style={{ color: nursingDone ? "hsl(var(--moss))" : undefined }}>
            {nursingDone ? t("quickLog.reached") : t("quickLog.more", { count: rec.nursing - todayNursingCount })}
          </p>
        </div>

        <div className="card-soft !p-3">
          <span className="text-[0.55rem] tracking-[0.1em] uppercase text-muted-foreground">{t("quickLog.diapers").toUpperCase()}</span>
          <p className="text-[1.1rem] font-semibold mt-1" style={{ color: diaperDone ? "hsl(var(--moss))" : "hsl(var(--bark))" }}>
            {todayDiaperCount}/{totalDiaperRec}
          </p>
          <div className="h-1.5 rounded-full overflow-hidden mt-1.5" style={{ background: "hsl(var(--stone-lighter))" }}>
            <div className="h-full rounded-full transition-all duration-500" style={{ width: `${diaperPct}%`, background: diaperDone ? "hsl(var(--sage))" : "hsl(var(--clay))" }} />
          </div>
          <p className="text-[0.55rem] text-muted-foreground mt-1">💧{todayWet} · 💩{todayDirty}</p>
        </div>

        <div className="card-soft !p-3">
          <span className="text-[0.55rem] tracking-[0.1em] uppercase text-muted-foreground">{t("quickLog.sleepLabel").toUpperCase()}</span>
          <p className="text-[1.1rem] font-semibold mt-1" style={{ color: "hsl(var(--bark))" }}>
            {sleepStr}
          </p>
          <div className="h-1.5 rounded-full overflow-hidden mt-1.5" style={{ background: "hsl(var(--stone-lighter))" }}>
            <div className="h-full rounded-full transition-all duration-500" style={{ width: `${Math.min((todaySleepMinutes / (8 * 60)) * 100, 100)}%`, background: "hsl(var(--sage))" }} />
          </div>
          <p className="text-[0.55rem] text-muted-foreground mt-1">
            {activeSleep ? t("quickLog.sleepingNow") : (todayNaps === 1 ? t("quickLog.napsOne", { count: todayNaps }) : t("quickLog.napsMany", { count: todayNaps }))}
          </p>
        </div>
      </div>

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

      {allLogs.length > 0 && (
        <div className="card-soft section-fade-in" style={{ animationDelay: "240ms" }}>
          <p className="label-upper mb-3">{t("diary.dailyLog")}</p>
          {allLogs.map((item) => {
            const myRole = profile.role;
            const partnerRole = myRole === "mor" ? "far" : "mor";
            const log = item.type === "nursing"
              ? nursingLogs.find(l => l.id === item.id)
              : item.type === "diaper"
              ? diaperLogs.find(l => l.id === item.id)
              : sleepLogs.find(l => l.id === item.id);
            const myReaction = log?.reactions?.[myRole];
            const partnerReaction = log?.reactions?.[partnerRole];

            const isFromPartner = !!log?.fromPartner;
            const partnerLabel = myRole === "mor" ? "F" : "M";

            return (
              <div key={item.id} className="flex items-center gap-3 py-2.5 border-b border-foreground/5 last:border-0">
                <span className="text-lg flex-shrink-0">{item.emoji}</span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <p className="text-[0.84rem] truncate">{item.title}</p>
                    {isFromPartner && (
                      <span className="text-[0.55rem] font-semibold px-1 py-0.5 rounded flex-shrink-0"
                        style={{ background: myRole === "mor" ? "hsl(var(--sage-light))" : "hsl(var(--clay-light))", color: myRole === "mor" ? "hsl(var(--moss))" : "hsl(var(--bark))" }}>
                        {partnerLabel}
                      </span>
                    )}
                  </div>
                  {(myReaction || partnerReaction) && (
                    <div className="flex gap-1 mt-0.5">
                      {myReaction && <span className="text-[0.75rem]">{myReaction}</span>}
                      {partnerReaction && <span className="text-[0.75rem]">{partnerReaction}</span>}
                    </div>
                  )}
                </div>
                <span className="text-[0.68rem] text-muted-foreground flex-shrink-0">{item.time}</span>
                <button
                  onClick={() => addReaction(item.type, item.id, myRole, myReaction ? "" : "❤️")}
                  className="p-1 rounded transition-colors flex-shrink-0 active:scale-90"
                >
                  <span className="text-base" style={{ opacity: myReaction ? 1 : 0.3 }}>❤️</span>
                </button>
                {!isFromPartner && (
                  <button onClick={() => handleRemove(item.id, item.type)} className="p-1 rounded hover:bg-destructive/10 transition-colors flex-shrink-0">
                    <Trash2 className="w-3.5 h-3.5 text-muted-foreground" />
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════
// HISTORY VIEW
// ═══════════════════════════════════════════
function HistoryView() {
  const { nursingLogs, diaperLogs, sleepLogs } = useDiary();
  const { profile } = useFamily();
  const { t, i18n } = useTranslation();
  const dateFnsLocale = i18n.language === "en" ? enUS : daLocale;
  const feedingMethod = profile.morHealth?.feedingMethod;
  const feedingLabel = feedingMethod === "flaske" ? t("diary.feedingBottleShort") : feedingMethod === "begge" ? t("diary.feedingCombiShort") : t("diary.feedingNursingShort");

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
      label: i === 0 ? t("diary.today") : i === 1 ? t("tasks.yesterday") : format(d, "EEE d/M", { locale: dateFnsLocale }),
      nursing, diapers, sleepMin,
    });
  }

  return (
    <div className="space-y-2 section-fade-in" style={{ animationDelay: "160ms" }}>
      <div className="flex items-center gap-2 mb-1">
        <TrendingUp className="w-4 h-4 text-muted-foreground" />
        <p className="text-[0.7rem] text-muted-foreground uppercase tracking-wider">{t("diary.last7days")}</p>
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
              <span title={t("quickLog.diapers")}>👶 {day.diapers}</span>
              <span title={t("quickLog.sleepLabel")}>💤 {sleepH > 0 ? `${sleepH}t${sleepM > 0 ? ` ${sleepM}m` : ""}` : `${sleepM}m`}</span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
