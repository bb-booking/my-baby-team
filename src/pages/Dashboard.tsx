import { useFamily } from "@/context/FamilyContext";
import { PregnancyWeekBar, BabySizeCard, PregnancyInsight } from "@/components/PregnancyWidgets";
import { NewbornDashboard } from "@/components/NewbornDashboard";
import { TaskList } from "@/components/TaskList";
import { PartnerNudge } from "@/components/PartnerNudge";
import { MilestoneTimeline } from "@/components/MilestoneTimeline";

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
        <p className="label-upper">{greeting}</p>
        <h1 className="text-[1.9rem] font-normal mt-2">{names}</h1>
        <p className="text-[0.68rem] tracking-[0.14em] uppercase text-muted-foreground mt-1">{phaseLabel}</p>
      </div>

      {profile.phase === "pregnant" ? (
        <>
          <PregnancyWeekBar />
          <BabySizeCard />
          <PregnancyInsight />
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
  if (h < 10) return "GOD MORGEN ☀️";
  if (h < 17) return "GOD DAG 🌿";
  return "GOD AFTEN 🌙";
}
