import { useFamily } from "@/context/FamilyContext";
import { getBabySize } from "@/lib/phaseData";
import babySizeImg from "@/assets/baby-size-lemon.png";

export function WeekProgress() {
  const { currentWeek, totalWeeks, trimester } = useFamily();
  const progress = (currentWeek / totalWeeks) * 100;
  const size = getBabySize(currentWeek);

  return (
    <div className="card-soft flex flex-col items-center text-center gap-4 section-fade-in">
      {/* Progress ring */}
      <div className="relative w-36 h-36">
        <svg className="w-full h-full -rotate-90" viewBox="0 0 120 120">
          <circle cx="60" cy="60" r="52" fill="none" stroke="hsl(var(--sage-light))" strokeWidth="8" />
          <circle
            cx="60" cy="60" r="52" fill="none"
            stroke="hsl(var(--sage))" strokeWidth="8" strokeLinecap="round"
            strokeDasharray={`${2 * Math.PI * 52}`}
            strokeDashoffset={`${2 * Math.PI * 52 * (1 - progress / 100)}`}
            className="transition-all duration-1000 ease-out"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-3xl font-serif">{currentWeek}</span>
          <span className="text-xs text-muted-foreground">af {totalWeeks} uger</span>
        </div>
      </div>

      {/* Baby size */}
      <div className="flex items-center gap-3 bg-sand-light rounded-2xl px-5 py-3">
        <img src={babySizeImg} alt="Baby størrelse" className="w-10 h-10 object-contain" />
        <div className="text-left">
          <p className="text-sm text-muted-foreground">Barnet er nu som</p>
          <p className="font-medium">{size.label} {size.emoji}</p>
        </div>
      </div>

      {/* Trimester badge */}
      <span className="inline-block text-xs font-medium bg-sage-light text-foreground px-3 py-1 rounded-full">
        {trimester}. trimester
      </span>
    </div>
  );
}
