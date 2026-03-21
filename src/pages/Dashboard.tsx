import { WeekProgress } from "@/components/WeekProgress";
import { WeekInsight } from "@/components/WeekInsight";
import { TaskList } from "@/components/TaskList";
import { PartnerNudge } from "@/components/PartnerNudge";
import { MilestoneTimeline } from "@/components/MilestoneTimeline";

export default function Dashboard() {
  const greeting = getGreeting();

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="section-fade-in">
        <p className="text-sm text-muted-foreground">{greeting}</p>
        <h1 className="text-2xl mt-1">Hej, Line & Mikkel</h1>
      </div>

      {/* Week progress ring */}
      <WeekProgress />

      {/* Insight of the week */}
      <WeekInsight />

      {/* Tasks */}
      <TaskList />

      {/* Partner nudge */}
      <PartnerNudge />

      {/* Journey timeline */}
      <MilestoneTimeline />

      {/* Spacer for bottom nav */}
      <div className="h-20 md:h-0" />
    </div>
  );
}

function getGreeting(): string {
  const h = new Date().getHours();
  if (h < 10) return "God morgen ☀️";
  if (h < 17) return "God dag 🌿";
  return "God aften 🌙";
}
