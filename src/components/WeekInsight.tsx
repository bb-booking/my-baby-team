import { useFamily } from "@/context/FamilyContext";
import { getWeekInsight } from "@/lib/phaseData";
import { Sparkles } from "lucide-react";
import { useTranslation } from "react-i18next";

export function WeekInsight() {
  const { currentWeek } = useFamily();
  const { t } = useTranslation();
  const data = getWeekInsight(currentWeek);

  return (
    <div className="card-soft section-fade-in" style={{ animationDelay: "100ms" }}>
      <div className="flex items-start gap-3">
        <div className="w-9 h-9 rounded-xl bg-clay-light flex items-center justify-center flex-shrink-0 mt-0.5">
          <Sparkles className="w-4 h-4 text-clay" />
        </div>
        <div>
          <h3 className="font-serif text-lg mb-1">{t("weekInsight.title")}</h3>
          <p className="text-sm text-muted-foreground leading-relaxed">{data.insight}</p>
        </div>
      </div>
      {data.milestone && (
        <div className="mt-4 bg-sage-light rounded-xl px-4 py-3">
          <p className="text-sm font-medium text-foreground">🎯 {data.milestone}</p>
        </div>
      )}
    </div>
  );
}
