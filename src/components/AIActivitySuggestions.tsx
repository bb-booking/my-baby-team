import { useState, useEffect } from "react";
import { useFamily } from "@/context/FamilyContext";
import { supabase } from "@/integrations/supabase/client";
import { Sparkles, RefreshCw, Clock } from "lucide-react";

interface AIActivity {
  emoji: string;
  title: string;
  description: string;
  developmentArea: string;
  duration: string;
}

export function AIActivitySuggestions() {
  const { profile, babyAgeWeeks } = useFamily();
  const childName = profile.children?.[0]?.name || "Baby";
  const [activities, setActivities] = useState<AIActivity[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchActivities = async () => {
    setLoading(true);
    setError(null);
    try {
      const resp = await supabase.functions.invoke("content-expert", {
        body: {
          type: "activity_suggestions",
          babyAgeWeeks,
          role: profile.role,
          phase: profile.phase,
          childName,
        },
      });
      if (resp.error) throw resp.error;
      const data = resp.data?.data;
      if (Array.isArray(data)) setActivities(data);
      else throw new Error("Ugyldigt svar");
    } catch (e: any) {
      console.error("Activity suggestions error:", e);
      setError("Kunne ikke hente forslag");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (babyAgeWeeks > 0) fetchActivities();
  }, [babyAgeWeeks]);

  if (loading) {
    return (
      <div className="card-soft section-fade-in" style={{ animationDelay: "300ms" }}>
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: "hsl(var(--clay-light))" }}>
            <Sparkles className="w-4 h-4 animate-pulse" style={{ color: "hsl(var(--clay))" }} />
          </div>
          <div>
            <p className="text-[0.88rem] font-medium">Ekspertpanelet tænker...</p>
            <p className="text-[0.68rem] text-muted-foreground">Finder aktiviteter til {childName} ({babyAgeWeeks} uger)</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || activities.length === 0) return null;

  const areaColor: Record<string, string> = {
    motorik: "--sage",
    sanser: "--clay",
    sprog: "--moss",
    social: "--clay",
    kognitiv: "--sage",
  };

  return (
    <div className="space-y-3 section-fade-in" style={{ animationDelay: "300ms" }}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: "hsl(var(--clay-light))" }}>
            <Sparkles className="w-4 h-4" style={{ color: "hsl(var(--clay))" }} />
          </div>
          <div>
            <p className="text-[0.88rem] font-medium">AI-forslag fra eksperterne</p>
            <p className="text-[0.56rem] tracking-[0.14em] uppercase text-muted-foreground">PERSONLIGE AKTIVITETER TIL {childName.toUpperCase()}</p>
          </div>
        </div>
        <button onClick={fetchActivities} className="p-2 rounded-xl hover:bg-muted transition-colors" title="Nye forslag">
          <RefreshCw className="w-3.5 h-3.5 text-muted-foreground" />
        </button>
      </div>

      {activities.map((act, i) => {
        const colorVar = areaColor[act.developmentArea?.toLowerCase()] || "--sage";
        return (
          <div key={i} className="card-soft">
            <div className="flex items-start gap-3 mb-2">
              <span className="text-2xl flex-shrink-0">{act.emoji}</span>
              <div className="flex-1">
                <p className="text-[0.92rem] font-medium">{act.title}</p>
                <p className="text-[0.78rem] text-foreground/70 leading-relaxed mt-1">{act.description}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1 text-[0.62rem] text-muted-foreground">
                <Clock className="w-3 h-3" /> {act.duration}
              </span>
              {act.developmentArea && (
                <span
                  className="text-[0.58rem] px-2 py-0.5 rounded-full"
                  style={{ background: `hsl(var(${colorVar}-light))`, border: `1px solid hsl(var(${colorVar}) / 0.2)` }}
                >
                  {act.developmentArea}
                </span>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
