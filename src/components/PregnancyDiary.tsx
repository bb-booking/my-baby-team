import { useState } from "react";
import { useFamily } from "@/context/FamilyContext";
import { PenLine, Trash2 } from "lucide-react";
import { useTranslation } from "react-i18next";

interface DiaryEntry {
  id: string;
  date: string;
  week: number;
  text: string;
  mood: string;
}

function loadEntries(): DiaryEntry[] {
  try { return JSON.parse(localStorage.getItem("melo-pregdiary") || "[]"); } catch { return []; }
}
function saveEntries(entries: DiaryEntry[]) {
  localStorage.setItem("melo-pregdiary", JSON.stringify(entries));
}

const MOODS = ["😊", "😴", "🥰", "😤", "🥲", "✨"];

export function PregnancyDiary() {
  const { currentWeek, profile } = useFamily();
  const isMor = profile.role === "mor";
  const { t, i18n } = useTranslation();

  const [entries, setEntries] = useState<DiaryEntry[]>(loadEntries);
  const [open, setOpen] = useState(false);
  const [text, setText] = useState("");
  const [mood, setMood] = useState("😊");

  if (!isMor) return null;

  const save = () => {
    if (!text.trim()) return;
    const entry: DiaryEntry = {
      id: Math.random().toString(36).slice(2, 10),
      date: new Date().toISOString(),
      week: currentWeek,
      text: text.trim(),
      mood,
    };
    const next = [entry, ...entries];
    setEntries(next);
    saveEntries(next);
    setText("");
    setOpen(false);
  };

  const remove = (id: string) => {
    const next = entries.filter(e => e.id !== id);
    setEntries(next);
    saveEntries(next);
  };

  const recent = entries.slice(0, 3);

  return (
    <div className="card-soft section-fade-in space-y-3" style={{ animationDelay: "140ms" }}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <PenLine className="w-4 h-4" style={{ color: "hsl(var(--clay))" }} />
          <p className="text-[0.55rem] tracking-[0.16em] uppercase text-muted-foreground">{t("pregDiary.title")}</p>
        </div>
        <button
          onClick={() => setOpen(v => !v)}
          className="text-[0.68rem] font-medium px-2.5 py-1 rounded-lg transition-all active:scale-95"
          style={{ background: "hsl(var(--clay-light))", color: "hsl(var(--bark))" }}
        >
          {t("pregDiary.write")}
        </button>
      </div>

      {open && (
        <div className="space-y-2">
          <div className="flex gap-2">
            {MOODS.map(m => (
              <button key={m} onClick={() => setMood(m)}
                className="text-xl transition-all active:scale-90"
                style={{ opacity: mood === m ? 1 : 0.35 }}>
                {m}
              </button>
            ))}
          </div>
          <textarea
            value={text}
            onChange={e => setText(e.target.value)}
            placeholder={t("pregDiary.placeholder", { week: currentWeek })}
            rows={3}
            className="w-full rounded-xl border-[1.5px] border-[hsl(var(--stone-light))] bg-background px-3 py-2.5 text-[0.82rem] focus:outline-none focus:border-[hsl(var(--clay))] transition-colors resize-none"
          />
          <div className="flex gap-2">
            <button onClick={save} disabled={!text.trim()}
              className="flex-1 py-2 rounded-xl text-[0.78rem] font-medium transition-all active:scale-[0.98]"
              style={{ background: text.trim() ? "hsl(var(--clay))" : "hsl(var(--stone-light))", color: "hsl(var(--bark))" }}>
              {t("pregDiary.save")}
            </button>
            <button onClick={() => setOpen(false)}
              className="px-4 py-2 rounded-xl text-[0.78rem] text-muted-foreground transition-all active:scale-[0.98]"
              style={{ background: "hsl(var(--stone-lighter))" }}>
              {t("pregDiary.cancel")}
            </button>
          </div>
        </div>
      )}

      {recent.length > 0 && (
        <div className="space-y-2">
          {recent.map(e => (
            <div key={e.id} className="rounded-xl px-3 py-2.5 group"
              style={{ background: "hsl(var(--cream))", border: "1px solid hsl(var(--stone-light))" }}>
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1">
                  <div className="flex items-center gap-1.5 mb-1">
                    <span className="text-sm">{e.mood}</span>
                    <span className="text-[0.58rem] tracking-[0.1em] uppercase text-muted-foreground">
                      {t("pregDiary.weekLabel", { week: e.week })} · {new Date(e.date).toLocaleDateString(i18n.language === "en" ? "en-GB" : "da-DK", { day: "numeric", month: "short" })}
                    </span>
                  </div>
                  <p className="text-[0.78rem] leading-relaxed">{e.text}</p>
                </div>
                <button onClick={() => remove(e.id)}
                  className="opacity-0 group-hover:opacity-100 transition-opacity p-1 flex-shrink-0">
                  <Trash2 className="w-3.5 h-3.5 text-muted-foreground" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {entries.length === 0 && !open && (
        <p className="text-[0.75rem] text-muted-foreground text-center py-2">
          {t("pregDiary.empty")}
        </p>
      )}
    </div>
  );
}
