import { Settings, User, Bell, HelpCircle } from "lucide-react";

const menuItems = [
  { icon: User, label: "Profil", desc: "Navne, roller, termin" },
  { icon: Bell, label: "Notifikationer", desc: "Rolige påmindelser" },
  { icon: Settings, label: "Indstillinger", desc: "Sprog, tema, data" },
  { icon: HelpCircle, label: "Hjælp", desc: "FAQ og support" },
];

export default function MerePage() {
  return (
    <div className="space-y-5">
      <div className="section-fade-in">
        <h1 className="text-2xl">Mere</h1>
      </div>

      <div className="space-y-2">
        {menuItems.map((item, i) => (
          <button
            key={item.label}
            className="card-soft w-full flex items-center gap-4 text-left transition-all active:scale-[0.98] section-fade-in"
            style={{ animationDelay: `${i * 80}ms` }}
          >
            <div className="w-10 h-10 rounded-xl bg-sand-light flex items-center justify-center">
              <item.icon className="w-5 h-5 text-foreground/60" />
            </div>
            <div>
              <p className="text-sm font-medium">{item.label}</p>
              <p className="text-xs text-muted-foreground">{item.desc}</p>
            </div>
          </button>
        ))}
      </div>

      <div className="card-soft text-center section-fade-in" style={{ animationDelay: "400ms" }}>
        <p className="text-xs text-muted-foreground">Lille v1.0 — lavet med kærlighed 💚</p>
      </div>

      <div className="h-20 md:h-0" />
    </div>
  );
}
