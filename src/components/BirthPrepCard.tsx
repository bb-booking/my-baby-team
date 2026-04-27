import { useState } from "react";
import { useFamily } from "@/context/FamilyContext";
import { ChevronDown, ChevronUp, Check } from "lucide-react";
import { useTranslation } from "react-i18next";

const HOSPITAL_BAG_IDS: { id: string; who: "mor" | "far" | "baby" }[] = [
  { id: "hb1",  who: "mor" }, { id: "hb2",  who: "mor" }, { id: "hb3",  who: "mor" },
  { id: "hb4",  who: "mor" }, { id: "hb5",  who: "mor" }, { id: "hb6",  who: "mor" },
  { id: "hb7",  who: "mor" }, { id: "hb8",  who: "mor" },
  { id: "hb9",  who: "far" }, { id: "hb10", who: "far" }, { id: "hb11", who: "far" }, { id: "hb12", who: "far" },
  { id: "hb13", who: "baby" }, { id: "hb14", who: "baby" }, { id: "hb15", who: "baby" }, { id: "hb16", who: "baby" },
];

const BIRTH_PLAN_IDS = ["bp1","bp2","bp3","bp4","bp5","bp6","bp7","bp8","bp9","bp10"];

function loadChecked(key: string): string[] {
  try { return JSON.parse(localStorage.getItem(key) || "[]"); } catch { return []; }
}
function saveChecked(key: string, ids: string[]) {
  localStorage.setItem(key, JSON.stringify(ids));
}

export function BirthPrepCard() {
  const { currentWeek, profile } = useFamily();
  const isMor = profile.role === "mor";
  const { t } = useTranslation();

  const [openBag, setOpenBag] = useState(false);
  const [openPlan, setOpenPlan] = useState(false);
  const [bagDone, setBagDone] = useState<string[]>(() => loadChecked("melo-hospital-bag"));
  const [planDone, setPlanDone] = useState<string[]>(() => loadChecked("melo-birth-plan"));

  if (currentWeek < 28) return null;

  const toggleBag = (id: string) => {
    const next = bagDone.includes(id) ? bagDone.filter(d => d !== id) : [...bagDone, id];
    setBagDone(next);
    saveChecked("melo-hospital-bag", next);
  };
  const togglePlan = (id: string) => {
    const next = planDone.includes(id) ? planDone.filter(d => d !== id) : [...planDone, id];
    setPlanDone(next);
    saveChecked("melo-birth-plan", next);
  };

  const bagProgress = Math.round((bagDone.length / HOSPITAL_BAG_IDS.length) * 100);
  const planProgress = Math.round((planDone.length / BIRTH_PLAN_IDS.length) * 100);

  const bagByWho = (who: "mor" | "far" | "baby") => HOSPITAL_BAG_IDS.filter(i => i.who === who);

  return (
    <div className="space-y-2 section-fade-in" style={{ animationDelay: "120ms" }}>
      <p className="label-upper">{t("birthPrep.title")}</p>

      {/* Hospital bag */}
      <div className="card-soft">
        <button onClick={() => setOpenBag(v => !v)} className="w-full flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <span className="text-xl">🧳</span>
            <div className="text-left">
              <p className="text-[0.85rem] font-medium">{t("birthPrep.bag")}</p>
              <p className="text-[0.65rem] text-muted-foreground">{t("birthPrep.packed", { done: bagDone.length, total: HOSPITAL_BAG_IDS.length })}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-16 h-1.5 rounded-full overflow-hidden" style={{ background: "hsl(var(--stone-lighter))" }}>
              <div className="h-full rounded-full transition-all" style={{ width: `${bagProgress}%`, background: "hsl(var(--moss))" }} />
            </div>
            {openBag ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
          </div>
        </button>

        {openBag && (
          <div className="mt-3 space-y-3">
            {(["mor", "far", "baby"] as const).map(who => (
              <div key={who}>
                <p className="text-[0.58rem] tracking-[0.14em] uppercase text-muted-foreground mb-1.5">
                  {who === "mor" ? t("birthPrep.forMom") : who === "far" ? (isMor ? t("birthPrep.forPartner") : t("birthPrep.forYou")) : t("birthPrep.forBaby")}
                </p>
                <div className="space-y-1">
                  {bagByWho(who).map(item => (
                    <button key={item.id} onClick={() => toggleBag(item.id)} className="w-full flex items-center gap-3 py-1.5 transition-opacity active:opacity-60">
                      <div className="w-5 h-5 rounded-md flex items-center justify-center flex-shrink-0 transition-colors"
                        style={{ background: bagDone.includes(item.id) ? "hsl(var(--moss))" : "transparent", border: `1.5px solid ${bagDone.includes(item.id) ? "hsl(var(--moss))" : "hsl(var(--stone-light))"}` }}>
                        {bagDone.includes(item.id) && <Check className="w-3 h-3 text-white" />}
                      </div>
                      <p className={`text-[0.78rem] text-left ${bagDone.includes(item.id) ? "line-through text-muted-foreground" : ""}`}>{t(`birthPrep.${item.id}`)}</p>
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Birth plan */}
      <div className="card-soft">
        <button onClick={() => setOpenPlan(v => !v)} className="w-full flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <span className="text-xl">📋</span>
            <div className="text-left">
              <p className="text-[0.85rem] font-medium">{t("birthPrep.plan")}</p>
              <p className="text-[0.65rem] text-muted-foreground">{t("birthPrep.clarified", { done: planDone.length, total: BIRTH_PLAN_IDS.length })}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-16 h-1.5 rounded-full overflow-hidden" style={{ background: "hsl(var(--stone-lighter))" }}>
              <div className="h-full rounded-full transition-all" style={{ width: `${planProgress}%`, background: "hsl(var(--clay))" }} />
            </div>
            {openPlan ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
          </div>
        </button>

        {openPlan && (
          <div className="mt-3 space-y-1">
            {BIRTH_PLAN_IDS.map(id => (
              <button key={id} onClick={() => togglePlan(id)} className="w-full flex items-center gap-3 py-1.5 transition-opacity active:opacity-60">
                <div className="w-5 h-5 rounded-md flex items-center justify-center flex-shrink-0 transition-colors"
                  style={{ background: planDone.includes(id) ? "hsl(var(--clay))" : "transparent", border: `1.5px solid ${planDone.includes(id) ? "hsl(var(--clay))" : "hsl(var(--stone-light))"}` }}>
                  {planDone.includes(id) && <Check className="w-3 h-3 text-white" />}
                </div>
                <p className={`text-[0.78rem] text-left ${planDone.includes(id) ? "line-through text-muted-foreground" : ""}`}>{t(`birthPrep.${id}`)}</p>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
