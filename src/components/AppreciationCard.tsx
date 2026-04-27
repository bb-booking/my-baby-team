import { useState } from "react";
import { useFamily } from "@/context/FamilyContext";
import { Heart, Calendar } from "lucide-react";
import { cn } from "@/lib/utils";
import { useTranslation } from "react-i18next";

export function AppreciationCard() {
  const { profile, appreciations, addAppreciation, morName, farName } = useFamily();
  const { t } = useTranslation();
  if (profile.hasPartner === false) return null;
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
        <p className="text-[0.6rem] tracking-[0.16em] uppercase text-muted-foreground">{t("appreciation.title")}</p>
      </div>

      {/* Latest from partner */}
      {latestFromPartner && (
        <div className="rounded-xl px-3 py-2.5" style={{ background: "hsl(var(--clay-light) / 0.4)" }}>
          <p className="text-[0.6rem] tracking-[0.1em] uppercase text-muted-foreground mb-1">
            {t("appreciation.noticeLabel", { name: partnerName || "" })}
          </p>
          <p className="text-[0.82rem] italic">"{latestFromPartner.text}"</p>
        </div>
      )}

      {/* Send appreciation */}
      {!sentToday ? (
        <div className="space-y-2">
          <p className="text-[0.78rem] text-muted-foreground">
            {t("appreciation.hint")}
          </p>
          <textarea
            value={text}
            onChange={e => setText(e.target.value)}
            placeholder={t("appreciation.placeholder")}
            rows={2}
            maxLength={200}
            className="w-full rounded-xl border-[1.5px] border-[hsl(var(--stone-light))] bg-background px-3 py-2.5 text-[0.82rem] focus:outline-none focus:border-[hsl(var(--clay))] transition-colors resize-none"
          />
          <button
            onClick={handleSend}
            disabled={!text.trim()}
            className={cn(
              "w-full py-2.5 rounded-full text-[0.78rem] font-medium transition-all active:scale-[0.98]",
              text.trim()
                ? "text-white"
                : "bg-muted text-muted-foreground cursor-not-allowed"
            )}
            style={text.trim() ? { background: "hsl(var(--clay))" } : {}}
          >
            {t("appreciation.sendTo", { name: partnerName || "" })}
          </button>
        </div>
      ) : (
        <div className="rounded-xl px-3 py-2.5 text-center" style={{ background: role === "mor" ? "hsl(var(--clay-light))" : "hsl(var(--sage-light))" }}>
          <p className="text-[0.82rem]">{sent ? t("appreciation.sent") : t("appreciation.alreadySent")}</p>
        </div>
      )}

      <DateNightNudge />
    </div>
  );
}

function DateNightNudge() {
  const { t } = useTranslation();
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
          <p className="text-[0.78rem] font-medium mb-0.5">{t("appreciation.dateNight")}</p>
          <p className="text-[0.7rem] text-muted-foreground leading-relaxed">
            {t("appreciation.dateNightDesc")}
          </p>
        </div>
        <button onClick={dismiss} className="text-[0.62rem] text-muted-foreground shrink-0 mt-0.5 hover:text-foreground">
          {t("appreciation.close")}
        </button>
      </div>
    </div>
  );
}
