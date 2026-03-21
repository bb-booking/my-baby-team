import { milestones } from "@/lib/data";

export function MilestoneTimeline() {
  return (
    <div className="card-soft section-fade-in" style={{ animationDelay: "400ms" }}>
      <h3 className="font-serif text-lg mb-4">Jeres rejse</h3>
      <div className="flex items-center gap-1 overflow-x-auto pb-2 -mx-1 px-1">
        {milestones.map((m, i) => (
          <div key={m.week} className="flex items-center flex-shrink-0">
            <div className="flex flex-col items-center gap-1">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium transition-all ${
                  m.active
                    ? "bg-sage text-primary-foreground ring-4 ring-sage-light"
                    : m.unlocked
                    ? "bg-sage/70 text-primary-foreground"
                    : "bg-muted text-muted-foreground"
                }`}
              >
                {m.week}
              </div>
              <span className="text-[10px] text-muted-foreground text-center w-16 leading-tight">
                {m.label}
              </span>
            </div>
            {i < milestones.length - 1 && (
              <div
                className={`w-4 h-0.5 mx-0.5 mt-[-18px] ${
                  m.unlocked ? "bg-sage/50" : "bg-muted"
                }`}
              />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
