import { useState, useEffect, useCallback } from "react";
import { useFamily } from "@/context/FamilyContext";
import { supabase } from "@/integrations/supabase/client";
import { Sparkles, RefreshCw, Clock } from "lucide-react";

interface AIActivity {
  emoji: string;
  title: string;
  description: string;
  why: string;
  duration: string;
}

interface AIActivitySuggestionsProps {
  category: string;
}

export function AIActivitySuggestions({ category }: AIActivitySuggestionsProps) {
  const { profile, babyAgeWeeks } = useFamily();
  const childName = profile.children?.[0]?.name || "Baby";
  const [activities, setActivities] = useState<AIActivity[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchActivities = useCallback(async () => {
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
          category,
        },
      });
      if (resp.error) throw resp.error;
      const data = resp.data?.data;
      if (Array.isArray(data)) setActivities(data);
      else throw new Error("Ugyldigt svar");
    } catch (e: any) {
      console.error("Activity suggestions error:", e);
      setError("Kunne ikke hente forslag lige nu");
    } finally {
      setLoading(false);
    }
  }, [babyAgeWeeks, category, profile.role, profile.phase, childName]);

  useEffect(() => {
    if (babyAgeWeeks > 0) fetchActivities();
  }, [fetchActivities]);

  if (loading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map(i => (
          <div key={i} className="card-soft animate-pulse">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-muted" />
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-muted rounded w-3/4" />
                <div className="h-3 bg-muted rounded w-full" />
                <div className="h-3 bg-muted rounded w-1/2" />
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="card-soft text-center py-8">
        <p className="text-[0.85rem] text-muted-foreground mb-3">{error}</p>
        <button
          onClick={fetchActivities}
          className="text-[0.8rem] font-medium px-4 py-2 rounded-xl transition-colors"
          style={{ background: "hsl(var(--sage-light))", color: "hsl(var(--moss))" }}
        >
          Prøv igen
        </button>
      </div>
    );
  }

  if (activities.length === 0) return null;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-end">
        <button onClick={fetchActivities} className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl hover:bg-muted transition-colors text-[0.72rem] text-muted-foreground" title="Nye forslag">
          <RefreshCw className="w-3 h-3" />
          Nye forslag
        </button>
      </div>

      {activities.map((act, i) => (
        <div key={i} className="card-soft section-fade-in" style={{ animationDelay: `${i * 60}ms` }}>
          <div className="flex items-start gap-3 mb-2">
            <span className="text-2xl flex-shrink-0">{act.emoji}</span>
            <div className="flex-1">
              <p className="text-[0.92rem] font-medium">{act.title}</p>
              <p className="text-[0.78rem] text-foreground/70 leading-relaxed mt-1">{act.description}</p>
            </div>
          </div>

          {act.why && (
            <div className="rounded-xl px-3 py-2 mb-2" style={{ background: "hsl(var(--sage-light))" }}>
              <p className="text-[0.72rem] leading-relaxed">💡 {act.why}</p>
            </div>
          )}

          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1 text-[0.62rem] text-muted-foreground">
              <Clock className="w-3 h-3" /> {act.duration}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}
