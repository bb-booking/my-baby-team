import { useFamily } from "@/context/FamilyContext";
import { useNavigate } from "react-router-dom";
import { Settings, User, Bell, HelpCircle, RotateCcw } from "lucide-react";

export default function MerePage() {
  const { profile, resetProfile } = useFamily();
  const navigate = useNavigate();

  const handleReset = () => {
    resetProfile();
    navigate("/onboarding");
  };

  const menuItems = [
    { icon: User, label: "Profil", desc: `${profile.parentName} — ${profile.role === "mor" ? "Mor" : "Far/Partner"}` },
    { icon: Bell, label: "Notifikationer", desc: "Rolige påmindelser" },
    { icon: Settings, label: "Indstillinger", desc: "Sprog, tema, data" },
    { icon: HelpCircle, label: "Hjælp", desc: "FAQ og support" },
  ];

  return (
    <div className="space-y-5">
      <div className="section-fade-in">
        <h1 className="text-[1.9rem] font-normal">Mere</h1>
      </div>

      <div className="space-y-2">
        {menuItems.map((item, i) => (
          <button
            key={item.label}
            className="card-soft w-full flex items-center gap-4 text-left transition-all active:scale-[0.98] section-fade-in"
            style={{ animationDelay: `${i * 80}ms` }}
          >
            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: "hsl(var(--sand-light))" }}>
              <item.icon className="w-5 h-5 text-foreground/60" />
            </div>
            <div>
              <p className="text-[0.85rem] font-normal">{item.label}</p>
              <p className="text-[0.68rem] text-muted-foreground">{item.desc}</p>
            </div>
          </button>
        ))}

        <button
          onClick={handleReset}
          className="card-soft w-full flex items-center gap-4 text-left transition-all active:scale-[0.98] section-fade-in"
          style={{ animationDelay: "320ms" }}
        >
          <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-destructive/10">
            <RotateCcw className="w-5 h-5 text-destructive" />
          </div>
          <div>
            <p className="text-[0.85rem] font-normal">Start forfra</p>
            <p className="text-[0.68rem] text-muted-foreground">Nulstil profil og vælg igen</p>
          </div>
        </button>
      </div>

      <div className="card-soft text-center section-fade-in" style={{ animationDelay: "400ms" }}>
        <p className="text-[0.68rem] text-muted-foreground">Lille v1.0 — lavet med kærlighed 🌿</p>
      </div>

      <div className="h-20 md:h-0" />
    </div>
  );
}
