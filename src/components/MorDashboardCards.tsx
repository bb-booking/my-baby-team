import { useFamily } from "@/context/FamilyContext";
import { useTranslation } from "react-i18next";
import { Heart } from "lucide-react";

// ── Mor Recovery Support ──
export function MorRecoveryCard() {
  const { profile, babyAgeWeeks } = useFamily();
  const { t } = useTranslation();

  const tips = getRecoveryTips(babyAgeWeeks, profile.morHealth?.birthType, t);
  if (!tips) return null;

  return (
    <div className="card-soft section-fade-in">
      <div className="flex items-center gap-2 mb-2">
        <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: "hsl(var(--clay-light))" }}>
          <Heart className="w-3.5 h-3.5" style={{ color: "hsl(var(--clay))" }} />
        </div>
        <p className="text-[0.55rem] tracking-[0.14em] uppercase text-muted-foreground">{t("morCards.recovery")}</p>
      </div>
      <p className="text-[0.88rem] font-medium mb-1">{tips.title}</p>
      <p className="text-[0.75rem] text-muted-foreground leading-relaxed">{tips.body}</p>
      <p className="text-[0.68rem] mt-2 italic" style={{ color: "hsl(var(--clay))" }}>{tips.reassurance}</p>
    </div>
  );
}

function getRecoveryTips(ageWeeks: number, birthType: string | undefined, t: (key: string) => string) {
  if (ageWeeks > 16) return null;

  if (birthType === "kejsersnit") {
    if (ageWeeks < 2) return { title: t("morCards.bodyHealingOp"), body: t("morCards.bodyHealingOpDesc"), reassurance: t("morCards.bodyHealingOpReassure") };
    if (ageWeeks < 6) return { title: t("morCards.scarHealing"), body: t("morCards.scarHealingDesc"), reassurance: t("morCards.scarHealingReassure") };
    return { title: t("morCards.recovery12weeks"), body: t("morCards.recovery12weeksDesc"), reassurance: t("morCards.recovery12weeksReassure") };
  }

  if (ageWeeks < 2) return { title: t("morCards.bodyWorking"), body: t("morCards.bodyWorkingDesc"), reassurance: t("morCards.bodyWorkingReassure") };
  if (ageWeeks < 6) return { title: t("morCards.recoveryTakesTime"), body: t("morCards.recoveryTakesTimeDesc"), reassurance: t("morCards.recoveryTakesTimeReassure") };
  if (ageWeeks < 12) return { title: t("morCards.findingRhythm"), body: t("morCards.findingRhythmDesc"), reassurance: t("morCards.findingRhythmReassure") };
  return null;
}

// ── Mor Auto Support ──
export function MorAutoSupport() {
  const { farName, babyAgeWeeks, isOnLeave } = useFamily();
  const { t } = useTranslation();
  const onLeave = isOnLeave("mor");
  const hour = new Date().getHours();

  let suggestion: { emoji: string; text: string; detail: string } | null = null;

  if (onLeave && hour >= 13 && hour <= 16) {
    suggestion = {
      emoji: "☕",
      text: t("morCards.madeItMorning"),
      detail: t("morCards.timeForBreak"),
    };
  }

  if (hour >= 17 && hour <= 19) {
    suggestion = {
      emoji: "🤝",
      text: t("morCards.partnerCanTakeOver", { farName }),
      detail: t("morCards.deservedBreak"),
    };
  }

  if (!suggestion) return null;

  return (
    <div className="rounded-2xl px-4 py-3 section-fade-in" style={{
      background: "hsl(var(--clay) / 0.06)",
      border: "1px solid hsl(var(--clay) / 0.1)",
    }}>
      <div className="flex items-start gap-3">
        <span className="text-lg">{suggestion.emoji}</span>
        <div>
          <p className="text-[0.82rem] font-medium">{suggestion.text}</p>
          <p className="text-[0.68rem] text-muted-foreground">{suggestion.detail}</p>
        </div>
      </div>
    </div>
  );
}

// ── Mor Feeding Support ──
export function MorFeedingCard() {
  const { profile, babyAgeWeeks } = useFamily();
  const { t, i18n } = useTranslation();
  const method = profile.morHealth?.feedingMethod || "amning";

  const tipsDA: Record<string, { title: string; body: string }[]> = {
    amning: [
      { title: "Det er normalt at det gør ondt i starten", body: "Stillinger og sugeteknik tager tid. Bed sundhedsplejersken om hjælp." },
      { title: "Hyppig amning = god mælkeproduktion", body: "Babyer ammer ofte — det er tegn på sund udvikling." },
    ],
    flaske: [
      { title: "Flaske er et godt valg", body: "Det vigtigste er at baby er mæt og tryg. Øjenkontakt under flaske styrker jeres bånd." },
      { title: "Del fladerne", body: "En stor fordel ved flaske er at begge forældre kan give mad." },
    ],
    begge: [
      { title: "Kombi-feeding er fleksibelt", body: "Kombination af bryst og flaske giver frihed. Der er ingen 'forkert' måde." },
      { title: "Vær tålmodig med overgangen", body: "Nogle babyer har brug for tid til at vænne sig." },
    ],
  };

  const tipsEN: Record<string, { title: string; body: string }[]> = {
    amning: [
      { title: "It's normal that it hurts at first", body: "Positions and latch take time. Ask your midwife for help." },
      { title: "Frequent nursing = good milk production", body: "Babies nurse often — it's a sign of healthy development." },
    ],
    flaske: [
      { title: "Bottle is a good choice", body: "The most important thing is that baby is full and safe. Eye contact during bottle strengthens your bond." },
      { title: "Share the feedings", body: "A big advantage of bottle is that both parents can feed." },
    ],
    begge: [
      { title: "Combo feeding is flexible", body: "Combining breast and bottle gives freedom. There's no 'wrong' way." },
      { title: "Be patient with the transition", body: "Some babies need time to adjust." },
    ],
  };

  const tips = i18n.language === "en" ? tipsEN : tipsDA;
  const currentTips = tips[method] || tips.amning;
  const tip = currentTips[babyAgeWeeks < 4 ? 0 : 1] || currentTips[0];

  const methodLabel = method === "amning" ? t("morCards.breastfeedingLabel") : method === "flaske" ? t("morCards.bottleLabel") : t("morCards.combiLabel");

  return (
    <div className="card-soft section-fade-in">
      <div className="flex items-center gap-2 mb-2">
        <span className="text-base">🤱</span>
        <p className="text-[0.55rem] tracking-[0.14em] uppercase text-muted-foreground">{methodLabel}</p>
      </div>
      <p className="text-[0.88rem] font-medium mb-1">{tip.title}</p>
      <p className="text-[0.75rem] text-muted-foreground leading-relaxed">{tip.body}</p>
    </div>
  );
}

// ── Mor Micro-support ──
export function MorMicroSupport() {
  const { t } = useTranslation();
  const messages = t("morMicro", { returnObjects: true }) as string[];

  const dayOfYear = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86400000);
  const message = Array.isArray(messages) ? messages[dayOfYear % messages.length] : "";

  return (
    <div className="rounded-2xl px-5 py-4 text-center section-fade-in"
      style={{ background: "linear-gradient(135deg, hsl(var(--clay) / 0.08), hsl(var(--clay) / 0.03))", border: "1px solid hsl(var(--clay) / 0.12)" }}>
      <p className="text-[0.88rem] leading-relaxed" style={{ color: "hsl(var(--bark))" }}>{message}</p>
    </div>
  );
}
