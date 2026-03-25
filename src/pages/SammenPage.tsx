import { useState } from "react";
import { Plus } from "lucide-react";
import { useFamily } from "@/context/FamilyContext";
import { useDiary } from "@/context/DiaryContext";
import {
  Users, TrendingUp, MessageCircle, Moon, ArrowLeftRight,
  Heart, Sparkles, Brain, HandHeart, RefreshCw
} from "lucide-react";
import { TaskList } from "@/components/TaskList";
import NærværTips from "@/components/NærværTips";

const conversationStarters = [
  "Hvad har du brug for mest fra mig lige nu?",
  "Hvad var den bedste del af din dag med baby?",
  "Er der noget du gerne ville gøre, men ikke har fået tid til?",
  "Hvordan har du det — helt ærligt?",
  "Hvad kan vi gøre anderledes i morgen?",
  "Hvornår følte du dig sidst afslappet?",
  "Hvad er du mest taknemmelig for ved os som team?",
  "Er der noget der stresser dig, som vi kan løse sammen?",
];


export default function SammenPage() {
  const { profile, morName, farName, tasks } = useFamily();
  const { nightShifts, setNightShift, getTonightShift } = useDiary();

  const tonight = getTonightShift();
  const todayStr = new Date().toISOString().slice(0, 10);

  // Conversation starter rotation
  const [starterIdx, setStarterIdx] = useState(() =>
    Math.floor(Date.now() / (1000 * 60 * 60 * 24)) % conversationStarters.length
  );

  // Weekly check-in state
  

  // Generate next 7 days for shift planning
  const next7Days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() + i);
    return d.toISOString().slice(0, 10);
  });

  // Task balance
  const morPending = tasks.filter(t => !t.completed && t.assignee === "mor").length;
  const farPending = tasks.filter(t => !t.completed && t.assignee === "far").length;
  const morDone = tasks.filter(t => t.completed && t.assignee === "mor").length;
  const farDone = tasks.filter(t => t.completed && t.assignee === "far").length;
  const totalDone = morDone + farDone || 1;
  const totalPending = morPending + farPending || 1;

  // Night shift balance this week
  const morShifts = nightShifts.filter(s => next7Days.includes(s.date) && s.assignee === "mor").length;
  const farShifts = nightShifts.filter(s => next7Days.includes(s.date) && s.assignee === "far").length;

  const dayLabels = ["Søn", "Man", "Tir", "Ons", "Tor", "Fre", "Lør"];

  // "I did it" moment
  const completedToday = tasks.filter(t => {
    if (!t.completed) return false;
    const created = new Date(t.createdAt);
    const now = new Date();
    return created.toDateString() === now.toDateString();
  }).length;

  const [showAddTask, setShowAddTask] = useState(false);

  return (
    <div className="space-y-5">
      <div className="section-fade-in flex items-start justify-between">
        <div>
          <h1 className="text-[1.9rem] font-normal">Samarbejde</h1>
          <p className="label-upper mt-1">JERES FÆLLES OVERBLIK</p>
        </div>
        <button
          onClick={() => setShowAddTask(!showAddTask)}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-[0.72rem] font-medium transition-all active:scale-95 bg-[hsl(var(--moss))] text-white hover:opacity-90 mt-1"
        >
          <Plus className="w-3.5 h-3.5" />
          Tilføj opgave
        </button>
      </div>

      {/* Task list — top priority */}
      <div className="section-fade-in" style={{ animationDelay: "60ms" }}>
        <TaskList externalShowAdd={showAddTask} onExternalShowAddChange={setShowAddTask} />
      </div>

      {/* Parent cards with live stats */}
      <div className="flex gap-2.5 section-fade-in" style={{ animationDelay: "80ms" }}>
        {[
          { name: morName, role: "Mor" as const, bg: "clay", pending: morPending, done: morDone, shifts: morShifts },
          { name: farName, role: "Far" as const, bg: "sage", pending: farPending, done: farDone, shifts: farShifts },
        ].map(p => (
          <div key={p.role} className="flex-1 rounded-2xl p-4"
            style={{
              background: `linear-gradient(135deg, hsl(var(--${p.bg}) / 0.13), hsl(var(--${p.bg}) / 0.06))`,
              border: `1px solid hsl(var(--${p.bg}) / 0.3)`,
            }}>
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-full flex items-center justify-center text-lg"
                style={{ background: `linear-gradient(135deg, hsl(var(--${p.bg}-light)), hsl(var(--${p.bg})))` }}>
                {p.name?.[0] || "?"}
              </div>
              <div>
                <p className="text-[0.9rem] font-normal">{p.name}</p>
                <p className="text-[0.58rem] tracking-[0.14em] uppercase text-muted-foreground">{p.role}</p>
              </div>
            </div>
            <div className="space-y-1.5">
              <div className="flex justify-between text-[0.65rem]">
                <span className="text-muted-foreground">Opgaver at gøre</span>
                <span className="font-medium tabular-nums">{p.pending}</span>
              </div>
              <div className="flex justify-between text-[0.65rem]">
                <span className="text-muted-foreground">Fuldført</span>
                <span className="font-medium tabular-nums">{p.done}</span>
              </div>
              {profile.phase !== "pregnant" && (
                <div className="flex justify-between text-[0.65rem]">
                  <span className="text-muted-foreground">Puttevagter (uge)</span>
                  <span className="font-medium tabular-nums">{p.shifts} denne uge</span>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Team celebration */}
      {completedToday >= 2 && (
        <div className="rounded-2xl p-4 flex items-center gap-3 section-fade-in" style={{
          animationDelay: "100ms",
          background: "linear-gradient(135deg, hsl(var(--sage) / 0.12), hsl(var(--sage) / 0.04))",
          border: "1px solid hsl(var(--sage) / 0.25)",
        }}>
          <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: "hsl(var(--sage-light))" }}>
            <Sparkles className="w-5 h-5" style={{ color: "hsl(var(--moss))" }} />
          </div>
          <div>
            <p className="text-[0.88rem] font-medium">I har klaret {completedToday} opgaver i dag! 🎉</p>
            <p className="text-[0.72rem] text-muted-foreground">Godt teamwork — keep going.</p>
          </div>
        </div>
      )}

      {/* Mental load insight — non-judgmental */}
      <div className="card-soft section-fade-in" style={{ animationDelay: "140ms" }}>
        <div className="flex items-center gap-2 mb-3">
          <Brain className="w-4 h-4" style={{ color: "hsl(var(--clay))" }} />
          <p className="text-[1rem] font-normal">Mental load</p>
        </div>
        <p className="text-[0.75rem] text-muted-foreground leading-relaxed mb-4">
          Det handler ikke om at tælle — men om at forstå, hvem der bærer hvad. Synlighed skaber balance.
        </p>

        {/* Pending balance */}
        <div className="mb-3">
          <p className="text-[0.6rem] tracking-[0.14em] uppercase text-muted-foreground mb-1.5">Ventende opgaver</p>
          <div className="flex items-center gap-2">
            <span className="text-[0.6rem] tracking-[0.1em] uppercase w-10" style={{ color: "hsl(var(--bark))" }}>{morName?.split(" ")[0]}</span>
            <div className="flex-1 flex h-2.5 rounded-full overflow-hidden" style={{ background: "hsl(var(--stone-lighter))" }}>
              <div className="rounded-l-full transition-all duration-700" style={{ width: `${(morPending / totalPending) * 100}%`, background: "hsl(var(--clay) / 0.6)" }} />
              <div className="rounded-r-full transition-all duration-700" style={{ width: `${(farPending / totalPending) * 100}%`, background: "hsl(var(--sage) / 0.6)" }} />
            </div>
            <span className="text-[0.6rem] tracking-[0.1em] uppercase w-10 text-right" style={{ color: "hsl(var(--sage-dark))" }}>{farName?.split(" ")[0]}</span>
          </div>
          <div className="flex justify-between mt-1 text-[0.6rem] text-muted-foreground tabular-nums">
            <span>{morPending}</span>
            <span>{farPending}</span>
          </div>
        </div>

        {/* Completed balance */}
        <div>
          <p className="text-[0.6rem] tracking-[0.14em] uppercase text-muted-foreground mb-1.5">Fuldførte</p>
          <div className="flex items-center gap-2">
            <span className="text-[0.6rem] tracking-[0.1em] uppercase w-10" style={{ color: "hsl(var(--bark))" }}>{morName?.split(" ")[0]}</span>
            <div className="flex-1 flex h-2.5 rounded-full overflow-hidden" style={{ background: "hsl(var(--stone-lighter))" }}>
              <div className="rounded-l-full transition-all duration-700" style={{ width: `${(morDone / totalDone) * 100}%`, background: "hsl(var(--clay) / 0.7)" }} />
              <div className="rounded-r-full transition-all duration-700" style={{ width: `${(farDone / totalDone) * 100}%`, background: "hsl(var(--sage) / 0.7)" }} />
            </div>
            <span className="text-[0.6rem] tracking-[0.1em] uppercase w-10 text-right" style={{ color: "hsl(var(--sage-dark))" }}>{farName?.split(" ")[0]}</span>
          </div>
          <div className="flex justify-between mt-1 text-[0.6rem] text-muted-foreground tabular-nums">
            <span>{morDone}</span>
            <span>{farDone}</span>
          </div>
        </div>

        {/* Suggestion — never blaming */}
        {Math.abs(morPending - farPending) > 3 && (
          <div className="mt-4 rounded-xl p-3 flex items-start gap-2.5" style={{ background: "hsl(var(--sand-light))" }}>
            <HandHeart className="w-4 h-4 mt-0.5 flex-shrink-0" style={{ color: "hsl(var(--clay))" }} />
            <p className="text-[0.75rem] text-muted-foreground leading-relaxed">
              {morPending > farPending
                ? `${morName} har mange opgaver på listen. Måske I kan gennemgå den sammen og omfordele?`
                : `${farName} har mange opgaver på listen. Måske I kan gennemgå den sammen og omfordele?`
              }
            </p>
          </div>
        )}
      </div>

      {/* Night shift planner */}
      {profile.phase !== "pregnant" && (
        <div className="card-soft section-fade-in" style={{ animationDelay: "180ms" }}>
          <div className="flex items-center gap-2 mb-2">
            <Moon className="w-4 h-4" style={{ color: "hsl(var(--sage-dark))" }} />
            <p className="text-[1rem] font-normal">Puttevagter</p>
          </div>
          <p className="text-[0.72rem] text-muted-foreground mb-4 leading-relaxed">
            Putning handler om at lægge {profile.children?.[0]?.name || "baby"} i seng — nærhed, ro og en fast rutine. 
            Begge forældre kan putte — det kræver ikke amning, men tilstedeværelse. 🌙
          </p>

          {/* Tonight highlight */}
          <div className="rounded-2xl p-3 mb-4 flex items-center justify-between"
            style={{ background: tonight ? "hsl(var(--sage-light) / 0.4)" : "hsl(var(--stone-lighter))" }}>
            <div>
              <p className="text-[0.65rem] tracking-[0.14em] uppercase text-muted-foreground">I aften</p>
              <p className="text-[0.95rem] font-medium">{tonight ? (tonight.assignee === "mor" ? morName : farName) : "Ikke planlagt"}</p>
            </div>
            {tonight ? (
              <button
                onClick={() => setNightShift(todayStr, tonight.assignee === "mor" ? "far" : "mor")}
                className="flex items-center gap-1 px-3 py-1.5 rounded-full text-[0.68rem] font-medium border transition-all active:scale-95"
                style={{ borderColor: "hsl(var(--sage))", color: "hsl(var(--moss))" }}
              >
                <ArrowLeftRight className="w-3 h-3" /> Byt
              </button>
            ) : (
              <button
                onClick={() => setNightShift(todayStr, "mor")}
                className="flex items-center gap-1 px-3 py-1.5 rounded-full text-[0.68rem] font-medium transition-all active:scale-95"
                style={{ background: "hsl(var(--moss))", color: "white" }}
              >
                Planlæg
              </button>
            )}
          </div>

          {/* Week grid */}
          <div className="grid grid-cols-7 gap-1">
            {next7Days.map((dateStr, i) => {
              const d = new Date(dateStr);
              const dayName = dayLabels[d.getDay()];
              const shift = nightShifts.find(s => s.date === dateStr);
              const isToday = i === 0;
              return (
                <div key={dateStr} className="text-center">
                  <p className={`text-[0.55rem] tracking-[0.1em] uppercase mb-1 ${isToday ? "font-bold" : "text-muted-foreground"}`}>
                    {dayName}
                  </p>
                  <button
                    onClick={() => setNightShift(dateStr, shift?.assignee === "mor" ? "far" : "mor")}
                    className={`w-full aspect-square rounded-xl text-[0.65rem] font-medium transition-all active:scale-95 border ${
                      shift?.assignee === "mor"
                        ? "bg-[hsl(var(--clay-light))] border-[hsl(var(--clay))] text-[hsl(var(--bark))]"
                        : shift?.assignee === "far"
                        ? "bg-[hsl(var(--sage-light))] border-[hsl(var(--sage))] text-[hsl(var(--sage-dark))]"
                        : "bg-background border-[hsl(var(--stone-lighter))] text-muted-foreground"
                    }`}
                  >
                    {shift ? (shift.assignee === "mor" ? "M" : "F") : "—"}
                  </button>
                  <p className="text-[0.5rem] text-muted-foreground mt-0.5">{d.getDate()}</p>
                </div>
              );
            })}
          </div>
          <div className="flex items-center gap-4 mt-3 text-[0.6rem] text-muted-foreground">
            <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded" style={{ background: "hsl(var(--clay-light))" }} /> {morName}</span>
            <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded" style={{ background: "hsl(var(--sage-light))" }} /> {farName}</span>
            <span className="ml-auto text-[0.55rem]">{morShifts}M · {farShifts}F denne uge</span>
          </div>
        </div>
      )}

      {/* Nærvær i hverdagen */}
      <NærværTips />


      <div className="card-soft section-fade-in" style={{ animationDelay: "380ms" }}>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <MessageCircle className="w-4 h-4" style={{ color: "hsl(var(--clay))" }} />
            <p className="text-[1rem] font-normal">Tal om det</p>
          </div>
          <button
            onClick={() => setStarterIdx((starterIdx + 1) % conversationStarters.length)}
            className="p-1.5 rounded-lg hover:bg-[hsl(var(--cream))] transition-colors active:scale-90"
          >
            <RefreshCw className="w-3.5 h-3.5 text-muted-foreground" />
          </button>
        </div>
        <div className="rounded-xl p-4" style={{ background: "hsl(var(--sand-light))" }}>
          <p className="text-[0.88rem] leading-relaxed italic">
            "{conversationStarters[starterIdx]}"
          </p>
        </div>
        <p className="text-[0.62rem] text-muted-foreground/60 mt-2 text-center">
          Samtalestart — for at styrke jeres bånd 💛
        </p>
      </div>

      <div className="h-20 md:h-0" />
    </div>
  );
}
