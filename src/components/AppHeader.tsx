import { Link } from "react-router-dom";
import { MeloWordmark } from "@/components/MeloWordmark";

interface AppHeaderProps {
  onBurgerClick: () => void;
}

export function AppHeader({ onBurgerClick }: AppHeaderProps) {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background border-b border-border"
      style={{
        paddingTop: "env(safe-area-inset-top, 0px)",
        boxShadow: "0 2px 20px hsl(30 20% 20% / 0.07)",
      }}
    >
      {/* Inner row — content centered */}
      <div className="h-24 flex items-center justify-between px-4">
        {/* Spacer left */}
        <div className="w-11 flex-shrink-0 md:hidden" />

        {/* Center: Wordmark */}
        <Link to="/" className="absolute left-1/2 -translate-x-1/2 select-none group transition-opacity active:opacity-70" aria-label="Gå til forsiden">
          <MeloWordmark size="15rem" />
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
      </div>
    </header>
  );
}
