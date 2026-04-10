import { useState } from "react";
import { useFamily } from "@/context/FamilyContext";
import { Sparkles } from "lucide-react";
import { format } from "date-fns";
import { da } from "date-fns/locale";

// Shows a prompt twice a week — Wednesday and Sunday evenings
function shouldShowPrompt(): boolean {
  const lastKey = localStorage.getItem("melo-memory-last");
  if (!lastKey) return true;
  const last = new Date(lastKey);
  const now = new Date();
  const daysSince = (now.getTime() - last.getTime()) / (1000 * 60 * 60 * 24);
  return daysSince >= 3; // at most every 3 days
}

export function MemoryKeeper() {
  const { memories, addMemory } = useFamily();
  const [text, setText] = useState("");
  const [saved, setSaved] = useState(false);
  const [showAll, setShowAll] = useState(false);

  const showPrompt = shouldShowPrompt() && !saved;
  const recent = [...memories].reverse().slice(0, showAll ? memories.length : 3);

  const handleSave = () => {
    if (!text.trim()) return;
    addMemory(text.trim());
    localStorage.setItem("melo-memory-last", new Date().toISOString());
    setText("");
    setSaved(true);
  };

  if (memories.length === 0 && !showPrompt) return null;

  return (
    <div className="card-soft section-fade-in space-y-3">
      <div className="flex items-center gap-2">
        <Sparkles className="w-4 h-4" style={{ color: "hsl(var(--clay))" }} />
        <p className="text-[0.6rem] tracking-[0.16em] uppercase text-muted-foreground">Jeres øjeblikke</p>
      </div>

      {showPrompt && (
        <div className="space-y-2">
          <p className="text-[0.85rem] font-medium">Én ting der fik dig til at smile denne uge?</p>
          <p className="text-[0.7rem] text-muted-foreground">10 sekunder. Det er nok.</p>
          <textarea
            value={text}
            onChange={e => setText(e.target.value)}
            placeholder={"F.eks. \u201cHan holdt om min finger og ville ikke slippe\u201d"}
            rows={2}
            maxLength={300}
            className="w-full rounded-xl border-[1.5px] border-[hsl(var(--stone-light))] bg-background px-3 py-2.5 text-[0.82rem] focus:outline-none focus:border-[hsl(var(--clay))] transition-colors resize-none"
          />
          <button
            onClick={handleSave}
            disabled={!text.trim()}
            className="w-full py-2.5 rounded-xl text-[0.78rem] font-medium transition-all active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed text-white"
            style={{ background: "hsl(var(--clay))" }}
          >
            Gem øjeblik ✨
          </button>
        </div>
      )}

      {saved && (
        <div className="rounded-xl px-3 py-2.5 text-center" style={{ background: "hsl(var(--sage-light))" }}>
          <p className="text-[0.82rem]">Gemt 💛 Du vil se det igen når det er sværest.</p>
        </div>
      )}

      {/* Memory list */}
      {recent.length > 0 && (
        <div className="space-y-1.5">
          {recent.map(m => (
            <div key={m.id} className="rounded-xl px-3 py-2.5" style={{ background: "hsl(var(--cream))" }}>
              <p className="text-[0.7rem] text-muted-foreground mb-0.5">
                {format(new Date(m.date), "d. MMM", { locale: da })}
              </p>
              <p className="text-[0.82rem] italic">"{m.text}"</p>
            </div>
          ))}
          {memories.length > 3 && (
            <button
              onClick={() => setShowAll(!showAll)}
              className="text-[0.68rem] text-muted-foreground hover:text-foreground transition-colors w-full text-center pt-1"
            >
              {showAll ? "Vis færre" : `Se alle ${memories.length} øjeblikke`}
            </button>
          )}
        </div>
      )}
    </div>
  );
}
