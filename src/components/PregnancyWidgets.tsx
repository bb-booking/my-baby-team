import { useFamily } from "@/context/FamilyContext";
import { getBabySize, getWeekInsight } from "@/lib/phaseData";
import { useTranslation } from "react-i18next";

export function PregnancyWeekBar() {
  const { currentWeek, totalWeeks, trimester } = useFamily();
  const { t } = useTranslation();
  const progress = (currentWeek / totalWeeks) * 100;

  return (
    <div className="card-soft flex items-center gap-5 section-fade-in">
      <div className="flex flex-col items-center flex-shrink-0 min-w-[64px]">
        <span className="text-5xl font-light leading-none" style={{ color: "hsl(var(--moss))" }}>
          {currentWeek}
        </span>
        <span className="label-upper mt-1">{t("pregnancy.weekLabel")}</span>
      </div>
      <div className="flex-1">
        <div className="flex items-center justify-between mb-2">
          <p className="text-[0.95rem]">{t("pregnancy.trimesterLabel", { num: trimester })}</p>
          <p className="text-[0.72rem] font-medium text-muted-foreground">{Math.round(progress)}%</p>
        </div>
        <div className="h-1.5 rounded-full overflow-hidden" style={{ background: "hsl(var(--stone-lighter))" }}>
          <div
            className="h-full rounded-full transition-all duration-700"
            style={{
              width: `${progress}%`,
              background: "linear-gradient(90deg, hsl(var(--sage)), hsl(var(--moss)))",
            }}
          />
        </div>
        <div className="flex justify-between mt-1.5">
          <span className="text-[0.56rem] tracking-[0.1em] uppercase text-muted-foreground">{t("pregnancy.trimShort1")}</span>
          <span className="text-[0.56rem] tracking-[0.1em] uppercase text-muted-foreground">{t("pregnancy.trimShort2")}</span>
          <span className="text-[0.56rem] tracking-[0.1em] uppercase text-muted-foreground">{t("pregnancy.trimShort3")}</span>
        </div>
      </div>
    </div>
  );
}

export function BabySizeCard() {
  const { currentWeek } = useFamily();
  const { t } = useTranslation();
  const size = getBabySize(currentWeek);

  return (
    <div
      className="rounded-2xl p-5 flex items-center gap-5 section-fade-in"
      style={{
        background: "linear-gradient(135deg, hsl(var(--sage) / 0.1), hsl(var(--moss) / 0.05))",
        border: "1px solid hsl(var(--sage) / 0.25)",
        animationDelay: "80ms",
      }}
    >
      <span className="text-5xl flex-shrink-0 w-16 text-center drop-shadow-sm">{size.emoji}</span>
      <div className="flex-1">
        <p className="text-[1.3rem] font-normal">{size.label}</p>
        <div className="flex gap-3 mt-1.5">
          <span className="text-[0.72rem] px-2 py-0.5 rounded-full font-medium"
            style={{ background: "hsl(var(--sage-light))", color: "hsl(var(--moss))" }}>
            {size.lengthCm} cm
          </span>
          <span className="text-[0.72rem] px-2 py-0.5 rounded-full font-medium"
            style={{ background: "hsl(var(--clay-light))", color: "hsl(var(--bark))" }}>
            {size.weightG} g
          </span>
        </div>
      </div>
    </div>
  );
}

export function PregnancyInsight() {
  const { currentWeek } = useFamily();
  const { t } = useTranslation();
  const data = getWeekInsight(currentWeek);

  return (
    <div className="card-soft section-fade-in" style={{ animationDelay: "160ms" }}>
      <p className="label-upper mb-3">{t("pregnancy.thisWeek")}</p>
      <p className="text-[0.85rem] text-foreground/70 leading-relaxed">{data.insight}</p>
      {data.milestone && (
        <div className="mt-3 rounded-xl px-4 py-2.5" style={{ background: "hsl(var(--sage-light))" }}>
          <p className="text-[0.82rem] font-normal">🎯 {data.milestone}</p>
        </div>
      )}
    </div>
  );
}
