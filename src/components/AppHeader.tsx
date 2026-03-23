import { Link } from "react-router-dom";
import { ProfileSwitcher } from "./ProfileSwitcher";

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

      {/* Center: Logo as home link */}
      <Link to="/" className="flex items-center gap-2.5 select-none group absolute left-1/2 -translate-x-1/2" aria-label="Gå til forsiden">
        <div
          className="w-8 h-8 rounded-full flex items-center justify-center transition-transform duration-300 group-hover:scale-105 group-active:scale-95"
          style={{ background: "#3a5235" }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="12" cy="6.5" r="4" fill="hsl(37 30% 91%)" />
            <circle cx="12" cy="13.5" r="3" fill="hsl(37 30% 91%)" />
            <circle cx="12" cy="19" r="2" fill="hsl(37 30% 91%)" />
          </svg>
        </div>
        <div className="flex flex-col">
          <span
            className="font-sans font-extrabold text-[1.15rem] tracking-[0.32em] uppercase leading-none"
            style={{ color: "#3a5235" }}
          >
            LILLE
          </span>
          <span
            className="font-sans text-[0.42rem] tracking-[0.22em] uppercase font-medium leading-none mt-[3px]"
            style={{ color: "#9a9080" }}
          >
            Forældreskab i balance
          </span>
        </div>
      </Link>

      {/* Burger — mobile only */}
      <button
        onClick={onBurgerClick}
        className="w-11 h-11 rounded-xl flex flex-col items-center justify-center gap-[5px] md:hidden active:bg-foreground/5 transition-colors flex-shrink-0"
        aria-label="Menu"
      >
        <span className="block w-5 h-[1.5px] rounded-sm" style={{ background: "#5a4e3c" }} />
        <span className="block w-5 h-[1.5px] rounded-sm" style={{ background: "#5a4e3c" }} />
        <span className="block w-5 h-[1.5px] rounded-sm" style={{ background: "#5a4e3c" }} />
      </button>
    </header>
  );
}
