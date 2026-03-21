import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useFamily, type ParentRole } from "@/context/FamilyContext";
import { ArrowRight, ArrowLeft } from "lucide-react";
import { format } from "date-fns";
import { da } from "date-fns/locale";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import lilleLogoImg from "@/assets/lille-logo.png";

type Step = "phase" | "date" | "role" | "names" | "child";

export default function OnboardingPage() {
  const { setProfile, addChild } = useFamily();
  const navigate = useNavigate();

  const [step, setStep] = useState<Step>("phase");
  const [phase, setPhase] = useState<"pregnant" | "born" | null>(null);
  const [date, setDate] = useState<Date | undefined>();
  const [role, setRole] = useState<ParentRole | null>(null);
  const [parentName, setParentName] = useState("");
  const [partnerName, setPartnerName] = useState("");
  const [childName, setChildName] = useState("");

  const steps: Step[] = phase === "born"
    ? ["phase", "date", "role", "names", "child"]
    : ["phase", "date", "role", "names"];
  const stepIndex = steps.indexOf(step);
  const progress = ((stepIndex + 1) / steps.length) * 100;

  const canNext = () => {
    if (step === "phase") return phase !== null;
    if (step === "date") return date !== undefined;
    if (step === "role") return role !== null;
    if (step === "names") return parentName.trim().length > 0 && partnerName.trim().length > 0;
    if (step === "child") return true; // child name is optional
    return false;
  };

  const finish = () => {
    setProfile({
      phase: phase === "pregnant" ? "pregnant" : "newborn",
      role: role!,
      dueOrBirthDate: date!.toISOString(),
      parentName: parentName.trim(),
      partnerName: partnerName.trim(),
      children: childName.trim()
        ? [{ id: crypto.randomUUID?.() || Math.random().toString(36).slice(2), name: childName.trim(), birthDate: date!.toISOString() }]
        : [],
      onboarded: true,
    });
    navigate("/");
  };

  const next = () => {
    const i = steps.indexOf(step);
    if (i < steps.length - 1) {
      setStep(steps[i + 1]);
    } else {
      finish();
    }
  };

  const back = () => {
    const i = steps.indexOf(step);
    if (i > 0) setStep(steps[i - 1]);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Progress bar */}
      <div className="h-0.5" style={{ background: "hsl(var(--stone-lighter))" }}>
        <div className="h-full transition-all duration-500 ease-out" style={{ width: `${progress}%`, background: "hsl(var(--moss))" }} />
      </div>

      <div className="flex-1 flex flex-col items-center justify-center px-6 py-10">
        <div className="w-full max-w-sm">
          {/* Logo */}
          <div className="flex flex-col items-center mb-12 section-fade-in">
            <div className="flex items-center gap-2 mb-1">
              <img src={lilleLogoImg} alt="" className="w-7 h-7" />
              <span className="font-sans font-extrabold text-[2.6rem] tracking-[0.28em] uppercase leading-none" style={{ color: "hsl(var(--moss))" }}>
                LILLE
              </span>
            </div>
            <span className="text-[0.58rem] tracking-[0.28em] uppercase text-muted-foreground font-light">
              for nye forældre
            </span>
          </div>

          {/* Step: Phase */}
          {step === "phase" && (
            <div className="space-y-5 section-fade-in" key="phase">
              <div className="text-center">
                <p className="text-[0.6rem] tracking-[0.2em] uppercase text-muted-foreground mb-5">TRIN 1 AF {steps.length}</p>
                <h1 className="text-[1.45rem] font-bold mb-1.5">Hvor er I på rejsen?</h1>
                <p className="text-[0.76rem] text-muted-foreground tracking-[0.04em] leading-relaxed">
                  Vi tilpasser alt indhold til netop jeres situation.
                </p>
              </div>

              <div className="space-y-2.5">
                <button
                  onClick={() => setPhase("pregnant")}
                  className={cn(
                    "w-full flex items-center gap-3.5 px-4 py-3.5 rounded-2xl border-[1.5px] text-left transition-all active:scale-[0.98]",
                    phase === "pregnant"
                      ? "border-[hsl(var(--moss))] bg-[hsl(var(--moss))]/5"
                      : "border-[hsl(var(--stone-light))] hover:border-[hsl(var(--sage))] bg-background"
                  )}
                >
                  <div className="w-12 h-12 rounded-full flex items-center justify-center text-xl"
                    style={{ background: "linear-gradient(135deg, hsl(var(--clay-light)), hsl(var(--clay)))" }}>
                    🤰
                  </div>
                  <div>
                    <p className="text-[0.95rem] font-semibold">Vi venter barn</p>
                    <p className="text-[0.62rem] tracking-[0.12em] uppercase text-muted-foreground">Graviditet — uge for uge</p>
                  </div>
                </button>

                <button
                  onClick={() => setPhase("born")}
                  className={cn(
                    "w-full flex items-center gap-3.5 px-4 py-3.5 rounded-2xl border-[1.5px] text-left transition-all active:scale-[0.98]",
                    phase === "born"
                      ? "border-[hsl(var(--moss))] bg-[hsl(var(--moss))]/5"
                      : "border-[hsl(var(--stone-light))] hover:border-[hsl(var(--sage))] bg-background"
                  )}
                >
                  <div className="w-12 h-12 rounded-full flex items-center justify-center text-xl"
                    style={{ background: "linear-gradient(135deg, hsl(var(--sage-light)), hsl(var(--sage)))" }}>
                    👶
                  </div>
                  <div>
                    <p className="text-[0.95rem] font-semibold">Barnet er født</p>
                    <p className="text-[0.62rem] tracking-[0.12em] uppercase text-muted-foreground">Nyfødt eller baby</p>
                  </div>
                </button>
              </div>
            </div>
          )}

          {/* Step: Date */}
          {step === "date" && (
            <div className="space-y-5 section-fade-in" key="date">
              <div className="text-center">
                <p className="text-[0.6rem] tracking-[0.2em] uppercase text-muted-foreground mb-5">TRIN 2 AF {steps.length}</p>
                <h1 className="text-[1.45rem] font-bold mb-1.5">
                  {phase === "pregnant" ? "Hvornår er terminen?" : "Hvornår blev barnet født?"}
                </h1>
                <p className="text-[0.76rem] text-muted-foreground tracking-[0.04em] leading-relaxed">
                  {phase === "pregnant" ? "Vi beregner automatisk hvilken uge I er i." : "Vi tilpasser indhold til barnets alder."}
                </p>
              </div>

              <Popover>
                <PopoverTrigger asChild>
                  <button className={cn(
                    "w-full rounded-2xl border-[1.5px] px-5 py-4 text-left transition-all active:scale-[0.98]",
                    date ? "border-[hsl(var(--moss))] bg-[hsl(var(--moss))]/5" : "border-[hsl(var(--stone-light))] bg-background"
                  )}>
                    {date ? (
                      <p className="font-semibold text-[0.95rem]">{format(date, "d. MMMM yyyy", { locale: da })}</p>
                    ) : (
                      <p className="text-muted-foreground text-[0.95rem]">Vælg dato</p>
                    )}
                    <p className="text-[0.62rem] tracking-[0.12em] uppercase text-muted-foreground mt-1">
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
          )}

          {/* Step: Role */}
          {step === "role" && (
            <div className="space-y-5 section-fade-in" key="role">
              <div className="text-center">
                <p className="text-[0.6rem] tracking-[0.2em] uppercase text-muted-foreground mb-5">TRIN 3 AF {steps.length}</p>
                <h1 className="text-[1.45rem] font-bold mb-1.5">Hvem er du?</h1>
                <p className="text-[0.76rem] text-muted-foreground tracking-[0.04em] leading-relaxed">
                  Vi viser indhold der passer til din rolle.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <button
                  onClick={() => setRole("mor")}
                  className={cn(
                    "py-5 px-3 rounded-2xl border-[1.5px] text-center transition-all active:scale-[0.98]",
                    role === "mor" ? "border-[hsl(var(--clay))] bg-[hsl(var(--clay))]/10" : "border-[hsl(var(--stone-light))] hover:border-[hsl(var(--clay))]"
                  )}
                >
                  <span className="text-3xl block mb-1.5">👩</span>
                  <span className="text-[0.82rem] font-light">Mor</span>
                </button>
                <button
                  onClick={() => setRole("far")}
                  className={cn(
                    "py-5 px-3 rounded-2xl border-[1.5px] text-center transition-all active:scale-[0.98]",
                    role === "far" ? "border-[hsl(var(--sage))] bg-[hsl(var(--sage))]/10" : "border-[hsl(var(--stone-light))] hover:border-[hsl(var(--sage))]"
                  )}
                >
                  <span className="text-3xl block mb-1.5">👨</span>
                  <span className="text-[0.82rem] font-light">Far / Partner</span>
                </button>
              </div>
            </div>
          )}

          {/* Step: Names */}
          {step === "names" && (
            <div className="space-y-5 section-fade-in" key="names">
              <div className="text-center">
                <p className="text-[0.6rem] tracking-[0.2em] uppercase text-muted-foreground mb-5">TRIN 4 AF {steps.length}</p>
                <h1 className="text-[1.45rem] font-bold mb-1.5">Hvad hedder I?</h1>
                <p className="text-[0.76rem] text-muted-foreground tracking-[0.04em] leading-relaxed">
                  Så appen føles personlig — kun for jer.
                </p>
              </div>

              <div className="space-y-3">
                <div>
                  <label className="text-[0.62rem] tracking-[0.16em] uppercase text-muted-foreground mb-1.5 block">Dit navn</label>
                  <input
                    type="text"
                    value={parentName}
                    onChange={(e) => setParentName(e.target.value)}
                    placeholder={role === "mor" ? "F.eks. Line" : "F.eks. Mikkel"}
                    maxLength={50}
                    className="w-full rounded-xl border-[1.5px] border-[hsl(var(--stone-light))] bg-background px-4 py-3 text-[0.9rem] font-normal focus:outline-none focus:border-[hsl(var(--sage))] transition-colors"
                  />
                </div>
                <div>
                  <label className="text-[0.62rem] tracking-[0.16em] uppercase text-muted-foreground mb-1.5 block">Partners navn</label>
                  <input
                    type="text"
                    value={partnerName}
                    onChange={(e) => setPartnerName(e.target.value)}
                    placeholder={role === "mor" ? "F.eks. Mikkel" : "F.eks. Line"}
                    maxLength={50}
                    className="w-full rounded-xl border-[1.5px] border-[hsl(var(--stone-light))] bg-background px-4 py-3 text-[0.9rem] font-normal focus:outline-none focus:border-[hsl(var(--sage))] transition-colors"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Step: Child name (born only) */}
          {step === "child" && (
            <div className="space-y-5 section-fade-in" key="child">
              <div className="text-center">
                <p className="text-[0.6rem] tracking-[0.2em] uppercase text-muted-foreground mb-5">TRIN 5 AF {steps.length}</p>
                <h1 className="text-[1.45rem] font-bold mb-1.5">Hvad hedder jeres barn?</h1>
                <p className="text-[0.76rem] text-muted-foreground tracking-[0.04em] leading-relaxed">
                  Så vi kan gøre oplevelsen helt personlig.
                </p>
              </div>

              <div>
                <label className="text-[0.62rem] tracking-[0.16em] uppercase text-muted-foreground mb-1.5 block">Barnets navn</label>
                <input
                  type="text"
                  value={childName}
                  onChange={(e) => setChildName(e.target.value)}
                  placeholder="F.eks. Alma"
                  maxLength={50}
                  className="w-full rounded-xl border-[1.5px] border-[hsl(var(--stone-light))] bg-background px-4 py-3 text-[0.9rem] font-normal focus:outline-none focus:border-[hsl(var(--sage))] transition-colors"
                />
                <p className="text-[0.68rem] text-muted-foreground mt-2">Du kan altid tilføje eller ændre dette senere.</p>
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
            className="w-12 h-12 rounded-xl border border-[hsl(var(--stone-light))] flex items-center justify-center transition-all active:scale-95 hover:bg-[hsl(var(--cream))]"
          >
            <ArrowLeft className="w-5 h-5 text-muted-foreground" />
          </button>
        )}
        <button
          onClick={next}
          disabled={!canNext()}
          className={cn(
            "flex-1 h-12 rounded-full font-semibold text-[0.74rem] tracking-[0.16em] uppercase flex items-center justify-center gap-2 transition-all active:scale-[0.98]",
            canNext()
              ? "bg-[hsl(var(--moss))] text-white hover:bg-[hsl(var(--sage-dark))]"
              : "bg-muted text-muted-foreground cursor-not-allowed"
          )}
        >
          {step === steps[steps.length - 1] ? "Kom i gang" : "Næste"}
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
