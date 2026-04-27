import { useFamily } from "@/context/FamilyContext";
import { getPregnancyWeekData } from "@/lib/phaseData";
import { useTranslation } from "react-i18next";

export function PregnancyWeekDetail() {
  const { currentWeek, profile } = useFamily();
  const isMor = profile.role === "mor";
  const data = getPregnancyWeekData(currentWeek);
  const { t } = useTranslation();

  return (
    <div className="space-y-2 section-fade-in" style={{ animationDelay: "60ms" }}>
      <p className="label-upper">{t("pregnancyDetail.weekLabel", { week: currentWeek })}</p>

      {/* Baby development */}
      <div className="card-soft">
        <div className="flex items-start gap-3">
          <span className="text-xl flex-shrink-0">👶</span>
          <div>
            <p className="text-[0.52rem] tracking-[0.16em] uppercase font-semibold mb-0.5" style={{ color: "hsl(var(--moss))" }}>{t("pregnancyDetail.babyDev")}</p>
            <p className="text-[0.82rem] leading-relaxed text-foreground/80">{data.babyDev}</p>
          </div>
        </div>
      </div>

      {/* Mother's body */}
      <div className="card-soft" style={{ background: "hsl(var(--clay-light))" }}>
        <div className="flex items-start gap-3">
          <span className="text-xl flex-shrink-0">🌸</span>
          <div>
            <p className="text-[0.52rem] tracking-[0.16em] uppercase font-semibold mb-0.5" style={{ color: "hsl(var(--bark))" }}>{t("pregnancyDetail.motherBody")}</p>
            <p className="text-[0.82rem] leading-relaxed text-foreground/80">{data.motherBody}</p>
          </div>
        </div>
      </div>

      {/* Partner focus */}
      {!isMor && (
        <div className="card-soft" style={{ background: "hsl(var(--sage-light))" }}>
          <div className="flex items-start gap-3">
            <span className="text-xl flex-shrink-0">🤝</span>
            <div>
              <p className="text-[0.52rem] tracking-[0.16em] uppercase font-semibold mb-0.5" style={{ color: "hsl(var(--moss))" }}>{t("pregnancyDetail.partnerTask")}</p>
              <p className="text-[0.82rem] leading-relaxed text-foreground/80">{data.partnerFocus}</p>
            </div>
          </div>
        </div>
      )}
      {isMor && (
        <div className="rounded-xl px-3 py-2.5" style={{ background: "hsl(var(--sage-light))" }}>
          <div className="flex items-center gap-2">
            <span className="text-base">{data.highlightEmoji}</span>
            <p className="text-[0.82rem] font-medium" style={{ color: "hsl(var(--moss))" }}>{data.highlight}</p>
          </div>
        </div>
      )}
    </div>
  );
}
