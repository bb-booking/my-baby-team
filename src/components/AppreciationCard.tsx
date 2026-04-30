import { useState } from "react";
import { useFamily } from "@/context/FamilyContext";
import { Heart } from "lucide-react";
import { cn } from "@/lib/utils";
import { useTranslation } from "react-i18next";

const DATE_NIGHT_KEY = "melo-datenight-dream";

const PRESET_OPTIONS = [
  { id: "sofa", emoji: "🛋️", labelKey: "appreciation.dateNightSofa" },
  { id: "dinner", emoji: "🍽️", labelKey: "appreciation.dateNightDinner" },
  { id: "active", emoji: "🏃", labelKey: "appreciation.dateNightActive" },
  { id: "spa", emoji: "🧖", labelKey: "appreciation.dateNightSpa" },
] as const;

type PresetId = typeof PRESET_OPTIONS[number]["id"];
type DateNightId = PresetId | "custom_mor" | "custom_far";

export function AppreciationCard() {
  const { profile, setProfile, appreciations, addAppreciation, morName, farName } = useFamily();
  const { t } = useTranslation();
  if (profile.hasPartner === false) return null;
  const { role } = profile;
  const partnerRole = role === "mor" ? "far" : "mor";
  const partnerName = role === "mor" ? farName : morName;

  const [text, setText] = useState("");
  const [sent, setSent] = useState(false);

  const [selected, setSelected] = useState<DateNightId | null>(() => {
    try { return localStorage.getItem(DATE_NIGHT_KEY) as DateNightId | null; } catch { return null; }
  });

  const [showCustomInput, setShowCustomInput] = useState(false);
  const [customDraft, setCustomDraft] = useState(profile.dateNightIdeas?.[role] || "");

  const todayStr = new Date().toISOString().slice(0, 10);
  const sentToday = appreciations.some(a => a.from === role && a.date.startsWith(todayStr));
  const latestFromPartner = appreciations.filter(a => a.from !== role).at(-1);

  const myCustomIdea = profile.dateNightIdeas?.[role];
  const partnerCustomIdea = profile.dateNightIdeas?.[partnerRole];

  const accentBg = role === "mor" ? "hsl(var(--clay-light))" : "hsl(var(--sage-light))";
  const accentText = role === "mor" ? "hsl(var(--bark))" : "hsl(var(--moss))";
  const accentSolid = role === "mor" ? "hsl(var(--clay))" : "hsl(var(--moss))";
  const accentSolidText = role === "mor" ? "hsl(var(--bark))" : "white";

  const handleSend = () => {
    if (!text.trim()) return;
    addAppreciation(text.trim());
    setText("");
    setSent(true);
    setTimeout(() => setSent(false), 3000);
  };

  const selectOption = (id: DateNightId) => {
    const next = selected === id ? null : id;
    setSelected(next);
    try { next ? localStorage.setItem(DATE_NIGHT_KEY, next) : localStorage.removeItem(DATE_NIGHT_KEY); } catch {}
  };

  const saveCustomIdea = () => {
    if (!customDraft.trim()) return;
    setProfile({
      ...profile,
      dateNightIdeas: { ...profile.dateNightIdeas, [role]: customDraft.trim() },
    });
    setShowCustomInput(false);
    selectOption(`custom_${role}` as DateNightId);
  };

  return (
    <div className="card-soft section-fade-in space-y-4">
      <div className="flex items-center gap-2">
        <Heart className="w-4 h-4" style={{ color: "hsl(var(--clay))" }} />
        <p className="text-[0.6rem] tracking-[0.16em] uppercase text-muted-foreground">{t("appreciation.title")}</p>
      </div>

      {/* Latest from partner */}
      {latestFromPartner && (
        <div className="rounded-xl px-3 py-2.5" style={{ background: accentBg }}>
          <p className="text-[0.6rem] tracking-[0.1em] uppercase text-muted-foreground mb-1">
            {t("appreciation.noticeLabel", { name: partnerName || "" })}
          </p>
          <p className="text-[0.82rem] italic" style={{ color: accentText }}>"{latestFromPartner.text}"</p>
        </div>
      )}

      {/* Send appreciation */}
      {!sentToday ? (
        <div className="space-y-2">
          <p className="text-[0.78rem] text-muted-foreground">{t("appreciation.hint")}</p>
          <textarea
            value={text}
            onChange={e => setText(e.target.value)}
            placeholder={t("appreciation.placeholder")}
            rows={2}
            maxLength={200}
            className="w-full rounded-xl border-[1.5px] border-[hsl(var(--stone-light))] bg-background px-3 py-2.5 text-[0.82rem] focus:outline-none transition-colors resize-none"
            style={{ fontSize: "16px" }}
          />
          <button
            onClick={handleSend}
            disabled={!text.trim()}
            className={cn(
              "w-full py-2.5 rounded-full text-[0.78rem] font-medium transition-all active:scale-[0.98]",
              !text.trim() && "bg-muted text-muted-foreground cursor-not-allowed"
            )}
            style={text.trim() ? { background: accentSolid, color: accentSolidText } : {}}
          >
            {t("appreciation.sendTo", { name: partnerName || "" })}
          </button>
        </div>
      ) : (
        <div className="rounded-xl px-3 py-2.5 text-center" style={{ background: accentBg }}>
          <p className="text-[0.82rem]" style={{ color: accentText }}>{sent ? t("appreciation.sent") : t("appreciation.alreadySent")}</p>
        </div>
      )}

      {/* Date night dreams */}
      <div className="border-t border-[hsl(var(--stone-lighter))] pt-3">
        <p className="text-[0.72rem] font-medium mb-1" style={{ color: "hsl(var(--bark))" }}>{t("appreciation.dateNightTitle")}</p>
        <p className="text-[0.68rem] text-muted-foreground mb-2.5">{t("appreciation.dateNightSubtitle")}</p>

        <div className="grid grid-cols-2 gap-2">
          {PRESET_OPTIONS.map(opt => {
            const isSelected = selected === opt.id;
            return (
              <button
                key={opt.id}
                onClick={() => selectOption(opt.id)}
                className="rounded-xl px-3 py-2.5 flex items-center gap-2 text-left transition-all active:scale-[0.97]"
                style={{
                  background: isSelected ? accentBg : "hsl(var(--cream))",
                  border: `1.5px solid ${isSelected ? accentText + "60" : "hsl(var(--stone-light))"}`,
                }}
              >
                <span className="text-base">{opt.emoji}</span>
                <span className="text-[0.72rem] leading-snug" style={{ color: isSelected ? accentText : "hsl(var(--foreground))" }}>
                  {t(opt.labelKey)}
                </span>
              </button>
            );
          })}

          {/* Partner's custom idea (read + selectable) */}
          {partnerCustomIdea && (
            <button
              onClick={() => selectOption(`custom_${partnerRole}` as DateNightId)}
              className="rounded-xl px-3 py-2.5 flex items-center gap-2 text-left transition-all active:scale-[0.97] col-span-2"
              style={{
                background: selected === `custom_${partnerRole}` ? accentBg : "hsl(var(--cream))",
                border: `1.5px solid ${selected === `custom_${partnerRole}` ? accentText + "60" : "hsl(var(--stone-light))"}`,
              }}
            >
              <span className="text-base">💌</span>
              <div className="flex-1 min-w-0">
                <p className="text-[0.6rem] text-muted-foreground">{t("appreciation.partnerIdea", { name: partnerName || "" })}</p>
                <p className="text-[0.75rem] leading-snug" style={{ color: selected === `custom_${partnerRole}` ? accentText : "hsl(var(--foreground))" }}>
                  {partnerCustomIdea}
                </p>
              </div>
            </button>
          )}

          {/* My custom idea */}
          {myCustomIdea && !showCustomInput ? (
            <button
              onClick={() => { setShowCustomInput(true); setCustomDraft(myCustomIdea); }}
              className="rounded-xl px-3 py-2.5 flex items-center gap-2 text-left transition-all active:scale-[0.97] col-span-2"
              style={{
                background: selected === `custom_${role}` ? accentBg : "hsl(var(--cream))",
                border: `1.5px solid ${selected === `custom_${role}` ? accentText + "60" : "hsl(var(--stone-light))"}`,
              }}
            >
              <span className="text-base">✏️</span>
              <div className="flex-1 min-w-0">
                <p className="text-[0.6rem] text-muted-foreground">{t("appreciation.myIdea")}</p>
                <p className="text-[0.75rem] leading-snug" style={{ color: selected === `custom_${role}` ? accentText : "hsl(var(--foreground))" }}>
                  {myCustomIdea}
                </p>
              </div>
            </button>
          ) : !showCustomInput ? (
            <button
              onClick={() => setShowCustomInput(true)}
              className="rounded-xl px-3 py-2.5 flex items-center gap-2 text-left transition-all active:scale-[0.97] col-span-2"
              style={{
                background: "hsl(var(--cream))",
                border: "1.5px dashed hsl(var(--stone-light))",
              }}
            >
              <span className="text-base">+</span>
              <span className="text-[0.72rem] text-muted-foreground">{t("appreciation.addOwnIdea")}</span>
            </button>
          ) : null}
        </div>

        {/* Custom input */}
        {showCustomInput && (
          <div className="mt-2 space-y-2">
            <input
              autoFocus
              value={customDraft}
              onChange={e => setCustomDraft(e.target.value)}
              placeholder={t("appreciation.customPlaceholder")}
              maxLength={80}
              className="w-full rounded-xl border-[1.5px] border-[hsl(var(--stone-light))] bg-background px-3 py-2.5 text-[0.82rem] focus:outline-none transition-colors"
              style={{ fontSize: "16px" }}
            />
            <div className="flex gap-2">
              <button
                onClick={saveCustomIdea}
                disabled={!customDraft.trim()}
                className="flex-1 py-2 rounded-full text-[0.75rem] font-medium transition-all active:scale-95 disabled:opacity-40"
                style={{ background: accentSolid, color: accentSolidText }}
              >
                {t("appreciation.saveIdea")}
              </button>
              <button
                onClick={() => setShowCustomInput(false)}
                className="px-4 py-2 rounded-full text-[0.75rem] text-muted-foreground transition-all active:scale-95"
                style={{ border: "1px solid hsl(var(--stone-light))" }}
              >
                {t("appreciation.close")}
              </button>
            </div>
            <p className="text-[0.62rem] text-muted-foreground text-center">{t("appreciation.customSyncNote", { name: partnerName || "" })}</p>
          </div>
        )}
      </div>
    </div>
  );
}
