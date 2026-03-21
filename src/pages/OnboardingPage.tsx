import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useFamily, type ParentRole, type BirthType, type FeedingMethod, type MorHealth } from "@/context/FamilyContext";
import { ArrowRight, ArrowLeft } from "lucide-react";
import { format } from "date-fns";
import { da } from "date-fns/locale";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import lilleLogoImg from "@/assets/lille-logo.png";

type Step = "phase" | "date" | "role" | "names" | "child" | "morhealth";

const complications = [
  { id: "rift", label: "Bristning / klip", emoji: "🩹" },
  { id: "blødning", label: "Stor blødning", emoji: "🩸" },
  { id: "infektion", label: "Infektion", emoji: "🤒" },
  { id: "præeklampsi", label: "Præeklampsi", emoji: "💉" },
  { id: "ammeproblemer", label: "Ammeproblemer", emoji: "🤱" },
  { id: "fødselsdepression", label: "Nedstemthed / fødselsdepression", emoji: "💔" },
];

export default function OnboardingPage() {
  const { setProfile } = useFamily();
  const navigate = useNavigate();

  const [step, setStep] = useState<Step>("phase");
  const [phase, setPhase] = useState<"pregnant" | "born" | null>(null);
  const [date, setDate] = useState<Date | undefined>();
  const [role, setRole] = useState<ParentRole | null>(null);
  const [parentName, setParentName] = useState("");
  const [partnerName, setPartnerName] = useState("");
  const [childName, setChildName] = useState("");

  // Mor health quiz
  const [birthType, setBirthType] = useState<BirthType | undefined>();
  const [selectedComplications, setSelectedComplications] = useState<string[]>([]);
  const [feedingMethod, setFeedingMethod] = useState<FeedingMethod | undefined>();

  const isMorBorn = role === "mor" && phase === "born";
  const steps: Step[] = [
    "phase", "date", "role", "names",
    ...(phase === "born" ? ["child" as Step] : []),
    ...(isMorBorn ? ["morhealth" as Step] : []),
  ];
  const stepIndex = steps.indexOf(step);
  const progress = ((stepIndex + 1) / steps.length) * 100;

  const canNext = () => {
    if (step === "phase") return phase !== null;
    if (step === "date") return date !== undefined;
    if (step === "role") return role !== null;
    if (step === "names") return parentName.trim().length > 0 && partnerName.trim().length > 0;
    if (step === "child") return true;
    if (step === "morhealth") return true; // all optional
    return false;
  };

  const toggleComplication = (id: string) => {
    setSelectedComplications(prev =>
      prev.includes(id) ? prev.filter(c => c !== id) : [...prev, id]
    );
  };

  const finish = () => {
    const morHealth: MorHealth | undefined = isMorBorn ? {
      birthType, complications: selectedComplications, feedingMethod,
    } : undefined;

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
      morHealth,
    });
    navigate("/");
  };

  const next = () => {
    const i = steps.indexOf(step);
    if (i < steps.length - 1) setStep(steps[i + 1]);
    else finish();
  };

  const back = () => {
    const i = steps.indexOf(step);
    if (i > 0) setStep(steps[i - 1]);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <div className="h-0.5" style={{ background: "hsl(var(--stone-lighter))" }}>
        <div className="h-full transition-all duration-500 ease-out" style={{ width: `${progress}%`, background: "hsl(var(--moss))" }} />
      </div>

      <div className="flex-1 flex flex-col items-center justify-center px-6 py-10">
        <div className="w-full max-w-sm">
          {/* Logo */}
          <div className="flex flex-col items-center mb-12 section-fade-in">
            <div className="flex items-center gap-2 mb-1">
              <img src={lilleLogoImg} alt="" className="w-7 h-7" />
              <span className="font-sans font-extrabold text-[2.6rem] tracking-[0.28em] uppercase leading-none" style={{ color: "hsl(var(--moss))" }}>LILLE</span>
            </div>
            <span className="text-[0.58rem] tracking-[0.28em] uppercase text-muted-foreground font-light">for nye forældre</span>
          </div>

          {/* Phase */}
          {step === "phase" && (
            <div className="space-y-5 section-fade-in" key="phase">
              <StepHeader num={stepIndex + 1} total={steps.length} title="Hvor er I på rejsen?" sub="Vi tilpasser alt indhold til netop jeres situation." />
              <div className="space-y-2.5">
                <OptionButton selected={phase === "pregnant"} onClick={() => setPhase("pregnant")} emoji="🤰" title="Vi venter barn" sub="Graviditet — uge for uge" />
                <OptionButton selected={phase === "born"} onClick={() => setPhase("born")} emoji="👶" title="Barnet er født" sub="Nyfødt eller baby" />
              </div>
            </div>
          )}

          {/* Date */}
          {step === "date" && (
            <div className="space-y-5 section-fade-in" key="date">
              <StepHeader num={stepIndex + 1} total={steps.length}
                title={phase === "pregnant" ? "Hvornår er terminen?" : "Hvornår blev barnet født?"}
                sub={phase === "pregnant" ? "Vi beregner automatisk hvilken uge I er i." : "Vi tilpasser indhold til barnets alder."} />
              <Popover>
                <PopoverTrigger asChild>
                  <button className={cn(
                    "w-full rounded-2xl border-[1.5px] px-5 py-4 text-left transition-all active:scale-[0.98]",
                    date ? "border-[hsl(var(--moss))] bg-[hsl(var(--moss))]/5" : "border-[hsl(var(--stone-light))] bg-background"
                  )}>
                    {date ? <p className="font-semibold text-[0.95rem]">{format(date, "d. MMMM yyyy", { locale: da })}</p> : <p className="text-muted-foreground text-[0.95rem]">Vælg dato</p>}
                    <p className="text-[0.62rem] tracking-[0.12em] uppercase text-muted-foreground mt-1">{phase === "pregnant" ? "Forventet fødselsdato" : "Fødselsdato"}</p>
                  </button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="center">
                  <Calendar mode="single" selected={date} onSelect={setDate} locale={da} className="p-3 pointer-events-auto"
                    disabled={(d) => phase === "pregnant" ? d < new Date() || d > new Date(Date.now() + 280 * 24 * 60 * 60 * 1000) : d > new Date() || d < new Date("2020-01-01")}
                    defaultMonth={phase === "pregnant" ? new Date(Date.now() + 120 * 24 * 60 * 60 * 1000) : new Date()} />
                </PopoverContent>
              </Popover>
            </div>
          )}

          {/* Role */}
          {step === "role" && (
            <div className="space-y-5 section-fade-in" key="role">
              <StepHeader num={stepIndex + 1} total={steps.length} title="Hvem er du?" sub="Vi viser indhold der passer til din rolle." />
              <div className="grid grid-cols-2 gap-2.5">
                <button onClick={() => setRole("mor")} className={cn("py-5 px-3 rounded-2xl border-[1.5px] text-center transition-all active:scale-[0.98]",
                  role === "mor" ? "border-[hsl(var(--clay))] bg-[hsl(var(--clay))]/10" : "border-[hsl(var(--stone-light))] hover:border-[hsl(var(--clay))]")}>
                  <span className="text-3xl block mb-1.5">👩</span><span className="text-[0.82rem] font-light">Mor</span>
                </button>
                <button onClick={() => setRole("far")} className={cn("py-5 px-3 rounded-2xl border-[1.5px] text-center transition-all active:scale-[0.98]",
                  role === "far" ? "border-[hsl(var(--sage))] bg-[hsl(var(--sage))]/10" : "border-[hsl(var(--stone-light))] hover:border-[hsl(var(--sage))]")}>
                  <span className="text-3xl block mb-1.5">👨</span><span className="text-[0.82rem] font-light">Far / Partner</span>
                </button>
              </div>
            </div>
          )}

          {/* Names */}
          {step === "names" && (
            <div className="space-y-5 section-fade-in" key="names">
              <StepHeader num={stepIndex + 1} total={steps.length} title="Hvad hedder I?" sub="Så appen føles personlig — kun for jer." />
              <div className="space-y-3">
                <InputField label="Dit navn" value={parentName} onChange={setParentName} placeholder={role === "mor" ? "F.eks. Line" : "F.eks. Mikkel"} />
                <InputField label="Partners navn" value={partnerName} onChange={setPartnerName} placeholder={role === "mor" ? "F.eks. Mikkel" : "F.eks. Line"} />
              </div>
            </div>
          )}

          {/* Child */}
          {step === "child" && (
            <div className="space-y-5 section-fade-in" key="child">
              <StepHeader num={stepIndex + 1} total={steps.length} title="Hvad hedder jeres barn?" sub="Så vi kan gøre oplevelsen helt personlig." />
              <InputField label="Barnets navn" value={childName} onChange={setChildName} placeholder="F.eks. Alma" />
              <p className="text-[0.68rem] text-muted-foreground">Du kan altid tilføje eller ændre dette senere.</p>
            </div>
          )}

          {/* Mor Health Quiz */}
          {step === "morhealth" && (
            <div className="space-y-5 section-fade-in" key="morhealth">
              <StepHeader num={stepIndex + 1} total={steps.length} title="Lidt om din fødsel" sub="Så vi kan tilpasse råd om recovery og amning. Alt er valgfrit." />

              {/* Birth type */}
              <div>
                <p className="text-[0.62rem] tracking-[0.16em] uppercase text-muted-foreground mb-2">Fødselstype</p>
                <div className="grid grid-cols-2 gap-2">
                  <OptionButton selected={birthType === "vaginal"} onClick={() => setBirthType("vaginal")} emoji="👶" title="Vaginal fødsel" compact />
                  <OptionButton selected={birthType === "kejsersnit"} onClick={() => setBirthType("kejsersnit")} emoji="🏥" title="Kejsersnit" compact />
                </div>
              </div>

              {/* Feeding */}
              <div>
                <p className="text-[0.62rem] tracking-[0.16em] uppercase text-muted-foreground mb-2">Ernæring</p>
                <div className="grid grid-cols-3 gap-2">
                  {([
                    { key: "amning" as FeedingMethod, emoji: "🤱", label: "Amning" },
                    { key: "flaske" as FeedingMethod, emoji: "🍼", label: "Flaske" },
                    { key: "begge" as FeedingMethod, emoji: "🤱🍼", label: "Begge" },
                  ]).map(f => (
                    <button key={f.key} onClick={() => setFeedingMethod(f.key)}
                      className={cn("flex flex-col items-center gap-1 py-3 rounded-2xl border-[1.5px] text-[0.72rem] transition-all active:scale-[0.97]",
                        feedingMethod === f.key ? "border-[hsl(var(--moss))] bg-[hsl(var(--moss))]/5 font-medium" : "border-[hsl(var(--stone-light))]")}>
                      <span>{f.emoji}</span>{f.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Complications */}
              <div>
                <p className="text-[0.62rem] tracking-[0.16em] uppercase text-muted-foreground mb-2">Komplikationer (valgfrit)</p>
                <div className="space-y-1.5">
                  {complications.map(c => (
                    <button key={c.id} onClick={() => toggleComplication(c.id)}
                      className={cn("w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl border-[1.5px] text-left text-[0.82rem] transition-all active:scale-[0.98]",
                        selectedComplications.includes(c.id) ? "border-[hsl(var(--clay))] bg-[hsl(var(--clay))]/8" : "border-[hsl(var(--stone-light))]")}>
                      <span>{c.emoji}</span>{c.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Bottom actions */}
      <div className="px-6 pb-8 pt-4 flex items-center gap-3 max-w-sm mx-auto w-full">
        {stepIndex > 0 && (
          <button onClick={back} className="w-12 h-12 rounded-xl border border-[hsl(var(--stone-light))] flex items-center justify-center transition-all active:scale-95 hover:bg-[hsl(var(--cream))]">
            <ArrowLeft className="w-5 h-5 text-muted-foreground" />
          </button>
        )}
        <button onClick={next} disabled={!canNext()}
          className={cn("flex-1 h-12 rounded-full font-semibold text-[0.74rem] tracking-[0.16em] uppercase flex items-center justify-center gap-2 transition-all active:scale-[0.98]",
            canNext() ? "bg-[hsl(var(--moss))] text-white hover:bg-[hsl(var(--sage-dark))]" : "bg-muted text-muted-foreground cursor-not-allowed")}>
          {step === steps[steps.length - 1] ? "Kom i gang" : step === "morhealth" ? "Kom i gang" : "Næste"}
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

// ── Helper components ──
function StepHeader({ num, total, title, sub }: { num: number; total: number; title: string; sub: string }) {
  return (
    <div className="text-center">
      <p className="text-[0.6rem] tracking-[0.2em] uppercase text-muted-foreground mb-5">TRIN {num} AF {total}</p>
      <h1 className="text-[1.45rem] font-bold mb-1.5">{title}</h1>
      <p className="text-[0.76rem] text-muted-foreground tracking-[0.04em] leading-relaxed">{sub}</p>
    </div>
  );
}

function OptionButton({ selected, onClick, emoji, title, sub, compact }: {
  selected: boolean; onClick: () => void; emoji: string; title: string; sub?: string; compact?: boolean;
}) {
  return (
    <button onClick={onClick}
      className={cn(
        "w-full flex items-center gap-3.5 rounded-2xl border-[1.5px] text-left transition-all active:scale-[0.98]",
        compact ? "px-3 py-2.5" : "px-4 py-3.5",
        selected ? "border-[hsl(var(--moss))] bg-[hsl(var(--moss))]/5" : "border-[hsl(var(--stone-light))] hover:border-[hsl(var(--sage))] bg-background"
      )}>
      {!compact && (
        <div className="w-12 h-12 rounded-full flex items-center justify-center text-xl"
          style={{ background: selected ? "hsl(var(--sage-light))" : "hsl(var(--stone-lighter))" }}>{emoji}</div>
      )}
      {compact && <span className="text-lg">{emoji}</span>}
      <div>
        <p className={`text-[0.95rem] ${compact ? "text-[0.82rem]" : "font-semibold"}`}>{title}</p>
        {sub && <p className="text-[0.62rem] tracking-[0.12em] uppercase text-muted-foreground">{sub}</p>}
      </div>
    </button>
  );
}

function InputField({ label, value, onChange, placeholder }: { label: string; value: string; onChange: (v: string) => void; placeholder: string }) {
  return (
    <div>
      <label className="text-[0.62rem] tracking-[0.16em] uppercase text-muted-foreground mb-1.5 block">{label}</label>
      <input type="text" value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} maxLength={50}
        className="w-full rounded-xl border-[1.5px] border-[hsl(var(--stone-light))] bg-background px-4 py-3 text-[0.9rem] font-normal focus:outline-none focus:border-[hsl(var(--sage))] transition-colors" />
    </div>
  );
}
