import { useState } from "react";
import { useFamily } from "@/context/FamilyContext";
import { useDiary } from "@/context/DiaryContext";
import { Users, TrendingUp, MessageCircle, Moon, ArrowLeftRight } from "lucide-react";
import TaskList from "@/components/TaskList";

export default function SammenPage() {
  const { profile, morName, farName, tasks } = useFamily();
  const { nightShifts, setNightShift, getTonightShift } = useDiary();

  const tonight = getTonightShift();
  const todayStr = new Date().toISOString().slice(0, 10);

  // Generate next 7 days for shift planning
  const next7Days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() + i);
    return d.toISOString().slice(0, 10);
  });

  const morTasksDone = tasks.filter(t => t.completed && t.assignee === "mor").length;
  const farTasksDone = tasks.filter(t => t.completed && t.assignee === "far").length;
  const total = morTasksDone + farTasksDone || 1;

  const dayLabels = ["Søn", "Man", "Tir", "Ons", "Tor", "Fre", "Lør"];

  return (
    <div className="space-y-5">
      <div className="section-fade-in">
        <h1 className="text-[1.9rem] font-normal">Samarbejde</h1>
        <p className="label-upper mt-1">JERES FÆLLES OVERBLIK</p>
      </div>

      {/* Parent cards */}
      <div className="flex gap-2.5 section-fade-in" style={{ animationDelay: "80ms" }}>
        {[
          { name: morName, role: "Mor" as const, bg: "clay" },
          { name: farName, role: "Far" as const, bg: "sage" },
        ].map(p => (
          <div key={p.role} className="flex-1 rounded-2xl p-4 flex items-center gap-3"
            style={{ background: `linear-gradient(135deg, hsl(var(--${p.bg}) / 0.13), hsl(var(--${p.bg}) / 0.06))`, border: `1px solid hsl(var(--${p.bg}) / 0.3)` }}>
            <div className="w-10 h-10 rounded-full flex items-center justify-center text-lg"
              style={{ background: `linear-gradient(135deg, hsl(var(--${p.bg}-light)), hsl(var(--${p.bg})))` }}>
              {p.name?.[0] || "?"}
            </div>
            <div>
              <p className="text-[0.9rem] font-normal">{p.name}</p>
              <p className="text-[0.58rem] tracking-[0.14em] uppercase text-muted-foreground">{p.role}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Night shift planner */}
      {profile.phase !== "pregnant" && (
        <div className="card-soft section-fade-in" style={{ animationDelay: "120ms" }}>
          <div className="flex items-center gap-2 mb-4">
            <Moon className="w-4 h-4" style={{ color: "hsl(var(--sage-dark))" }} />
            <p className="text-[1rem] font-normal">Puttevagter</p>
          </div>

          {/* Tonight highlight */}
          <div className="rounded-2xl p-3 mb-4 flex items-center justify-between"
            style={{ background: tonight ? "hsl(var(--sage-light) / 0.4)" : "hsl(var(--stone-lighter))" }}>
            <div>
              <p className="text-[0.65rem] tracking-[0.14em] uppercase text-muted-foreground">I nat</p>
              <p className="text-[0.95rem] font-medium">{tonight ? (tonight.assignee === "mor" ? morName : farName) : "Ikke planlagt"}</p>
            </div>
            {tonight && (
              <button
                onClick={() => setNightShift(todayStr, tonight.assignee === "mor" ? "far" : "mor")}
                className="flex items-center gap-1 px-3 py-1.5 rounded-full text-[0.68rem] font-medium border transition-all active:scale-95"
                style={{ borderColor: "hsl(var(--sage))", color: "hsl(var(--moss))" }}
              >
                <ArrowLeftRight className="w-3 h-3" /> Byt
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
          </div>
        </div>
      )}

      {/* Balance */}
      <div className="card-soft section-fade-in" style={{ animationDelay: "200ms" }}>
        <div className="flex items-center gap-2 mb-4">
          <TrendingUp className="w-4 h-4 text-moss" />
          <p className="text-[1rem] font-normal">Balance</p>
        </div>
        <p className="text-[0.68rem] text-muted-foreground mb-2">Fuldførte opgaver</p>
        <div className="flex items-center gap-2">
          <span className="text-[0.6rem] tracking-[0.1em] uppercase w-8" style={{ color: "hsl(var(--bark))" }}>Mor</span>
          <div className="flex-1 flex h-3 rounded-full overflow-hidden bg-muted">
            <div className="rounded-l-full transition-all duration-500" style={{ width: `${(morTasksDone / total) * 100}%`, background: "hsl(var(--clay) / 0.7)" }} />
            <div className="rounded-r-full transition-all duration-500" style={{ width: `${(farTasksDone / total) * 100}%`, background: "hsl(var(--sage) / 0.7)" }} />
          </div>
          <span className="text-[0.6rem] tracking-[0.1em] uppercase w-8 text-right" style={{ color: "hsl(var(--sage-dark))" }}>Far</span>
        </div>
        <div className="flex justify-between mt-1.5 text-[0.65rem] text-muted-foreground">
          <span>{morTasksDone} opgaver</span>
          <span>{farTasksDone} opgaver</span>
        </div>
      </div>

      {/* Task list */}
      <div className="section-fade-in" style={{ animationDelay: "280ms" }}>
        <TaskList />
      </div>

      {/* Conversation starters */}
      <div className="card-soft section-fade-in" style={{ animationDelay: "360ms" }}>
        <div className="flex items-center gap-2 mb-3">
          <MessageCircle className="w-4 h-4" style={{ color: "hsl(var(--clay))" }} />
          <p className="text-[1rem] font-normal">Tal om det</p>
        </div>
        <p className="text-[0.82rem] text-muted-foreground leading-relaxed italic">
          "Hvad har du brug for mest fra mig lige nu?"
        </p>
        <p className="text-[0.68rem] text-muted-foreground/60 mt-2">Samtalestart — for at styrke jeres bånd</p>
      </div>

      <div className="h-20 md:h-0" />
    </div>
  );
}
