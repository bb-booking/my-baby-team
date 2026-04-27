import { useState } from "react";
import { useFamily, type ParentRole, type BirthType, type FeedingMethod } from "@/context/FamilyContext";
import { useAuth } from "@/context/AuthContext";
import { ArrowRight, ArrowLeft, Mail, Lock, Eye, EyeOff } from "lucide-react";
import { format, addDays } from "date-fns";
import { da } from "date-fns/locale";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { upsertProfile } from "@/hooks/useSupabaseSync";
import { MeloWordmark } from "@/components/MeloWordmark";

// Calculate due date from LMP (last menstrual period): LMP + 280 days
function lmpToDueDate(lmp: Date): Date {
  return addDays(lmp, 280);
}

type Step =
  | "phase"       // Venter barn / Har født
  | "lmp"         // Gravid: første dag i sidste cyklus
  | "birthdate"   // Født: barnets fødselsdato
  | "babyname"    // Barnets navn
  | "role"        // Hvem er du? Mor / Far
  | "yourname"    // Dit navn
  | "partnername" // Partners navn
  | "birthtype"   // Fødselstype [spring over]
  | "feeding"     // Amning / flaske [spring over]
  | "leave"       // Hvem er på barsel
  | "account";    // Opret konto (email + adgangskode) — altid sidst

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
  const { signUp, signIn, user } = useAuth();

  const [step, setStep] = useState<Step>("phase");
  const [phase, setPhase] = useState<"pregnant" | "born" | null>(null);
  const [lmpDate, setLmpDate] = useState<Date | undefined>();
  const [birthDate, setBirthDate] = useState<Date | undefined>();
  const [babyName, setBabyName] = useState("");
  const [role, setRole] = useState<ParentRole>("mor");
  const [hasPartner, setHasPartner] = useState(true);
  const [yourName, setYourName] = useState("");
  const [partnerName, setPartnerName] = useState("");
  const [birthType, setBirthType] = useState<BirthType | undefined>();
  const [selectedComplications, setSelectedComplications] = useState<string[]>([]);
  const [feedingMethod, setFeedingMethod] = useState<FeedingMethod | undefined>();
  const [morLeave, setMorLeave] = useState(true);
  const [farLeave, setFarLeave] = useState(false);

  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  // Account step state
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  // Sensitive steps that can be skipped
  const skippable: Step[] = ["birthtype", "feeding", "leave"];

  const steps: Step[] = [
    "phase",
    ...(phase === "pregnant" ? ["lmp" as Step] : []),
    ...(phase === "born" ? ["birthdate" as Step, "babyname" as Step] : []),
    "role",
    "yourname",
    ...(hasPartner ? ["partnername" as Step] : []),
    ...(phase === "born" ? ["birthtype" as Step, "feeding" as Step] : []),
    "leave",
    "account",
  ];

  const stepIndex = steps.indexOf(step);
  const progress = ((stepIndex + 1) / steps.length) * 100;

  const canNext = () => {
    if (step === "phase") return phase !== null;
    if (step === "lmp") return lmpDate !== undefined;
    if (step === "birthdate") return birthDate !== undefined;
    if (step === "babyname") return true; // optional
    if (step === "role") return true;
    if (step === "yourname") return yourName.trim().length > 0;
    if (step === "partnername") return true; // optional
    if (step === "birthtype") return true;
    if (step === "feeding") return true;
    if (step === "leave") return true;
    if (step === "account") return email.trim().length > 0 && password.length >= 6;
    return true;
  };

  const toggleComplication = (id: string) => {
    setSelectedComplications(prev =>
      prev.includes(id) ? prev.filter(c => c !== id) : [...prev, id]
    );
  };

  const goNext = () => {
    const i = steps.indexOf(step);
    if (i < steps.length - 1) setStep(steps[i + 1]);
  };

  const goBack = () => {
    const i = steps.indexOf(step);
    if (i > 0) setStep(steps[i - 1]);
  };

  const finish = async () => {
    setSaving(true);
    setSaveError(null);

    const dueOrBirthDate = phase === "pregnant"
      ? lmpToDueDate(lmpDate!).toISOString()
      : birthDate!.toISOString();

    const newProfile = {
      phase: phase === "pregnant" ? "pregnant" : "newborn" as const,
      role,
      dueOrBirthDate,
      parentName: yourName.trim(),
      partnerName: partnerName.trim(),
      children: babyName.trim()
        ? [{ id: Math.random().toString(36).slice(2), name: babyName.trim(), birthDate: dueOrBirthDate }]
        : [],
      onboarded: true,
      morHealth: phase === "born" ? { birthType, complications: selectedComplications, feedingMethod } : undefined,
      parentalLeave: { mor: morLeave, far: farLeave },
      languages: { mor: "da", far: "da" },
      hasPartner,
      inviteCode: Math.random().toString(36).substring(2, 8).toUpperCase(),
      familyId: Math.random().toString(36).substring(2, 18),
    };

    // Try to create account
    const { error: signUpError, needsConfirmation, userId } = await signUp(email.trim(), password);

    if (signUpError) {
      // If email already exists, try signing in instead
      if (signUpError.toLowerCase().includes("already") || signUpError.toLowerCase().includes("registered")) {
        const { error: signInError } = await signIn(email.trim(), password);
        if (signInError) {
          setSaveError("Denne e-mail er allerede i brug. Kontrollér din adgangskode og prøv igen.");
          setSaving(false);
          return;
        }
        // signIn succeeded — onAuthStateChange will re-render the app.
        // Save profile to localStorage so the new FamilyProvider picks it up.
        setProfile(newProfile);
        // Save to Supabase using user from auth (will be set by onAuthStateChange shortly)
        // We do this optimistically — the debounced sync will handle it too.
        if (user) await upsertProfile(user.id, newProfile);
        setSaving(false);
        return;
      }
      setSaveError(signUpError);
      setSaving(false);
      return;
    }

    if (needsConfirmation) {
      setSaveError("Tjek din e-mail for et bekræftelseslink, og kom tilbage for at logge ind.");
      setSaving(false);
      return;
    }

    // Signup succeeded and session is active — save profile
    setProfile(newProfile);
    if (userId) await upsertProfile(userId, newProfile);

    setSaving(false);
    // onAuthStateChange will fire and re-render App.tsx → user is authenticated → Dashboard shown
  };

  const handleNext = () => {
    if (step === "account") {
      finish();
    } else {
      goNext();
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col"
      style={{ paddingTop: "env(safe-area-inset-top, 0px)" }}
    >
      {/* Progress bar */}
      <div className="h-0.5" style={{ background: "hsl(var(--stone-lighter))" }}>
        <div className="h-full transition-all duration-500 ease-out" style={{ width: `${progress}%`, background: "hsl(var(--moss))" }} />
      </div>

      <div className="flex-1 flex flex-col items-center justify-center px-6 py-10">
        <div className="w-full max-w-sm">

          {/* Logo — only on first step */}
          {step === "phase" && (
            <div className="flex flex-col items-center mb-12 section-fade-in">
              <MeloWordmark size="2.6rem" />
              <span className="text-[0.58rem] tracking-[0.28em] uppercase text-muted-foreground font-light mt-1">for nye forældre</span>
            </div>
          )}

          {/* STEP: Phase */}
          {step === "phase" && (
            <div className="space-y-5 section-fade-in" key="phase">
              <StepHeader title="Hvor er I på rejsen?" sub="Vi tilpasser alt indhold til netop jeres situation." />
              <div className="space-y-2.5">
                <OptionButton
                  selected={phase === "pregnant"}
                  onClick={() => setPhase("pregnant")}
                  emoji="🤰" title="Vi venter barn" sub="Graviditet — uge for uge"
                />
                <OptionButton
                  selected={phase === "born"}
                  onClick={() => setPhase("born")}
                  emoji="👶" title="Barnet er født" sub="Nyfødt eller baby"
                />
              </div>
            </div>
          )}

          {/* STEP: LMP (pregnant) */}
          {step === "lmp" && (
            <div className="space-y-5 section-fade-in" key="lmp">
              <StepHeader
                title="Hvornår startede din sidste cyklus?"
                sub="Vi bruger dette til at beregne din termin automatisk. Første dag i din sidste menstruation."
              />
              <Popover>
                <PopoverTrigger asChild>
                  <button className={cn(
                    "w-full rounded-2xl border-[1.5px] px-5 py-4 text-left transition-all active:scale-[0.98]",
                    lmpDate ? "border-[hsl(var(--moss))] bg-[hsl(var(--moss))]/5" : "border-[hsl(var(--stone-light))] bg-background"
                  )}>
                    {lmpDate
                      ? <p className="font-semibold text-[0.95rem]">{format(lmpDate, "d. MMMM yyyy", { locale: da })}</p>
                      : <p className="text-muted-foreground text-[0.95rem]">Vælg dato</p>
                    }
                    <p className="text-[0.62rem] tracking-[0.12em] uppercase text-muted-foreground mt-1">Første dag i sidste menstruation</p>
                  </button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="center">
                  <Calendar
                    mode="single" selected={lmpDate} onSelect={setLmpDate} locale={da}
                    className="p-3 pointer-events-auto"
                    disabled={(d) => d > new Date() || d < new Date("2024-01-01")}
                    defaultMonth={new Date()}
                  />
                </PopoverContent>
              </Popover>
              {lmpDate && (
                <div className="rounded-2xl px-4 py-3" style={{ background: "hsl(var(--sage-light))" }}>
                  <p className="text-[0.62rem] tracking-[0.12em] uppercase text-muted-foreground mb-0.5">Beregnet termin</p>
                  <p className="font-semibold text-[0.95rem]">{format(lmpToDueDate(lmpDate), "d. MMMM yyyy", { locale: da })}</p>
                </div>
              )}
            </div>
          )}

          {/* STEP: Birth date (born) */}
          {step === "birthdate" && (
            <div className="space-y-5 section-fade-in" key="birthdate">
              <StepHeader title="Hvornår blev barnet født?" sub="Vi tilpasser indhold til barnets alder." />
              <Popover>
                <PopoverTrigger asChild>
                  <button className={cn(
                    "w-full rounded-2xl border-[1.5px] px-5 py-4 text-left transition-all active:scale-[0.98]",
                    birthDate ? "border-[hsl(var(--moss))] bg-[hsl(var(--moss))]/5" : "border-[hsl(var(--stone-light))] bg-background"
                  )}>
                    {birthDate
                      ? <p className="font-semibold text-[0.95rem]">{format(birthDate, "d. MMMM yyyy", { locale: da })}</p>
                      : <p className="text-muted-foreground text-[0.95rem]">Vælg dato</p>
                    }
                    <p className="text-[0.62rem] tracking-[0.12em] uppercase text-muted-foreground mt-1">Fødselsdato</p>
                  </button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="center">
                  <Calendar
                    mode="single" selected={birthDate} onSelect={setBirthDate} locale={da}
                    className="p-3 pointer-events-auto"
                    disabled={(d) => d > new Date() || d < new Date("2020-01-01")}
                    defaultMonth={new Date()}
                  />
                </PopoverContent>
              </Popover>
            </div>
          )}

          {/* STEP: Baby name */}
          {step === "babyname" && (
            <div className="space-y-5 section-fade-in" key="babyname">
              <StepHeader title="Hvad hedder jeres barn?" sub="Så vi kan gøre oplevelsen helt personlig. Du kan altid ændre det senere." />
              <InputField label="Barnets navn" value={babyName} onChange={setBabyName} placeholder="F.eks. Alma" />
            </div>
          )}

          {/* STEP: Role */}
          {step === "role" && (
            <div className="space-y-5 section-fade-in" key="role">
              <StepHeader title="Hvem er du?" sub="Vi tilpasser appen til din oplevelse — uanset familietype." />
              <div className="space-y-2.5">
                <button
                  onClick={() => { setRole("mor"); setHasPartner(true); }}
                  className={cn(
                    "w-full flex items-start gap-3.5 rounded-2xl border-[1.5px] text-left px-4 py-3.5 transition-all active:scale-[0.98]",
                    role === "mor" && hasPartner
                      ? "border-[hsl(var(--clay))] bg-[hsl(var(--clay))]/8"
                      : "border-[hsl(var(--stone-light))] hover:border-[hsl(var(--clay))]"
                  )}
                >
                  <span className="text-2xl mt-0.5">🤱</span>
                  <div>
                    <p className="text-[0.95rem] font-semibold">Den gravide / fødende forælder</p>
                    <p className="text-[0.62rem] tracking-[0.08em] text-muted-foreground mt-0.5">Graviditet, fødsel og recovery — med medforælder</p>
                  </div>
                </button>
                <button
                  onClick={() => { setRole("far"); setHasPartner(true); }}
                  className={cn(
                    "w-full flex items-start gap-3.5 rounded-2xl border-[1.5px] text-left px-4 py-3.5 transition-all active:scale-[0.98]",
                    role === "far" && hasPartner
                      ? "border-[hsl(var(--sage))] bg-[hsl(var(--sage))]/8"
                      : "border-[hsl(var(--stone-light))] hover:border-[hsl(var(--sage))]"
                  )}
                >
                  <span className="text-2xl mt-0.5">🤝</span>
                  <div>
                    <p className="text-[0.95rem] font-semibold">Medforælder / partner</p>
                    <p className="text-[0.62rem] tracking-[0.08em] text-muted-foreground mt-0.5">Støttende forælder — uanset køn eller relation</p>
                  </div>
                </button>
                <button
                  onClick={() => { setRole("mor"); setHasPartner(false); }}
                  className={cn(
                    "w-full flex items-start gap-3.5 rounded-2xl border-[1.5px] text-left px-4 py-3.5 transition-all active:scale-[0.98]",
                    !hasPartner
                      ? "border-[hsl(var(--moss))] bg-[hsl(var(--moss))]/5"
                      : "border-[hsl(var(--stone-light))] hover:border-[hsl(var(--moss))]"
                  )}
                >
                  <span className="text-2xl mt-0.5">💪</span>
                  <div>
                    <p className="text-[0.95rem] font-semibold">Alene forælder</p>
                    <p className="text-[0.62rem] tracking-[0.08em] text-muted-foreground mt-0.5">Du klarer det alene — vi er her for dig</p>
                  </div>
                </button>
              </div>
            </div>
          )}

          {/* STEP: Your name */}
          {step === "yourname" && (
            <div className="space-y-5 section-fade-in" key="yourname">
              <StepHeader
                title="Hvad hedder du?"
                sub="Så appen kan tiltale dig personligt."
              />
              <InputField
                label="Dit navn"
                value={yourName}
                onChange={setYourName}
                placeholder="F.eks. Sofie"
              />
            </div>
          )}

          {/* STEP: Partner name */}
          {step === "partnername" && (
            <div className="space-y-5 section-fade-in" key="partnername">
              <StepHeader title="Hvad hedder din medforælder?" sub="Så appen føles personlig for jer begge. Du kan ændre det senere." />
              <InputField
                label="Medforfælders navn"
                value={partnerName}
                onChange={setPartnerName}
                placeholder="F.eks. Mikkel"
              />
            </div>
          )}

          {/* STEP: Birth type [skippable] */}
          {step === "birthtype" && (
            <div className="space-y-5 section-fade-in" key="birthtype">
              <StepHeader
                title="Hvordan foregik fødslen?"
                sub="Vi bruger dette til at tilpasse råd om recovery. Helt valgfrit."
                skippable
              />
              <div className="grid grid-cols-2 gap-2.5">
                <OptionButton selected={birthType === "vaginal"} onClick={() => setBirthType("vaginal")} emoji="👶" title="Vaginal fødsel" compact />
                <OptionButton selected={birthType === "kejsersnit"} onClick={() => setBirthType("kejsersnit")} emoji="🏥" title="Kejsersnit" compact />
              </div>
              <div>
                <p className="text-[0.62rem] tracking-[0.16em] uppercase text-muted-foreground mb-2">Komplikationer (valgfrit)</p>
                <div className="space-y-1.5">
                  {complications.map(c => (
                    <button key={c.id} onClick={() => toggleComplication(c.id)}
                      className={cn(
                        "w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl border-[1.5px] text-left text-[0.82rem] transition-all active:scale-[0.98]",
                        selectedComplications.includes(c.id)
                          ? "border-[hsl(var(--clay))] bg-[hsl(var(--clay))]/8"
                          : "border-[hsl(var(--stone-light))]"
                      )}>
                      <span>{c.emoji}</span>{c.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* STEP: Feeding [skippable] */}
          {step === "feeding" && (
            <div className="space-y-5 section-fade-in" key="feeding">
              <StepHeader title="Hvordan ernærer I barnet?" sub="Vi tilpasser råd til jeres valg. Helt valgfrit." skippable />
              <div className="grid grid-cols-3 gap-2">
                {([
                  { key: "amning" as FeedingMethod, emoji: "🤱", label: "Amning" },
                  { key: "flaske" as FeedingMethod, emoji: "🍼", label: "Flaske" },
                  { key: "begge" as FeedingMethod, emoji: "🤱🍼", label: "Begge" },
                ] as const).map(f => (
                  <button key={f.key} onClick={() => setFeedingMethod(f.key)}
                    className={cn(
                      "flex flex-col items-center gap-1.5 py-4 rounded-2xl border-[1.5px] text-[0.72rem] transition-all active:scale-[0.97]",
                      feedingMethod === f.key
                        ? "border-[hsl(var(--moss))] bg-[hsl(var(--moss))]/5 font-medium"
                        : "border-[hsl(var(--stone-light))]"
                    )}>
                    <span className="text-2xl">{f.emoji}</span>{f.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* STEP: Account — always last */}
          {step === "account" && (
            <div className="space-y-5 section-fade-in" key="account">
              <div className="flex flex-col items-center mb-2">
                <MeloWordmark size="2.2rem" />
              </div>
              <StepHeader
                title="Næsten der!"
                sub="Opret din konto for at gemme dine indstillinger og tilgå Melo fra alle dine enheder."
              />
              <div className="space-y-3">
                <div className="space-y-1.5">
                  <label className="text-[0.62rem] tracking-[0.16em] uppercase text-muted-foreground">E-mail</label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <input
                      type="email"
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      placeholder="din@email.dk"
                      required
                      className="w-full rounded-xl border-[1.5px] border-[hsl(var(--stone-light))] bg-background pl-10 pr-4 py-3 text-[0.88rem] focus:outline-none focus:border-[hsl(var(--moss))] transition-colors"
                    />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className="text-[0.62rem] tracking-[0.16em] uppercase text-muted-foreground">Adgangskode</label>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <input
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      placeholder="Min. 6 tegn"
                      minLength={6}
                      className="w-full rounded-xl border-[1.5px] border-[hsl(var(--stone-light))] bg-background pl-10 pr-11 py-3 text-[0.88rem] focus:outline-none focus:border-[hsl(var(--moss))] transition-colors"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STEP: Leave [skippable] */}
          {step === "leave" && (
            <div className="space-y-5 section-fade-in" key="leave">
              <StepHeader title="Hvem er på barsel?" sub="Så vi kan tilpasse hvem der gør hvad i hverdagen." skippable />
              <div className="space-y-3">
                <button onClick={() => setMorLeave(!morLeave)}
                  className={cn(
                    "w-full flex items-center gap-3.5 rounded-2xl border-[1.5px] text-left px-4 py-3.5 transition-all active:scale-[0.98]",
                    morLeave ? "border-[hsl(var(--clay))] bg-[hsl(var(--clay))]/5" : "border-[hsl(var(--stone-light))] bg-background"
                  )}>
                  <div className="w-12 h-12 rounded-full flex items-center justify-center text-xl"
                    style={{ background: morLeave ? "hsl(var(--clay-light))" : "hsl(var(--stone-lighter))" }}>👩</div>
                  <div className="flex-1">
                    <p className="text-[0.95rem] font-semibold">{role === "mor" ? "Dig" : partnerName || "Mor"}</p>
                    <p className="text-[0.62rem] tracking-[0.12em] uppercase text-muted-foreground">{morLeave ? "På barsel" : "Ikke på barsel"}</p>
                  </div>
                  <div className={cn("w-5 h-5 rounded-md flex items-center justify-center", morLeave ? "bg-[hsl(var(--clay))]" : "border-[1.5px] border-[hsl(var(--stone-light))]")}>
                    {morLeave && <span className="text-white text-[0.7rem]">✓</span>}
                  </div>
                </button>
                <button onClick={() => setFarLeave(!farLeave)}
                  className={cn(
                    "w-full flex items-center gap-3.5 rounded-2xl border-[1.5px] text-left px-4 py-3.5 transition-all active:scale-[0.98]",
                    farLeave ? "border-[hsl(var(--sage))] bg-[hsl(var(--sage))]/5" : "border-[hsl(var(--stone-light))] bg-background"
                  )}>
                  <div className="w-12 h-12 rounded-full flex items-center justify-center text-xl"
                    style={{ background: farLeave ? "hsl(var(--sage-light))" : "hsl(var(--stone-lighter))" }}>👨</div>
                  <div className="flex-1">
                    <p className="text-[0.95rem] font-semibold">{role === "far" ? "Dig" : partnerName || "Far"}</p>
                    <p className="text-[0.62rem] tracking-[0.12em] uppercase text-muted-foreground">{farLeave ? "På barsel" : "Ikke på barsel"}</p>
                  </div>
                  <div className={cn("w-5 h-5 rounded-md flex items-center justify-center", farLeave ? "bg-[hsl(var(--sage))]" : "border-[1.5px] border-[hsl(var(--stone-light))]")}>
                    {farLeave && <span className="text-white text-[0.7rem]">✓</span>}
                  </div>
                </button>
              </div>
            </div>
          )}

        </div>
      </div>

      {/* Bottom navigation */}
      <div className="px-6 pb-8 pt-4 flex flex-col gap-3 max-w-sm mx-auto w-full">
        <div className="flex items-center gap-3">
          {stepIndex > 0 && (
            <button onClick={goBack}
              className="w-12 h-12 rounded-xl border border-[hsl(var(--stone-light))] flex items-center justify-center transition-all active:scale-95 hover:bg-[hsl(var(--cream))]">
              <ArrowLeft className="w-5 h-5 text-muted-foreground" />
            </button>
          )}
          <button
            onClick={handleNext}
            disabled={!canNext() || saving}
            className={cn(
              "flex-1 h-12 rounded-full font-semibold text-[0.74rem] tracking-[0.16em] uppercase flex items-center justify-center gap-2 transition-all active:scale-[0.98]",
              canNext() && !saving
                ? "bg-[hsl(var(--moss))] text-white hover:bg-[hsl(var(--sage-dark))]"
                : "bg-muted text-muted-foreground cursor-not-allowed"
            )}
          >
            {saving ? "Opretter konto..." : step === "account" ? "Opret konto" : "Næste"}
            {!saving && <ArrowRight className="w-4 h-4" />}
          </button>
        </div>

        {saveError && (
          <div className="rounded-xl px-4 py-3 text-[0.78rem] text-center" style={{ background: "hsl(0 70% 95%)", color: "hsl(0 60% 40%)" }}>
            {saveError}
          </div>
        )}

        {/* Skip button for sensitive steps */}
        {skippable.includes(step) && step !== "leave" && step !== "account" && (
          <button onClick={goNext}
            className="text-center text-[0.72rem] text-muted-foreground hover:text-foreground transition-colors py-1">
            Spring over
          </button>
        )}
      </div>
    </div>
  );
}

// ── Helper components ──
function StepHeader({ title, sub, skippable }: { title: string; sub: string; skippable?: boolean }) {
  return (
    <div className="text-center">
      {skippable && (
        <p className="text-[0.58rem] tracking-[0.18em] uppercase mb-4" style={{ color: "hsl(var(--sage))" }}>Valgfrit</p>
      )}
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
        selected
          ? "border-[hsl(var(--moss))] bg-[hsl(var(--moss))]/5"
          : "border-[hsl(var(--stone-light))] hover:border-[hsl(var(--sage))] bg-background"
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

function InputField({ label, value, onChange, placeholder }: {
  label: string; value: string; onChange: (v: string) => void; placeholder: string;
}) {
  return (
    <div>
      <label className="text-[0.62rem] tracking-[0.16em] uppercase text-muted-foreground mb-1.5 block">{label}</label>
      <input
        type="text" value={value} onChange={e => onChange(e.target.value)}
        placeholder={placeholder} maxLength={50}
        className="w-full rounded-xl border-[1.5px] border-[hsl(var(--stone-light))] bg-background px-4 py-3 text-[0.9rem] font-normal focus:outline-none focus:border-[hsl(var(--sage))] transition-colors"
      />
    </div>
  );
}
