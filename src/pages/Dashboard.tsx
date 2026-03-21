import { useFamily } from "@/context/FamilyContext";
import { PregnancyWeekBar, BabySizeCard, PregnancyInsight } from "@/components/PregnancyWidgets";
import { NewbornDashboard } from "@/components/NewbornDashboard";
import { TaskList } from "@/components/TaskList";
import { PartnerNudge } from "@/components/PartnerNudge";
import { MilestoneTimeline } from "@/components/MilestoneTimeline";
import { Heart, Shield, Zap, Baby } from "lucide-react";

export default function Dashboard() {
  const { profile, phaseLabel, morName, farName, babyAgeWeeks } = useFamily();
  const greeting = getGreeting();
  const isMor = profile.role === "mor";

  // Child name for personalization
  const childName = profile.children?.[0]?.name;

  const names = isMor
    ? `${profile.parentName} & ${profile.partnerName}`
    : `${profile.partnerName} & ${profile.parentName}`;

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="section-fade-in">
        <p className="label-upper">{greeting}</p>
        <h1 className="text-[1.9rem] font-normal mt-2">{profile.parentName}</h1>
        <p className="text-[0.68rem] tracking-[0.14em] uppercase text-muted-foreground mt-1">
          {phaseLabel}
          {childName ? ` · ${childName}` : ""}
        </p>
      </div>

      {/* Role-specific focus card */}
      <RoleFocusCard isMor={isMor} phase={profile.phase} childName={childName} partnerName={isMor ? farName : morName} />

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

      <div className="h-20 md:h-0" />
    </div>
  );
}

function RoleFocusCard({
  isMor,
  phase,
  childName,
  partnerName,
}: {
  isMor: boolean;
  phase: string;
  childName?: string;
  partnerName: string;
}) {
  if (phase === "pregnant") {
    if (isMor) {
      return (
        <div
          className="rounded-2xl p-4 flex items-center gap-4 section-fade-in"
          style={{
            background: "linear-gradient(135deg, hsl(var(--clay) / 0.1), hsl(var(--clay) / 0.04))",
            border: "1px solid hsl(var(--clay) / 0.2)",
            animationDelay: "60ms",
          }}
        >
          <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: "hsl(var(--clay-light))" }}>
            <Heart className="w-5 h-5" style={{ color: "hsl(var(--clay))" }} />
          </div>
          <div>
            <p className="text-[0.88rem] font-medium">Husk dig selv i dag</p>
            <p className="text-[0.72rem] text-muted-foreground leading-relaxed">
              Din krop arbejder hårdt — tag en pause og mærk efter.
            </p>
          </div>
        </div>
      );
    }
    return (
      <div
        className="rounded-2xl p-4 flex items-center gap-4 section-fade-in"
        style={{
          background: "linear-gradient(135deg, hsl(var(--sage) / 0.1), hsl(var(--sage) / 0.04))",
          border: "1px solid hsl(var(--sage) / 0.2)",
          animationDelay: "60ms",
        }}
      >
        <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: "hsl(var(--sage-light))" }}>
          <Shield className="w-5 h-5" style={{ color: "hsl(var(--moss))" }} />
        </div>
        <div>
          <p className="text-[0.88rem] font-medium">Sådan støtter du {partnerName}</p>
          <p className="text-[0.72rem] text-muted-foreground leading-relaxed">
            Spørg konkret: "Hvad kan jeg gøre for dig lige nu?"
          </p>
        </div>
      </div>
    );
  }

  // Newborn/baby phase
  if (isMor) {
    return (
      <div
        className="rounded-2xl p-4 flex items-center gap-4 section-fade-in"
        style={{
          background: "linear-gradient(135deg, hsl(var(--clay) / 0.1), hsl(var(--clay) / 0.04))",
          border: "1px solid hsl(var(--clay) / 0.2)",
          animationDelay: "60ms",
        }}
      >
        <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: "hsl(var(--clay-light))" }}>
          <Heart className="w-5 h-5" style={{ color: "hsl(var(--clay))" }} />
        </div>
        <div>
          <p className="text-[0.88rem] font-medium">Recovery & velvære</p>
          <p className="text-[0.72rem] text-muted-foreground leading-relaxed">
            Det er okay at prioritere dig selv — {childName || "baby"} har brug for en glad mor.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div
      className="rounded-2xl p-4 flex items-center gap-4 section-fade-in"
      style={{
        background: "linear-gradient(135deg, hsl(var(--sage) / 0.1), hsl(var(--sage) / 0.04))",
        border: "1px solid hsl(var(--sage) / 0.2)",
        animationDelay: "60ms",
      }}
    >
      <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: "hsl(var(--sage-light))" }}>
        <Zap className="w-5 h-5" style={{ color: "hsl(var(--moss))" }} />
      </div>
      <div>
        <p className="text-[0.88rem] font-medium">Din handling i dag</p>
        <p className="text-[0.72rem] text-muted-foreground leading-relaxed">
          Tag en nattevagt eller giv {partnerName} en pause — small wins matter.
        </p>
      </div>
    </div>
  );
}

function getGreeting(): string {
  const h = new Date().getHours();
  if (h < 10) return "GOD MORGEN ☀️";
  if (h < 17) return "GOD DAG 🌿";
  return "GOD AFTEN 🌙";
}
