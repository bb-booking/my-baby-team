import { useState } from "react";
import { Link } from "react-router-dom";
import { X, ChevronRight, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  usePregnancyDiary,
  getPersonalizedAdvice,
  MOOD_OPTIONS,
  ENERGY_OPTIONS,
  SYMPTOMS,
  type DiaryEntry,
} from "@/hooks/usePregnancyDiary";
import { useFamily } from "@/context/FamilyContext";
import confetti from "canvas-confetti";

// ── Check-in card (shown on Dashboard) ────────────────────────────────────────
export function CheckInCard() {
  const { todayEntry } = usePregnancyDiary();
  const [open, setOpen] = useState(false);
  const { profile } = useFamily();

  const moodEmoji = todayEntry ? MOOD_OPTIONS.find(m => m.value === todayEntry.mood)?.emoji : null;

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="w-full rounded-2xl px-5 py-4 text-left transition-all active:scale-[0.98] section-fade-in"
        style={{
          background: todayEntry
            ? "hsl(var(--sage-light))"
            : "hsl(var(--warm-white))",
          border: `1px solid ${todayEntry ? "hsl(var(--sage) / 0.3)" : "hsl(var(--stone-light))"}`,
          animationDelay: "50ms",
        }}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-full flex items-center justify-center text-xl flex-shrink-0"
              style={{ background: todayEntry ? "hsl(var(--sage) / 0.2)" : "hsl(var(--stone-lighter))" }}
            >
              {todayEntry ? moodEmoji : "🌿"}
            </div>
            <div>
              {todayEntry ? (
                <>
                  <p className="text-[0.85rem] font-semibold" style={{ color: "hsl(var(--moss))" }}>
                    Tjekket ind i dag
                  </p>
                  <p className="text-[0.68rem] text-muted-foreground">
                    {moodEmoji} {MOOD_OPTIONS.find(m => m.value === todayEntry.mood)?.label}
                    {" · "}
                    {ENERGY_OPTIONS.find(e => e.value === todayEntry.energy)?.label} energi
                  </p>
                </>
              ) : (
                <>
                  <p className="text-[0.85rem] font-semibold">Hvordan har du det i dag?</p>
                  <p className="text-[0.68rem] text-muted-foreground">Tager under 30 sekunder</p>
                </>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2">
            {todayEntry && (
              <Link
                to="/gravid-dagbog"
                onClick={e => e.stopPropagation()}
                className="text-[0.65rem] font-medium px-2.5 py-1 rounded-full"
                style={{ background: "hsl(var(--sage) / 0.2)", color: "hsl(var(--moss))" }}
              >
                Se dagbog
              </Link>
            )}
            <ChevronRight className="w-4 h-4 text-muted-foreground/40" />
          </div>
        </div>
      </button>

      {open && (
        <CheckInSheet
          onClose={() => setOpen(false)}
          parentName={profile.parentName || ""}
        />
      )}
    </>
  );
}

// ── Bottom sheet ───────────────────────────────────────────────────────────────
interface CheckInSheetProps {
  onClose: () => void;
  parentName: string;
}

function CheckInSheet({ onClose, parentName }: CheckInSheetProps) {
  const { addEntry, todayEntry } = usePregnancyDiary();
  const { currentWeek } = useFamily();

  const [step, setStep] = useState<"mood" | "energy" | "symptoms" | "note" | "result">("mood");
  const [mood, setMood] = useState<1|2|3|4|5>(todayEntry?.mood ?? 3);
  const [energy, setEnergy] = useState<1|2|3>(todayEntry?.energy ?? 2);
  const [symptoms, setSymptoms] = useState<string[]>(todayEntry?.symptoms ?? []);
  const [note, setNote] = useState(todayEntry?.note ?? "");
  const [cravings, setCravings] = useState(todayEntry?.cravings ?? "");
  const [savedEntry, setSavedEntry] = useState<DiaryEntry | null>(null);

  const toggleSymptom = (key: string) => {
    setSymptoms(prev => prev.includes(key) ? prev.filter(s => s !== key) : [...prev, key]);
  };

  const handleSave = () => {
    const today = new Date().toISOString().slice(0, 10);
    const entry = addEntry({ date: today, week: currentWeek, mood, energy, symptoms, cravings, note });
    setSavedEntry(entry);
    confetti({
      particleCount: 30, spread: 45, origin: { y: 0.6 },
      colors: ["#5a7a50", "#c4a97d", "#8fae7e"], scalar: 0.7, gravity: 1.4,
    });
    setStep("result");
  };

  const advice = savedEntry
    ? getPersonalizedAdvice(savedEntry.mood, savedEntry.energy, savedEntry.symptoms, currentWeek)
    : [];

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col justify-end"
      style={{ background: "rgba(0,0,0,0.4)" }}
      onClick={onClose}
    >
      <div
        className="rounded-t-3xl overflow-hidden"
        style={{ background: "hsl(var(--warm-white))", maxHeight: "88vh", overflowY: "auto" }}
        onClick={e => e.stopPropagation()}
      >
        {/* Handle */}
        <div className="flex justify-center pt-3 pb-1">
          <div className="w-10 h-1 rounded-full" style={{ background: "hsl(var(--stone-light))" }} />
        </div>

        <div className="px-5 pb-8 space-y-5">
          {/* Header */}
          <div className="flex items-center justify-between pt-1">
            <div>
              <p className="text-[1rem] font-semibold">
                {step === "result" ? "Råd til dig" : "Hvordan har du det?"}
              </p>
              {step !== "result" && (
                <p className="text-[0.68rem] text-muted-foreground">
                  Uge {currentWeek} · {new Date().toLocaleDateString("da-DK", { weekday: "long", day: "numeric", month: "long" })}
                </p>
              )}
            </div>
            <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full" style={{ background: "hsl(var(--stone-lighter))" }}>
              <X className="w-4 h-4 text-muted-foreground" />
            </button>
          </div>

          {/* Step: Mood */}
          {step === "mood" && (
            <div className="space-y-4">
              <p className="text-[0.78rem] text-muted-foreground">Hej {parentName} — vælg dit humør i dag</p>
              <div className="flex justify-between gap-2">
                {MOOD_OPTIONS.map(opt => (
                  <button
                    key={opt.value}
                    onClick={() => setMood(opt.value)}
                    className={cn(
                      "flex-1 flex flex-col items-center gap-1.5 py-3 rounded-2xl transition-all active:scale-95",
                      mood === opt.value ? "scale-105" : "opacity-60"
                    )}
                    style={{
                      background: mood === opt.value ? "hsl(var(--sage-light))" : "hsl(var(--stone-lighter))",
                      border: mood === opt.value ? "2px solid hsl(var(--sage))" : "2px solid transparent",
                    }}
                  >
                    <span className="text-2xl">{opt.emoji}</span>
                    <span className="text-[0.58rem] font-medium text-center leading-tight">{opt.label}</span>
                  </button>
                ))}
              </div>
              <button
                onClick={() => setStep("energy")}
                className="w-full py-3.5 rounded-2xl text-[0.85rem] font-medium text-white transition-all active:scale-95"
                style={{ background: "hsl(var(--moss))" }}
              >
                Næste →
              </button>
            </div>
          )}

          {/* Step: Energy */}
          {step === "energy" && (
            <div className="space-y-4">
              <p className="text-[0.78rem] text-muted-foreground">Hvad er dit energiniveau i dag?</p>
              <div className="flex flex-col gap-2.5">
                {ENERGY_OPTIONS.map(opt => (
                  <button
                    key={opt.value}
                    onClick={() => setEnergy(opt.value)}
                    className={cn(
                      "flex items-center gap-3 px-4 py-3.5 rounded-2xl transition-all active:scale-[0.98]",
                    )}
                    style={{
                      background: energy === opt.value ? "hsl(var(--sage-light))" : "hsl(var(--stone-lighter))",
                      border: energy === opt.value ? "2px solid hsl(var(--sage))" : "2px solid transparent",
                    }}
                  >
                    <span className="text-xl">{opt.icon}</span>
                    <div className="text-left">
                      <p className="text-[0.85rem] font-semibold">{opt.label}</p>
                      <p className="text-[0.68rem] text-muted-foreground">{opt.sub}</p>
                    </div>
                    {energy === opt.value && (
                      <div className="ml-auto w-5 h-5 rounded-full flex items-center justify-center" style={{ background: "hsl(var(--moss))" }}>
                        <span className="text-white text-[0.6rem]">✓</span>
                      </div>
                    )}
                  </button>
                ))}
              </div>
              <div className="flex gap-2">
                <button onClick={() => setStep("mood")}
                  className="flex-1 py-3.5 rounded-2xl text-[0.85rem] font-medium transition-all active:scale-95"
                  style={{ background: "hsl(var(--stone-lighter))", color: "hsl(var(--foreground))" }}>
                  ← Tilbage
                </button>
                <button onClick={() => setStep("symptoms")}
                  className="flex-1 py-3.5 rounded-2xl text-[0.85rem] font-medium text-white transition-all active:scale-95"
                  style={{ background: "hsl(var(--moss))" }}>
                  Næste →
                </button>
              </div>
            </div>
          )}

          {/* Step: Symptoms */}
          {step === "symptoms" && (
            <div className="space-y-4">
              <p className="text-[0.78rem] text-muted-foreground">Hvad mærker du? (vælg gerne flere)</p>
              <div className="grid grid-cols-2 gap-2">
                {SYMPTOMS.map(s => {
                  const active = symptoms.includes(s.key);
                  return (
                    <button
                      key={s.key}
                      onClick={() => toggleSymptom(s.key)}
                      className="flex items-center gap-2 px-3 py-2.5 rounded-xl transition-all active:scale-95 text-left"
                      style={{
                        background: active ? "hsl(var(--sage-light))" : "hsl(var(--stone-lighter))",
                        border: active ? "1.5px solid hsl(var(--sage))" : "1.5px solid transparent",
                      }}
                    >
                      <span className="text-base">{s.icon}</span>
                      <span className="text-[0.72rem] font-medium leading-tight">{s.label}</span>
                    </button>
                  );
                })}
              </div>
              <div className="flex gap-2">
                <button onClick={() => setStep("energy")}
                  className="flex-1 py-3.5 rounded-2xl text-[0.85rem] font-medium transition-all active:scale-95"
                  style={{ background: "hsl(var(--stone-lighter))", color: "hsl(var(--foreground))" }}>
                  ← Tilbage
                </button>
                <button onClick={() => setStep("note")}
                  className="flex-1 py-3.5 rounded-2xl text-[0.85rem] font-medium text-white transition-all active:scale-95"
                  style={{ background: "hsl(var(--moss))" }}>
                  Næste →
                </button>
              </div>
            </div>
          )}

          {/* Step: Note */}
          {step === "note" && (
            <div className="space-y-4">
              <div className="space-y-2">
                <p className="text-[0.78rem] font-medium">En tanke eller notat? <span className="text-muted-foreground font-normal">(valgfrit)</span></p>
                <textarea
                  value={note}
                  onChange={e => setNote(e.target.value)}
                  placeholder="Hvad tænker du på i dag..."
                  rows={3}
                  className="w-full rounded-2xl border px-4 py-3 text-[0.82rem] focus:outline-none resize-none"
                  style={{ borderColor: "hsl(var(--stone-light))", background: "hsl(var(--warm-white))", fontSize: "16px" }}
                />
              </div>
              <div className="space-y-2">
                <p className="text-[0.78rem] font-medium">Cravings? <span className="text-muted-foreground font-normal">(valgfrit)</span></p>
                <input
                  value={cravings}
                  onChange={e => setCravings(e.target.value)}
                  placeholder="Hvad har du lyst til at spise..."
                  className="w-full rounded-2xl border px-4 py-3 text-[0.82rem] focus:outline-none"
                  style={{ borderColor: "hsl(var(--stone-light))", background: "hsl(var(--warm-white))", fontSize: "16px" }}
                />
              </div>
              <div className="flex gap-2">
                <button onClick={() => setStep("symptoms")}
                  className="flex-1 py-3.5 rounded-2xl text-[0.85rem] font-medium transition-all active:scale-95"
                  style={{ background: "hsl(var(--stone-lighter))", color: "hsl(var(--foreground))" }}>
                  ← Tilbage
                </button>
                <button onClick={handleSave}
                  className="flex-1 py-3.5 rounded-2xl text-[0.85rem] font-medium text-white transition-all active:scale-95 flex items-center justify-center gap-2"
                  style={{ background: "hsl(var(--moss))" }}>
                  <Sparkles className="w-4 h-4" /> Gem og få råd
                </button>
              </div>
            </div>
          )}

          {/* Step: Result */}
          {step === "result" && savedEntry && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 rounded-2xl px-4 py-3" style={{ background: "hsl(var(--sage-light))" }}>
                <span className="text-2xl">{MOOD_OPTIONS.find(m => m.value === savedEntry.mood)?.emoji}</span>
                <div>
                  <p className="text-[0.82rem] font-semibold" style={{ color: "hsl(var(--moss))" }}>
                    {MOOD_OPTIONS.find(m => m.value === savedEntry.mood)?.label} dag · {ENERGY_OPTIONS.find(e => e.value === savedEntry.energy)?.label} energi
                  </p>
                  {savedEntry.symptoms.length > 0 && (
                    <p className="text-[0.65rem] text-muted-foreground">
                      {savedEntry.symptoms.map(s => SYMPTOMS.find(sym => sym.key === s)?.icon).join(" ")}
                    </p>
                  )}
                </div>
              </div>

              <div className="space-y-2.5">
                <p className="text-[0.72rem] font-semibold tracking-wide uppercase text-muted-foreground">
                  Råd til dig i dag
                </p>
                {advice.map((a, i) => (
                  <div key={i} className="rounded-2xl px-4 py-3.5 space-y-1" style={{ background: a.bg, border: "1px solid hsl(var(--stone-light))" }}>
                    <div className="flex items-center gap-2">
                      <span className="text-base">{a.icon}</span>
                      <p className="text-[0.82rem] font-semibold">{a.title}</p>
                    </div>
                    <p className="text-[0.75rem] text-muted-foreground leading-relaxed">{a.text}</p>
                    {a.action && (
                      <Link
                        to={a.action.path}
                        onClick={onClose}
                        className="inline-flex items-center gap-1 text-[0.72rem] font-medium mt-1"
                        style={{ color: "hsl(var(--moss))" }}
                      >
                        {a.action.label} <ChevronRight className="w-3 h-3" />
                      </Link>
                    )}
                  </div>
                ))}
              </div>

              <div className="flex gap-2 pt-1">
                <Link
                  to="/gravid-dagbog"
                  onClick={onClose}
                  className="flex-1 py-3.5 rounded-2xl text-[0.82rem] font-medium text-center transition-all active:scale-95"
                  style={{ background: "hsl(var(--stone-lighter))", color: "hsl(var(--foreground))" }}
                >
                  Se din dagbog
                </Link>
                <button
                  onClick={onClose}
                  className="flex-1 py-3.5 rounded-2xl text-[0.82rem] font-medium text-white transition-all active:scale-95"
                  style={{ background: "hsl(var(--moss))" }}
                >
                  Luk
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
