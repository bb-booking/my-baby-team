import { useFamily } from "@/context/FamilyContext";
import { getPartnerNudge } from "@/lib/phaseData";
import { Heart } from "lucide-react";

export function PartnerNudge() {
  const { profile } = useFamily();
  const nudges = getPartnerNudge(profile.phase, profile.role);

  return (
    <div className="card-soft section-fade-in" style={{ animationDelay: "300ms" }}>
      <div className="flex items-center gap-2 mb-4">
        <Heart className="w-4 h-4 text-clay" />
        <h3 className="font-serif text-lg">For jer som team</h3>
      </div>
      <div className="space-y-3">
        {nudges.map((task, i) => (
          <div key={i} className="bg-clay-light/50 rounded-xl px-4 py-3">
            <p className="text-sm font-medium">{task.title}</p>
            <p className="text-xs text-muted-foreground mt-1">{task.hint}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
