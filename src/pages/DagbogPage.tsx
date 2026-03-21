import { useState } from "react";
import { useFamily } from "@/context/FamilyContext";

type Tab = "amning" | "ble" | "sovn";

interface LogEntry {
  id: string;
  type: Tab;
  emoji: string;
  title: string;
  sub: string;
  time: string;
}

const demoLogs: LogEntry[] = [
  { id: "1", type: "amning", emoji: "🍼", title: "Amning — venstre", sub: "12 min", time: "12:30" },
  { id: "2", type: "ble", emoji: "👶", title: "Ble — våd", sub: "", time: "11:45" },
  { id: "3", type: "sovn", emoji: "😴", title: "Lur", sub: "45 min", time: "10:00" },
  { id: "4", type: "amning", emoji: "🍼", title: "Amning — højre", sub: "15 min", time: "08:30" },
  { id: "5", type: "ble", emoji: "👶", title: "Ble — afføring", sub: "Normal", time: "07:15" },
];

export default function DagbogPage() {
  const { profile } = useFamily();
  const [activeTab, setActiveTab] = useState<Tab>("amning");

  // Only show dagbog for born babies
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
            Når baby er født kan I logge amning, bleer, søvn og noter — så I har styr på hverdagen.
          </p>
        </div>
        <div className="h-20 md:h-0" />
      </div>
    );
  }

  const tabs: { key: Tab; label: string; emoji: string }[] = [
    { key: "amning", label: "Amning", emoji: "🍼" },
    { key: "ble", label: "Ble", emoji: "👶" },
    { key: "sovn", label: "Søvn", emoji: "😴" },
  ];

  const filteredLogs = demoLogs.filter((l) => l.type === activeTab);

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

      {/* Quick add */}
      {activeTab === "amning" && <NursingQuickAdd />}
      {activeTab === "ble" && <DiaperQuickAdd />}
      {activeTab === "sovn" && <SleepQuickAdd />}

      {/* Log entries */}
      <div className="card-soft section-fade-in" style={{ animationDelay: "240ms" }}>
        <p className="label-upper mb-3">SENESTE</p>
        {filteredLogs.length === 0 ? (
          <p className="text-[0.82rem] text-muted-foreground py-4 text-center">Ingen logs endnu i dag</p>
        ) : (
          <div>
            {filteredLogs.map((log) => (
              <div key={log.id} className="flex items-center gap-3 py-2.5 border-b border-foreground/5 last:border-0">
                <span className="text-lg flex-shrink-0">{log.emoji}</span>
                <div className="flex-1">
                  <p className="text-[0.84rem]">{log.title}</p>
                  {log.sub && <p className="text-[0.68rem] text-muted-foreground">{log.sub}</p>}
                </div>
                <span className="text-[0.68rem] text-muted-foreground">{log.time}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="h-20 md:h-0" />
    </div>
  );
}

function NursingQuickAdd() {
  const [side, setSide] = useState<"left" | "right">("left");

  return (
    <div className="card-soft section-fade-in" style={{ animationDelay: "160ms" }}>
      <p className="label-upper mb-3">NY LOG</p>
      <div className="flex gap-2 mb-4">
        <button
          onClick={() => setSide("left")}
          className={`flex-1 py-2.5 rounded-full text-[0.72rem] tracking-[0.06em] border transition-all ${
            side === "left"
              ? "bg-sage-light border-sage text-sage-dark font-medium"
              : "border-stone-light text-muted-foreground"
          }`}
        >
          🤱 Venstre
        </button>
        <button
          onClick={() => setSide("right")}
          className={`flex-1 py-2.5 rounded-full text-[0.72rem] tracking-[0.06em] border transition-all ${
            side === "right"
              ? "bg-sage-light border-sage text-sage-dark font-medium"
              : "border-stone-light text-muted-foreground"
          }`}
        >
          Højre 🤱
        </button>
      </div>
      <button className="btn-moss w-full">Start amning</button>
    </div>
  );
}

function DiaperQuickAdd() {
  const [type, setType] = useState<string>("wet");
  const types = [
    { key: "wet", emoji: "💧", label: "Våd" },
    { key: "dirty", emoji: "💩", label: "Afføring" },
    { key: "both", emoji: "💧💩", label: "Begge" },
  ];

  return (
    <div className="card-soft section-fade-in" style={{ animationDelay: "160ms" }}>
      <p className="label-upper mb-3">NY LOG</p>
      <div className="grid grid-cols-3 gap-2 mb-4">
        {types.map((t) => (
          <button
            key={t.key}
            onClick={() => setType(t.key)}
            className={`flex items-center justify-center gap-1.5 py-3 rounded-xl text-[0.78rem] border transition-all ${
              type === t.key
                ? "bg-[#dce9f0] border-[#a8c8dc] text-[#2a4a5a]"
                : "border-stone-light text-muted-foreground"
            }`}
          >
            <span>{t.emoji}</span> {t.label}
          </button>
        ))}
      </div>
      <button className="btn-moss w-full">Log ble</button>
    </div>
  );
}

function SleepQuickAdd() {
  const [type, setType] = useState<string>("nap");

  return (
    <div className="card-soft section-fade-in" style={{ animationDelay: "160ms" }}>
      <p className="label-upper mb-3">NY LOG</p>
      <div className="flex gap-2 mb-4">
        <button
          onClick={() => setType("nap")}
          className={`flex-1 py-2.5 rounded-full text-[0.72rem] tracking-[0.06em] border transition-all ${
            type === "nap" ? "bg-[#dce9f0] border-[#a8c8dc] text-[#1a3a4a]" : "border-stone-light text-muted-foreground"
          }`}
        >
          💤 Lur
        </button>
        <button
          onClick={() => setType("night")}
          className={`flex-1 py-2.5 rounded-full text-[0.72rem] tracking-[0.06em] border transition-all ${
            type === "night" ? "bg-[#dce9f0] border-[#a8c8dc] text-[#1a3a4a]" : "border-stone-light text-muted-foreground"
          }`}
        >
          🌙 Nattesøvn
        </button>
      </div>
      <button className="btn-moss w-full">Start søvn</button>
    </div>
  );
}
