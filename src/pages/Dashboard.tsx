import { useFamily } from "@/context/FamilyContext";
import { WeekProgress } from "@/components/WeekProgress";
import { WeekInsight } from "@/components/WeekInsight";
import { TaskList } from "@/components/TaskList";
import { PartnerNudge } from "@/components/PartnerNudge";
import { MilestoneTimeline } from "@/components/MilestoneTimeline";
import { NewbornDashboard } from "@/components/NewbornDashboard";

export default function Dashboard() {
  const { profile, phaseLabel } = useFamily();
  const greeting = getGreeting();

  const names =
    profile.role === "mor"
      ? `${profile.parentName} & ${profile.partnerName}`
      : `${profile.partnerName} & ${profile.parentName}`;

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="section-fade-in">
        <p className="text-sm text-muted-foreground">{greeting}</p>
        <h1 className="text-2xl mt-1">Hej, {names}</h1>
        <p className="text-xs text-muted-foreground mt-0.5">{phaseLabel}</p>
      </div>

      {profile.phase === "pregnant" ? (
        <>
          <WeekProgress />
          <WeekInsight />
          <TaskList />
          <PartnerNudge />
          <MilestoneTimeline />
        </>
      ) : (
        <>
          <NewbornDashboard />
          <TaskList />
          <PartnerNudge />
          <MilestoneTimeline />
        </>
      )}

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
