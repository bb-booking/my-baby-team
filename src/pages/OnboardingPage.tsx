import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useFamily, type LifePhase, type ParentRole } from "@/context/FamilyContext";
import { Heart, Baby, ArrowRight, ArrowLeft } from "lucide-react";
import { format } from "date-fns";
import { da } from "date-fns/locale";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";

type Step = "phase" | "date" | "role" | "names";

export default function OnboardingPage() {
  const { setProfile } = useFamily();
  const navigate = useNavigate();

  const [step, setStep] = useState<Step>("phase");
  const [phase, setPhase] = useState<"pregnant" | "born" | null>(null);
  const [date, setDate] = useState<Date | undefined>();
  const [role, setRole] = useState<ParentRole | null>(null);
  const [parentName, setParentName] = useState("");
  const [partnerName, setPartnerName] = useState("");

  const steps: Step[] = ["phase", "date", "role", "names"];
  const stepIndex = steps.indexOf(step);
  const progress = ((stepIndex + 1) / steps.length) * 100;

  const canNext = () => {
    if (step === "phase") return phase !== null;
    if (step === "date") return date !== undefined;
    if (step === "role") return role !== null;
    if (step === "names") return parentName.trim().length > 0 && partnerName.trim().length > 0;
    return false;
  };

  const next = () => {
    const i = steps.indexOf(step);
    if (i < steps.length - 1) {
      setStep(steps[i + 1]);
    } else {
      // Complete
      const lifePhase: LifePhase = phase === "pregnant" ? "pregnant" : "newborn";
      setProfile({
        phase: lifePhase,
        role: role!,
        dueOrBirthDate: date!.toISOString(),
        parentName: parentName.trim(),
        partnerName: partnerName.trim(),
        onboarded: true,
      });
      navigate("/");
    }
  };

  const back = () => {
    const i = steps.indexOf(step);
    if (i > 0) setStep(steps[i - 1]);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Progress bar */}
      <div className="h-1 bg-muted">
        <div
          className="h-full bg-sage transition-all duration-500 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>

      <div className="flex-1 flex flex-col items-center justify-center px-6 py-10">
        <div className="w-full max-w-sm">
          {/* Logo */}
          <div className="flex items-center gap-2 mb-12 section-fade-in">
            <div className="w-10 h-10 rounded-xl bg-sage flex items-center justify-center">
              <Heart className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="font-serif text-2xl">Lille</span>
          </div>

          {/* Step: Phase */}
          {step === "phase" && (
            <div className="space-y-6 section-fade-in" key="phase">
              <div>
                <h1 className="text-2xl font-serif">Hvor er I på rejsen?</h1>
                <p className="text-sm text-muted-foreground mt-2">
                  Vi tilpasser alt indhold til netop jeres situation.
                </p>
              </div>

              <div className="space-y-3">
                <button
                  onClick={() => setPhase("pregnant")}
                  className={cn(
                    "w-full card-soft flex items-center gap-4 text-left transition-all active:scale-[0.98]",
                    phase === "pregnant"
                      ? "ring-2 ring-sage bg-sage-light/30"
                      : "hover:bg-muted/30"
                  )}
                >
                  <div className="w-12 h-12 rounded-2xl bg-sage-light flex items-center justify-center">
                    <span className="text-2xl">🤰</span>
                  </div>
                  <div>
                    <p className="font-medium">Vi venter barn</p>
                    <p className="text-xs text-muted-foreground">Graviditet — uge for uge</p>
                  </div>
                </button>

                <button
                  onClick={() => setPhase("born")}
                  className={cn(
                    "w-full card-soft flex items-center gap-4 text-left transition-all active:scale-[0.98]",
                    phase === "born"
                      ? "ring-2 ring-sage bg-sage-light/30"
                      : "hover:bg-muted/30"
                  )}
                >
                  <div className="w-12 h-12 rounded-2xl bg-clay-light flex items-center justify-center">
                    <Baby className="w-6 h-6 text-clay" />
                  </div>
                  <div>
                    <p className="font-medium">Barnet er født</p>
                    <p className="text-xs text-muted-foreground">Nyfødt eller baby — dag for dag</p>
                  </div>
                </button>
              </div>
            </div>
          )}

          {/* Step: Date */}
          {step === "date" && (
            <div className="space-y-6 section-fade-in" key="date">
              <div>
                <h1 className="text-2xl font-serif">
                  {phase === "pregnant" ? "Hvornår er terminen?" : "Hvornår blev barnet født?"}
                </h1>
                <p className="text-sm text-muted-foreground mt-2">
                  {phase === "pregnant"
                    ? "Vi beregner automatisk hvilken uge I er i."
                    : "Vi tilpasser indhold til barnets alder."}
                </p>
              </div>

              <div className="flex flex-col items-center">
                <Popover>
                  <PopoverTrigger asChild>
                    <button
                      className={cn(
                        "w-full card-soft text-left transition-all active:scale-[0.98]",
                        !date && "text-muted-foreground"
                      )}
                    >
                      {date ? (
                        <p className="font-medium">{format(date, "d. MMMM yyyy", { locale: da })}</p>
                      ) : (
                        <p className="font-medium">Vælg dato</p>
                      )}
                      <p className="text-xs text-muted-foreground mt-1">
                        {phase === "pregnant" ? "Forventet fødselsdato" : "Fødselsdato"}
                      </p>
                    </button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="center">
                    <Calendar
                      mode="single"
                      selected={date}
                      onSelect={setDate}
                      locale={da}
                      className="p-3 pointer-events-auto"
                      disabled={(d) =>
                        phase === "pregnant"
                          ? d < new Date() || d > new Date(Date.now() + 280 * 24 * 60 * 60 * 1000)
                          : d > new Date() || d < new Date("2020-01-01")
                      }
                      defaultMonth={phase === "pregnant" ? new Date(Date.now() + 120 * 24 * 60 * 60 * 1000) : new Date()}
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>
          )}

          {/* Step: Role */}
          {step === "role" && (
            <div className="space-y-6 section-fade-in" key="role">
              <div>
                <h1 className="text-2xl font-serif">Hvem er du?</h1>
                <p className="text-sm text-muted-foreground mt-2">
                  Vi viser indhold og opgaver der passer til din rolle.
                </p>
              </div>

              <div className="space-y-3">
                <button
                  onClick={() => setRole("mor")}
                  className={cn(
                    "w-full card-soft flex items-center gap-4 text-left transition-all active:scale-[0.98]",
                    role === "mor"
                      ? "ring-2 ring-clay bg-clay-light/30"
                      : "hover:bg-muted/30"
                  )}
                >
                  <div className="w-12 h-12 rounded-2xl bg-clay-light flex items-center justify-center">
                    <span className="text-2xl">👩</span>
                  </div>
                  <div>
                    <p className="font-medium">Mor</p>
                    <p className="text-xs text-muted-foreground">Krop, helbred og recovery</p>
                  </div>
                </button>

                <button
                  onClick={() => setRole("far")}
                  className={cn(
                    "w-full card-soft flex items-center gap-4 text-left transition-all active:scale-[0.98]",
                    role === "far"
                      ? "ring-2 ring-sage bg-sage-light/30"
                      : "hover:bg-muted/30"
                  )}
                >
                  <div className="w-12 h-12 rounded-2xl bg-sage-light flex items-center justify-center">
                    <span className="text-2xl">👨</span>
                  </div>
                  <div>
                    <p className="font-medium">Far / Partner</p>
                    <p className="text-xs text-muted-foreground">Støtte, handling og tydelighed</p>
                  </div>
                </button>
              </div>
            </div>
          )}

          {/* Step: Names */}
          {step === "names" && (
            <div className="space-y-6 section-fade-in" key="names">
              <div>
                <h1 className="text-2xl font-serif">Hvad hedder I?</h1>
                <p className="text-sm text-muted-foreground mt-2">
                  Så appen føles personlig — kun for jer.
                </p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium mb-1.5 block">Dit navn</label>
                  <input
                    type="text"
                    value={parentName}
                    onChange={(e) => setParentName(e.target.value)}
                    placeholder={role === "mor" ? "F.eks. Line" : "F.eks. Mikkel"}
                    maxLength={50}
                    className="w-full bg-card border border-border rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-sage transition-shadow"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-1.5 block">Partners navn</label>
                  <input
                    type="text"
                    value={partnerName}
                    onChange={(e) => setPartnerName(e.target.value)}
                    placeholder={role === "mor" ? "F.eks. Mikkel" : "F.eks. Line"}
                    maxLength={50}
                    className="w-full bg-card border border-border rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-sage transition-shadow"
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Bottom actions */}
      <div className="px-6 pb-8 pt-4 flex items-center gap-3 max-w-sm mx-auto w-full">
        {stepIndex > 0 && (
          <button
            onClick={back}
            className="w-12 h-12 rounded-xl bg-muted flex items-center justify-center transition-all active:scale-95 hover:bg-muted/80"
          >
            <ArrowLeft className="w-5 h-5 text-muted-foreground" />
          </button>
        )}
        <button
          onClick={next}
          disabled={!canNext()}
          className={cn(
            "flex-1 h-12 rounded-xl font-medium text-sm flex items-center justify-center gap-2 transition-all active:scale-[0.98]",
            canNext()
              ? "bg-sage text-primary-foreground hover:opacity-90"
              : "bg-muted text-muted-foreground cursor-not-allowed"
          )}
        >
          {step === "names" ? "Kom i gang" : "Næste"}
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
