import { useState, useEffect, useRef } from "react";
import { useFamily } from "@/context/FamilyContext";
import { supabase } from "@/integrations/supabase/client";
import { upsertDailyQuestion, fetchDailyQuestion } from "@/hooks/useSupabaseSync";
import { useAuth } from "@/context/AuthContext";
import { useTranslation } from "react-i18next";

const LOCAL_KEY = "melo-daily-q";

function getTodayStr() { return new Date().toISOString().slice(0, 10); }
function getDayOfYear() {
  const now = new Date();
  const start = new Date(now.getFullYear(), 0, 0);
  return Math.floor((now.getTime() - start.getTime()) / 86400000);
}

interface LocalData { date: string; questionIndex: number; morAnswer?: string; farAnswer?: string; }

function loadLocal(): LocalData {
  try {
    const stored = localStorage.getItem(LOCAL_KEY);
    if (stored) {
      const parsed: LocalData = JSON.parse(stored);
      if (parsed.date === getTodayStr()) return parsed;
    }
  } catch {}
  return { date: getTodayStr(), questionIndex: getDayOfYear() % 30 };
}

export function DagensSpørgsmål() {
  const { profile } = useFamily();
  const { user } = useAuth();
  const { t, i18n } = useTranslation();
  const isMor = profile.role === "mor";
  const myAnswerKey = isMor ? "morAnswer" : "farAnswer";
  const partnerAnswerKey = isMor ? "farAnswer" : "morAnswer";
  const partnerName = profile.partnerName || (i18n.language === "en" ? (isMor ? "Dad" : "Mom") : (isMor ? "Far" : "Mor"));
  const hasPartner = profile.hasPartner !== false;
  const familyId = profile.familyId;
  const QUESTIONS = t("dagensQ.questions", { returnObjects: true }) as string[];

  const [local, setLocal] = useState<LocalData>(loadLocal);
  const [inputValue, setInputValue] = useState("");
  const [revealed, setRevealed] = useState(false);
  const [loading, setLoading] = useState(false);
  const channelRef = useRef<any>(null);

  const today = getTodayStr();
  const questionIndex = local.questionIndex;
  const question = QUESTIONS[questionIndex];
  const myAnswer = local[myAnswerKey as keyof LocalData] as string | undefined;
  const partnerAnswer = local[partnerAnswerKey as keyof LocalData] as string | undefined;

  // Load from Supabase if family_id available
  useEffect(() => {
    if (!familyId) return;
    setLoading(true);
    fetchDailyQuestion(familyId, today).then(row => {
      if (row) {
        const updated: LocalData = {
          date: today,
          questionIndex: row.question_index,
          morAnswer: row.mor_answer ?? undefined,
          farAnswer: row.far_answer ?? undefined,
        };
        setLocal(updated);
        localStorage.setItem(LOCAL_KEY, JSON.stringify(updated));
      } else {
        // Create today's entry in Supabase
        upsertDailyQuestion({ family_id: familyId, date: today, question_index: questionIndex });
      }
      setLoading(false);
    });
  }, [familyId, today]);

  // Real-time subscription for partner's answer
  useEffect(() => {
    if (!familyId) return;
    const channel = supabase
      .channel(`daily-q-${familyId}-${today}`)
      .on("postgres_changes", {
        event: "*", schema: "public", table: "daily_questions",
        filter: `family_id=eq.${familyId}`,
      }, async () => {
        const row = await fetchDailyQuestion(familyId, today);
        if (row) {
          const updated: LocalData = {
            date: today,
            questionIndex: row.question_index,
            morAnswer: row.mor_answer ?? undefined,
            farAnswer: row.far_answer ?? undefined,
          };
          setLocal(updated);
          localStorage.setItem(LOCAL_KEY, JSON.stringify(updated));
        }
      })
      .subscribe();

    channelRef.current = channel;
    return () => { supabase.removeChannel(channel); };
  }, [familyId, today]);

  const handleSubmit = async () => {
    if (!inputValue.trim()) return;
    const updated: LocalData = { ...local, [myAnswerKey]: inputValue.trim() };
    setLocal(updated);
    localStorage.setItem(LOCAL_KEY, JSON.stringify(updated));
    setInputValue("");

    if (familyId) {
      await upsertDailyQuestion({
        family_id: familyId,
        date: today,
        question_index: questionIndex,
        mor_answer: updated.morAnswer ?? null,
        far_answer: updated.farAnswer ?? null,
      });
    }
  };

  const accentBg = isMor ? "hsl(var(--clay-light))" : "hsl(var(--sage-light))";
  const accentText = isMor ? "hsl(var(--bark))" : "hsl(var(--moss))";
  const accentSolid = isMor ? "hsl(var(--clay))" : "hsl(var(--moss))";
  const accentSolidText = isMor ? "hsl(var(--bark))" : "white";

  if (loading) return null;

  return (
    <div className="card-soft section-fade-in space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-base">💬</span>
          <p className="text-[0.55rem] tracking-[0.14em] uppercase text-muted-foreground">{t("dagensQ.title")}</p>
        </div>
        {hasPartner && partnerAnswer && !myAnswer && (
          <span className="text-[0.6rem] px-2 py-0.5 rounded-full font-medium" style={{ background: accentBg, color: accentText }}>
            {t("dagensQ.partnerAnswered", { name: partnerName })}
          </span>
        )}
      </div>

      <p className="text-[0.95rem] font-medium leading-snug" style={{ color: "hsl(var(--bark))" }}>
        {question}
      </p>

      {!myAnswer ? (
        <div className="space-y-2">
          <textarea
            value={inputValue}
            onChange={e => setInputValue(e.target.value)}
            placeholder={t("dagensQ.placeholder")}
            rows={2}
            className="w-full rounded-xl px-3 py-2.5 text-[0.82rem] resize-none outline-none transition-all"
            style={{
              background: "hsl(var(--cream))",
              border: "1px solid hsl(var(--stone-light))",
              color: "hsl(var(--bark))",
              fontSize: "16px",
            }}
          />
          <button
            onClick={handleSubmit}
            disabled={!inputValue.trim()}
            className="w-full py-2.5 rounded-xl text-[0.82rem] font-medium transition-all active:scale-95 disabled:opacity-40"
            style={{ background: accentSolid, color: accentSolidText }}
          >
            {t("dagensQ.send")}
          </button>
        </div>
      ) : (
        <div className="space-y-2">
          <div className="rounded-xl px-3 py-2.5" style={{ background: accentBg }}>
            <p className="text-[0.6rem] tracking-[0.1em] uppercase text-muted-foreground mb-1">{t("dagensQ.yourAnswer")}</p>
            <p className="text-[0.82rem] leading-relaxed" style={{ color: accentText }}>{myAnswer}</p>
          </div>

          {hasPartner && (
            partnerAnswer ? (
              revealed ? (
                <div className="rounded-xl px-3 py-2.5" style={{ background: "hsl(var(--cream))", border: "1px solid hsl(var(--stone-light))" }}>
                  <p className="text-[0.6rem] tracking-[0.1em] uppercase text-muted-foreground mb-1">{t("dagensQ.partnerAnswer", { name: partnerName })}</p>
                  <p className="text-[0.82rem] leading-relaxed" style={{ color: "hsl(var(--bark))" }}>{partnerAnswer}</p>
                </div>
              ) : (
                <button
                  onClick={() => setRevealed(true)}
                  className="w-full py-2.5 rounded-xl text-[0.82rem] font-medium transition-all active:scale-95"
                  style={{ background: "hsl(var(--cream))", border: "1px solid hsl(var(--stone-light))", color: "hsl(var(--bark))" }}
                >
                  {t("dagensQ.seeAnswer", { name: partnerName })}
                </button>
              )
            ) : (
              <p className="text-[0.72rem] text-muted-foreground text-center py-1">
                {t("dagensQ.waiting", { name: partnerName })}
              </p>
            )
          )}
        </div>
      )}
    </div>
  );
}
