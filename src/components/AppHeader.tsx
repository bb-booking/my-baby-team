import { Link } from "react-router-dom";
import { ProfileSwitcher } from "./ProfileSwitcher";
import meloIcon from "@/assets/melo-icon.png";

interface AppHeaderProps {
  onBurgerClick: () => void;
}

export function AppHeader({ onBurgerClick }: AppHeaderProps) {
  return (
    <header className="fixed top-0 left-0 right-0 h-16 z-50 flex items-center justify-between px-4"
      style={{
        background: "hsl(37 30% 91%)",
        borderBottom: "1px solid hsl(34 16% 82% / 0.5)",
        boxShadow: "0 2px 20px hsl(30 20% 20% / 0.07)",
      }}
    >
      {/* Profile switcher — left */}
      <div className="flex-shrink-0">
        <ProfileSwitcher />
      </div>

      {/* Center: Icon + MELO */}
      <Link to="/" className="flex items-center gap-2 select-none group absolute left-1/2 -translate-x-1/2" aria-label="Gå til forsiden">
        <img
          src={meloIcon}
          alt=""
          className="w-8 h-8 object-contain transition-transform duration-300 group-hover:scale-105 group-active:scale-95"
        />
        <span
          className="font-sans font-bold text-[1.05rem] tracking-[0.28em] uppercase leading-none"
          style={{ color: "hsl(var(--moss))" }}
        >
          MELO
        </span>
      </Link>

      {/* Burger — mobile only */}
      <button
        onClick={onBurgerClick}
        className="w-11 h-11 rounded-xl flex flex-col items-center justify-center gap-[5px] md:hidden active:bg-foreground/5 transition-colors flex-shrink-0"
        aria-label="Menu"
      >
        <span className="block w-5 h-[1.5px] rounded-sm bg-bark" />
        <span className="block w-5 h-[1.5px] rounded-sm bg-bark" />
        <span className="block w-5 h-[1.5px] rounded-sm bg-bark" />
      </button>
    </header>
  );
}
