import { useState } from "react";
import { useFamily } from "@/context/FamilyContext";
import { Heart, Calendar } from "lucide-react";
import { cn } from "@/lib/utils";

export function AppreciationCard() {
  const { profile, appreciations, addAppreciation, morName, farName } = useFamily();
  const { role } = profile;
  const partnerName = role === "mor" ? farName : morName;

  const [text, setText] = useState("");
  const [sent, setSent] = useState(false);

  const todayStr = new Date().toISOString().slice(0, 10);
  const sentToday = appreciations.some(a => a.from === role && a.date.startsWith(todayStr));

  const latestFromPartner = appreciations
    .filter(a => a.from !== role)
    .at(-1);

  const handleSend = () => {
    if (!text.trim()) return;
    addAppreciation(text.trim());
    setText("");
    setSent(true);
    setTimeout(() => setSent(false), 3000);
  };

  return (
    <div className="card-soft section-fade-in space-y-3">
      <div className="flex items-center gap-2">
        <Heart className="w-4 h-4" style={{ color: "hsl(var(--clay))" }} />
        <p className="text-[0.6rem] tracking-[0.16em] uppercase text-muted-foreground">Sæt pris på hinanden</p>
      </div>

      {/* Latest from partner */}
      {latestFromPartner && (
        <div className="rounded-xl px-3 py-2.5" style={{ background: "hsl(var(--clay-light) / 0.4)" }}>
          <p className="text-[0.6rem] tracking-[0.1em] uppercase text-muted-foreground mb-1">
            {partnerName || "Din partner"} lagde mærke til:
          </p>
          <p className="text-[0.82rem] italic">"{latestFromPartner.text}"</p>
        </div>
      )}

      {/* Send appreciation */}
      {!sentToday ? (
        <div className="space-y-2">
          <p className="text-[0.78rem] text-muted-foreground">
            Ét ting du lagde mærke til i dag — konkret og specifikt gør det mere.
          </p>
          <textarea
            value={text}
            onChange={e => setText(e.target.value)}
            placeholder={`F.eks. "Jeg lagde mærke til at du stod op selvom du var udmattet"`}
            rows={2}
            maxLength={200}
            className="w-full rounded-xl border-[1.5px] border-[hsl(var(--stone-light))] bg-background px-3 py-2.5 text-[0.82rem] focus:outline-none focus:border-[hsl(var(--clay))] transition-colors resize-none"
          />
          <button
            onClick={handleSend}
            disabled={!text.trim()}
            className={cn(
              "w-full py-2.5 rounded-xl text-[0.78rem] font-medium transition-all active:scale-[0.98]",
              text.trim()
                ? "text-white"
                : "bg-muted text-muted-foreground cursor-not-allowed"
            )}
            style={text.trim() ? { background: "hsl(var(--clay))" } : {}}
          >
            Send til {partnerName || "din partner"}
          </button>
        </div>
      ) : (
        <div className="rounded-xl px-3 py-2.5 text-center" style={{ background: "hsl(var(--sage-light))" }}>
          <p className="text-[0.82rem]">{sent ? "✨ Sendt — det betyder noget." : "Du har allerede sendt en anerkendelse i dag 💚"}</p>
        </div>
      )}

      <DateNightNudge />
    </div>
  );
}

function DateNightNudge() {
  const [dismissed, setDismissed] = useState(() => {
    const stored = localStorage.getItem("melo-datenudge-dismissed");
    if (!stored) return false;
    // Show again after 7 days
    return Date.now() - parseInt(stored) < 7 * 24 * 60 * 60 * 1000;
  });

  if (dismissed) return null;

  const dismiss = () => {
    localStorage.setItem("melo-datenudge-dismissed", Date.now().toString());
    setDismissed(true);
  };

  return (
    <div className="border-t border-[hsl(var(--stone-lighter))] pt-3">
      <div className="flex items-start gap-2.5">
        <Calendar className="w-4 h-4 mt-0.5 shrink-0" style={{ color: "hsl(var(--moss))" }} />
        <div className="flex-1">
          <p className="text-[0.78rem] font-medium mb-0.5">Dato-aften denne uge?</p>
          <p className="text-[0.7rem] text-muted-foreground leading-relaxed">
            Ikke en middag ude. Bare sofaen, en film og ingen telefoner når barnet sover. 30 minutter er nok.
          </p>
        </div>
        <button onClick={dismiss} className="text-[0.62rem] text-muted-foreground shrink-0 mt-0.5 hover:text-foreground">
          Luk
        </button>
      </div>
    </div>
  );
}
