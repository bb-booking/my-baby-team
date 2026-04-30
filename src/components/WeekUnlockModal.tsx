import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useFamily } from "@/context/FamilyContext";
import { getBabySize } from "@/lib/phaseData";
import { X } from "lucide-react";

const SEEN_WEEK_KEY = "melo-seen-week";

function getWeekHighlights(week: number): string[] {
  if (week < 8)  return ["Babys hjerte begynder at slå", "Organer er ved at dannes", "En vigtig uge i udviklingen"];
  if (week < 12) return ["Hjertet slår 150 slag/min", "Fingre og tæer tager form", "Hjernen vokser hurtigt"];
  if (week < 16) return ["Første trimester klaret!", "Baby begynder at bevæge sig", "Risikoen for tab falder"];
  if (week < 20) return ["Baby kan lave ansigtsudtryk", "Sanser vågner til live", "Knogler og muskler styrkes"];
  if (week < 24) return ["Baby kan høre din stemme", "Halvvejs igennem rejsen", "Hjertet pumper hårdt for jer"];
  if (week < 28) return ["Baby reagerer på lys", "En fast søvnrytme udvikles", "Lungerne modnes"];
  if (week < 32) return ["Tredje trimester!", "Baby kan åbne øjnene", "Vender sig med hovedet nedad"];
  if (week < 36) return ["Baby er næsten klar", "Tydelige spark og bevægelser", "Næsten i mål!"];
  return ["Baby kan komme snart", "Alt er fuldt udviklet", "I er klar til mødet"];
}

export function WeekUnlockModal() {
  const navigate = useNavigate();
  const { currentWeek } = useFamily();
  const [show, setShow] = useState(false);
  const [prevWeek, setPrevWeek] = useState<number | null>(null);

  useEffect(() => {
    if (!currentWeek) return;
    try {
      const stored = localStorage.getItem(SEEN_WEEK_KEY);
      const lastSeen = stored ? parseInt(stored, 10) : null;

      if (lastSeen !== null && currentWeek > lastSeen) {
        setPrevWeek(lastSeen);
        setShow(true);
      }
      localStorage.setItem(SEEN_WEEK_KEY, String(currentWeek));
    } catch {}
  }, [currentWeek]);

  if (!show || !currentWeek) return null;

  const size = getBabySize(currentWeek);
  const highlights = getWeekHighlights(currentWeek);

  const handleClose = () => setShow(false);
  const handleSeeWeek = () => {
    setShow(false);
    navigate("/graviditet/uge");
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center"
      style={{ background: "hsl(0 0% 0% / 0.45)" }}
      onClick={handleClose}
    >
      <div
        className="w-full max-w-md rounded-t-[28px] px-6 pt-6 pb-10 section-fade-in"
        style={{ background: "hsl(var(--warm-white))" }}
        onClick={e => e.stopPropagation()}
      >
        {/* Close */}
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 w-8 h-8 rounded-full flex items-center justify-center text-muted-foreground active:scale-95"
          style={{ background: "hsl(var(--stone-lighter))" }}
        >
          <X className="w-4 h-4" />
        </button>

        {/* Fruit */}
        <div className="text-center mb-4">
          <span className="text-[5rem] leading-none block">{size.emoji}</span>
        </div>

        {/* Headline */}
        {prevWeek && (
          <p className="text-[0.72rem] tracking-[0.12em] uppercase text-muted-foreground text-center mb-1">
            Du gennemførte uge {prevWeek}
          </p>
        )}
        <h2 className="font-serif text-[1.35rem] font-medium text-center mb-1">
          Velkommen til uge {currentWeek} 💛
        </h2>
        <p className="text-[0.85rem] text-muted-foreground text-center mb-5">
          Din baby er nu på størrelse med {size.label.toLowerCase()} — {size.lengthCm} cm · {size.weightG} g
        </p>

        {/* Highlights */}
        <div
          className="rounded-2xl px-4 py-4 mb-5 space-y-2"
          style={{ background: "hsl(var(--sage-light))" }}
        >
          <p className="text-[0.72rem] font-medium tracking-[0.08em] uppercase text-muted-foreground mb-2">
            Det kan I forvente i uge {currentWeek}
          </p>
          {highlights.map((h, i) => (
            <div key={i} className="flex items-center gap-2">
              <div
                className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                style={{ background: "hsl(var(--moss))" }}
              />
              <p className="text-[0.82rem]">{h}</p>
            </div>
          ))}
        </div>

        {/* CTA */}
        <button
          onClick={handleSeeWeek}
          className="w-full py-3.5 rounded-full text-[0.85rem] font-semibold text-white transition-all active:scale-[0.98]"
          style={{ background: "hsl(var(--moss))" }}
        >
          Se uge {currentWeek}
        </button>
      </div>
    </div>
  );
}
