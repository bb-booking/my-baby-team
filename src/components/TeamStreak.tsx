import { useDiary } from "@/context/DiaryContext";
import { useFamily } from "@/context/FamilyContext";
import { useTranslation } from "react-i18next";

function getStreakDays(nursingLogs: any[], diaperLogs: any[], sleepLogs: any[]): number {
  const allLogs = [
    ...nursingLogs.map(l => l.timestamp),
    ...diaperLogs.map(l => l.timestamp),
    ...sleepLogs.map(l => l.startTime),
  ];

  if (allLogs.length === 0) return 0;

  const loggedDays = new Set(
    allLogs.map(ts => new Date(ts).toDateString())
  );

  let streak = 0;
  const today = new Date();

  for (let i = 0; i <= 365; i++) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    if (loggedDays.has(d.toDateString())) {
      streak++;
    } else {
      // Allow today to not have a log yet (streak continues from yesterday)
      if (i === 0) continue;
      break;
    }
  }

  return streak;
}

const STREAK_MILESTONES = [3, 7, 14, 30, 60, 100];

function getMilestoneKey(streak: number): string | null {
  if (streak === 3) return "streak.m3";
  if (streak === 7) return "streak.m7";
  if (streak === 14) return "streak.m14";
  if (streak === 30) return "streak.m30";
  if (streak === 60) return "streak.m60";
  if (streak === 100) return "streak.m100";
  return null;
}

export function TeamStreak() {
  const { nursingLogs, diaperLogs, sleepLogs } = useDiary();
  const { profile } = useFamily();
  const isMor = profile.role === "mor";
  const { t } = useTranslation();

  if (profile.phase === "pregnant") return null;

  const streak = getStreakDays(nursingLogs, diaperLogs, sleepLogs);
  if (streak < 2) return null;

  const milestoneKey = getMilestoneKey(streak);
  const milestone = milestoneKey ? t(milestoneKey) : null;
  const accentBg = isMor ? "hsl(var(--clay-light))" : "hsl(var(--sage-light))";
  const accentText = isMor ? "hsl(var(--bark))" : "hsl(var(--moss))";

  // Flame fills based on streak
  const flames = Math.min(streak, 7);

  return (
    <div className="rounded-2xl px-4 py-3.5 section-fade-in flex items-center gap-4"
      style={{ background: accentBg, border: `1px solid ${accentText}20` }}>
      <div className="flex items-end gap-0.5">
        {Array.from({ length: Math.min(flames, 5) }).map((_, i) => (
          <span key={i} className="text-[1.1rem]" style={{ opacity: 0.5 + (i / Math.max(flames - 1, 1)) * 0.5 }}>
            🔥
          </span>
        ))}
      </div>
      <div className="flex-1">
        <p className="text-[0.88rem] font-semibold" style={{ color: accentText }}>
          {t("streak.daysInRow", { count: streak })}
        </p>
        <p className="text-[0.68rem]" style={{ color: accentText, opacity: 0.75 }}>
          {milestone || t("streak.togetherEachDay")}
        </p>
      </div>
      <p className="text-[1.8rem] font-light tabular-nums" style={{ color: accentText, opacity: 0.4 }}>
        {streak}
      </p>
    </div>
  );
}
