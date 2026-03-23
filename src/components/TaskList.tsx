import { useState, useRef, useEffect } from "react";
import { useFamily, type TaskAssignee, type TaskRecurrence } from "@/context/FamilyContext";
import { Check, Plus, X, ChevronDown, User, Users, Pencil, Trash2, RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";
import confetti from "canvas-confetti";

const assigneeOptions: { value: TaskAssignee; label: string; icon: React.ReactNode }[] = [
  { value: "mor", label: "Mor", icon: <User className="w-3 h-3" /> },
  { value: "far", label: "Far", icon: <User className="w-3 h-3" /> },
  { value: "fælles", label: "Fælles", icon: <Users className="w-3 h-3" /> },
];

const recurrenceOptions: { value: TaskRecurrence; label: string }[] = [
  { value: "never", label: "Aldrig" },
  { value: "daily", label: "Dagligt" },
  { value: "weekly", label: "Ugentligt" },
  { value: "monthly", label: "Månedligt" },
];

function recurrenceLabel(r: TaskRecurrence) {
  return recurrenceOptions.find(o => o.value === r)?.label || "";
}

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

interface AddTaskInlineProps {
  onAdd: (title: string, assignee: TaskAssignee, recurrence: TaskRecurrence) => void;
  onCancel: () => void;
  morName: string;
  farName: string;
  defaultAssignee: TaskAssignee;
  compact?: boolean;
}

function AddTaskInline({ onAdd, onCancel, morName, farName, defaultAssignee, compact }: AddTaskInlineProps) {
  const [title, setTitle] = useState("");
  const [assignee, setAssignee] = useState<TaskAssignee>(defaultAssignee);
  const [recurrence, setRecurrence] = useState<TaskRecurrence>("never");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleAdd = () => {
    if (title.trim()) {
      onAdd(title.trim(), assignee, recurrence);
      setTitle("");
      setRecurrence("never");
    }
  };

  return (
    <div className={cn(
      "rounded-2xl border border-[hsl(var(--sage))] bg-[hsl(var(--sage-light))]/30 p-3 space-y-2.5",
      compact && "rounded-xl p-2.5 space-y-2"
    )}>
      <input
        ref={inputRef}
        type="text"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && handleAdd()}
        placeholder="Hvad skal gøres?"
        maxLength={100}
        className="w-full bg-background rounded-lg border border-[hsl(var(--stone-light))] px-3 py-2 text-[0.85rem] focus:outline-none focus:border-[hsl(var(--sage))] transition-colors"
      />
      {/* Assignee row */}
      <div className="flex gap-1.5 flex-wrap">
        {assigneeOptions.map((opt) => (
          <button
            key={opt.value}
            onClick={() => setAssignee(opt.value)}
            className={cn(
              "flex items-center gap-1 px-2.5 py-1 rounded-full text-[0.65rem] transition-all active:scale-95",
              assignee === opt.value
                ? "bg-[hsl(var(--moss))] text-white"
                : "bg-[hsl(var(--stone-lighter))] text-foreground/60 hover:bg-[hsl(var(--stone-light))]"
            )}
          >
            {opt.icon}
            {opt.value === "mor" ? morName : opt.value === "far" ? farName : "Fælles"}
          </button>
        ))}
      </div>
      {/* Recurrence row */}
      <div className="flex gap-1.5 flex-wrap">
        {recurrenceOptions.map((opt) => (
          <button
            key={opt.value}
            onClick={() => setRecurrence(opt.value)}
            className={cn(
              "flex items-center gap-1 px-2.5 py-1 rounded-full text-[0.65rem] transition-all active:scale-95",
              recurrence === opt.value
                ? "bg-[hsl(var(--bark))] text-white"
                : "bg-[hsl(var(--stone-lighter))] text-foreground/60 hover:bg-[hsl(var(--stone-light))]"
            )}
          >
            {opt.value !== "never" && <RefreshCw className="w-2.5 h-2.5" />}
            {opt.label}
          </button>
        ))}
      </div>
      {/* Actions */}
      <div className="flex items-center justify-end gap-1.5">
        <button
          onClick={onCancel}
          className="px-3 py-1.5 rounded-lg text-[0.7rem] text-muted-foreground hover:bg-[hsl(var(--stone-lighter))] transition-colors"
        >
          Annullér
        </button>
        <button
          onClick={handleAdd}
          disabled={!title.trim()}
          className={cn(
            "px-3 py-1.5 rounded-lg text-[0.7rem] font-medium transition-all",
            title.trim()
              ? "bg-[hsl(var(--moss))] text-white active:scale-95"
              : "bg-muted text-muted-foreground cursor-not-allowed"
          )}
        >
          Tilføj
        </button>
      </div>
    </div>
  );
}

type FilterTab = "alle" | "mor" | "far" | "fælles" | "afsluttet";

export function TaskList() {
  const { tasks, toggleTask, removeTask, reassignTask, addTask, editTaskTitle, morName, farName, profile } = useFamily();
  const [showAdd, setShowAdd] = useState(false);
  const [inlineAddFilter, setInlineAddFilter] = useState<FilterTab | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editText, setEditText] = useState("");
  const [filter, setFilter] = useState<FilterTab>("alle");

  const pending = tasks.filter((t) => !t.completed);
  const completed = tasks.filter((t) => t.completed);

  const morTasks = pending.filter(t => t.assignee === "mor");
  const farTasks = pending.filter(t => t.assignee === "far");
  const fællesTasks = pending.filter(t => t.assignee === "fælles");

  const filteredTasks = filter === "alle" ? pending
    : filter === "mor" ? morTasks
    : filter === "far" ? farTasks
    : filter === "fælles" ? fællesTasks
    : [];

  const tabs: { key: FilterTab; label: string; count: number }[] = [
    { key: "alle", label: "Alle", count: pending.length },
    { key: "mor", label: morName || "Mor", count: morTasks.length },
    { key: "far", label: farName || "Far", count: farTasks.length },
    { key: "fælles", label: "Fælles", count: fællesTasks.length },
    { key: "afsluttet", label: "Afsluttet", count: completed.length },
  ];

  const handleAdd = (title: string, assignee: TaskAssignee, recurrence: TaskRecurrence) => {
    addTask(title, assignee, recurrence);
    setShowAdd(false);
    setInlineAddFilter(null);
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

  const defaultAssigneeForFilter = (f: FilterTab): TaskAssignee => {
    if (f === "mor") return "mor";
    if (f === "far") return "far";
    if (f === "fælles") return "fælles";
    return profile.role === "mor" ? "mor" : "far";
  };

  const renderTask = (task: typeof tasks[0], isCompleted = false) => (
    <div
      key={task.id}
      className="group flex items-center gap-3 rounded-xl px-3 py-2.5 transition-all hover:bg-[hsl(var(--cream))]"
    >
      <button
        onClick={() => toggleTask(task.id)}
        className={cn(
          "w-5 h-5 rounded-md flex items-center justify-center flex-shrink-0 transition-all active:scale-90",
          isCompleted
            ? "bg-[hsl(var(--sage))]"
            : "border-[1.5px] border-[hsl(var(--stone-light))] hover:border-[hsl(var(--sage))]"
        )}
      >
        {isCompleted && <Check className="w-3 h-3 text-white" />}
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
          <div>
            <p className={cn("text-[0.85rem] leading-snug", isCompleted && "text-muted-foreground line-through")}>
              {task.title}
            </p>
            {task.recurrence && task.recurrence !== "never" && (
              <span className="flex items-center gap-0.5 text-[0.58rem] text-muted-foreground mt-0.5">
                <RefreshCw className="w-2 h-2" />
                {recurrenceLabel(task.recurrence)}
              </span>
            )}
          </div>
        )}
      </div>
      <div className="flex items-center gap-1.5">
        {!isCompleted && (
          <button
            onClick={() => startEdit(task.id, task.title)}
            className="opacity-0 group-hover:opacity-60 transition-opacity p-1 hover:opacity-100"
          >
            <Pencil className="w-3 h-3" />
          </button>
        )}
        <button
          onClick={() => removeTask(task.id)}
          className="opacity-0 group-hover:opacity-60 transition-opacity p-1 hover:opacity-100 hover:text-destructive"
        >
          <Trash2 className="w-3 h-3" />
        </button>
        {!isCompleted && (
          <AssigneeChip
            assignee={task.assignee}
            onReassign={(a) => reassignTask(task.id, a)}
            morName={morName}
            farName={farName}
          />
        )}
      </div>
    </div>
  );

  return (
    <div className="space-y-3">
      {/* Header with add button */}
      <div className="flex items-center justify-between">
        <div /> {/* spacer */}
        <button
          onClick={() => { setShowAdd(!showAdd); setInlineAddFilter(null); }}
          className={cn(
            "flex items-center gap-1.5 px-4 py-2 rounded-xl text-[0.75rem] font-medium transition-all active:scale-95",
            "bg-[hsl(var(--moss))] text-white hover:opacity-90"
          )}
        >
          <Plus className="w-3.5 h-3.5" />
          Tilføj opgave
        </button>
      </div>

      {/* Top-level add task form */}
      {showAdd && (
        <AddTaskInline
          onAdd={handleAdd}
          onCancel={() => setShowAdd(false)}
          morName={morName}
          farName={farName}
          defaultAssignee={defaultAssigneeForFilter("alle")}
        />
      )}

      {/* Filter tabs */}
      <div className="flex gap-1 overflow-x-auto pb-1 -mx-1 px-1 scrollbar-none">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => { setFilter(tab.key); setInlineAddFilter(null); }}
            className={cn(
              "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[0.68rem] tracking-[0.06em] uppercase whitespace-nowrap transition-all active:scale-95",
              filter === tab.key
                ? "bg-foreground text-background font-medium"
                : "text-muted-foreground hover:bg-[hsl(var(--stone-lighter))]"
            )}
          >
            {tab.label}
            <span className={cn(
              "text-[0.6rem] tabular-nums min-w-[1.1rem] text-center rounded-md px-1 py-0.5",
              filter === tab.key ? "bg-background/20" : "bg-[hsl(var(--stone-lighter))]"
            )}>
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      {/* Task list */}
      <div className="card-soft">
        {filter === "afsluttet" ? (
          completed.length > 0 ? (
            <div className="space-y-1">
              {completed.map(t => renderTask(t, true))}
            </div>
          ) : (
            <p className="text-center text-[0.8rem] text-muted-foreground py-6">
              Ingen afsluttede opgaver endnu
            </p>
          )
        ) : (
          <>
            {filteredTasks.length > 0 ? (
              <div className="space-y-1">
                {filteredTasks.map(t => renderTask(t))}
              </div>
            ) : (
              <p className="text-center text-[0.8rem] text-muted-foreground py-6">
                Ingen opgaver i denne kategori ✨
              </p>
            )}
            {/* Inline add for filtered tab */}
            {filter !== "alle" && !inlineAddFilter && (
              <button
                onClick={() => setInlineAddFilter(filter)}
                className="flex items-center gap-1.5 w-full px-3 py-2 text-[0.72rem] text-muted-foreground hover:text-foreground transition-colors rounded-xl hover:bg-[hsl(var(--cream))]"
              >
                <Plus className="w-3 h-3" />
                Tilføj til {tabs.find(t => t.key === filter)?.label}
              </button>
            )}
            {inlineAddFilter && (
              <div className="mt-2">
                <AddTaskInline
                  onAdd={handleAdd}
                  onCancel={() => setInlineAddFilter(null)}
                  morName={morName}
                  farName={farName}
                  defaultAssignee={defaultAssigneeForFilter(filter)}
                  compact
                />
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
