import { useState, useMemo } from "react";
import { Heart, RefreshCw, Clock, Sparkles } from "lucide-react";
import { useTranslation } from "react-i18next";

interface NærværTip {
  title: string;
  description: string;
  duration: string;
  emoji: string;
  category: "micro" | "ritual" | "date" | "reconnect";
}

function useTips(t: (k: string, o?: any) => string): NærværTip[] {
  return [
    { title: t("nearnessTips.kiss"), description: t("nearnessTips.kissDesc"), duration: t("nearnessTips.10sec"), emoji: "💋", category: "micro" },
    { title: t("nearnessTips.eyeContact"), description: t("nearnessTips.eyeContactDesc"), duration: t("nearnessTips.3sec"), emoji: "👁️", category: "micro" },
    { title: t("nearnessTips.message"), description: t("nearnessTips.messageDesc"), duration: t("nearnessTips.30sec"), emoji: "💬", category: "micro" },
    { title: t("nearnessTips.touch"), description: t("nearnessTips.touchDesc"), duration: t("nearnessTips.2sec"), emoji: "🤝", category: "micro" },
    { title: t("nearnessTips.sofaDebrief"), description: t("nearnessTips.sofaDebriefDesc"), duration: t("nearnessTips.10min"), emoji: "🛋️", category: "ritual" },
    { title: t("nearnessTips.morningCoffee"), description: t("nearnessTips.morningCoffeeDesc"), duration: t("nearnessTips.5min"), emoji: "☕", category: "ritual" },
    { title: t("nearnessTips.eveningRoutine"), description: t("nearnessTips.eveningRoutineDesc"), duration: t("nearnessTips.15min"), emoji: "🌙", category: "ritual" },
    { title: t("nearnessTips.highLow"), description: t("nearnessTips.highLowDesc"), duration: t("nearnessTips.5min"), emoji: "📊", category: "ritual" },
    { title: t("nearnessTips.sofaDate"), description: t("nearnessTips.sofaDateDesc"), duration: t("nearnessTips.30plus"), emoji: "🕯️", category: "date" },
    { title: t("nearnessTips.walkTalk"), description: t("nearnessTips.walkTalkDesc"), duration: t("nearnessTips.20plus"), emoji: "🚶", category: "date" },
    { title: t("nearnessTips.takeaway"), description: t("nearnessTips.takeawayDesc"), duration: t("nearnessTips.45min"), emoji: "🍕", category: "date" },
    { title: t("nearnessTips.needYou"), description: t("nearnessTips.needYouDesc"), duration: t("nearnessTips.1min"), emoji: "🫶", category: "reconnect" },
    { title: t("nearnessTips.acknowledge"), description: t("nearnessTips.acknowledgeDesc"), duration: t("nearnessTips.30sec"), emoji: "✨", category: "reconnect" },
    { title: t("nearnessTips.freeTime"), description: t("nearnessTips.freeTimeDesc"), duration: "—", emoji: "🎁", category: "reconnect" },
  ];
}

export default function NærværTips() {
  const { t } = useTranslation();
  const tips = useTips(t);
  const [seed, setSeed] = useState(() => Math.floor(Date.now() / (1000 * 60 * 60 * 6)));

  const categoryLabels: Record<NærværTip["category"], { label: string; color: string }> = {
    micro: { label: t("nearness.microMoment"), color: "clay" },
    ritual: { label: t("nearness.ritual"), color: "sage" },
    date: { label: t("nearness.date"), color: "clay" },
    reconnect: { label: t("nearness.connection"), color: "sage" },
  };

  const currentTips = useMemo(() => {
    const shuffled = [...tips].sort((a, b) => {
      const hashA = (seed * 31 + tips.indexOf(a) * 17) % 100;
      const hashB = (seed * 31 + tips.indexOf(b) * 17) % 100;
      return hashA - hashB;
    });
    return shuffled.slice(0, 2);
  }, [seed, tips]);

  return (
    <div className="card-soft section-fade-in" style={{ animationDelay: "320ms" }}>
      <div className="flex items-center justify-between mb-1">
        <div className="flex items-center gap-2">
          <Heart className="w-4 h-4" style={{ color: "hsl(var(--clay))" }} />
          <p className="text-[1rem] font-normal">{t("nearness.title")}</p>
        </div>
        <button onClick={() => setSeed(s => s + 1)} className="p-1.5 rounded-lg hover:bg-[hsl(var(--cream))] transition-colors active:scale-90" aria-label={t("nearness.title")}>
          <RefreshCw className="w-3.5 h-3.5 text-muted-foreground" />
        </button>
      </div>
      <p className="text-[0.72rem] text-muted-foreground mb-4 leading-relaxed">{t("nearness.desc")}</p>

      <div className="space-y-3">
        {currentTips.map((tip, i) => {
          const cat = categoryLabels[tip.category];
          return (
            <div key={`${seed}-${i}`} className="rounded-2xl p-4 transition-all" style={{
              background: `linear-gradient(135deg, hsl(var(--${cat.color}-light) / 0.4), hsl(var(--${cat.color}-light) / 0.15))`,
              border: `1px solid hsl(var(--${cat.color}) / 0.2)`,
              animation: "fadeSlideIn 0.4s ease-out both",
              animationDelay: `${i * 80}ms`,
            }}>
              <div className="flex items-start gap-3">
                <span className="text-xl mt-0.5">{tip.emoji}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-[0.88rem] font-medium mb-1">{tip.title}</p>
                  <p className="text-[0.75rem] text-muted-foreground leading-relaxed mb-2">{tip.description}</p>
                  <div className="flex items-center gap-3">
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[0.58rem] tracking-wide uppercase"
                      style={{ background: `hsl(var(--${cat.color}) / 0.15)`, color: `hsl(var(--${cat.color === "clay" ? "bark" : "moss"}))` }}>
                      <Sparkles className="w-2.5 h-2.5" />{cat.label}
                    </span>
                    <span className="inline-flex items-center gap-1 text-[0.6rem] text-muted-foreground">
                      <Clock className="w-2.5 h-2.5" />{tip.duration}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
      <p className="text-[0.6rem] text-muted-foreground/50 mt-3 text-center">{t("nearness.newSuggestions")}</p>
    </div>
  );
}
