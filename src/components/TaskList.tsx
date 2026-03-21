import { useState } from "react";
import { useFamily } from "@/context/FamilyContext";
import { getTasksForPhase, type PhaseTask } from "@/lib/phaseData";
import { Check, User, Users } from "lucide-react";

const assigneeLabel: Record<string, string> = {
  mor: "Mor",
  far: "Far",
  fælles: "Fælles",
};

const assigneeIcon: Record<string, React.ReactNode> = {
  mor: <User className="w-3 h-3" />,
  far: <User className="w-3 h-3" />,
  fælles: <Users className="w-3 h-3" />,
};

export function TaskList() {
  const { profile, currentWeek, babyAgeWeeks } = useFamily();
  const phaseTasks = getTasksForPhase(profile.phase, profile.phase === "pregnant" ? currentWeek : babyAgeWeeks);
  const [completed, setCompleted] = useState<Set<string>>(new Set());

  const toggle = (id: string) => {
    setCompleted((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  return (
    <div className="card-soft section-fade-in" style={{ animationDelay: "200ms" }}>
      <h3 className="font-serif text-lg mb-4">Opgaver denne uge</h3>
      <div className="space-y-3">
        {phaseTasks.map((task) => {
          const done = completed.has(task.id);
          return (
            <button
              key={task.id}
              onClick={() => toggle(task.id)}
              className={`w-full flex items-center gap-3 rounded-xl px-4 py-3 text-left transition-all duration-200 active:scale-[0.98] ${
                done ? "bg-sage-light/50" : "bg-sand-light hover:bg-sand-light/80"
              }`}
            >
              <div
                className={`w-6 h-6 rounded-lg flex items-center justify-center flex-shrink-0 transition-colors duration-200 ${
                  done ? "bg-sage text-primary-foreground" : "border-2 border-border"
                }`}
              >
                {done && <Check className="w-3.5 h-3.5" />}
              </div>
              <div className="flex-1 min-w-0">
                <p className={`text-sm font-medium transition-opacity ${done ? "opacity-50 line-through" : ""}`}>
                  {task.title}
                </p>
              </div>
              <span
                className={`flex items-center gap-1 text-xs px-2 py-0.5 rounded-full ${
                  task.assignee === "mor"
                    ? "bg-clay-light text-clay"
                    : task.assignee === "far"
                    ? "bg-sage-light text-sage"
                    : "bg-sand text-foreground/70"
                }`}
              >
                {assigneeIcon[task.assignee]}
                {assigneeLabel[task.assignee]}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
