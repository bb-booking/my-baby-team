import { useState } from "react";
import { useFamily, type TaskAssignee } from "@/context/FamilyContext";
import { Plus, Check, ChevronDown, ChevronUp } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

// ── Category icons ─────────────────────────────────────────────────────────────
const CATEGORY_ICONS: Record<string, string> = {
  health: "🏥",
  preparation: "📦",
  admin: "📋",
  relationship: "💌",
  custom: "✅",
};

// ── Pregnancy task suggestions ─────────────────────────────────────────────────
const TASK_SUGGESTIONS = [
  "Pak hospitalstaske",
  "Planlæg barselsorlov",
  "Køb autostol",
  "Book jordemoder",
  "Lav fødselsplan",
  "Tilmeld fødselsforberedelse",
  "Bestil barnevogn",
];

// ── Daily nudges (3 shown, rotating by day) ────────────────────────────────────
const ALL_NUDGES = [
  { icon: "🤝", text: "Tag én opgave fra jeres liste i dag" },
  { icon: "💬", text: "Spørg din partner hvordan dagen har været" },
  { icon: "📅", text: "Planlæg næste uge sammen — 10 minutter er nok" },
  { icon: "🌿", text: "Del én bekymring og én glæde fra ugen" },
  { icon: "🫶", text: "Sæt et minut af til at kramas i dag" },
  { icon: "💛", text: "Fortæl din partner ét ting du sætter pris på" },
  { icon: "☕", text: "Lav noget godt til din partner i dag" },
  { icon: "🗣️", text: "Tal om hvad I glæder jer mest til" },
];

function getTodayNudges() {
  const day = Math.floor(Date.now() / 86400000);
  const start = day % ALL_NUDGES.length;
  return [0, 1, 2].map(i => ALL_NUDGES[(start + i) % ALL_NUDGES.length]);
}

// ── Moods ──────────────────────────────────────────────────────────────────────
const MOODS = [
  { emoji: "😊", label: "Godt" },
  { emoji: "😐", label: "Okay" },
  { emoji: "😔", label: "Hårdt" },
];

type FilterTab = "alle" | "mor" | "far" | "fælles";

// ── Main component ─────────────────────────────────────────────────────────────
export default function SammenPregnant() {
  const {
    profile, tasks, morName, farName,
    addTask, toggleTask, takeTask,
    addCheckIn, todayCheckIn,
  } = useFamily();

  const role = profile.role;
  const partnerRole = role === "mor" ? "far" : "mor";
  const myName = role === "mor" ? morName : farName;
  const partnerName = role === "mor" ? farName : morName;
  const isMor = role === "mor";

  // ── Filter state ──
  const [filter, setFilter] = useState<FilterTab>("alle");

  // ── Check-in state ──
  const [showCheckin, setShowCheckin] = useState(false);

  // ── Task expand state ──
  const [expandedTask, setExpandedTask] = useState<string | null>(null);

  // ── Recently taken (for animation) ──
  const [recentlyTaken, setRecentlyTaken] = useState<Set<string>>(new Set());

  // ── Create task ──
  const [showCreate, setShowCreate] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newAssignee, setNewAssignee] = useState<TaskAssignee>("fælles");

  const activeTasks = tasks.filter(t => !t.completed);

  const filteredTasks = activeTasks.filter(t => {
    if (filter === "alle") return true;
    if (filter === "mor") return t.assignee === "mor";
    if (filter === "far") return t.assignee === "far";
    if (filter === "fælles") return t.assignee === "fælles";
    return true;
  });

  const handleTakeTask = (id: string) => {
    takeTask(id);
    setRecentlyTaken(prev => new Set([...prev, id]));
    setTimeout(() => {
      setRecentlyTaken(prev => { const n = new Set(prev); n.delete(id); return n; });
    }, 2000);
    toast("Nice — det gør en forskel 💛", { duration: 3000 });
  };

  const handleCreateTask = () => {
    if (!newTitle.trim()) return;
    addTask(newTitle.trim(), newAssignee, "never");
    setNewTitle("");
    setNewAssignee("fælles");
    setShowCreate(false);
  };

  const nudges = getTodayNudges();

  const accentBg = isMor ? "hsl(var(--clay-light))" : "hsl(var(--sage-light))";
  const accentColor = isMor ? "hsl(var(--bark))" : "hsl(var(--moss))";

  return (
    <div className="space-y-5 pb-8">

      {/* ── A. Header ────────────────────────────────────────────────────────── */}
      <div className="section-fade-in flex items-start justify-between">
        <div>
          <h1 className="text-[1.9rem]">Samarbejde</h1>
          <p className="text-[0.72rem] text-muted-foreground mt-1">Vi klarer det bedst sammen</p>
        </div>
        <div className="flex items-center -space-x-2 mt-1">
          <div className="w-9 h-9 rounded-full flex items-center justify-center text-[0.75rem] font-semibold ring-2 ring-background"
            style={{ background: "hsl(var(--clay-light))", color: "hsl(var(--bark))" }}>
            {morName?.charAt(0)?.toUpperCase() || "M"}
          </div>
          <div className="w-9 h-9 rounded-full flex items-center justify-center text-[0.75rem] font-semibold ring-2 ring-background"
            style={{ background: "hsl(var(--sage-light))", color: "hsl(var(--moss))" }}>
            {farName?.charAt(0)?.toUpperCase() || "F"}
          </div>
        </div>
      </div>

      {/* ── B. Check-in Together ─────────────────────────────────────────────── */}
      <div
        className="rounded-2xl px-5 py-5 section-fade-in"
        style={{
          background: "hsl(var(--sage-light))",
          border: "1px solid hsl(var(--sage) / 0.3)",
          animationDelay: "40ms",
        }}
      >
        {!todayCheckIn && !showCheckin ? (
          <>
            <p className="font-serif text-[1.05rem] font-medium mb-1" style={{ color: "hsl(var(--moss))" }}>
              Hvordan har det mellem jer?
            </p>
            <p className="text-[0.82rem] text-muted-foreground mb-4">
              2 minutter kan gøre en stor forskel.
            </p>
            <button
              onClick={() => setShowCheckin(true)}
              className="w-full py-3 rounded-full text-[0.85rem] font-semibold text-white transition-all active:scale-[0.98]"
              style={{ background: "hsl(var(--moss))" }}
            >
              Tjek ind sammen
            </button>
          </>
        ) : showCheckin ? (
          <>
            <p className="text-[0.78rem] font-medium mb-3" style={{ color: "hsl(var(--moss))" }}>
              Hvordan har du det lige nu?
            </p>
            <div className="flex gap-2">
              {MOODS.map(m => (
                <button
                  key={m.label}
                  onClick={() => { addCheckIn(m.label); setShowCheckin(false); }}
                  className="flex-1 flex flex-col items-center gap-1.5 py-3 rounded-xl transition-all active:scale-95"
                  style={{ background: "hsl(var(--warm-white))", border: "1px solid hsl(var(--sage) / 0.3)" }}
                >
                  <span className="text-xl">{m.emoji}</span>
                  <span className="text-[0.68rem] text-muted-foreground">{m.label}</span>
                </button>
              ))}
            </div>
          </>
        ) : (
          <div className="flex items-center gap-3">
            <span className="text-2xl">{MOODS.find(m => m.label === todayCheckIn.mood)?.emoji || "😊"}</span>
            <div>
              <p className="text-[0.82rem] font-medium" style={{ color: "hsl(var(--moss))" }}>Tjekket ind i dag</p>
              <p className="text-[0.72rem] text-muted-foreground">Bliv ved med at støtte hinanden</p>
            </div>
          </div>
        )}
      </div>

      {/* ── C. Task List ─────────────────────────────────────────────────────── */}
      <div className="section-fade-in" style={{ animationDelay: "80ms" }}>

        {/* Header */}
        <div className="flex items-start justify-between mb-1">
          <div>
            <p className="text-[0.82rem] font-semibold">Det I har gang i</p>
            <p className="text-[0.68rem] text-muted-foreground">Små skridt, stor forskel</p>
          </div>
          <button
            onClick={() => setShowCreate(!showCreate)}
            className="flex items-center gap-1 px-3 py-1.5 rounded-full text-[0.72rem] font-medium text-white transition-all active:scale-95"
            style={{ background: "hsl(var(--moss))" }}
          >
            <Plus className="w-3 h-3" /> Opret opgave
          </button>
        </div>

        {/* Create task form */}
        {showCreate && (
          <div className="rounded-2xl px-4 py-4 mb-3 space-y-3"
            style={{ background: "hsl(var(--warm-white))", border: "1px solid hsl(var(--stone-light))" }}>
            <input
              autoFocus
              value={newTitle}
              onChange={e => setNewTitle(e.target.value)}
              onKeyDown={e => e.key === "Enter" && handleCreateTask()}
              placeholder="Hvad skal I have styr på?"
              maxLength={80}
              className="w-full rounded-xl border-[1.5px] border-[hsl(var(--stone-light))] bg-background px-3 py-2.5 text-[0.85rem] focus:outline-none transition-colors"
              style={{ fontSize: "16px" }}
            />
            {/* Quick suggestions */}
            <div className="flex flex-wrap gap-1.5">
              {TASK_SUGGESTIONS.slice(0, 4).map(s => (
                <button
                  key={s}
                  onClick={() => setNewTitle(s)}
                  className="text-[0.68rem] px-2.5 py-1 rounded-full transition-all active:scale-95"
                  style={{ background: "hsl(var(--stone-lighter))", color: "hsl(var(--foreground))" }}
                >
                  {s}
                </button>
              ))}
            </div>
            {/* Assign */}
            <div className="flex gap-2">
              {(["fælles", "mor", "far"] as TaskAssignee[]).map(a => {
                const label = a === "fælles" ? "Fælles" : a === "mor" ? (morName || "Mor") : (farName || "Far");
                const isSelected = newAssignee === a;
                return (
                  <button
                    key={a}
                    onClick={() => setNewAssignee(a)}
                    className="flex-1 py-2 rounded-xl text-[0.72rem] font-medium transition-all active:scale-95"
                    style={{
                      background: isSelected ? "hsl(var(--moss))" : "hsl(var(--stone-lighter))",
                      color: isSelected ? "white" : "hsl(var(--foreground))",
                    }}
                  >
                    {label}
                  </button>
                );
              })}
            </div>
            <button
              onClick={handleCreateTask}
              disabled={!newTitle.trim()}
              className="w-full py-2.5 rounded-full text-[0.78rem] font-semibold text-white transition-all active:scale-[0.98] disabled:opacity-40"
              style={{ background: "hsl(var(--moss))" }}
            >
              Læg i jeres liste
            </button>
          </div>
        )}

        {/* Filter tabs */}
        <div className="flex gap-1.5 mb-3 mt-3">
          {([
            { key: "alle", label: "Alle" },
            { key: "mor", label: morName || "Mor" },
            { key: "far", label: farName || "Far" },
            { key: "fælles", label: "Fælles" },
          ] as { key: FilterTab; label: string }[]).map(tab => (
            <button
              key={tab.key}
              onClick={() => setFilter(tab.key)}
              className="flex-1 py-1.5 rounded-full text-[0.68rem] font-medium transition-all active:scale-95 truncate"
              style={{
                background: filter === tab.key ? "hsl(var(--moss))" : "hsl(var(--stone-lighter))",
                color: filter === tab.key ? "white" : "hsl(var(--muted-foreground))",
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Task rows */}
        <div className="space-y-2">
          {filteredTasks.length === 0 && (
            <div className="text-center py-8">
              <p className="text-2xl mb-2">🌿</p>
              <p className="text-[0.78rem] text-muted-foreground">Ingen opgaver her endnu</p>
            </div>
          )}
          {filteredTasks.map(task => {
            const isExpanded = expandedTask === task.id;
            const isMyTask = task.assignee === role || task.takenBy === role;
            const justTaken = recentlyTaken.has(task.id);
            const ownerName = task.assignee === "mor" ? morName : task.assignee === "far" ? farName : "Fælles";
            const icon = CATEGORY_ICONS[task.category] || "✅";

            return (
              <div
                key={task.id}
                className="rounded-2xl overflow-hidden transition-all"
                style={{ background: "hsl(var(--warm-white))", border: "1px solid hsl(var(--stone-light))" }}
              >
                {/* Main row */}
                <div
                  className="flex items-center gap-3 px-4 py-3.5 cursor-pointer active:bg-[hsl(var(--stone-lighter))] transition-colors"
                  onClick={() => setExpandedTask(isExpanded ? null : task.id)}
                >
                  <span className="text-lg flex-shrink-0">{icon}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-[0.82rem] font-medium truncate">{task.title}</p>
                    <p className="text-[0.65rem] text-muted-foreground">{ownerName}</p>
                  </div>
                  {justTaken ? (
                    <span className="text-[0.68rem] font-medium px-3 py-1.5 rounded-full flex items-center gap-1"
                      style={{ background: "hsl(var(--sage-light))", color: "hsl(var(--moss))" }}>
                      <Check className="w-3 h-3" /> Du tog den
                    </span>
                  ) : isMyTask ? (
                    <span className="text-[0.68rem] px-3 py-1.5 rounded-full border"
                      style={{ borderColor: "hsl(var(--stone-light))", color: "hsl(var(--muted-foreground))" }}>
                      Din opgave
                    </span>
                  ) : (
                    <button
                      onClick={e => { e.stopPropagation(); handleTakeTask(task.id); }}
                      className="text-[0.72rem] font-medium px-3 py-1.5 rounded-full text-white transition-all active:scale-95 flex-shrink-0"
                      style={{ background: "hsl(var(--moss))" }}
                    >
                      Tag den
                    </button>
                  )}
                  {isExpanded
                    ? <ChevronUp className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0" />
                    : <ChevronDown className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0" />
                  }
                </div>

                {/* Expanded detail */}
                {isExpanded && (
                  <div className="px-4 pb-4 border-t" style={{ borderColor: "hsl(var(--stone-lighter))" }}>
                    <p className="text-[0.72rem] text-muted-foreground mt-3 mb-3">
                      En god forberedelse giver ro og overskud — til jer begge.
                    </p>
                    <div className="flex gap-2">
                      {!isMyTask && (
                        <button
                          onClick={() => handleTakeTask(task.id)}
                          className="flex-1 py-2 rounded-full text-[0.75rem] font-medium text-white transition-all active:scale-95"
                          style={{ background: "hsl(var(--moss))" }}
                        >
                          Tag den
                        </button>
                      )}
                      <button
                        onClick={() => { toggleTask(task.id); setExpandedTask(null); }}
                        className={cn(
                          "py-2 rounded-full text-[0.75rem] font-medium transition-all active:scale-95",
                          isMyTask ? "flex-1" : "px-4"
                        )}
                        style={{ border: "1.5px solid hsl(var(--stone-light))", color: "hsl(var(--muted-foreground))" }}
                      >
                        Markér som færdig
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* ── D. Gentle Nudges ─────────────────────────────────────────────────── */}
      <div className="section-fade-in" style={{ animationDelay: "120ms" }}>
        <p className="text-[0.82rem] font-semibold mb-3">Små påmindelser til jer i dag</p>
        <div className="space-y-2">
          {nudges.map((n, i) => (
            <div
              key={i}
              className="flex items-center gap-3 rounded-2xl px-4 py-3"
              style={{ background: "hsl(var(--warm-white))", border: "1px solid hsl(var(--stone-light))" }}
            >
              <span className="text-xl flex-shrink-0">{n.icon}</span>
              <p className="text-[0.82rem] text-muted-foreground">{n.text}</p>
            </div>
          ))}
        </div>
        <p className="text-[0.65rem] text-muted-foreground/60 mt-2 text-center">
          Ingen forventninger — bare inspiration
        </p>
      </div>

    </div>
  );
}
