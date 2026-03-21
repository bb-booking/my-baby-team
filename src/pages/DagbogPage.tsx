import { useState } from "react";
import { useFamily } from "@/context/FamilyContext";
import { useDiary, type StoolColor, type StoolConsistency } from "@/context/DiaryContext";
import { Trash2, Clock, Moon, Sun } from "lucide-react";
import { format } from "date-fns";
import { da } from "date-fns/locale";

type Tab = "amning" | "ble" | "sovn";

// ── Reference data from Tjek Baby PDF ──
const stoolGuideByAge: Record<string, { colors: string; consistency: string; note: string }> = {
  "Dag 1": { colors: "Sort, brun eller mørk grøn", consistency: "Klæbrig (mekonium)", note: "Mindst 1 afføringsble. Mindst 4-5 amninger." },
  "Dag 2": { colors: "Lysere og mere grønlig", consistency: "Blødere", note: "Mindst 2 afføringsbleer. Mindst 8 amninger." },
  "Dag 3": { colors: "Gullig/grøn", consistency: "Blød, kan være grynet", note: "Mindst 3 afføringsbleer. 3+ tunge tissebleer." },
  "Uge 1": { colors: "Gul med syrlig lugt", consistency: "Blød, grynet", note: "Mindst 4 afføringsbleer. 5+ tunge tissebleer." },
  "Uge 2-4": { colors: "Gul", consistency: "Blød, grynet", note: "6+ tunge tissebleer. Afføring kan variere." },
};

const stoolColors: { value: StoolColor; label: string; color: string }[] = [
  { value: "sort", label: "Sort/brun", color: "#2d2520" },
  { value: "mørkegrøn", label: "Mørk grøn", color: "#3a5235" },
  { value: "grøn", label: "Grøn", color: "#6b8f5e" },
  { value: "gulgrøn", label: "Gullig/grøn", color: "#a8b060" },
  { value: "gul", label: "Gul", color: "#d4a843" },
];

const stoolConsistencies: { value: StoolConsistency; label: string }[] = [
  { value: "hård", label: "Hård" },
  { value: "blød", label: "Blød" },
  { value: "grynet", label: "Grynet" },
  { value: "flydende", label: "Flydende" },
  { value: "slimet", label: "Slimet" },
];

export default function DagbogPage() {
  const { profile, babyAgeWeeks } = useFamily();
  const [activeTab, setActiveTab] = useState<Tab>("amning");

  if (profile.phase === "pregnant") {
    return (
      <div className="space-y-5">
        <div className="section-fade-in">
          <h1 className="text-[1.9rem] font-normal">Dagbog</h1>
          <p className="label-upper mt-1">TILGÆNGELIG NÅR BARNET ER FØDT</p>
        </div>
        <div className="card-soft text-center py-12 section-fade-in" style={{ animationDelay: "80ms" }}>
          <span className="text-4xl mb-4 block">📖</span>
          <p className="text-[1rem] font-normal mb-2">Dagbogen venter på jer</p>
          <p className="text-[0.8rem] text-muted-foreground max-w-xs mx-auto leading-relaxed">
            Når baby er født kan I logge amning, bleer, søvn og noter.
          </p>
        </div>
        <div className="h-20 md:h-0" />
      </div>
    );
  }

  // Age guide key
  let ageGuideKey = "Uge 2-4";
  const ageDays = babyAgeWeeks * 7;
  if (ageDays < 2) ageGuideKey = "Dag 1";
  else if (ageDays < 3) ageGuideKey = "Dag 2";
  else if (ageDays < 4) ageGuideKey = "Dag 3";
  else if (ageDays < 7) ageGuideKey = "Uge 1";

  const tabs: { key: Tab; label: string; emoji: string }[] = [
    { key: "amning", label: "Amning", emoji: "🤱" },
    { key: "ble", label: "Ble", emoji: "👶" },
    { key: "sovn", label: "Søvn", emoji: "😴" },
  ];

  return (
    <div className="space-y-5">
      <div className="section-fade-in">
        <h1 className="text-[1.9rem] font-normal">Dagbog</h1>
        <p className="label-upper mt-1">I DAG — LOG OG OVERBLIK</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-0 border-b border-stone-lighter section-fade-in" style={{ animationDelay: "80ms" }}>
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`flex items-center gap-1.5 px-4 py-2.5 text-[0.72rem] tracking-[0.13em] uppercase border-b-2 -mb-px transition-all ${
              activeTab === tab.key
                ? "border-b-moss text-moss"
                : "border-b-transparent text-muted-foreground"
            }`}
          >
            <span>{tab.emoji}</span>
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === "amning" && <NursingSection />}
      {activeTab === "ble" && <DiaperSection ageGuideKey={ageGuideKey} />}
      {activeTab === "sovn" && <SleepSection />}

      <div className="h-20 md:h-0" />
    </div>
  );
}

// ═══════════════════════════════════════════
// NURSING
// ═══════════════════════════════════════════
function NursingSection() {
  const { nursingLogs, addNursing, removeNursingLog, todayNursingCount } = useDiary();
  const [side, setSide] = useState<"left" | "right">("left");
  const todayLogs = nursingLogs.filter(l => new Date(l.timestamp).toDateString() === new Date().toDateString());

  return (
    <>
      <div className="card-soft section-fade-in" style={{ animationDelay: "160ms" }}>
        <p className="label-upper mb-3">TILFØJ AMNING</p>
        <div className="flex gap-2 mb-4">
          {(["left", "right"] as const).map(s => (
            <button key={s} onClick={() => setSide(s)}
              className={`flex-1 py-3 rounded-2xl text-[0.78rem] border transition-all active:scale-[0.97] ${
                side === s
                  ? "bg-[hsl(var(--sage-light))] border-[hsl(var(--sage))] text-[hsl(var(--sage-dark))] font-medium"
                  : "border-[hsl(var(--stone-light))] text-muted-foreground"
              }`}
            >
              {s === "left" ? "🤱 Venstre" : "Højre 🤱"}
            </button>
          ))}
        </div>
        <button onClick={() => addNursing(side)} className="btn-moss w-full">
          Tilføj amning
        </button>
      </div>

      {/* Today stats */}
      <div className="card-soft section-fade-in" style={{ animationDelay: "200ms" }}>
        <div className="flex items-center justify-between mb-1">
          <p className="label-upper">I DAG</p>
          <span className="text-[1.2rem] font-semibold" style={{ color: "hsl(var(--moss))" }}>{todayNursingCount}</span>
        </div>
        <p className="text-[0.72rem] text-muted-foreground">amninger registreret</p>
        {todayNursingCount < 8 && (
          <p className="text-[0.68rem] mt-2 px-2 py-1.5 rounded-lg" style={{ background: "hsl(var(--clay-light) / 0.4)", color: "hsl(var(--bark))" }}>
            💡 Anbefalet: mindst 8 amninger i døgnet de første uger
          </p>
        )}
      </div>

      {/* Log */}
      <LogList
        items={todayLogs.map(l => ({
          id: l.id,
          emoji: "🤱",
          title: `Amning — ${l.side === "left" ? "venstre" : "højre"}`,
          time: format(new Date(l.timestamp), "HH:mm"),
        }))}
        onRemove={removeNursingLog}
      />
    </>
  );
}

// ═══════════════════════════════════════════
// DIAPERS
// ═══════════════════════════════════════════
function DiaperSection({ ageGuideKey }: { ageGuideKey: string }) {
  const { diaperLogs, addDiaper, removeDiaperLog, todayDiaperCount } = useDiary();
  const [type, setType] = useState<"wet" | "dirty" | "both">("wet");
  const [color, setColor] = useState<StoolColor | undefined>();
  const [consistency, setConsistency] = useState<StoolConsistency | undefined>();
  const showStool = type === "dirty" || type === "both";
  const guide = stoolGuideByAge[ageGuideKey];

  const handleAdd = () => {
    addDiaper(type, showStool ? color : undefined, showStool ? consistency : undefined);
    setColor(undefined);
    setConsistency(undefined);
  };

  const todayLogs = diaperLogs.filter(l => new Date(l.timestamp).toDateString() === new Date().toDateString());

  return (
    <>
      <div className="card-soft section-fade-in" style={{ animationDelay: "160ms" }}>
        <p className="label-upper mb-3">TILFØJ BLE</p>
        <div className="grid grid-cols-3 gap-2 mb-4">
          {([
            { key: "wet" as const, emoji: "💧", label: "Tisse" },
            { key: "dirty" as const, emoji: "💩", label: "Afføring" },
            { key: "both" as const, emoji: "💧💩", label: "Begge" },
          ]).map(t => (
            <button key={t.key} onClick={() => setType(t.key)}
              className={`flex flex-col items-center gap-1 py-3 rounded-2xl text-[0.72rem] border transition-all active:scale-[0.97] ${
                type === t.key
                  ? "bg-[hsl(var(--sage-light))] border-[hsl(var(--sage))] text-[hsl(var(--sage-dark))] font-medium"
                  : "border-[hsl(var(--stone-light))] text-muted-foreground"
              }`}
            >
              <span className="text-lg">{t.emoji}</span>
              {t.label}
            </button>
          ))}
        </div>

        {showStool && (
          <>
            <p className="text-[0.65rem] tracking-[0.14em] uppercase text-muted-foreground mb-2 mt-1">Farve</p>
            <div className="flex gap-2 mb-3 flex-wrap">
              {stoolColors.map(c => (
                <button key={c.value} onClick={() => setColor(c.value)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[0.7rem] border transition-all active:scale-[0.97] ${
                    color === c.value ? "border-[hsl(var(--moss))] font-medium" : "border-[hsl(var(--stone-light))]"
                  }`}
                >
                  <span className="w-3 h-3 rounded-full" style={{ background: c.color }} />
                  {c.label}
                </button>
              ))}
            </div>

            <p className="text-[0.65rem] tracking-[0.14em] uppercase text-muted-foreground mb-2">Konsistens</p>
            <div className="flex gap-2 mb-3 flex-wrap">
              {stoolConsistencies.map(c => (
                <button key={c.value} onClick={() => setConsistency(c.value)}
                  className={`px-3 py-1.5 rounded-full text-[0.7rem] border transition-all active:scale-[0.97] ${
                    consistency === c.value ? "border-[hsl(var(--moss))] bg-[hsl(var(--sage-light))] font-medium" : "border-[hsl(var(--stone-light))] text-muted-foreground"
                  }`}
                >
                  {c.label}
                </button>
              ))}
            </div>
          </>
        )}

        <button onClick={handleAdd} className="btn-moss w-full">Log ble</button>
      </div>

      {/* Age-specific guide */}
      {guide && (
        <div className="card-soft section-fade-in" style={{ animationDelay: "200ms", background: "hsl(var(--cream))" }}>
          <p className="label-upper mb-2">📋 FORVENTET — {ageGuideKey.toUpperCase()}</p>
          <div className="space-y-1.5 text-[0.78rem] text-muted-foreground">
            <p><span className="font-medium text-foreground">Farve:</span> {guide.colors}</p>
            <p><span className="font-medium text-foreground">Konsistens:</span> {guide.consistency}</p>
            <p className="text-[0.72rem] mt-2 px-2 py-1.5 rounded-lg" style={{ background: "hsl(var(--sage-light) / 0.5)" }}>
              💡 {guide.note}
            </p>
          </div>
        </div>
      )}

      {/* Today stats */}
      <div className="card-soft section-fade-in" style={{ animationDelay: "240ms" }}>
        <div className="flex items-center justify-between mb-1">
          <p className="label-upper">I DAG</p>
          <span className="text-[1.2rem] font-semibold" style={{ color: "hsl(var(--moss))" }}>{todayDiaperCount}</span>
        </div>
        <p className="text-[0.72rem] text-muted-foreground">bleer registreret</p>
      </div>

      <LogList
        items={todayLogs.map(l => ({
          id: l.id,
          emoji: l.type === "wet" ? "💧" : l.type === "dirty" ? "💩" : "💧💩",
          title: `${l.type === "wet" ? "Tisse" : l.type === "dirty" ? "Afføring" : "Tisse + afføring"}${l.stoolColor ? ` · ${l.stoolColor}` : ""}${l.stoolConsistency ? ` · ${l.stoolConsistency}` : ""}`,
          time: format(new Date(l.timestamp), "HH:mm"),
        }))}
        onRemove={removeDiaperLog}
      />
    </>
  );
}

// ═══════════════════════════════════════════
// SLEEP
// ═══════════════════════════════════════════
function SleepSection() {
  const { sleepLogs, addSleep, endSleep, removeSleepLog, activeSleep, todaySleepMinutes } = useDiary();
  const [type, setType] = useState<"nap" | "night">("nap");
  const [manualStart, setManualStart] = useState("");
  const [manualEnd, setManualEnd] = useState("");
  const [mode, setMode] = useState<"quick" | "manual">("quick");

  const handleQuickStart = () => {
    addSleep(type, new Date().toISOString());
  };

  const handleManualAdd = () => {
    if (!manualStart) return;
    const today = new Date().toISOString().slice(0, 10);
    const start = new Date(`${today}T${manualStart}`).toISOString();
    const end = manualEnd ? new Date(`${today}T${manualEnd}`).toISOString() : undefined;
    addSleep(type, start, end);
    setManualStart("");
    setManualEnd("");
  };

  const todayLogs = sleepLogs.filter(l => new Date(l.startTime).toDateString() === new Date().toDateString());
  const hours = Math.floor(todaySleepMinutes / 60);
  const mins = Math.round(todaySleepMinutes % 60);

  return (
    <>
      {/* Active sleep banner */}
      {activeSleep && (
        <div className="card-soft section-fade-in border-l-4" style={{ borderLeftColor: "hsl(var(--sage))", background: "hsl(var(--sage-light) / 0.3)" }}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-50" style={{ background: "hsl(var(--sage))" }} />
                <span className="relative inline-flex rounded-full h-2.5 w-2.5" style={{ background: "hsl(var(--moss))" }} />
              </span>
              <p className="text-[0.85rem] font-medium">{activeSleep.type === "nap" ? "💤 Lur i gang" : "🌙 Nattesøvn i gang"}</p>
            </div>
            <button onClick={() => endSleep(activeSleep.id)}
              className="px-3 py-1.5 rounded-full text-[0.7rem] font-medium transition-all active:scale-95"
              style={{ background: "hsl(var(--moss))", color: "white" }}
            >
              Stop
            </button>
          </div>
          <p className="text-[0.68rem] text-muted-foreground mt-1">
            Startet {format(new Date(activeSleep.startTime), "HH:mm")}
          </p>
        </div>
      )}

      <div className="card-soft section-fade-in" style={{ animationDelay: "160ms" }}>
        <p className="label-upper mb-3">LOG SØVN</p>

        {/* Type selection */}
        <div className="flex gap-2 mb-3">
          {([{ key: "nap" as const, emoji: "💤", label: "Lur" }, { key: "night" as const, emoji: "🌙", label: "Nat" }]).map(t => (
            <button key={t.key} onClick={() => setType(t.key)}
              className={`flex-1 py-2.5 rounded-2xl text-[0.78rem] border transition-all active:scale-[0.97] ${
                type === t.key
                  ? "bg-[hsl(var(--sage-light))] border-[hsl(var(--sage))] text-[hsl(var(--sage-dark))] font-medium"
                  : "border-[hsl(var(--stone-light))] text-muted-foreground"
              }`}
            >{t.emoji} {t.label}</button>
          ))}
        </div>

        {/* Mode toggle */}
        <div className="flex gap-2 mb-4">
          <button onClick={() => setMode("quick")}
            className={`flex-1 py-2 rounded-xl text-[0.68rem] tracking-[0.1em] uppercase transition-all ${
              mode === "quick" ? "bg-foreground/5 font-medium" : "text-muted-foreground"
            }`}
          >Start/stop</button>
          <button onClick={() => setMode("manual")}
            className={`flex-1 py-2 rounded-xl text-[0.68rem] tracking-[0.1em] uppercase transition-all ${
              mode === "manual" ? "bg-foreground/5 font-medium" : "text-muted-foreground"
            }`}
          >Manuelt</button>
        </div>

        {mode === "quick" ? (
          <button onClick={handleQuickStart} disabled={!!activeSleep} className="btn-moss w-full disabled:opacity-50">
            {activeSleep ? "Søvn i gang…" : `Start ${type === "nap" ? "lur" : "nattesøvn"}`}
          </button>
        ) : (
          <div className="space-y-2">
            <div className="flex gap-2">
              <div className="flex-1">
                <label className="text-[0.6rem] tracking-[0.14em] uppercase text-muted-foreground mb-1 block">
                  <Clock className="w-3 h-3 inline mr-1" />Start
                </label>
                <input type="time" value={manualStart} onChange={e => setManualStart(e.target.value)}
                  className="w-full rounded-xl border border-[hsl(var(--stone-light))] bg-background px-3 py-2 text-[0.85rem] focus:outline-none focus:border-[hsl(var(--sage))] transition-colors" />
              </div>
              <div className="flex-1">
                <label className="text-[0.6rem] tracking-[0.14em] uppercase text-muted-foreground mb-1 block">
                  <Clock className="w-3 h-3 inline mr-1" />Slut
                </label>
                <input type="time" value={manualEnd} onChange={e => setManualEnd(e.target.value)}
                  className="w-full rounded-xl border border-[hsl(var(--stone-light))] bg-background px-3 py-2 text-[0.85rem] focus:outline-none focus:border-[hsl(var(--sage))] transition-colors" />
              </div>
            </div>
            <button onClick={handleManualAdd} disabled={!manualStart} className="btn-moss w-full disabled:opacity-50">
              Tilføj søvn
            </button>
          </div>
        )}
      </div>

      {/* Today stats */}
      <div className="card-soft section-fade-in" style={{ animationDelay: "200ms" }}>
        <div className="flex items-center justify-between mb-1">
          <p className="label-upper">SØVN I DAG</p>
          <span className="text-[1.2rem] font-semibold" style={{ color: "hsl(var(--moss))" }}>
            {hours > 0 ? `${hours}t ${mins}m` : `${mins}m`}
          </span>
        </div>
        <p className="text-[0.72rem] text-muted-foreground">samlet søvn registreret</p>
      </div>

      <LogList
        items={todayLogs.map(l => ({
          id: l.id,
          emoji: l.type === "nap" ? "💤" : "🌙",
          title: `${l.type === "nap" ? "Lur" : "Nattesøvn"}${l.endTime ? "" : " (i gang)"}`,
          time: `${format(new Date(l.startTime), "HH:mm")}${l.endTime ? ` — ${format(new Date(l.endTime), "HH:mm")}` : ""}`,
        }))}
        onRemove={removeSleepLog}
      />
    </>
  );
}

// ═══════════════════════════════════════════
// Shared log list
// ═══════════════════════════════════════════
function LogList({ items, onRemove }: { items: { id: string; emoji: string; title: string; time: string }[]; onRemove: (id: string) => void }) {
  if (items.length === 0) return null;

  return (
    <div className="card-soft section-fade-in" style={{ animationDelay: "280ms" }}>
      <p className="label-upper mb-3">SENESTE</p>
      {items.map((item) => (
        <div key={item.id} className="flex items-center gap-3 py-2.5 border-b border-foreground/5 last:border-0">
          <span className="text-lg flex-shrink-0">{item.emoji}</span>
          <div className="flex-1 min-w-0">
            <p className="text-[0.84rem] truncate">{item.title}</p>
          </div>
          <span className="text-[0.68rem] text-muted-foreground flex-shrink-0">{item.time}</span>
          <button onClick={() => onRemove(item.id)} className="p-1 rounded hover:bg-destructive/10 transition-colors flex-shrink-0">
            <Trash2 className="w-3.5 h-3.5 text-muted-foreground" />
          </button>
        </div>
      ))}
    </div>
  );
}
