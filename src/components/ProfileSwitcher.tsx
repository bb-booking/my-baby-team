import { useFamily, type ParentRole } from "@/context/FamilyContext";
import { useState } from "react";

export function ProfileSwitcher() {
  const { profile, setProfile, morName, farName } = useFamily();
  const [open, setOpen] = useState(false);

  const switchRole = (role: ParentRole) => {
    const newProfile = {
      ...profile,
      role,
      parentName: role === "mor" ? morName : farName,
      partnerName: role === "mor" ? farName : morName,
    };
    setProfile(newProfile);
    setOpen(false);
  };

  const currentEmoji = profile.role === "mor" ? "👩" : "👨";
  const otherRole: ParentRole = profile.role === "mor" ? "far" : "mor";
  const otherEmoji = otherRole === "mor" ? "👩" : "👨";
  const otherName = otherRole === "mor" ? morName : farName;

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl transition-all active:scale-95"
        style={{
          background: profile.role === "mor"
            ? "hsl(var(--clay) / 0.12)"
            : "hsl(var(--sage) / 0.12)",
          border: `1px solid ${profile.role === "mor" ? "hsl(var(--clay) / 0.2)" : "hsl(var(--sage) / 0.2)"}`,
        }}
      >
        <span className="text-sm">{currentEmoji}</span>
        <span className="text-[0.72rem] font-medium">{profile.parentName}</span>
        <svg className={`w-3 h-3 transition-transform ${open ? "rotate-180" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div
            className="absolute top-full right-0 mt-2 w-52 rounded-2xl p-2 z-50 shadow-lg"
            style={{
              background: "hsl(var(--warm-white))",
              border: "1px solid hsl(var(--stone-light))",
            }}
          >
            <p className="text-[0.52rem] tracking-[0.2em] uppercase text-muted-foreground px-3 pt-2 pb-1">
              SKIFT BRUGER
            </p>

            {/* Current user */}
            <div
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl mb-0.5"
              style={{
                background: profile.role === "mor"
                  ? "hsl(var(--clay) / 0.1)"
                  : "hsl(var(--sage) / 0.1)",
              }}
            >
              <span className="text-lg">{currentEmoji}</span>
              <div className="flex-1">
                <p className="text-[0.82rem] font-medium">{profile.parentName}</p>
                <p className="text-[0.58rem] text-muted-foreground uppercase tracking-wider">
                  {profile.role === "mor" ? "Mor" : "Far"} · aktiv
                </p>
              </div>
              <span className="w-2 h-2 rounded-full" style={{ background: "hsl(var(--sage))" }} />
            </div>

            {/* Other user */}
            <button
              onClick={() => switchRole(otherRole)}
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl w-full text-left transition-colors hover:bg-muted/50 active:scale-[0.98]"
            >
              <span className="text-lg">{otherEmoji}</span>
              <div className="flex-1">
                <p className="text-[0.82rem] font-medium">{otherName || (otherRole === "mor" ? "Mor" : "Far")}</p>
                <p className="text-[0.58rem] text-muted-foreground uppercase tracking-wider">
                  {otherRole === "mor" ? "Mor" : "Far"}
                </p>
              </div>
            </button>
          </div>
        </>
      )}
    </div>
  );
}
