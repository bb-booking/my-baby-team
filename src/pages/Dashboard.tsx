import { useFamily } from "@/context/FamilyContext";
import { PregnancyWeekBar, BabySizeCard, PregnancyInsight } from "@/components/PregnancyWidgets";
import { NewbornDashboard } from "@/components/NewbornDashboard";
import { TaskList } from "@/components/TaskList";
import { PartnerNudge } from "@/components/PartnerNudge";
import { MilestoneTimeline } from "@/components/MilestoneTimeline";
import { Heart, Shield, Zap, Stethoscope, Brain } from "lucide-react";
import { format } from "date-fns";
import { da } from "date-fns/locale";

export default function Dashboard() {
  const { profile, phaseLabel, morName, farName, babyAgeWeeks, babyAgeMonths } = useFamily();
  const greeting = getGreeting();
  const isMor = profile.role === "mor";
  const childName = profile.children?.[0]?.name;

  // Phase label with child name
  const displayPhase = childName
    ? `${phaseLabel} · ${childName}`
    : phaseLabel;

  // Date display
  const dateStr = format(new Date(), "EEE d. MMM · HH:mm", { locale: da }).toUpperCase();

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="section-fade-in">
        <div className="flex items-center justify-between">
          <p className="label-upper">{greeting}</p>
          <span className="text-[0.58rem] tracking-[0.1em] uppercase text-muted-foreground px-3 py-1 rounded-full border" style={{ borderColor: "hsl(var(--stone-light))" }}>
            {dateStr}
          </span>
        </div>
        <h1 className="text-[1.9rem] font-normal mt-2">
          {isMor ? `${greeting.includes("MORGEN") ? "Godmorgen" : greeting.includes("DAG") ? "Goddag" : "Godaften"}, ${profile.parentName}` : `${greeting.includes("MORGEN") ? "Godmorgen" : greeting.includes("DAG") ? "Goddag" : "Godaften"}, ${profile.parentName}`}
        </h1>
        <p className="text-[0.62rem] tracking-[0.14em] uppercase text-muted-foreground mt-1">
          {displayPhase}
        </p>
      </div>

      {/* Role-specific focus card */}
      <RoleFocusCard
        isMor={isMor}
        phase={profile.phase}
        childName={childName}
        partnerName={isMor ? farName : morName}
        babyAgeWeeks={babyAgeWeeks}
      />

      {profile.phase === "pregnant" ? (
        <>
          <PregnancyWeekBar />
          <BabySizeCard />
          <TaskList />
          <PregnancyInsight />
          <PartnerNudge />
          <MilestoneTimeline />
        </>
      ) : (
        <>
          <TaskList />
          <NewbornDashboard />
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
  babyAgeWeeks,
}: {
  isMor: boolean;
  phase: string;
  childName?: string;
  partnerName: string;
  babyAgeWeeks: number;
}) {
  const name = childName || "baby";

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

  // Newborn/baby — different for mor vs far
  if (isMor) {
    // Mor gets recovery focus, body awareness, mental health
    const morCards = getMorFocusContent(babyAgeWeeks, name, partnerName);
    return (
      <div
        className="rounded-2xl p-4 section-fade-in"
        style={{
          background: "linear-gradient(135deg, hsl(var(--clay) / 0.08), hsl(var(--clay) / 0.03))",
          border: "1px solid hsl(var(--clay) / 0.18)",
          animationDelay: "60ms",
        }}
      >
        <div className="flex items-center gap-3 mb-2">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: "hsl(var(--clay-light))" }}>
            {morCards.icon}
          </div>
          <div>
            <p className="text-[0.88rem] font-medium">{morCards.title}</p>
          </div>
        </div>
        <p className="text-[0.75rem] text-muted-foreground leading-relaxed">{morCards.body}</p>
      </div>
    );
  }

  // Far gets concrete actions, support tips
  const farCards = getFarFocusContent(babyAgeWeeks, name, partnerName);
  return (
    <div
      className="rounded-2xl p-4 section-fade-in"
      style={{
        background: "linear-gradient(135deg, hsl(var(--sage) / 0.08), hsl(var(--sage) / 0.03))",
        border: "1px solid hsl(var(--sage) / 0.18)",
        animationDelay: "60ms",
      }}
    >
      <div className="flex items-center gap-3 mb-2">
        <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: "hsl(var(--sage-light))" }}>
          {farCards.icon}
        </div>
        <div>
          <p className="text-[0.88rem] font-medium">{farCards.title}</p>
        </div>
      </div>
      <p className="text-[0.75rem] text-muted-foreground leading-relaxed">{farCards.body}</p>
    </div>
  );
}

function getMorFocusContent(ageWeeks: number, childName: string, partnerName: string) {
  if (ageWeeks < 2) return {
    icon: <Stethoscope className="w-4 h-4" style={{ color: "hsl(var(--clay))" }} />,
    title: "Din krop heler",
    body: `De første dage handler om hvile. Drik masser af vand, spis godt og lad ${partnerName} tage over når du kan. Efterveer og træthed er helt normalt.`,
  };
  if (ageWeeks < 6) return {
    icon: <Heart className="w-4 h-4" style={{ color: "hsl(var(--clay))" }} />,
    title: "Recovery & velvære",
    body: `Din krop har præsteret noget utroligt. Det er okay at have blandede følelser — baby blues rammer op til 80% i de første uger. Tal med ${partnerName} om det.`,
  };
  if (ageWeeks < 12) return {
    icon: <Brain className="w-4 h-4" style={{ color: "hsl(var(--clay))" }} />,
    title: "Mental load er reel",
    body: `Du behøver ikke holde styr på alt selv. Del ansvaret med ${partnerName} — brug opgavelisten og vær ærlig om hvad du har brug for.`,
  };
  return {
    icon: <Heart className="w-4 h-4" style={{ color: "hsl(var(--clay))" }} />,
    title: "Du gør det godt",
    body: `${childName} har en fantastisk mor. Husk: tid til dig selv er ikke egoistisk — det er nødvendigt.`,
  };
}

function getFarFocusContent(ageWeeks: number, childName: string, partnerName: string) {
  if (ageWeeks < 2) return {
    icon: <Zap className="w-4 h-4" style={{ color: "hsl(var(--moss))" }} />,
    title: "Du er afgørende lige nu",
    body: `${partnerName} har brug for dig mere end nogensinde. Tag ansvar for mad, rengøring og gæster. Hud-mod-hud med ${childName} styrker jeres bånd.`,
  };
  if (ageWeeks < 6) return {
    icon: <Shield className="w-4 h-4" style={{ color: "hsl(var(--moss))" }} />,
    title: "Tag nattevagter",
    body: `Delt søvn gør en kæmpe forskel. Selv én nattevagt giver ${partnerName} den dybe søvn hun har brug for. Du er holdets rygrad.`,
  };
  if (ageWeeks < 12) return {
    icon: <Zap className="w-4 h-4" style={{ color: "hsl(var(--moss))" }} />,
    title: "Find jeres rytme sammen",
    body: `Tag ${childName} med på gåture alene — det bygger selvtillid og giver ${partnerName} pause. Du er ikke "hjælper" — du er forælder.`,
  };
  return {
    icon: <Shield className="w-4 h-4" style={{ color: "hsl(var(--moss))" }} />,
    title: "Vær til stede",
    body: `${childName} kender din stemme og dine hænder. Kvalitetstid handler ikke om timer — det handler om nærvær. Leg, læs, syng.`,
  };
}

function getGreeting(): string {
  const h = new Date().getHours();
  if (h < 10) return "GOD MORGEN ☀️";
  if (h < 17) return "GOD DAG 🌿";
  return "GOD AFTEN 🌙";
}
