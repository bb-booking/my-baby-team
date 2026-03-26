import { useState, useEffect } from "react";
import { useFamily } from "@/context/FamilyContext";
import { supabase } from "@/integrations/supabase/client";
import { Sparkles, RefreshCw } from "lucide-react";

interface SleepGuidance {
  wakeWindow: string;
  napsPerDay: string;
  nightSleep: string;
  tips: string[];
  currentRegression: string | null;
}

export function AISleepGuidance() {
  const { profile, babyAgeWeeks } = useFamily();
  const childName = profile.children?.[0]?.name || "Baby";
  const [guidance, setGuidance] = useState<SleepGuidance | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchGuidance = async () => {
    setLoading(true);
    setError(null);
    try {
      const resp = await supabase.functions.invoke("content-expert", {
        body: {
          type: "sleep_guidance",
          babyAgeWeeks,
          role: profile.role,
          phase: profile.phase,
          childName,
        },
      });

      if (resp.error) throw resp.error;
      const data = resp.data?.data;
      if (data) setGuidance(data);
      else throw new Error("Tomt svar");
    } catch (e: any) {
      console.error("Sleep guidance error:", e);
      setError("Kunne ikke hente søvnvejledning");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (babyAgeWeeks > 0) fetchGuidance();
  }, [babyAgeWeeks]);

  if (loading) {
    return (
      <div className="card-soft section-fade-in" style={{ animationDelay: "140ms" }}>
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: "hsl(var(--sage-light))" }}>
            <Sparkles className="w-4 h-4 animate-pulse" style={{ color: "hsl(var(--moss))" }} />
          </div>
          <div className="flex-1">
            <p className="text-[0.88rem] font-medium">Søvnspecialisten analyserer...</p>
            <p className="text-[0.68rem] text-muted-foreground">Tilpasser vejledning til {childName}s alder</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !guidance) return null;

  return (
    <div className="card-soft section-fade-in" style={{ animationDelay: "140ms" }}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: "hsl(var(--sage-light))" }}>
            <Sparkles className="w-4 h-4" style={{ color: "hsl(var(--moss))" }} />
          </div>
          <div>
            <p className="text-[0.88rem] font-medium">Søvnspecialist</p>
            <p className="text-[0.56rem] tracking-[0.14em] uppercase text-muted-foreground">TILPASSET {childName.toUpperCase()} · {babyAgeWeeks} UGER</p>
          </div>
        </div>
        <button
          onClick={fetchGuidance}
          className="p-2 rounded-xl hover:bg-muted transition-colors"
          title="Opdater vejledning"
        >
          <RefreshCw className="w-3.5 h-3.5 text-muted-foreground" />
        </button>
      </div>

      <div className="space-y-2">
        <div className="grid grid-cols-3 gap-2">
          <div className="rounded-xl px-3 py-2.5 text-center" style={{ background: "hsl(var(--cream))" }}>
            <p className="text-[0.6rem] text-muted-foreground uppercase tracking-wide">Vågenvindue</p>
            <p className="text-[0.88rem] font-semibold mt-0.5" style={{ color: "hsl(var(--moss))" }}>{guidance.wakeWindow}</p>
          </div>
          <div className="rounded-xl px-3 py-2.5 text-center" style={{ background: "hsl(var(--cream))" }}>
            <p className="text-[0.6rem] text-muted-foreground uppercase tracking-wide">Lure/dag</p>
            <p className="text-[0.88rem] font-semibold mt-0.5" style={{ color: "hsl(var(--moss))" }}>{guidance.napsPerDay}</p>
          </div>
          <div className="rounded-xl px-3 py-2.5 text-center" style={{ background: "hsl(var(--cream))" }}>
            <p className="text-[0.6rem] text-muted-foreground uppercase tracking-wide">Nattesøvn</p>
            <p className="text-[0.88rem] font-semibold mt-0.5" style={{ color: "hsl(var(--moss))" }}>{guidance.nightSleep}</p>
          </div>
        </div>

        {guidance.currentRegression && (
          <div className="rounded-xl px-4 py-3" style={{ background: "hsl(var(--clay-light))", border: "1px solid hsl(var(--clay) / 0.2)" }}>
            <p className="text-[0.68rem] font-medium" style={{ color: "hsl(var(--clay-dark))" }}>⚠️ Mulig søvnregression</p>
            <p className="text-[0.75rem] mt-1 leading-relaxed">{guidance.currentRegression}</p>
          </div>
        )}

        {guidance.tips?.length > 0 && (
          <div className="rounded-xl px-4 py-3" style={{ background: "hsl(var(--sage-light))" }}>
            <p className="text-[0.68rem] font-medium mb-1.5" style={{ color: "hsl(var(--moss))" }}>💡 Tips fra søvnspecialisten</p>
            <div className="space-y-1.5">
              {guidance.tips.map((tip, i) => (
                <p key={i} className="text-[0.75rem] leading-relaxed flex items-start gap-2">
                  <span className="text-[0.6rem] mt-1 flex-shrink-0">•</span>
                  {tip}
                </p>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
