import { useState, useRef, useEffect } from "react";
import { useFamily, type TaskAssignee } from "@/context/FamilyContext";
import { Check, Plus, X, ChevronDown, User, Users, Pencil, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";

const assigneeOptions: { value: TaskAssignee; label: string; icon: React.ReactNode }[] = [
  { value: "mor", label: "Mor", icon: <User className="w-3 h-3" /> },
  { value: "far", label: "Far", icon: <User className="w-3 h-3" /> },
  { value: "fælles", label: "Fælles", icon: <Users className="w-3 h-3" /> },
];

function AssigneeChip({
  assignee,
  onReassign,
  morName,
  farName,
}: {
  assignee: TaskAssignee;
  onReassign: (a: TaskAssignee) => void;
  morName: string;
  farName: string;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const displayName = assignee === "mor" ? morName : assignee === "far" ? farName : "Fælles";

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={(e) => {
          e.stopPropagation();
          setOpen(!open);
        }}
        className={cn(
          "flex items-center gap-1 text-[0.65rem] tracking-[0.06em] px-2.5 py-1 rounded-full transition-all active:scale-95",
          assignee === "mor"
            ? "bg-[hsl(var(--clay-light))] text-[hsl(var(--bark))]"
            : assignee === "far"
            ? "bg-[hsl(var(--sage-light))] text-[hsl(var(--sage-dark))]"
            : "bg-[hsl(var(--stone-lighter))] text-foreground/70"
        )}
      >
        {assignee === "fælles" ? <Users className="w-2.5 h-2.5" /> : <User className="w-2.5 h-2.5" />}
        {displayName}
        <ChevronDown className="w-2.5 h-2.5 opacity-50" />
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-1 z-50 bg-background rounded-xl border border-[hsl(var(--stone-light))] shadow-lg overflow-hidden min-w-[120px]">
          {assigneeOptions.map((opt) => (
            <button
              key={opt.value}
              onClick={(e) => {
                e.stopPropagation();
                onReassign(opt.value);
                setOpen(false);
              }}
              className={cn(
                "w-full flex items-center gap-2 px-3 py-2 text-[0.75rem] text-left transition-colors hover:bg-[hsl(var(--cream))]",
                assignee === opt.value && "bg-[hsl(var(--sage-light))]"
              )}
            >
              {opt.icon}
              <span>{opt.value === "mor" ? morName : opt.value === "far" ? farName : "Fælles"}</span>
              {assignee === opt.value && <Check className="w-3 h-3 ml-auto text-[hsl(var(--moss))]" />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export function TaskList() {
  const { tasks, toggleTask, removeTask, reassignTask, addTask, editTaskTitle, morName, farName, profile } = useFamily();
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [newTaskAssignee, setNewTaskAssignee] = useState<TaskAssignee>(profile.role === "mor" ? "mor" : "far");
  const [showAdd, setShowAdd] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editText, setEditText] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const pending = tasks.filter((t) => !t.completed);
  const completed = tasks.filter((t) => t.completed);

  const handleAdd = () => {
    if (newTaskTitle.trim()) {
      addTask(newTaskTitle.trim(), newTaskAssignee);
      setNewTaskTitle("");
      setShowAdd(false);
    }
  };

  const startEdit = (id: string, title: string) => {
    setEditingId(id);
    setEditText(title);
  };

  const saveEdit = () => {
    if (editingId && editText.trim()) {
      editTaskTitle(editingId, editText.trim());
    }
    setEditingId(null);
    setEditText("");
  };

  useEffect(() => {
    if (showAdd && inputRef.current) inputRef.current.focus();
  }, [showAdd]);

  return (
    <div className="card-soft section-fade-in" style={{ animationDelay: "200ms" }}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-[1rem] font-semibold">Opgaver</h3>
        <button
          onClick={() => setShowAdd(!showAdd)}
          className="flex items-center gap-1 text-[0.65rem] tracking-[0.1em] uppercase transition-all active:scale-95 px-2.5 py-1.5 rounded-full hover:bg-[hsl(var(--cream))]"
          style={{ color: "hsl(var(--moss))" }}
        >
          <Plus className="w-3.5 h-3.5" />
          Tilføj
        </button>
      </div>

      {/* Add task inline */}
      {showAdd && (
        <div className="mb-4 rounded-xl border border-[hsl(var(--sage))] bg-[hsl(var(--sage-light))]/30 p-3 space-y-2.5">
          <input
            ref={inputRef}
            type="text"
            value={newTaskTitle}
            onChange={(e) => setNewTaskTitle(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleAdd()}
            placeholder="Hvad skal gøres?"
            maxLength={100}
            className="w-full bg-background rounded-lg border border-[hsl(var(--stone-light))] px-3 py-2 text-[0.85rem] focus:outline-none focus:border-[hsl(var(--sage))] transition-colors"
          />
          <div className="flex items-center justify-between">
            <div className="flex gap-1.5">
              {assigneeOptions.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => setNewTaskAssignee(opt.value)}
                  className={cn(
                    "flex items-center gap-1 px-2.5 py-1 rounded-full text-[0.65rem] transition-all active:scale-95",
                    newTaskAssignee === opt.value
                      ? "bg-[hsl(var(--moss))] text-white"
                      : "bg-[hsl(var(--stone-lighter))] text-foreground/60 hover:bg-[hsl(var(--stone-light))]"
                  )}
                >
                  {opt.icon}
                  {opt.value === "mor" ? morName : opt.value === "far" ? farName : "Fælles"}
                </button>
              ))}
            </div>
            <div className="flex gap-1.5">
              <button
                onClick={() => setShowAdd(false)}
                className="px-3 py-1.5 rounded-lg text-[0.7rem] text-muted-foreground hover:bg-[hsl(var(--stone-lighter))] transition-colors"
              >
                Annullér
              </button>
              <button
                onClick={handleAdd}
                disabled={!newTaskTitle.trim()}
                className={cn(
                  "px-3 py-1.5 rounded-lg text-[0.7rem] font-medium transition-all",
                  newTaskTitle.trim()
                    ? "bg-[hsl(var(--moss))] text-white active:scale-95"
                    : "bg-muted text-muted-foreground cursor-not-allowed"
                )}
              >
                Tilføj
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Pending tasks */}
      <div className="space-y-1.5">
        {pending.map((task) => (
          <div
            key={task.id}
            className="group flex items-center gap-3 rounded-xl px-3 py-2.5 transition-all hover:bg-[hsl(var(--cream))]"
          >
            <button
              onClick={() => toggleTask(task.id)}
              className="w-5 h-5 rounded-md border-[1.5px] border-[hsl(var(--stone-light))] flex items-center justify-center flex-shrink-0 transition-all hover:border-[hsl(var(--sage))] active:scale-90"
            >
              {/* empty checkbox */}
            </button>
            <div className="flex-1 min-w-0">
              {editingId === task.id ? (
                <input
                  value={editText}
                  onChange={(e) => setEditText(e.target.value)}
                  onBlur={saveEdit}
                  onKeyDown={(e) => e.key === "Enter" && saveEdit()}
                  autoFocus
                  className="w-full bg-transparent text-[0.85rem] focus:outline-none border-b border-[hsl(var(--sage))]"
                />
              ) : (
                <p className="text-[0.85rem] leading-snug">{task.title}</p>
              )}
            </div>
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => startEdit(task.id, task.title)}
                className="opacity-0 group-hover:opacity-60 transition-opacity p-1 hover:opacity-100"
              >
                <Pencil className="w-3 h-3" />
              </button>
              <button
                onClick={() => removeTask(task.id)}
                className="opacity-0 group-hover:opacity-60 transition-opacity p-1 hover:opacity-100 hover:text-destructive"
              >
                <Trash2 className="w-3 h-3" />
              </button>
              <AssigneeChip
                assignee={task.assignee}
                onReassign={(a) => reassignTask(task.id, a)}
                morName={morName}
                farName={farName}
              />
            </div>
          </div>
        ))}
      </div>

      {/* Completed */}
      {completed.length > 0 && (
        <div className="mt-4 pt-3 border-t border-[hsl(var(--stone-lighter))]">
          <p className="text-[0.6rem] tracking-[0.16em] uppercase text-muted-foreground mb-2">
            Færdige ({completed.length})
          </p>
          <div className="space-y-1">
            {completed.map((task) => (
              <div
                key={task.id}
                className="group flex items-center gap-3 rounded-xl px-3 py-2 transition-all hover:bg-[hsl(var(--cream))]"
              >
                <button
                  onClick={() => toggleTask(task.id)}
                  className="w-5 h-5 rounded-md flex items-center justify-center flex-shrink-0 transition-all active:scale-90"
                  style={{ background: "hsl(var(--sage))" }}
                >
                  <Check className="w-3 h-3 text-white" />
                </button>
                <p className="flex-1 text-[0.82rem] text-muted-foreground line-through">{task.title}</p>
                <button
                  onClick={() => removeTask(task.id)}
                  className="opacity-0 group-hover:opacity-60 transition-opacity p-1 hover:opacity-100 hover:text-destructive"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {pending.length === 0 && completed.length === 0 && (
        <p className="text-center text-[0.8rem] text-muted-foreground py-6">
          Ingen opgaver endnu — tilføj den første! ✨
        </p>
      )}
    </div>
  );
}
