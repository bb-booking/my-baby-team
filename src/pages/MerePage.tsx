import { useState } from "react";
import { useFamily, type BirthType, type FeedingMethod } from "@/context/FamilyContext";
import { useAuth } from "@/context/AuthContext";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Settings, User, Bell, HelpCircle, RotateCcw, Baby, Plus, Trash2, Users, Heart, BookOpen, Moon, CalendarDays, ClipboardList, Lightbulb, Gamepad2, CreditCard, Star } from "lucide-react";
import { cn } from "@/lib/utils";

export default function MerePage() {
  const { profile, setProfile, resetProfile, addChild, removeChild } = useFamily();
  const { signOut } = useAuth();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [showAddChild, setShowAddChild] = useState(false);
  const [newChildName, setNewChildName] = useState("");
  const [newChildDate, setNewChildDate] = useState("");
  const [showMorHealth, setShowMorHealth] = useState(false);

  const handleReset = () => { resetProfile(); navigate("/onboarding"); };
  const handleSignOut = async () => { await signOut(); };

  const handleAddChild = () => {
    if (newChildName.trim()) {
      addChild(newChildName.trim(), newChildDate || new Date().toISOString());
      setNewChildName(""); setNewChildDate(""); setShowAddChild(false);
    }
  };

  const sections = [
    {
      title: t("settings.yourPages"),
      items: [
        { icon: BookOpen,     label: t("nav.diary"),          desc: t("sidebar.diaryDesc"),        path: "/dagbog" },
        { icon: Moon,         label: t("sidebar.sleep"),       desc: t("sidebar.sleepDesc"),        path: "/sovn" },
        { icon: Baby,         label: t("nav.child"),           desc: t("sidebar.childDesc"),        path: "/barn" },
        { icon: Users,        label: t("nav.together"),        desc: t("sidebar.togetherDesc"),     path: "/sammen" },
        { icon: CalendarDays, label: t("sidebar.calendar"),    desc: t("sidebar.calendarDesc"),     path: "/kalender" },
        { icon: ClipboardList,label: t("sidebar.checklist"),   desc: t("sidebar.checklistDesc"),    path: "/tjekliste" },
      ],
    },
    {
      title: t("settings.discoverMore"),
      items: [
        { icon: Lightbulb,    label: t("sidebar.advice"),      desc: t("sidebar.adviceDesc"),       path: "/raad" },
        { icon: Gamepad2,     label: t("sidebar.play"),        desc: t("sidebar.playDesc"),         path: "/leg" },
        { icon: Star,         label: t("babyNames.addName"),   desc: t("sidebar.babyNamesDesc"),    path: "/babynavne" },
      ],
    },
    {
      title: t("settings.account"),
      items: [
        { icon: CreditCard,   label: t("sidebar.subscription"),desc: t("sidebar.subscriptionDesc"), path: "/shop" },
        { icon: Settings,     label: t("settings.settingsMenu"),desc: t("settings.languageThemeData"), path: "/indstillinger" },
        { icon: Bell,         label: t("settings.notifications"),desc: t("settings.quietReminders"), path: "" },
        { icon: HelpCircle,   label: t("settings.help"),       desc: t("settings.faqSupport"),      path: "" },
      ],
    },
  ];

  return (
    <div className="space-y-5">
      <div className="section-fade-in">
        <h1 className="text-[1.9rem] font-normal">{t("settings.title")}</h1>
      </div>

      {/* Family */}
      <div className="card-soft section-fade-in" style={{ animationDelay: "40ms" }}>
        <div className="flex items-center gap-2 mb-3">
          <Users className="w-4 h-4" style={{ color: "hsl(var(--moss))" }} />
          <p className="text-[1rem] font-semibold">{t("settings.family")}</p>
        </div>
        <div className="space-y-2 mb-3">
          <div className="flex items-center gap-3 px-3 py-2 rounded-xl" style={{ background: profile.role === "mor" ? "hsl(var(--clay-light) / 0.4)" : "hsl(var(--sage-light) / 0.4)" }}>
            <span className="text-lg">{profile.role === "mor" ? "👩" : "👨"}</span>
            <div>
              <p className="text-[0.85rem] font-medium">{profile.parentName}</p>
              <p className="text-[0.6rem] tracking-[0.12em] uppercase text-muted-foreground">{profile.role === "mor" ? t("settings.mom") : t("settings.dad")} · {t("settings.you")}</p>
            </div>
          </div>
          <div className="flex items-center gap-3 px-3 py-2 rounded-xl" style={{ background: profile.role === "far" ? "hsl(var(--clay-light) / 0.4)" : "hsl(var(--sage-light) / 0.4)" }}>
            <span className="text-lg">{profile.role === "far" ? "👩" : "👨"}</span>
            <div>
              <p className="text-[0.85rem] font-medium">{profile.partnerName}</p>
              <p className="text-[0.6rem] tracking-[0.12em] uppercase text-muted-foreground">{profile.role === "far" ? t("settings.mom") : t("settings.dad")} · {t("settings.partner")}</p>
            </div>
          </div>
        </div>

        {/* Children */}
        <div className="border-t border-[hsl(var(--stone-lighter))] pt-3">
          <p className="text-[0.6rem] tracking-[0.16em] uppercase text-muted-foreground mb-2">{t("settings.children")}</p>
          {profile.children.length > 0 ? (
            <div className="space-y-2">
              {profile.children.map((child) => (
                <div key={child.id} className="flex items-center gap-3 px-3 py-2 rounded-xl bg-[hsl(var(--cream))]">
                  <Baby className="w-4 h-4" style={{ color: "hsl(var(--moss))" }} />
                  <div className="flex-1">
                    <p className="text-[0.85rem] font-medium">{child.name}</p>
                    <p className="text-[0.6rem] text-muted-foreground">{t("settings.born", { date: new Date(child.birthDate).toLocaleDateString(t === t ? "da-DK" : "en-GB") })}</p>
                  </div>
                  <button onClick={() => removeChild(child.id)} className="p-1 rounded hover:bg-destructive/10 transition-colors">
                    <Trash2 className="w-3.5 h-3.5 text-muted-foreground hover:text-destructive" />
                  </button>
                </div>
              ))}
            </div>
          ) : <p className="text-[0.78rem] text-muted-foreground">{t("settings.noChildren")}</p>}

          {showAddChild ? (
            <div className="mt-3 space-y-2 p-3 rounded-xl border border-[hsl(var(--sage))] bg-[hsl(var(--sage-light))]/30">
              <input type="text" value={newChildName} onChange={(e) => setNewChildName(e.target.value)} placeholder={t("settings.childName")} maxLength={50}
                className="w-full rounded-lg border border-[hsl(var(--stone-light))] bg-background px-3 py-2 text-[0.85rem] focus:outline-none focus:border-[hsl(var(--sage))]" />
              <input type="date" value={newChildDate} onChange={(e) => setNewChildDate(e.target.value)}
                className="w-full rounded-lg border border-[hsl(var(--stone-light))] bg-background px-3 py-2 text-[0.85rem] focus:outline-none focus:border-[hsl(var(--sage))]" />
              <div className="flex gap-2">
                <button onClick={() => setShowAddChild(false)} className="flex-1 py-2 rounded-lg text-[0.75rem] text-muted-foreground hover:bg-[hsl(var(--stone-lighter))]">{t("settings.cancelBtn")}</button>
                <button onClick={handleAddChild} disabled={!newChildName.trim()} className="flex-1 py-2 rounded-lg text-[0.75rem] font-medium bg-[hsl(var(--moss))] text-white active:scale-95 disabled:opacity-50">{t("settings.addBtn")}</button>
              </div>
            </div>
          ) : (
            <button onClick={() => setShowAddChild(true)} className="mt-2 flex items-center gap-1.5 text-[0.72rem] tracking-[0.08em] uppercase active:scale-95" style={{ color: "hsl(var(--moss))" }}>
              <Plus className="w-3.5 h-3.5" /> {t("settings.addChild")}
            </button>
          )}
        </div>
      </div>

      {/* Parental leave */}
      {profile.phase !== "pregnant" && (
        <div className="card-soft section-fade-in" style={{ animationDelay: "60ms" }}>
          <div className="flex items-center gap-2 mb-3">
            <Users className="w-4 h-4" style={{ color: "hsl(var(--moss))" }} />
            <p className="text-[1rem] font-semibold">{t("settings.parentalLeave")}</p>
          </div>
          <div className="space-y-2">
            {[
              { role: "mor" as const, name: profile.role === "mor" ? profile.parentName : profile.partnerName, emoji: "👩" },
              { role: "far" as const, name: profile.role === "far" ? profile.parentName : profile.partnerName, emoji: "👨" },
            ].map(p => {
              const isOn = profile.parentalLeave?.[p.role] ?? (p.role === "mor");
              return (
                <button key={p.role} onClick={() => {
                  setProfile({
                    ...profile,
                    parentalLeave: { ...profile.parentalLeave || { mor: true, far: false }, [p.role]: !isOn },
                  });
                }} className={cn("w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all active:scale-[0.98]",
                  isOn ? "bg-[hsl(var(--sage-light))]" : "bg-[hsl(var(--stone-lighter))]")}>
                  <span className="text-lg">{p.emoji}</span>
                  <span className="text-[0.85rem] flex-1 text-left">{p.name}</span>
                  <span className={cn("text-[0.68rem] px-2.5 py-1 rounded-full",
                    isOn ? "bg-[hsl(var(--moss))] text-white" : "text-muted-foreground")}>
                    {isOn ? t("settings.onLeave") : t("settings.notOnLeave")}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Mor Health section */}
      {profile.phase !== "pregnant" && (
        <div className="card-soft section-fade-in" style={{ animationDelay: "80ms" }}>
          <button onClick={() => setShowMorHealth(!showMorHealth)} className="flex items-center gap-2 w-full text-left">
            <Heart className="w-4 h-4" style={{ color: "hsl(var(--clay))" }} />
            <p className="text-[1rem] font-semibold flex-1">{t("settings.momRecovery")}</p>
            <span className="text-muted-foreground text-sm">{showMorHealth ? "▲" : "▼"}</span>
          </button>
          {showMorHealth && <MorHealthEditor onSave={() => setShowMorHealth(false)} />}
        </div>
      )}

      {sections.map((section, si) => (
        <div key={section.title} className="space-y-1 section-fade-in" style={{ animationDelay: `${(si + 2) * 60}ms` }}>
          <p className="text-[0.58rem] tracking-[0.18em] uppercase text-muted-foreground px-1 mb-2">{section.title}</p>
          {section.items.map((item) => (
            <button key={item.label} onClick={() => item.path && navigate(item.path)}
              className="card-soft w-full flex items-center gap-4 text-left transition-all active:scale-[0.98]">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: "hsl(var(--sand-light))" }}>
                <item.icon className="w-5 h-5" style={{ color: "hsl(var(--moss))" }} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[0.85rem] font-normal">{item.label}</p>
                <p className="text-[0.68rem] text-muted-foreground">{item.desc}</p>
              </div>
              {item.path && <span className="text-muted-foreground/40 text-sm">›</span>}
            </button>
          ))}
        </div>
      ))}

      <div className="section-fade-in" style={{ animationDelay: "300ms" }}>
        <button onClick={handleReset} className="card-soft w-full flex items-center gap-4 text-left transition-all active:scale-[0.98]">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-destructive/10 flex-shrink-0"><RotateCcw className="w-5 h-5 text-destructive" /></div>
          <div><p className="text-[0.85rem] font-normal">{t("settings.reset")}</p><p className="text-[0.68rem] text-muted-foreground">{t("settings.resetDesc")}</p></div>
        </button>
      </div>

      <div className="card-soft text-center section-fade-in" style={{ animationDelay: "560ms" }}>
        <p className="text-[0.68rem] text-muted-foreground">{t("settings.footer")}</p>
      </div>

    </div>
  );
}

function MorHealthEditor({ onSave }: { onSave?: () => void }) {
  const { profile, setProfile } = useFamily();
  const { t } = useTranslation();
  const mh = profile.morHealth || {};

  const update = (patch: Partial<typeof mh>) => {
    setProfile({ ...profile, morHealth: { ...mh, ...patch } });
  };

  const complications = [
    { id: "rift", label: t("settings.complication_tear") },
    { id: "blødning", label: t("settings.complication_bleeding") },
    { id: "infektion", label: t("settings.complication_infection") },
    { id: "præeklampsi", label: t("settings.complication_preeclampsia") },
    { id: "ammeproblemer", label: t("settings.complication_breastfeeding") },
    { id: "fødselsdepression", label: t("settings.complication_depression") },
  ];

  const toggleComp = (id: string) => {
    const current = mh.complications || [];
    update({ complications: current.includes(id) ? current.filter(c => c !== id) : [...current, id] });
  };

  return (
    <div className="mt-4 space-y-4">
      <div>
        <p className="text-[0.62rem] tracking-[0.16em] uppercase text-muted-foreground mb-2">{t("settings.birthType")}</p>
        <div className="flex gap-2">
          {(["vaginal", "kejsersnit"] as BirthType[]).map(bt => (
            <button key={bt} onClick={() => update({ birthType: bt })}
              className={cn("flex-1 py-2 rounded-xl text-[0.78rem] border transition-all active:scale-[0.97]",
                mh.birthType === bt ? "bg-[hsl(var(--sage-light))] border-[hsl(var(--sage))] font-medium" : "border-[hsl(var(--stone-light))] text-muted-foreground")}>
              {bt === "vaginal" ? t("settings.vaginal") : t("settings.cSection")}
            </button>
          ))}
        </div>
      </div>

      <div>
        <p className="text-[0.62rem] tracking-[0.16em] uppercase text-muted-foreground mb-2">{t("settings.nutrition")}</p>
        <div className="flex gap-2">
          {([{ k: "amning" as FeedingMethod, l: t("settings.breastfeeding") }, { k: "flaske" as FeedingMethod, l: t("settings.bottleFeeding") }, { k: "begge" as FeedingMethod, l: t("settings.both") }]).map(f => (
            <button key={f.k} onClick={() => update({ feedingMethod: f.k })}
              className={cn("flex-1 py-2 rounded-xl text-[0.72rem] border transition-all active:scale-[0.97]",
                mh.feedingMethod === f.k ? "bg-[hsl(var(--sage-light))] border-[hsl(var(--sage))] font-medium" : "border-[hsl(var(--stone-light))] text-muted-foreground")}>
              {f.l}
            </button>
          ))}
        </div>
      </div>

      <div>
        <p className="text-[0.62rem] tracking-[0.16em] uppercase text-muted-foreground mb-2">{t("settings.complications")}</p>
        <div className="flex flex-wrap gap-1.5">
          {complications.map(c => (
            <button key={c.id} onClick={() => toggleComp(c.id)}
              className={cn("px-3 py-1.5 rounded-full text-[0.7rem] border transition-all active:scale-[0.97]",
                (mh.complications || []).includes(c.id) ? "border-[hsl(var(--clay))] bg-[hsl(var(--clay))]/10 font-medium" : "border-[hsl(var(--stone-light))] text-muted-foreground")}>
              {c.label}
            </button>
          ))}
        </div>
      </div>

      <button
        onClick={onSave}
        className="w-full py-2.5 rounded-full text-[0.82rem] font-medium transition-all active:scale-[0.97]"
        style={{ background: "hsl(var(--moss))", color: "white" }}
      >
        {t("settings.saveChanges")}
      </button>
    </div>
  );
}
