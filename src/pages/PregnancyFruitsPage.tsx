import { useNavigate } from "react-router-dom";
import { useFamily } from "@/context/FamilyContext";
import { ChevronLeft, Lock, Check } from "lucide-react";

const ALL_WEEKS: { week: number; label: string; emoji: string; lengthCm: string; weightG: string }[] = [
  { week: 4,  label: "Et valmuefrø",   emoji: "🌱", lengthCm: "0.1",  weightG: "<1"   },
  { week: 6,  label: "En linse",       emoji: "🫘", lengthCm: "0.5",  weightG: "<1"   },
  { week: 8,  label: "Et hindbær",     emoji: "🫐", lengthCm: "1.6",  weightG: "1"    },
  { week: 10, label: "En oliven",      emoji: "🫒", lengthCm: "3",    weightG: "4"    },
  { week: 12, label: "En lime",        emoji: "🍋", lengthCm: "5.4",  weightG: "14"   },
  { week: 14, label: "En citron",      emoji: "🍋", lengthCm: "8.7",  weightG: "43"   },
  { week: 16, label: "En avocado",     emoji: "🥑", lengthCm: "11.6", weightG: "100"  },
  { week: 18, label: "En peberfrugt",  emoji: "🫑", lengthCm: "14.2", weightG: "190"  },
  { week: 20, label: "En banan",       emoji: "🍌", lengthCm: "25",   weightG: "300"  },
  { week: 22, label: "En papaya",      emoji: "🥭", lengthCm: "27.8", weightG: "430"  },
  { week: 24, label: "En majskolbe",   emoji: "🌽", lengthCm: "30",   weightG: "600"  },
  { week: 26, label: "Et salathovede", emoji: "🥬", lengthCm: "35.6", weightG: "760"  },
  { week: 28, label: "En aubergine",   emoji: "🍆", lengthCm: "37.6", weightG: "1000" },
  { week: 30, label: "En kokos",       emoji: "🥥", lengthCm: "39.9", weightG: "1300" },
  { week: 32, label: "En ananas",      emoji: "🍍", lengthCm: "42.4", weightG: "1700" },
  { week: 34, label: "En cantaloupe",  emoji: "🍈", lengthCm: "45",   weightG: "2100" },
  { week: 36, label: "En honeydew",    emoji: "🍈", lengthCm: "47.4", weightG: "2600" },
  { week: 38, label: "En vandmelon",   emoji: "🍉", lengthCm: "49.8", weightG: "3100" },
  { week: 40, label: "Et lille græskar", emoji: "🎃", lengthCm: "51", weightG: "3400" },
];

export default function PregnancyFruitsPage() {
  const navigate = useNavigate();
  const { currentWeek } = useFamily();

  // Find the closest milestone week at or before current
  const currentMilestone = ALL_WEEKS.reduce((prev, cur) =>
    cur.week <= currentWeek ? cur : prev
  );

  return (
    <div className="space-y-4 pb-8 section-fade-in">

      {/* Header */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-1 text-muted-foreground text-[0.78rem] active:scale-95 transition-transform"
        >
          <ChevronLeft className="w-4 h-4" />
          Tilbage
        </button>
      </div>

      <div>
        <h1 className="text-[1.6rem]">Babys rejse</h1>
        <p className="text-[0.82rem] text-muted-foreground mt-1">Uge for uge — fra frø til mødet</p>
      </div>

      {/* Current week — highlighted */}
      <div
        className="rounded-[20px] px-5 py-5"
        style={{
          background: "linear-gradient(145deg, hsl(154 22% 28%), hsl(154 27% 20%))",
        }}
      >
        <p className="text-[0.6rem] tracking-[0.18em] uppercase text-white/50 mb-2">Du er her nu</p>
        <div className="flex items-center justify-between">
          <div>
            <p className="font-serif text-[1.4rem] font-medium text-white">Uge {currentWeek}</p>
            <p className="text-[0.85rem] text-white/70 mt-0.5">{currentMilestone.label}</p>
            <p className="text-[0.72rem] text-white/50 mt-1">
              {currentMilestone.lengthCm} cm · {currentMilestone.weightG} g
            </p>
          </div>
          <span className="text-[4rem] leading-none">{currentMilestone.emoji}</span>
        </div>
      </div>

      {/* All weeks list */}
      <div className="space-y-2">
        {ALL_WEEKS.map(entry => {
          const isPast = entry.week < currentWeek && entry.week !== currentMilestone.week;
          const isCurrent = entry.week === currentMilestone.week;
          const isFuture = entry.week > currentMilestone.week;

          if (isCurrent) return null; // shown above

          if (isFuture) {
            return (
              <div
                key={entry.week}
                className="flex items-center gap-3 rounded-2xl px-4 py-3.5"
                style={{
                  background: "hsl(var(--stone-lighter))",
                  border: "1px solid hsl(var(--stone-light))",
                  opacity: 0.6,
                }}
              >
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
                  style={{ background: "hsl(var(--stone-light))" }}
                >
                  <Lock className="w-4 h-4 text-muted-foreground" />
                </div>
                <div className="flex-1">
                  <p className="text-[0.78rem] font-medium text-muted-foreground">
                    Låst — åbner i uge {entry.week}
                  </p>
                  <p className="text-[0.65rem] text-muted-foreground/60">
                    {entry.week - currentWeek} {entry.week - currentWeek === 1 ? "uge" : "uger"} tilbage
                  </p>
                </div>
              </div>
            );
          }

          // Past weeks
          return (
            <div
              key={entry.week}
              className="flex items-center gap-3 rounded-2xl px-4 py-3.5"
              style={{
                background: "hsl(var(--warm-white))",
                border: "1px solid hsl(var(--stone-light))",
              }}
            >
              <span className="text-2xl flex-shrink-0 w-10 text-center">{entry.emoji}</span>
              <div className="flex-1">
                <p className="text-[0.82rem] font-medium">Uge {entry.week} — {entry.label}</p>
                <p className="text-[0.68rem] text-muted-foreground">
                  {entry.lengthCm} cm · {entry.weightG} g
                </p>
              </div>
              <div
                className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0"
                style={{ background: "hsl(var(--sage-light))" }}
              >
                <Check className="w-3.5 h-3.5" style={{ color: "hsl(var(--moss))" }} />
              </div>
            </div>
          );
        })}
      </div>

      {/* Disclaimer */}
      <div className="rounded-xl px-4 py-3" style={{ background: "hsl(var(--stone-lighter))" }}>
        <p className="text-[0.68rem] text-muted-foreground leading-relaxed">
          Størrelser er gennemsnit og vejledende. Alle babyer vokser i eget tempo.
        </p>
      </div>
    </div>
  );
}
