import { useFamily } from "@/context/FamilyContext";
import { useDiary } from "@/context/DiaryContext";
import { formatDistanceToNow } from "date-fns";
import { da, enUS } from "date-fns/locale";
import { useTranslation } from "react-i18next";

// Visible to the partner when they open the app — shows the other person's current state
export function PartnerHandoff() {
  const { profile, morName, farName, checkIns } = useFamily();
  const { t, i18n } = useTranslation();
  if (profile.hasPartner === false) return null;
  const { nursingLogs, diaperLogs, sleepLogs, getTonightShift } = useDiary();
  const locale = i18n.language === "en" ? enUS : da;

  const { role } = profile;
  const partnerRole = role === "mor" ? "far" : "mor";
  const partnerName = role === "mor" ? farName : morName;
  const myName = role === "mor" ? morName : farName;

  // Partner's latest mood from shared check-ins
  const todayStr = new Date().toISOString().slice(0, 10);
  const partnerMood = checkIns
    .filter(c => c.role === partnerRole && c.date === todayStr)
    .at(-1);

  // Partner's active need
  const partnerNeed = profile.activeNeed?.[partnerRole];

  // Latest logs (shared via Supabase eventually — for now shows device data)
  const lastNursing = nursingLogs.at(-1);
  const lastDiaper = diaperLogs.at(-1);
  const lastSleep = sleepLogs.filter(s => s.endTime).at(-1);

  const tonightShift = getTonightShift();

  // Only show if there's something meaningful to show
  const hasContent = partnerMood || partnerNeed || lastNursing || lastDiaper || tonightShift;
  if (!hasContent) return null;

  const moodEmoji: Record<string, string> = {
    great: "😄", good: "🙂", okay: "😐", tired: "😔", hard: "😢",
    super: "😄", godt: "🙂", træt: "😔", hård: "😢",
  };

  return (
    <div className="card-soft section-fade-in space-y-3">
      <p className="text-[0.6rem] tracking-[0.16em] uppercase text-muted-foreground">
        {partnerName ? t("handoff.partnerDay", { name: partnerName }) : t("handoff.partnerDayFallback")}
      </p>

      <div className="space-y-2">
        {/* Partner mood */}
        {partnerMood && (
          <Row
            emoji={moodEmoji[partnerMood.mood] ?? "💭"}
            label={t("handoff.mood")}
            value={moodLabel(partnerMood.mood, t)}
          />
        )}

        {/* Partner need */}
        {partnerNeed && (
          <Row
            emoji={partnerNeed.emoji}
            label={t("handoff.needs")}
            value={partnerNeed.label}
            highlight
          />
        )}

        {/* Last nursing */}
        {lastNursing && (
          <Row
            emoji="🍼"
            label={t("handoff.lastNursing")}
            value={formatDistanceToNow(new Date(lastNursing.timestamp), { locale, addSuffix: true })}
          />
        )}

        {/* Last diaper */}
        {lastDiaper && (
          <Row
            emoji="🧷"
            label={t("handoff.lastDiaper")}
            value={formatDistanceToNow(new Date(lastDiaper.timestamp), { locale, addSuffix: true })}
          />
        )}

        {/* Tonight's shift */}
        {tonightShift && (
          <Row
            emoji="🌙"
            label={t("handoff.nightShift")}
            value={tonightShift.assignee === role ? `${myName} ${t("handoff.you")}` : `${partnerName || t("handoff.partnerDayFallback")}`}
          />
        )}
      </div>
    </div>
  );
}

function Row({ emoji, label, value, highlight }: { emoji: string; label: string; value: string; highlight?: boolean }) {
  return (
    <div className={`flex items-center gap-2.5 rounded-xl px-3 py-2 ${highlight ? "bg-[hsl(var(--sage-light))]" : "bg-[hsl(var(--cream))]"}`}>
      <span className="text-base w-6 text-center">{emoji}</span>
      <div className="flex-1 min-w-0">
        <p className="text-[0.62rem] text-muted-foreground">{label}</p>
        <p className="text-[0.8rem] font-medium truncate">{value}</p>
      </div>
    </div>
  );
}

function moodLabel(mood: string, t: (key: string) => string): string {
  const map: Record<string, string> = {
    great: t("handoff.moodGreat"), good: t("handoff.moodGood"), okay: t("handoff.moodOkay"),
    tired: t("handoff.moodTired"), hard: t("handoff.moodHard"),
    super: t("handoff.moodGreat"), godt: t("handoff.moodGood"),
    træt: t("handoff.moodTired"), hård: t("handoff.moodHard"),
  };
  return map[mood] ?? mood;
}
