import { useState, useEffect, useRef } from "react";
import { useFamily } from "@/context/FamilyContext";
import { getWeekInsight } from "@/lib/phaseData";
import { Bell, X, Check } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { da, enUS } from "date-fns/locale";
import { useTranslation } from "react-i18next";

// ── Seen state ────────────────────────────────────────────────────────────────
const SEEN_KEY = "melo-notif-seen";

interface SeenState {
  appreciationIds: string[];
  taskTakenKeys: string[];   // `${taskId}_${takenBy}`
  weekMilestones: number[];
  needTimestamps: string[];
}

function loadSeen(): SeenState {
  try {
    const raw = localStorage.getItem(SEEN_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return { appreciationIds: [], taskTakenKeys: [], weekMilestones: [], needTimestamps: [] };
}

function saveSeen(seen: SeenState) {
  try { localStorage.setItem(SEEN_KEY, JSON.stringify(seen)); } catch {}
}

// ── Notification model ────────────────────────────────────────────────────────
type NotifType = "appreciation" | "task_taken" | "milestone" | "partner_need";

interface AppNotif {
  id: string;
  type: NotifType;
  icon: string;
  title: string;
  body: string;
  timestamp: string;
}

// ── Main component ─────────────────────────────────────────────────────────────
export function NotificationBell() {
  const {
    profile, appreciations, tasks, morName, farName,
    currentWeek,
  } = useFamily();
  const { i18n } = useTranslation();
  const dateFnsLocale = i18n.language === "en" ? enUS : da;

  const role = profile.role;
  const partnerRole = role === "mor" ? "far" : "mor";
  const partnerName = role === "mor" ? farName : morName;

  const [seen, setSeen] = useState<SeenState>(loadSeen);
  const [open, setOpen] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);

  // Close panel on outside tap
  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  // ── Build notifications ──────────────────────────────────────────────────────
  const notifs: AppNotif[] = [];

  // 1. Appreciations from partner
  appreciations
    .filter(a => a.from === partnerRole && !seen.appreciationIds.includes(a.id))
    .forEach(a => {
      notifs.push({
        id: `appr_${a.id}`,
        type: "appreciation",
        icon: "💌",
        title: `${partnerName || "Din partner"} sendte dig noget`,
        body: `"${a.text}"`,
        timestamp: a.date,
      });
    });

  // 2. Tasks taken by partner
  tasks
    .filter(t => t.takenBy === partnerRole && !seen.taskTakenKeys.includes(`${t.id}_${t.takenBy}`))
    .forEach(t => {
      notifs.push({
        id: `task_${t.id}`,
        type: "task_taken",
        icon: "🤝",
        title: `${partnerName || "Din partner"} tog en opgave`,
        body: t.title,
        timestamp: t.takenAt || t.createdAt,
      });
    });

  // 3. Pregnancy week milestone
  const insight = currentWeek ? getWeekInsight(currentWeek) : null;
  if (insight?.milestone && currentWeek && !seen.weekMilestones.includes(currentWeek)) {
    notifs.push({
      id: `milestone_${currentWeek}`,
      type: "milestone",
      icon: "🎯",
      title: `Milepæl i uge ${currentWeek}`,
      body: insight.milestone,
      timestamp: new Date().toISOString(),
    });
  }

  // 4. Partner's active need (if set recently — within 12h)
  const partnerNeed = profile.activeNeed?.[partnerRole];
  if (partnerNeed) {
    const ageH = (Date.now() - new Date(partnerNeed.setAt).getTime()) / 3600000;
    if (ageH < 12 && !seen.needTimestamps.includes(partnerNeed.setAt)) {
      notifs.push({
        id: `need_${partnerNeed.setAt}`,
        type: "partner_need",
        icon: partnerNeed.emoji,
        title: `${partnerName || "Din partner"} har et behov`,
        body: partnerNeed.label,
        timestamp: partnerNeed.setAt,
      });
    }
  }

  const unreadCount = notifs.length;

  // ── Mark all as seen ─────────────────────────────────────────────────────────
  const markAllSeen = () => {
    const newSeen: SeenState = { ...seen };
    appreciations
      .filter(a => a.from === partnerRole)
      .forEach(a => {
        if (!newSeen.appreciationIds.includes(a.id)) newSeen.appreciationIds.push(a.id);
      });
    tasks
      .filter(t => t.takenBy === partnerRole)
      .forEach(t => {
        const key = `${t.id}_${t.takenBy}`;
        if (!newSeen.taskTakenKeys.includes(key)) newSeen.taskTakenKeys.push(key);
      });
    if (currentWeek && insight?.milestone) {
      if (!newSeen.weekMilestones.includes(currentWeek)) newSeen.weekMilestones.push(currentWeek);
    }
    if (partnerNeed && !newSeen.needTimestamps.includes(partnerNeed.setAt)) {
      newSeen.needTimestamps.push(partnerNeed.setAt);
    }
    setSeen(newSeen);
    saveSeen(newSeen);
  };

  const handleOpen = () => {
    setOpen(prev => !prev);
  };

  const handleClose = () => {
    setOpen(false);
    markAllSeen();
  };

  return (
    <div className="relative" ref={panelRef}>
      {/* Bell button */}
      <button
        onClick={handleOpen}
        className="relative w-9 h-9 rounded-full flex items-center justify-center transition-all active:scale-95"
        style={{ background: "hsl(var(--stone-lighter))" }}
        aria-label="Notifikationer"
      >
        <Bell className="w-4 h-4" style={{ color: "hsl(var(--foreground))" }} />
        {unreadCount > 0 && (
          <span
            className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full flex items-center justify-center text-[0.55rem] font-bold text-white"
            style={{ background: "hsl(var(--moss))" }}
          >
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {/* Panel */}
      {open && (
        <div
          className="absolute right-0 top-11 z-50 w-80 rounded-2xl overflow-hidden shadow-lg"
          style={{
            background: "hsl(var(--warm-white))",
            border: "1px solid hsl(var(--stone-light))",
            boxShadow: "0 8px 32px hsl(0 0% 0% / 0.12)",
          }}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b" style={{ borderColor: "hsl(var(--stone-light))" }}>
            <p className="text-[0.78rem] font-semibold">Notifikationer</p>
            <button onClick={handleClose} className="p-1 rounded-lg transition-all active:scale-95" style={{ color: "hsl(var(--muted-foreground))" }}>
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* List */}
          <div className="max-h-80 overflow-y-auto">
            {notifs.length === 0 ? (
              <div className="px-4 py-8 text-center">
                <p className="text-2xl mb-2">🌿</p>
                <p className="text-[0.78rem] text-muted-foreground">Ingen nye notifikationer</p>
              </div>
            ) : (
              notifs.map(n => (
                <div
                  key={n.id}
                  className="flex items-start gap-3 px-4 py-3 border-b last:border-0"
                  style={{ borderColor: "hsl(var(--stone-lighter))" }}
                >
                  <span className="text-xl flex-shrink-0 mt-0.5">{n.icon}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-[0.78rem] font-medium leading-snug">{n.title}</p>
                    <p className="text-[0.72rem] text-muted-foreground mt-0.5 leading-snug">{n.body}</p>
                    <p className="text-[0.62rem] text-muted-foreground/60 mt-1">
                      {formatDistanceToNow(new Date(n.timestamp), { addSuffix: true, locale: dateFnsLocale })}
                    </p>
                  </div>
                  <div
                    className="w-2 h-2 rounded-full flex-shrink-0 mt-2"
                    style={{ background: "hsl(var(--moss))" }}
                  />
                </div>
              ))
            )}
          </div>

          {/* Footer — mark all seen */}
          {notifs.length > 0 && (
            <div className="px-4 py-2.5 border-t" style={{ borderColor: "hsl(var(--stone-light))" }}>
              <button
                onClick={handleClose}
                className="flex items-center gap-1.5 text-[0.72rem] font-medium transition-colors"
                style={{ color: "hsl(var(--moss))" }}
              >
                <Check className="w-3.5 h-3.5" /> Marker alle som læst
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
