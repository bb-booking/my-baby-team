import { useState } from "react";
import { useFamily } from "@/context/FamilyContext";
import { Check, ChevronDown, ChevronUp, Plus, X, List, LayoutGrid } from "lucide-react";
import { cn } from "@/lib/utils";
import confetti from "canvas-confetti";
import { getHealthSuggestions } from "@/lib/phaseData";

const TASK_CATEGORY_CONFIG: Record<string, { label: string; emoji: string; bg: string }> = {
  health:       { label: "Helbred",      emoji: "🏥", bg: "hsl(var(--sage-light))"   },
  preparation:  { label: "Forberedelse", emoji: "📦", bg: "hsl(var(--clay-light))"   },
  admin:        { label: "Planlægning",  emoji: "📅", bg: "hsl(var(--sand-light))"   },
  relationship: { label: "Relation",     emoji: "💌", bg: "hsl(var(--clay-light))"   },
  custom:       { label: "Opgave",       emoji: "✅", bg: "hsl(var(--stone-lighter))" },
};

function fireConfetti() {
  confetti({ particleCount: 40, spread: 50, origin: { y: 0.7 }, colors: ["#5a7a50", "#c4a97d", "#8fae7e", "#d4c4a8"], scalar: 0.7, gravity: 1.2 });
}

// ── Tasks section (list + category view) ──────────────────────────────────────
function TasksSection() {
  const { tasks, toggleTask, morName, farName } = useFamily();
  const [view, setView] = useState<"liste" | "kategorier">("liste");
  const [openCat, setOpenCat] = useState<string | null>(null);

  const activeTasks = tasks.filter(t => !t.completed);
  const completedTasks = tasks.filter(t => t.completed);

  // Group by category
  const grouped: Record<string, typeof tasks> = {};
  activeTasks.forEach(t => {
    const key = t.category || "custom";
    if (!grouped[key]) grouped[key] = [];
    grouped[key].push(t);
  });

  const handleToggle = (id: string) => {
    const task = tasks.find(t => t.id === id);
    if (task && !task.completed) fireConfetti();
    toggleTask(id);
  };

  const TaskRow = ({ task }: { task: typeof tasks[0] }) => {
    const isFelles = task.assignee === "fælles";
    const ownerName = isFelles ? "Fælles" : task.assignee === "mor" ? morName : farName;
    const cat = TASK_CATEGORY_CONFIG[task.category] || TASK_CATEGORY_CONFIG.custom;
    return (
      <div className={cn("flex items-center gap-3 px-4 py-3.5 transition-all", task.completed && "opacity-50")}>
        <button
          onClick={() => handleToggle(task.id)}
          className={cn("w-5 h-5 rounded flex items-center justify-center flex-shrink-0 transition-all active:scale-90 border-[1.5px]",
            task.completed ? "bg-[hsl(var(--moss))] border-[hsl(var(--moss))]" : "border-[hsl(var(--stone-light))] bg-background"
          )}
        >
          {task.completed && <Check className="w-3 h-3 text-white" />}
        </button>
        <div className="w-8 h-8 rounded-full flex items-center justify-center text-base flex-shrink-0" style={{ background: cat.bg }}>
          {cat.emoji}
        </div>
        <div className="flex-1 min-w-0">
          <p className={cn("text-[0.85rem] font-medium truncate", task.completed && "line-through text-muted-foreground")}>{task.title}</p>
          <p className="text-[0.65rem] text-muted-foreground">{ownerName}</p>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-4">
      {/* Toggle */}
      <div className="flex items-center gap-2">
        <div className="flex p-1 rounded-xl gap-1" style={{ background: "hsl(var(--stone-lighter))" }}>
          <button
            onClick={() => setView("liste")}
            className={cn("flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[0.72rem] font-medium transition-all", view === "liste" ? "bg-background shadow-sm" : "text-muted-foreground")}
          >
            <List className="w-3.5 h-3.5" /> Liste
          </button>
          <button
            onClick={() => setView("kategorier")}
            className={cn("flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[0.72rem] font-medium transition-all", view === "kategorier" ? "bg-background shadow-sm" : "text-muted-foreground")}
          >
            <LayoutGrid className="w-3.5 h-3.5" /> Kategorier
          </button>
        </div>
        <span className="text-[0.68rem] text-muted-foreground ml-auto">{activeTasks.length} aktive · {completedTasks.length} færdige</span>
      </div>

      {activeTasks.length === 0 && (
        <div className="text-center py-10 rounded-2xl" style={{ background: "hsl(var(--warm-white))", border: "1px solid hsl(var(--stone-light))" }}>
          <p className="text-2xl mb-2">🌿</p>
          <p className="text-[0.82rem] text-muted-foreground">Ingen aktive opgaver</p>
        </div>
      )}

      {view === "liste" && activeTasks.length > 0 && (
        <div className="rounded-2xl overflow-hidden" style={{ background: "hsl(var(--warm-white))", border: "1px solid hsl(var(--stone-light))" }}>
          <div className="divide-y" style={{ borderColor: "hsl(var(--stone-lighter))" }}>
            {activeTasks.map(task => <TaskRow key={task.id} task={task} />)}
          </div>
          {completedTasks.length > 0 && (
            <div className="divide-y border-t" style={{ borderColor: "hsl(var(--stone-lighter))" }}>
              <div className="px-4 py-2.5" style={{ background: "hsl(var(--stone-lighter))" }}>
                <p className="text-[0.62rem] tracking-[0.14em] uppercase text-muted-foreground">Færdige ({completedTasks.length})</p>
              </div>
              {completedTasks.map(task => <TaskRow key={task.id} task={task} />)}
            </div>
          )}
        </div>
      )}

      {view === "kategorier" && activeTasks.length > 0 && (
        <div className="space-y-2">
          {Object.entries(grouped).map(([catKey, catTasks]) => {
            const cat = TASK_CATEGORY_CONFIG[catKey] || TASK_CATEGORY_CONFIG.custom;
            const done = catTasks.filter(t => t.completed).length;
            const isOpen = openCat === catKey;
            return (
              <div key={catKey} className="rounded-2xl overflow-hidden" style={{ background: "hsl(var(--warm-white))", border: "1px solid hsl(var(--stone-light))" }}>
                <button
                  onClick={() => setOpenCat(isOpen ? null : catKey)}
                  className="w-full flex items-center gap-3 px-4 py-3.5 transition-all active:bg-[hsl(var(--stone-lighter))]"
                >
                  <div className="w-9 h-9 rounded-full flex items-center justify-center text-base flex-shrink-0" style={{ background: cat.bg }}>
                    {cat.emoji}
                  </div>
                  <div className="flex-1 text-left">
                    <p className="text-[0.88rem] font-semibold">{cat.label}</p>
                    <p className="text-[0.65rem] text-muted-foreground">{catTasks.length} opgaver</p>
                  </div>
                  {isOpen ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
                </button>
                {isOpen && (
                  <div className="divide-y border-t" style={{ borderColor: "hsl(var(--stone-lighter))" }}>
                    {catTasks.map(task => <TaskRow key={task.id} task={task} />)}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

interface CustomItem {
  id: string;
  title: string;
  category: string;
  phase: Phase;
  assignee: "mor" | "far" | "fælles";
}

const CUSTOM_KEY = "lille-checklist-custom";

function CircularProgress({ pct, size = 52 }: { pct: number; size?: number }) {
  const r = (size - 8) / 2;
  const circumference = 2 * Math.PI * r;
  const dash = circumference * Math.min(pct, 1);
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ transform: "rotate(-90deg)" }}>
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="hsl(var(--stone-lighter))" strokeWidth="4" />
      <circle cx={size / 2} cy={size / 2} r={r} fill="none"
        stroke={pct >= 1 ? "hsl(var(--sage))" : "hsl(var(--clay))"}
        strokeWidth="4"
        strokeDasharray={`${dash} ${circumference}`}
        strokeLinecap="round"
        style={{ transition: "stroke-dasharray 0.5s ease" }}
      />
    </svg>
  );
}

type Priority = "nødvendig" | "valgfri";
type Phase = "before" | "after";

interface ChecklistItem {
  id: string;
  title: string;
  hint: string;
  priority: Priority;
  phase: Phase;
  category: string;
  emoji: string;
}

const CHECKLIST_ITEMS: ChecklistItem[] = [
  // ── INDEN FØDSLEN ──
  { id: "b1", title: "Barneseng", hint: "Skal have inden hjemsendelse fra hospital", priority: "nødvendig", phase: "before", category: "Søvn & hvile", emoji: "🌙" },
  { id: "b2", title: "Madras til barneseng", hint: "Fast og flad uden huller — sikkerhedskrav", priority: "nødvendig", phase: "before", category: "Søvn & hvile", emoji: "🌙" },
  { id: "b3", title: "Sovepose 0–6 mdr.", hint: "TOG 1.0 sommer · TOG 2.5 vinter — sikrere end dyne", priority: "nødvendig", phase: "before", category: "Søvn & hvile", emoji: "🌙" },
  { id: "b4", title: "Babylydovervågning", hint: "Moonboon synkroniserer automatisk med Lille", priority: "nødvendig", phase: "before", category: "Søvn & hvile", emoji: "🌙" },
  { id: "b5", title: "White noise maskine", hint: "34% færre opvågninger — meget effektivt", priority: "valgfri", phase: "before", category: "Søvn & hvile", emoji: "🌙" },

  { id: "b6", title: "Klapvogn", hint: "Den vigtigste investering — vælg én I er glade for i årevis", priority: "nødvendig", phase: "before", category: "Klapvogn & transport", emoji: "🚗" },
  { id: "b7", title: "Autostol gruppe 0+ (0–13 kg)", hint: "⚠️ Lovpligtigt — skal have inden hjemsendelse fra hospital", priority: "nødvendig", phase: "before", category: "Klapvogn & transport", emoji: "🚗" },
  { id: "b8", title: "Bæresele / bærebinde", hint: "Frigiver hænder · giver baby ro · fantastisk til far", priority: "valgfri", phase: "before", category: "Klapvogn & transport", emoji: "🚗" },
  { id: "b9", title: "Regnslag til klapvogn", hint: "Danmark — du ved det godt", priority: "valgfri", phase: "before", category: "Klapvogn & transport", emoji: "🚗" },

  { id: "b10", title: "Puslebord / pusleplads", hint: "Hold altid én hånd på barnet", priority: "nødvendig", phase: "before", category: "Bleer & pusle", emoji: "🧷" },
  { id: "b11", title: "Bleer str. 1–2 (newborn + næste)", hint: "Abonnement anbefales — aldrig løbe tør", priority: "nødvendig", phase: "before", category: "Bleer & pusle", emoji: "🧷" },
  { id: "b12", title: "Vådservietter parfumefri", hint: "Hav rigeligt — bruges til alt", priority: "nødvendig", phase: "before", category: "Bleer & pusle", emoji: "🧷" },
  { id: "b13", title: "Pusleunderlag (kan vaskes)", hint: "Hav mindst 2 — de bliver hurtigt snavsede", priority: "nødvendig", phase: "before", category: "Bleer & pusle", emoji: "🧷" },

  { id: "b14", title: "Babybadekar", hint: "Brug altid badetermometer — 37°C er ideelt", priority: "nødvendig", phase: "before", category: "Bad & pleje", emoji: "🛁" },
  { id: "b15", title: "Badetermometer", hint: "Plastikduk er ikke præcis nok", priority: "nødvendig", phase: "before", category: "Bad & pleje", emoji: "🛁" },
  { id: "b16", title: "Parfumefri babysæbe & shampoo", hint: "Babyens hud er meget sensitiv de første måneder", priority: "nødvendig", phase: "before", category: "Bad & pleje", emoji: "🛁" },
  { id: "b17", title: "Neglesaks til baby", hint: "Afrundede spidser — klip mens de sover", priority: "nødvendig", phase: "before", category: "Bad & pleje", emoji: "🛁" },
  { id: "b18", title: "Babycreme til tørhud", hint: "Mange babyer behøver det ikke — godt at have", priority: "valgfri", phase: "before", category: "Bad & pleje", emoji: "🛁" },

  { id: "b19", title: "Bodyer str. 50–56 (5–7 stk.)", hint: "Snaps i skridtet — nemmest. Vask inden brug.", priority: "nødvendig", phase: "before", category: "Tøj", emoji: "👕" },
  { id: "b20", title: "Sparkebukser & flyverdragter str. 56+62", hint: "De vokser hurtigt — køb ikke for mange i str. 50", priority: "nødvendig", phase: "before", category: "Tøj", emoji: "👕" },
  { id: "b21", title: "Hue & vanter", hint: "Babyer regulerer kropstemperatur dårligt de første måneder", priority: "nødvendig", phase: "before", category: "Tøj", emoji: "👕" },

  { id: "b22", title: "Nipplecreme", hint: "Start fra dag 1 — forebygger sår markant", priority: "nødvendig", phase: "before", category: "Ernæring & amning", emoji: "🍼" },
  { id: "b23", title: "Amningspude", hint: "Aflaster nakke og arme markant", priority: "valgfri", phase: "before", category: "Ernæring & amning", emoji: "🍼" },
  { id: "b24", title: "Brystpumpe", hint: "Kun relevant hvis du planlægger at pumpe", priority: "valgfri", phase: "before", category: "Ernæring & amning", emoji: "🍼" },
  { id: "b25", title: "Sutteflasker × 2", hint: "Nyttigt selv ved amning til pumpet mælk", priority: "valgfri", phase: "before", category: "Ernæring & amning", emoji: "🍼" },

  { id: "b26", title: "Hospitalspose pakket", hint: "Tøj, snacks, lader, sundhedskort, forsikringsbevis", priority: "nødvendig", phase: "before", category: "Praktisk & vigtigt", emoji: "📋" },
  { id: "b27", title: "Barselsdagpenge ansøgt", hint: "NemRefusion / borger.dk — tidligst 8 uger før termin", priority: "nødvendig", phase: "before", category: "Praktisk & vigtigt", emoji: "📋" },
  { id: "b28", title: "Navngivning (inden 15 dage efter fødsel)", hint: "borger.dk — kan gøres direkte fra telefonen", priority: "nødvendig", phase: "before", category: "Praktisk & vigtigt", emoji: "📋" },

  // ── NÅR BABY ER KOMMET ──
  { id: "a1", title: "D-vitamin dråber", hint: "Sundhedsstyrelsen anbefaler fra dag 1", priority: "nødvendig", phase: "after", category: "Første uger", emoji: "🌿" },
  { id: "a2", title: "Bekræft sundhedsplejerske-besøg", hint: "Sker automatisk — ring og bekræft tidspunkt", priority: "nødvendig", phase: "after", category: "Første uger", emoji: "🌿" },
  { id: "a3", title: "PKU-blodprøve & hørescreening", hint: "Tages på hospitalet — bekræft at det er sket", priority: "nødvendig", phase: "after", category: "Første uger", emoji: "🌿" },

  { id: "a4", title: "4 mdr. lægetjek booket", hint: "Anbefales uge 16–17 — book tidligt, det fyldes hurtigt", priority: "nødvendig", phase: "after", category: "3–6 måneder", emoji: "📅" },
  { id: "a5", title: "Vaccinationer planlagt", hint: "MFR 1 ved 5 mdr. — Sundhedsstyrelsen.dk", priority: "nødvendig", phase: "after", category: "3–6 måneder", emoji: "📅" },
  { id: "a6", title: "Bleer str. 3 klar", hint: "Skift typisk ved ca. 6–7 kg — lad Lille minde dig", priority: "nødvendig", phase: "after", category: "3–6 måneder", emoji: "📅" },
  { id: "a7", title: "Tummy time dagligt (5 min × 3)", hint: "Fundamentalt for motorisk udvikling — start nu", priority: "nødvendig", phase: "after", category: "3–6 måneder", emoji: "📅" },

  { id: "a8", title: "Højstol", hint: "Bruges dagligt i årevis — invester klogt", priority: "nødvendig", phase: "after", category: "Fast føde (fra ca. 6 mdr.)", emoji: "🍽️" },
  { id: "a9", title: "Babymad bestik silikone", hint: "Bløde kanter — vigtig for gummer og tænder", priority: "valgfri", phase: "after", category: "Fast føde (fra ca. 6 mdr.)", emoji: "🍽️" },
  { id: "a10", title: "Silikone hagesmæk med lomme", hint: "Nem at gøre ren — undgå stof til mad", priority: "valgfri", phase: "after", category: "Fast føde (fra ca. 6 mdr.)", emoji: "🍽️" },

  { id: "a11", title: "Bækkenbund genoptræning", hint: "Specialiseret fysioterapeut — vigtigt efter fødsel, også uden symptomer", priority: "nødvendig", phase: "after", category: "For jer som forældre", emoji: "❤️" },
  { id: "a12", title: "Barselgruppe", hint: "Sociale bånd der holder — vigtig for begge forældre", priority: "valgfri", phase: "after", category: "For jer som forældre", emoji: "❤️" },
  { id: "a13", title: "Dato-aften planlagt", hint: "Start fra 2–3 måneder — vigtigt for parforholdet", priority: "valgfri", phase: "after", category: "For jer som forældre", emoji: "❤️" },
];

const STORAGE_KEY = "lille-checklist";

function useChecklist() {
  const [checked, setChecked] = useState<string[]>(() => {
    try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]"); } catch { return []; }
  });
  const [customItems, setCustomItems] = useState<CustomItem[]>(() => {
    try { return JSON.parse(localStorage.getItem(CUSTOM_KEY) || "[]"); } catch { return []; }
  });

  const toggle = (id: string) => {
    setChecked(prev => {
      const next = prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id];
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      if (!prev.includes(id)) {
        confetti({ particleCount: 40, spread: 50, origin: { y: 0.7 }, colors: ["#5a7a50", "#c4a97d", "#8fae7e", "#d4c4a8"], scalar: 0.7, gravity: 1.2 });
      }
      return next;
    });
  };

  const addCustom = (item: Omit<CustomItem, "id">) => {
    const newItem = { ...item, id: `custom-${Date.now()}` };
    setCustomItems(prev => {
      const next = [...prev, newItem];
      localStorage.setItem(CUSTOM_KEY, JSON.stringify(next));
      return next;
    });
  };

  const removeCustom = (id: string) => {
    setCustomItems(prev => {
      const next = prev.filter(i => i.id !== id);
      localStorage.setItem(CUSTOM_KEY, JSON.stringify(next));
      return next;
    });
    setChecked(prev => {
      const next = prev.filter(x => x !== id);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      return next;
    });
  };

  return { checked, toggle, customItems, addCustom, removeCustom };
}

export default function TjeklistePage() {
  const { profile } = useFamily();
  const { checked, toggle, customItems, addCustom, removeCustom } = useChecklist();
  const [mainTab, setMainTab] = useState<"opgaver" | "forberedelse">("opgaver");
  const [phase, setPhase] = useState<Phase>("before");
  const [selectedCat, setSelectedCat] = useState<string | null>(null);
  const [addingTo, setAddingTo] = useState<string | null>(null);
  const [newTitle, setNewTitle] = useState("");
  const [newAssignee, setNewAssignee] = useState<"mor" | "far" | "fælles">("fælles");
  const morName = profile.parentName || "Mor";
  const farName = profile.partnerName || "Far";

  const items = CHECKLIST_ITEMS.filter(i => i.phase === phase);
  const phaseCustom = customItems.filter(i => i.phase === phase);

  // Group by category (static + custom)
  const categories: { name: string; emoji: string; items: (ChecklistItem | CustomItem & { hint?: string; priority?: Priority })[]; } [] = [];
  items.forEach(item => {
    const existing = categories.find(c => c.name === item.category);
    if (existing) existing.items.push(item);
    else categories.push({ name: item.category, emoji: item.emoji, items: [item] });
  });
  phaseCustom.forEach(item => {
    const existing = categories.find(c => c.name === item.category);
    if (existing) existing.items.push(item);
  });

  const allIds = [...items.map(i => i.id), ...phaseCustom.map(i => i.id)];
  const checkedInPhase = allIds.filter(id => checked.includes(id)).length;
  const pct = allIds.length > 0 ? Math.round((checkedInPhase / allIds.length) * 100) : 0;

  const handleAddItem = (catName: string) => {
    if (!newTitle.trim()) return;
    addCustom({ title: newTitle.trim(), category: catName, phase, assignee: newAssignee });
    setNewTitle("");
    setAddingTo(null);
  };

  // Group categories into rows of 2 for inline expansion
  const rows: typeof categories[] = [];
  for (let i = 0; i < categories.length; i += 2) rows.push(categories.slice(i, i + 2));

  return (
    <div className="space-y-5">
      <div className="section-fade-in">
        <h1 className="text-[1.9rem] font-normal">Tjekliste</h1>
        <p className="label-upper mt-1">FORBERED JER TIL BABYEN</p>
      </div>

      {/* Main tab switcher */}
      <div className="section-fade-in flex p-1 rounded-xl gap-1" style={{ background: "hsl(var(--stone-lighter))", animationDelay: "20ms" }}>
        <button
          onClick={() => setMainTab("opgaver")}
          className={cn("flex-1 py-2 rounded-lg text-[0.72rem] font-medium transition-all", mainTab === "opgaver" ? "bg-background shadow-sm" : "text-muted-foreground")}
        >
          Opgaver
        </button>
        <button
          onClick={() => setMainTab("forberedelse")}
          className={cn("flex-1 py-2 rounded-lg text-[0.72rem] font-medium transition-all", mainTab === "forberedelse" ? "bg-background shadow-sm" : "text-muted-foreground")}
        >
          Forberedelse
        </button>
      </div>

      {mainTab === "opgaver" && <TasksSection />}

      {mainTab === "forberedelse" && <>

      {/* Phase tabs */}
      <div className="section-fade-in flex gap-0" style={{ animationDelay: "40ms" }}>
        <button
          onClick={() => setPhase("before")}
          className={cn(
            "flex-1 py-2.5 text-[0.72rem] tracking-[0.1em] uppercase font-medium border-b-2 transition-all",
            phase === "before"
              ? "border-b-[hsl(var(--sage))] text-foreground"
              : "border-b-transparent text-muted-foreground hover:text-foreground"
          )}
        >
          Inden fødslen
        </button>
        <button
          onClick={() => setPhase("after")}
          className={cn(
            "flex-1 py-2.5 text-[0.72rem] tracking-[0.1em] uppercase font-medium border-b-2 transition-all",
            phase === "after"
              ? "border-b-[hsl(var(--sage))] text-foreground"
              : "border-b-transparent text-muted-foreground hover:text-foreground"
          )}
        >
          Når baby er kommet
        </button>
      </div>

      {/* Progress */}
      <div className="section-fade-in space-y-2" style={{ animationDelay: "60ms" }}>
        <div className="flex items-center justify-between text-[0.72rem] text-muted-foreground">
          <span>{checkedInPhase} af {allIds.length} punkter klar</span>
          <span className="font-medium">{pct}%</span>
        </div>
        <div className="h-1.5 rounded-full overflow-hidden" style={{ background: "hsl(var(--stone-lighter))" }}>
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{ width: `${pct}%`, background: "hsl(var(--sage))" }}
          />
        </div>
      </div>

      {/* Health visit suggestions (after birth only) */}
      {phase === "after" && profile.phase !== "pregnant" && <HealthSuggestions />}

      {/* Category grid — rows of 2 with inline expansion */}
      <div className="space-y-3 section-fade-in" style={{ animationDelay: "100ms" }}>
        {rows.map((row, rowIdx) => {
          const openCat = row.find(c => c.name === selectedCat) ?? null;
          return (
            <div key={rowIdx} className="space-y-3">
              {/* Row of 2 cards */}
              <div className="grid grid-cols-2 gap-3">
                {row.map(cat => {
                  const catChecked = cat.items.filter(i => checked.includes(i.id)).length;
                  const catPct = cat.items.length > 0 ? catChecked / cat.items.length : 0;
                  const isComplete = catChecked === cat.items.length && cat.items.length > 0;
                  const isOpen = selectedCat === cat.name;
                  return (
                    <button key={cat.name}
                      onClick={() => { setSelectedCat(isOpen ? null : cat.name); setAddingTo(null); }}
                      className="relative rounded-2xl p-4 flex flex-col items-center gap-2 transition-all active:scale-[0.97]"
                      style={{
                        background: isComplete ? "hsl(var(--sage-light))" : isOpen ? "hsl(var(--cream))" : "hsl(var(--warm-white))",
                        border: `1.5px solid ${isComplete ? "hsl(var(--sage))" : isOpen ? "hsl(var(--clay-light))" : "hsl(var(--stone-light))"}`,
                      }}>
                      {isComplete && (
                        <span className="absolute top-2 right-2 w-5 h-5 rounded-full flex items-center justify-center" style={{ background: "hsl(var(--sage))" }}>
                          <Check className="w-3 h-3 text-white" />
                        </span>
                      )}
                      <div className="relative">
                        <CircularProgress pct={catPct} size={52} />
                        <span className="absolute inset-0 flex items-center justify-center text-lg">{cat.emoji}</span>
                      </div>
                      <p className="text-[0.72rem] font-semibold text-center leading-tight">{cat.name}</p>
                      <p className="text-[0.6rem] text-muted-foreground">{catChecked}/{cat.items.length}</p>
                      {isOpen ? <ChevronUp className="w-3.5 h-3.5 text-muted-foreground" /> : <ChevronDown className="w-3.5 h-3.5 text-muted-foreground" />}
                    </button>
                  );
                })}
                {/* Empty cell if odd number of cats */}
                {row.length === 1 && <div />}
              </div>

              {/* Inline expanded list — appears directly below this row */}
              {openCat && (
                <div className="rounded-2xl border border-[hsl(var(--stone-lighter))] overflow-hidden">
                  <div className="px-4 py-3 border-b border-[hsl(var(--stone-lighter))]" style={{ background: "hsl(var(--cream))" }}>
                    <p className="text-[0.78rem] font-semibold">{openCat.emoji} {openCat.name}</p>
                  </div>

                  {openCat.items.map((item, i) => {
                    const isDone = checked.includes(item.id);
                    const isCustom = item.id.startsWith("custom-");
                    const assignee = (item as CustomItem).assignee;
                    const assigneeLabel = assignee === "mor" ? morName : assignee === "far" ? farName : null;
                    return (
                      <div key={item.id}
                        className={cn("flex items-center gap-3 px-4 py-3.5 transition-all",
                          i > 0 && "border-t border-[hsl(var(--stone-lighter))]",
                          isDone ? "bg-[hsl(var(--sage-light))]/30" : "bg-background"
                        )}>
                        <button onClick={() => toggle(item.id)}
                          className={cn("w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 transition-all active:scale-90 border-[1.5px]",
                            isDone ? "bg-[hsl(var(--moss))] border-[hsl(var(--moss))]" : "border-[hsl(var(--stone-light))]"
                          )}>
                          {isDone && <Check className="w-3.5 h-3.5 text-white" />}
                        </button>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className={cn("text-[0.85rem]", isDone && "line-through text-muted-foreground")}>{item.title}</span>
                            {assigneeLabel && (
                              <span className="text-[0.55rem] tracking-[0.08em] uppercase px-2 py-0.5 rounded-full font-medium"
                                style={{ background: assignee === "mor" ? "hsl(var(--clay-light))" : "hsl(var(--sage-light))", color: assignee === "mor" ? "hsl(var(--bark))" : "hsl(var(--sage-dark))" }}>
                                {assigneeLabel}
                              </span>
                            )}
                            {!isCustom && (item as ChecklistItem).priority === "nødvendig" && (
                              <span className="text-[0.55rem] tracking-[0.1em] uppercase px-2 py-0.5 rounded-full font-medium bg-[hsl(var(--clay-light))] text-[hsl(var(--bark))]">
                                vigtig
                              </span>
                            )}
                          </div>
                          {!isCustom && (item as ChecklistItem).hint && (
                            <p className={cn("text-[0.72rem] text-muted-foreground mt-0.5 leading-snug", isDone && "line-through")}>
                              {(item as ChecklistItem).hint}
                            </p>
                          )}
                        </div>
                        {isCustom && (
                          <button onClick={() => removeCustom(item.id)} className="text-muted-foreground/40 hover:text-muted-foreground transition-colors">
                            <X className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    );
                  })}

                  {/* Add item row */}
                  {addingTo === openCat.name ? (
                    <div className="border-t border-[hsl(var(--stone-lighter))] px-4 py-3 space-y-2 bg-[hsl(var(--cream))]">
                      <input
                        autoFocus
                        value={newTitle}
                        onChange={e => setNewTitle(e.target.value)}
                        onKeyDown={e => { if (e.key === "Enter") handleAddItem(openCat.name); if (e.key === "Escape") setAddingTo(null); }}
                        placeholder="Tilføj punkt..."
                        className="w-full rounded-xl border px-3 py-2 text-[0.82rem] focus:outline-none"
                        style={{ borderColor: "hsl(var(--stone-light))", fontSize: "16px", background: "white" }}
                      />
                      <div className="flex gap-2 items-center">
                        <div className="flex gap-1.5 flex-1">
                          {(["mor", "far", "fælles"] as const).map(a => (
                            <button key={a} onClick={() => setNewAssignee(a)}
                              className="flex-1 py-1.5 rounded-lg text-[0.62rem] font-medium transition-all"
                              style={{
                                background: newAssignee === a ? (a === "mor" ? "hsl(var(--clay))" : a === "far" ? "hsl(var(--moss))" : "hsl(var(--bark))") : "hsl(var(--stone-lighter))",
                                color: newAssignee === a ? "white" : "hsl(var(--muted-foreground))",
                              }}>
                              {a === "mor" ? morName : a === "far" ? farName : "Fælles"}
                            </button>
                          ))}
                        </div>
                        <button onClick={() => handleAddItem(openCat.name)}
                          disabled={!newTitle.trim()}
                          className="px-3 py-1.5 rounded-lg text-[0.72rem] font-medium transition-all disabled:opacity-40"
                          style={{ background: "hsl(var(--moss))", color: "white" }}>
                          Tilføj
                        </button>
                        <button onClick={() => setAddingTo(null)} className="text-muted-foreground">
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button onClick={() => setAddingTo(openCat.name)}
                      className="w-full border-t border-[hsl(var(--stone-lighter))] px-4 py-3 flex items-center gap-2 text-[0.75rem] text-muted-foreground hover:text-foreground transition-colors"
                      style={{ background: "hsl(var(--cream))" }}>
                      <Plus className="w-3.5 h-3.5" />
                      Tilføj eget punkt
                    </button>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      </>}

    </div>
  );
}

function HealthSuggestions() {
  const { babyAgeWeeks, addTask, tasks } = useFamily();
  const suggestions = getHealthSuggestions(babyAgeWeeks);
  const [dismissed, setDismissed] = useState<string[]>(() => {
    try { return JSON.parse(localStorage.getItem("melo-health-dismissed") || "[]"); } catch { return []; }
  });

  const existingTitles = tasks.map(t => t.title.toLowerCase());
  const visible = suggestions.filter(s =>
    !dismissed.includes(s.id) &&
    !existingTitles.some(t => t.includes(s.title.toLowerCase().slice(0, 20)))
  );

  if (visible.length === 0) return null;

  const dismiss = (id: string) => {
    const next = [...dismissed, id];
    setDismissed(next);
    localStorage.setItem("melo-health-dismissed", JSON.stringify(next));
  };

  const addAndDismiss = (s: typeof visible[0]) => {
    addTask(s.title, s.assignee, "never");
    dismiss(s.id);
  };

  return (
    <div className="section-fade-in space-y-2" style={{ animationDelay: "80ms" }}>
      <p className="text-[0.58rem] tracking-[0.18em] uppercase text-muted-foreground flex items-center gap-1.5">
        <span>🏥</span> Relevant nu
      </p>
      {visible.map(s => (
        <div key={s.id} className="rounded-xl px-3 py-3 flex items-center gap-3"
          style={{ background: "hsl(var(--cream))", border: "1px solid hsl(var(--stone-light))" }}>
          <div className="flex-1 min-w-0">
            <p className="text-[0.8rem] leading-snug" style={{ color: "hsl(var(--bark))" }}>{s.title}</p>
          </div>
          <button
            onClick={() => addAndDismiss(s)}
            className="flex-shrink-0 px-3 py-1.5 rounded-lg text-[0.72rem] font-medium transition-all active:scale-95"
            style={{ background: "hsl(var(--moss))", color: "white" }}
          >
            + Tilføj
          </button>
          <button onClick={() => dismiss(s.id)} className="flex-shrink-0 p-1 rounded opacity-50 hover:opacity-80 transition-opacity">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      ))}
    </div>
  );
}
