import { useState } from "react";
import { useDiary } from "@/context/DiaryContext";
import { useFamily } from "@/context/FamilyContext";
import { Moon, ChevronDown, ChevronUp } from "lucide-react";
import { useTranslation } from "react-i18next";

function getLast7Days(): string[] {
  const days: string[] = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    days.push(d.toISOString().slice(0, 10));
  }
  return days;
}

// Monday-first day labels — indexed (dayOfWeek + 6) % 7
const DA_DAY_LABELS = ["Man", "Tir", "Ons", "Tor", "Fre", "Lør", "Søn"];
const EN_DAY_LABELS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

export function NatteplanCard() {
  const { nightShifts, setNightShift, getTonightShift } = useDiary();
  const { profile, morName, farName } = useFamily();
  const isMor = profile.role === "mor";
  const feedingMethod = profile.morHealth?.feedingMethod;
  const [expanded, setExpanded] = useState(false);
  const { t, i18n } = useTranslation();

  const tonightStr = new Date().toISOString().slice(0, 10);
  const tonightShift = getTonightShift();
  const days = getLast7Days();
  const DAY_LABELS = i18n.language === "en" ? EN_DAY_LABELS : DA_DAY_LABELS;

  const morShifts = nightShifts.filter(s => days.includes(s.date) && s.assignee === "mor").length;
  const farShifts = nightShifts.filter(s => days.includes(s.date) && s.assignee === "far").length;
  const totalAssigned = morShifts + farShifts;

  const getSuggestion = () => {
    const m = morName || (i18n.language === "en" ? "Mom" : "Mor");
    const f = farName || (i18n.language === "en" ? "Dad" : "Far");
    if (feedingMethod === "amning") return t("natteplan.sugNursing", { mor: m, far: f });
    if (feedingMethod === "flaske") return t("natteplan.sugBottle");
    return t("natteplan.sugCombo", { mor: m, far: f });
  };

  const shiftLabel = (assignee: "mor" | "far") => assignee === "mor" ? (morName || "Mor") : (farName || "Far");
  const shiftColor = (assignee: "mor" | "far") => assignee === "mor"
    ? { bg: "hsl(var(--clay-light))", text: "hsl(var(--bark))" }
    : { bg: "hsl(var(--sage-light))", text: "hsl(var(--moss))" };

  return (
    <div className="card-soft section-fade-in">
      <button
        onClick={() => setExpanded(e => !e)}
        className="w-full flex items-center justify-between"
      >
        <div className="flex items-center gap-2">
          <Moon className="w-4 h-4" style={{ color: "hsl(var(--moss))" }} />
          <p className="text-[0.55rem] tracking-[0.14em] uppercase text-muted-foreground">{t("natteplan.title")}</p>
        </div>
        {tonightShift ? (
          <span className="text-[0.78rem] font-medium px-2.5 py-1 rounded-lg"
            style={{ background: shiftColor(tonightShift.assignee).bg, color: shiftColor(tonightShift.assignee).text }}>
            {t("natteplan.hasShift", { name: shiftLabel(tonightShift.assignee) })}
          </span>
        ) : (
          <span className="text-[0.72rem] text-muted-foreground">{t("natteplan.notPlanned")}</span>
        )}
        {expanded ? <ChevronUp className="w-4 h-4 text-muted-foreground ml-2" /> : <ChevronDown className="w-4 h-4 text-muted-foreground ml-2" />}
      </button>

      {expanded && (
        <div className="mt-4 space-y-4">
          {/* Tonight assignment */}
          <div>
            <p className="text-[0.68rem] tracking-[0.1em] uppercase text-muted-foreground mb-2">{t("natteplan.tonight")}</p>
            <div className="grid grid-cols-2 gap-2">
              {(["mor", "far"] as const).map(role => {
                const colors = shiftColor(role);
                const isActive = tonightShift?.assignee === role;
                return (
                  <button
                    key={role}
                    onClick={() => setNightShift(tonightStr, role)}
                    className="py-3 rounded-xl text-[0.82rem] font-medium transition-all active:scale-95"
                    style={{
                      background: isActive ? colors.bg : "hsl(var(--stone-lighter, var(--cream)))",
                      color: isActive ? colors.text : "hsl(var(--muted-foreground))",
                      border: isActive ? `1.5px solid ${colors.text}30` : "1.5px solid transparent",
                    }}
                  >
                    {shiftLabel(role)}
                    {isActive && " ✓"}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Feeding suggestion */}
          <div className="rounded-xl px-3 py-2.5" style={{ background: "hsl(var(--cream))", border: "1px solid hsl(var(--stone-light))" }}>
            <p className="text-[0.68rem] tracking-[0.1em] uppercase text-muted-foreground mb-1">{t("natteplan.suggestion")}</p>
            <p className="text-[0.78rem] leading-relaxed" style={{ color: "hsl(var(--bark))" }}>💡 {getSuggestion()}</p>
          </div>

          {/* 7-day balance */}
          {totalAssigned > 0 && (
            <div>
              <p className="text-[0.68rem] tracking-[0.1em] uppercase text-muted-foreground mb-2">{t("natteplan.distribution")}</p>
              <div className="flex gap-1 mb-2">
                {days.map((day, i) => {
                  const shift = nightShifts.find(s => s.date === day);
                  const isToday = day === tonightStr;
                  const dayOfWeek = new Date(day).getDay();
                  const label = DAY_LABELS[(dayOfWeek + 6) % 7];
                  return (
                    <div key={day} className="flex-1 flex flex-col items-center gap-1">
                      <div className="w-full h-7 rounded-lg flex items-center justify-center"
                        style={{
                          background: shift ? shiftColor(shift.assignee).bg : "hsl(var(--stone-lighter, var(--cream)))",
                          border: isToday ? "1.5px solid hsl(var(--moss))" : "1.5px solid transparent",
                        }}>
                        {shift && (
                          <span className="text-[0.6rem] font-semibold" style={{ color: shiftColor(shift.assignee).text }}>
                            {shift.assignee === "mor" ? "M" : "F"}
                          </span>
                        )}
                      </div>
                      <p className="text-[0.52rem] text-muted-foreground">{label}</p>
                    </div>
                  );
                })}
              </div>
              <div className="flex items-center justify-between text-[0.68rem] text-muted-foreground">
                <span style={{ color: "hsl(var(--bark))" }}>{morName || (i18n.language === "en" ? "Mom" : "Mor")}: {morShifts} {t("natteplan.nights")}</span>
                <span style={{ color: "hsl(var(--moss))" }}>{farName || (i18n.language === "en" ? "Dad" : "Far")}: {farShifts} {t("natteplan.nights")}</span>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
