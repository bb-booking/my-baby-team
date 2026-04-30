import { useState } from "react";
import { useFamily, type TaskAssignee } from "@/context/FamilyContext";
import { Plus, ChevronRight, Bell } from "lucide-react";
import { toast } from "sonner";
import { Link } from "react-router-dom";
import confetti from "canvas-confetti";

// ── Category config ────────────────────────────────────────────────────────────
const CATEGORY_CONFIG: Record<string, { label: string; emoji: string; bg: string; color: string }> = {
  health:       { label: "Helbred",      emoji: "🏥", bg: "hsl(var(--sage-light))",  color: "hsl(var(--moss))"  },
  preparation:  { label: "Forberedelse", emoji: "📦", bg: "hsl(var(--clay-light))",  color: "hsl(var(--bark))"  },
  admin:        { label: "Planlægning",  emoji: "📅", bg: "hsl(var(--sand-light))",  color: "hsl(var(--bark))"  },
  relationship: { label: "Relation",     emoji: "💌", bg: "hsl(var(--clay-light))",  color: "hsl(var(--bark))"  },
  custom:       { label: "Opgave",       emoji: "✅", bg: "hsl(var(--stone-lighter))",color: "hsl(var(--foreground))" },
};

// ── Nudges ─────────────────────────────────────────────────────────────────────
const ALL_NUDGES = [
  { emoji: "❤️", bg: "hsl(var(--clay-light))",  title: "Tag én ting fra din partner i dag",  desc: "Selv små ting gør en forskel" },
  { emoji: "💬", bg: "hsl(var(--stone-lighter))", title: "Spørg hvordan dagen har været",      desc: "Lyt – det styrker forbindelsen" },
  { emoji: "📅", bg: "hsl(var(--sand-light))",   title: "Planlæg næste uge sammen",           desc: "10 minutter nu sparer stress senere" },
  { emoji: "🌿", bg: "hsl(var(--sage-light))",   title: "Del én bekymring og én glæde",       desc: "Ærlighed skaber nærhed" },
  { emoji: "🫶", bg: "hsl(var(--clay-light))",   title: "Sæt et minut af til at kramas",      desc: "Fysisk kontakt er vigtigt" },
  { emoji: "💛", bg: "hsl(var(--sand-light))",   title: "Fortæl din partner noget du sætter pris på", desc: "Et ord kan vende en dag" },
];

function getTodayNudges() {
  const day = Math.floor(Date.now() / 86400000);
  const start = day % ALL_NUDGES.length;
  return [0, 1, 2].map(i => ALL_NUDGES[(start + i) % ALL_NUDGES.length]);
}

// ── Task suggestions ───────────────────────────────────────────────────────────
const TASK_SUGGESTIONS = [
  "Pak hospitalstaske", "Planlæg barselsorlov",
  "Køb autostol", "Book jordemoder",
  "Lav fødselsplan", "Bestil barnevogn",
];

// ── Relative time ──────────────────────────────────────────────────────────────
function relativeTime(iso: string): string {
  if (!iso) return "";
  const d = new Date(iso);
  const now = new Date();
  const todayStr = now.toDateString();
  const yest = new Date(now); yest.setDate(now.getDate() - 1);
  const hh = d.getHours().toString().padStart(2, "0");
  const mm = d.getMinutes().toString().padStart(2, "0");
  if (d.toDateString() === todayStr) return `I dag kl. ${hh}.${mm}`;
  if (d.toDateString() === yest.toDateString()) return `I går kl. ${hh}.${mm}`;
  return `${d.getDate()}/${d.getMonth() + 1} kl. ${hh}.${mm}`;
}

type FilterTab = "alle" | "mor" | "far" | "fælles";

// ── Main component ─────────────────────────────────────────────────────────────
export default function SammenPregnant() {
  const {
    profile, tasks, morName, farName,
    addTask, toggleTask, takeTask,
  } = useFamily();

  const role = profile.role;
  const [filter, setFilter] = useState<FilterTab>("alle");
  const [recentlyTaken, setRecentlyTaken] = useState<Set<string>>(new Set());
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

  // Activity feed: last 5 events (taken or completed)
  const activityItems = tasks
    .filter(t => t.takenAt)
    .sort((a, b) => new Date(b.takenAt!).getTime() - new Date(a.takenAt!).getTime())
    .slice(0, 3)
    .map(t => ({
      name: t.takenBy === "mor" ? morName : farName,
      role: t.takenBy,
      text: `tog opgaven '${t.title}'`,
      time: relativeTime(t.takenAt!),
    }));

  const handleTakeTask = (id: string) => {
    takeTask(id);
    setRecentlyTaken(prev => new Set([...prev, id]));
    setTimeout(() => {
      setRecentlyTaken(prev => { const n = new Set(prev); n.delete(id); return n; });
    }, 2000);
    toast("Nice — det gør en forskel 💛", { duration: 3000 });
  };

  const handleComplete = (id: string) => {
    confetti({
      particleCount: 40,
      spread: 50,
      origin: { y: 0.7 },
      colors: ["#5a7a50", "#c4a97d", "#8fae7e", "#d4c4a8"],
      scalar: 0.7,
      gravity: 1.2,
    });
    toggleTask(id);
  };

  const handleCreateTask = () => {
    if (!newTitle.trim()) return;
    addTask(newTitle.trim(), newAssignee, "never");
    setNewTitle(""); setNewAssignee("fælles"); setShowCreate(false);
  };

  const nudges = getTodayNudges();

  return (
    <div className="space-y-5 pb-8">

      {/* ── A. Header ────────────────────────────────────────────────────────── */}
      <div className="section-fade-in flex items-start justify-between">
        <div>
          <h1 className="text-[1.9rem]">Samarbejde</h1>
          <p className="text-[0.82rem] text-muted-foreground mt-0.5">Vi klarer det bedst sammen ♡</p>
        </div>
        <div className="flex items-center gap-2.5 mt-1">
          <div className="flex -space-x-2">
            <div className="w-9 h-9 rounded-full flex items-center justify-center text-[0.75rem] font-semibold ring-2 ring-background z-10"
              style={{ background: "hsl(var(--clay-light))", color: "hsl(var(--bark))" }}>
              {morName?.charAt(0)?.toUpperCase() || "M"}
            </div>
            <div className="w-9 h-9 rounded-full flex items-center justify-center text-[0.75rem] font-semibold ring-2 ring-background"
              style={{ background: "hsl(var(--sage-light))", color: "hsl(var(--moss))" }}>
              {farName?.charAt(0)?.toUpperCase() || "F"}
            </div>
          </div>
          <div className="relative w-8 h-8 flex items-center justify-center">
            <Bell className="w-5 h-5 text-muted-foreground" strokeWidth={1.8} />
          </div>
        </div>
      </div>

      {/* ── B. Hero banner ───────────────────────────────────────────────────── */}
      <div
        className="rounded-2xl px-5 py-5 section-fade-in overflow-hidden relative"
        style={{
          background: "hsl(var(--sand-light))",
          border: "1px solid hsl(var(--stone-light))",
          animationDelay: "40ms",
          minHeight: "100px",
        }}
      >
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0"
            style={{ background: "hsl(var(--stone-lighter))" }}>
            <span className="text-2xl">🤝</span>
          </div>
          <div>
            <p className="font-serif text-[1.05rem] font-medium leading-snug mb-1">Små skridt, stor forskel</p>
            <p className="text-[0.8rem] text-muted-foreground leading-relaxed">
              Når vi hjælper hinanden, får vi mere overskud til det, der betyder mest.
            </p>
          </div>
        </div>
      </div>

      {/* ── C. Task list ─────────────────────────────────────────────────────── */}
      <div
        className="rounded-2xl overflow-hidden section-fade-in"
        style={{
          background: "hsl(var(--warm-white))",
          border: "1px solid hsl(var(--stone-light))",
          animationDelay: "80ms",
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 pt-4 pb-3">
          <p className="text-[0.95rem] font-semibold">Det I er i gang med</p>
          <button
            onClick={() => setShowCreate(!showCreate)}
            className="flex items-center gap-1 text-[0.72rem] font-medium transition-all active:scale-95"
            style={{ color: "hsl(var(--moss))" }}
          >
            <Plus className="w-3.5 h-3.5" /> Opret opgave
          </button>
        </div>

        {/* Create task form */}
        {showCreate && (
          <div className="mx-4 mb-3 rounded-xl px-4 py-3 space-y-3"
            style={{ background: "hsl(var(--stone-lighter))" }}>
            <input
              autoFocus
              value={newTitle}
              onChange={e => setNewTitle(e.target.value)}
              onKeyDown={e => e.key === "Enter" && handleCreateTask()}
              placeholder="Hvad skal I have styr på?"
              maxLength={80}
              className="w-full rounded-xl border-[1.5px] border-[hsl(var(--stone-light))] bg-background px-3 py-2.5 text-[0.85rem] focus:outline-none"
              style={{ fontSize: "16px" }}
            />
            <div className="flex flex-wrap gap-1.5">
              {TASK_SUGGESTIONS.slice(0, 4).map(s => (
                <button key={s} onClick={() => setNewTitle(s)}
                  className="text-[0.68rem] px-2.5 py-1 rounded-full bg-background transition-all active:scale-95"
                  style={{ color: "hsl(var(--foreground))", border: "1px solid hsl(var(--stone-light))" }}>
                  {s}
                </button>
              ))}
            </div>
            <div className="flex gap-2">
              {(["fælles", "mor", "far"] as TaskAssignee[]).map(a => {
                const label = a === "fælles" ? "Fælles" : a === "mor" ? (morName || "Mor") : (farName || "Far");
                return (
                  <button key={a} onClick={() => setNewAssignee(a)}
                    className="flex-1 py-2 rounded-xl text-[0.72rem] font-medium transition-all active:scale-95"
                    style={{
                      background: newAssignee === a ? "hsl(var(--moss))" : "hsl(var(--warm-white))",
                      color: newAssignee === a ? "white" : "hsl(var(--foreground))",
                    }}>
                    {label}
                  </button>
                );
              })}
            </div>
            <button onClick={handleCreateTask} disabled={!newTitle.trim()}
              className="w-full py-2.5 rounded-full text-[0.78rem] font-semibold text-white transition-all active:scale-[0.98] disabled:opacity-40"
              style={{ background: "hsl(var(--moss))" }}>
              Læg i jeres liste
            </button>
          </div>
        )}

        {/* Filter pills */}
        <div className="flex gap-2 px-5 pb-3">
          {([
            { key: "alle",   label: "Alle" },
            { key: "mor",    label: morName || "Mor" },
            { key: "far",    label: farName || "Far" },
            { key: "fælles", label: "Fælles" },
          ] as { key: FilterTab; label: string }[]).map(tab => (
            <button
              key={tab.key}
              onClick={() => setFilter(tab.key)}
              className="px-4 py-1.5 rounded-full text-[0.72rem] font-medium transition-all active:scale-95"
              style={{
                background: filter === tab.key ? "hsl(var(--moss))" : "transparent",
                color: filter === tab.key ? "white" : "hsl(var(--muted-foreground))",
                border: filter === tab.key ? "none" : "1px solid hsl(var(--stone-light))",
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Task rows */}
        <div className="divide-y" style={{ borderColor: "hsl(var(--stone-lighter))" }}>
          {filteredTasks.length === 0 && (
            <div className="text-center py-8 px-5">
              <p className="text-2xl mb-2">🌿</p>
              <p className="text-[0.78rem] text-muted-foreground">Ingen opgaver her endnu</p>
            </div>
          )}
          {filteredTasks.map(task => {
            const isMyTask = task.assignee === role || task.takenBy === role;
            const justTaken = recentlyTaken.has(task.id);
            const isFelles = task.assignee === "fælles";
            const cat = CATEGORY_CONFIG[task.category] || CATEGORY_CONFIG.custom;
            const ownerName = isFelles ? "Fælles" : task.assignee === "mor" ? morName : farName;

            return (
              <div key={task.id} className="flex items-center gap-3 px-4 py-3.5">
                {/* Checkbox */}
                <button
                  onClick={() => handleComplete(task.id)}
                  className="w-5 h-5 rounded flex items-center justify-center flex-shrink-0 transition-all active:scale-90"
                  style={{
                    border: "1.5px solid hsl(var(--stone-light))",
                    background: "hsl(var(--warm-white))",
                  }}
                  aria-label="Markér som færdig"
                />

                {/* Category icon */}
                <div
                  className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 text-[1rem]"
                  style={{ background: cat.bg }}
                >
                  {cat.emoji}
                </div>

                {/* Title + category */}
                <div className="flex-1 min-w-0">
                  <p className="text-[0.85rem] font-medium truncate">{task.title}</p>
                  <p className="text-[0.65rem] text-muted-foreground">{cat.label}</p>
                </div>

                {/* Avatar(s) + name */}
                <div className="flex items-center gap-1.5 flex-shrink-0">
                  {isFelles ? (
                    <div className="flex -space-x-1.5">
                      <div className="w-6 h-6 rounded-full flex items-center justify-center text-[0.55rem] font-semibold ring-1 ring-background z-10"
                        style={{ background: "hsl(var(--clay-light))", color: "hsl(var(--bark))" }}>
                        {morName?.[0]}
                      </div>
                      <div className="w-6 h-6 rounded-full flex items-center justify-center text-[0.55rem] font-semibold ring-1 ring-background"
                        style={{ background: "hsl(var(--sage-light))", color: "hsl(var(--moss))" }}>
                        {farName?.[0]}
                      </div>
                    </div>
                  ) : (
                    <div className="w-6 h-6 rounded-full flex items-center justify-center text-[0.55rem] font-semibold"
                      style={{
                        background: task.assignee === "mor" ? "hsl(var(--clay-light))" : "hsl(var(--sage-light))",
                        color: task.assignee === "mor" ? "hsl(var(--bark))" : "hsl(var(--moss))",
                      }}>
                      {ownerName?.[0]}
                    </div>
                  )}
                  <span className="text-[0.65rem] text-muted-foreground">{ownerName}</span>
                </div>

                {/* Action */}
                {justTaken ? (
                  <span className="text-[0.65rem] font-medium px-2.5 py-1 rounded-full flex-shrink-0"
                    style={{ background: "hsl(var(--sage-light))", color: "hsl(var(--moss))" }}>
                    ✓ Taget
                  </span>
                ) : isMyTask ? null : (
                  <button
                    onClick={() => handleTakeTask(task.id)}
                    className="text-[0.72rem] font-semibold px-3.5 py-1.5 rounded-xl text-white transition-all active:scale-95 flex-shrink-0"
                    style={{ background: "hsl(var(--moss))" }}
                  >
                    Tag den
                  </button>
                )}
              </div>
            );
          })}
        </div>

        {/* Footer link */}
        <Link
          to="/tjekliste"
          className="flex items-center justify-between px-5 py-3.5 transition-all active:bg-[hsl(var(--stone-lighter))]"
          style={{ borderTop: "1px solid hsl(var(--stone-lighter))" }}
        >
          <span className="text-[0.82rem] text-muted-foreground">Se alle opgaver</span>
          <ChevronRight className="w-4 h-4 text-muted-foreground/50" />
        </Link>
      </div>

      {/* ── D. Nudges (horizontal scroll) ────────────────────────────────────── */}
      <div className="section-fade-in" style={{ animationDelay: "120ms" }}>
        <div className="flex items-center gap-2 mb-3 px-0.5">
          <span className="text-[0.95rem]">💡</span>
          <p className="text-[0.88rem] font-semibold">Små påmindelser til jer i dag</p>
        </div>
        <div className="flex gap-3 overflow-x-auto pb-1 -mx-1 px-1" style={{ scrollbarWidth: "none" }}>
          {nudges.map((n, i) => (
            <div
              key={i}
              className="flex-shrink-0 rounded-2xl px-4 py-3.5 w-44"
              style={{
                background: "hsl(var(--warm-white))",
                border: "1px solid hsl(var(--stone-light))",
              }}
            >
              <div className="w-8 h-8 rounded-full flex items-center justify-center text-base mb-2.5"
                style={{ background: n.bg }}>
                {n.emoji}
              </div>
              <p className="text-[0.78rem] font-medium leading-snug mb-1">{n.title}</p>
              <p className="text-[0.65rem] text-muted-foreground leading-snug">{n.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ── E. Recent activity ───────────────────────────────────────────────── */}
      {activityItems.length > 0 && (
        <div className="section-fade-in" style={{ animationDelay: "160ms" }}>
          <div className="flex items-center justify-between mb-3">
            <p className="text-[0.88rem] font-semibold">Seneste aktivitet</p>
            <Link to="/tjekliste"
              className="text-[0.72rem] font-medium flex items-center gap-0.5"
              style={{ color: "hsl(var(--moss))" }}>
              Se alle <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>
          <div
            className="rounded-2xl overflow-hidden"
            style={{ background: "hsl(var(--warm-white))", border: "1px solid hsl(var(--stone-light))" }}
          >
            <div className="divide-y" style={{ borderColor: "hsl(var(--stone-lighter))" }}>
              {activityItems.map((item, i) => (
                <div key={i} className="flex items-center gap-3 px-4 py-3.5">
                  <div
                    className="w-9 h-9 rounded-full flex items-center justify-center text-[0.75rem] font-semibold flex-shrink-0"
                    style={{
                      background: item.role === "mor" ? "hsl(var(--clay-light))" : "hsl(var(--sage-light))",
                      color: item.role === "mor" ? "hsl(var(--bark))" : "hsl(var(--moss))",
                    }}
                  >
                    {item.name?.[0]}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[0.82rem] leading-snug">
                      <span className="font-medium">{item.name}</span>{" "}
                      <span className="text-muted-foreground">{item.text}</span>
                    </p>
                    <p className="text-[0.65rem] text-muted-foreground mt-0.5">{item.time}</p>
                  </div>
                  <button className="p-1.5 rounded-lg transition-all active:scale-90"
                    style={{ color: "hsl(var(--stone-light))" }}>
                    ♡
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
