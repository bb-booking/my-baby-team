import { useFamily } from "@/context/FamilyContext";
import { useDiary } from "@/context/DiaryContext";
import { formatDistanceToNow } from "date-fns";
import { da } from "date-fns/locale";

// Visible to the partner when they open the app — shows the other person's current state
export function PartnerHandoff() {
  const { profile, morName, farName, checkIns } = useFamily();
  const { nursingLogs, diaperLogs, sleepLogs, getTonightShift } = useDiary();

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
    "super": "😄", "godt": "🙂", "okay": "😐", "træt": "😔", "hård": "😢",
  };

  return (
    <div className="card-soft section-fade-in space-y-3">
      <p className="text-[0.6rem] tracking-[0.16em] uppercase text-muted-foreground">
        {partnerName ? `${partnerName}s dag` : "Din partners dag"}
      </p>

      <div className="space-y-2">
        {/* Partner mood */}
        {partnerMood && (
          <Row
            emoji={moodEmoji[partnerMood.mood] ?? "💭"}
            label="Stemning i dag"
            value={moodLabel(partnerMood.mood)}
          />
        )}

        {/* Partner need */}
        {partnerNeed && (
          <Row
            emoji={partnerNeed.emoji}
            label="Har brug for"
            value={partnerNeed.label}
            highlight
          />
        )}

        {/* Last nursing */}
        {lastNursing && (
          <Row
            emoji="🍼"
            label="Sidst ammet"
            value={formatDistanceToNow(new Date(lastNursing.timestamp), { locale: da, addSuffix: true })}
          />
        )}

        {/* Last diaper */}
        {lastDiaper && (
          <Row
            emoji="🧷"
            label="Sidst skiftet ble"
            value={formatDistanceToNow(new Date(lastDiaper.timestamp), { locale: da, addSuffix: true })}
          />
        )}

        {/* Tonight's shift */}
        {tonightShift && (
          <Row
            emoji="🌙"
            label="Nattevagt i aften"
            value={tonightShift.assignee === role ? `${myName} (dig)` : `${partnerName || "Din partner"}`}
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

function moodLabel(mood: string): string {
  const map: Record<string, string> = {
    great: "Super", good: "Godt", okay: "Okay", tired: "Træt", hard: "Hård dag",
    super: "Super", godt: "Godt", okay2: "Okay", træt: "Træt", hård: "Hård dag",
  };
  return map[mood] ?? mood;
}
