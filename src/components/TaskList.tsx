import { useState } from "react";
import { tasks as initialTasks, type Task } from "@/lib/data";
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
  const [tasks, setTasks] = useState<Task[]>(initialTasks);

  const toggle = (id: string) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t))
    );
  };

  return (
    <div className="card-soft section-fade-in" style={{ animationDelay: "200ms" }}>
      <h3 className="font-serif text-lg mb-4">Opgaver denne uge</h3>
      <div className="space-y-3">
        {tasks.map((task) => (
          <button
            key={task.id}
            onClick={() => toggle(task.id)}
            className={`w-full flex items-center gap-3 rounded-xl px-4 py-3 text-left transition-all duration-200 active:scale-[0.98] ${
              task.completed
                ? "bg-sage-light/50"
                : "bg-sand-light hover:bg-sand-light/80"
            }`}
          >
            <div
              className={`w-6 h-6 rounded-lg flex items-center justify-center flex-shrink-0 transition-colors duration-200 ${
                task.completed
                  ? "bg-sage text-primary-foreground"
                  : "border-2 border-border"
              }`}
            >
              {task.completed && <Check className="w-3.5 h-3.5" />}
            </div>
            <div className="flex-1 min-w-0">
              <p
                className={`text-sm font-medium transition-opacity ${
                  task.completed ? "opacity-50 line-through" : ""
                }`}
              >
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
        ))}
      </div>
    </div>
  );
}
