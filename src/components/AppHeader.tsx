import lilleLogoImg from "@/assets/lille-logo.png";

interface AppHeaderProps {
  onBurgerClick: () => void;
}

export function AppHeader({ onBurgerClick }: AppHeaderProps) {
  return (
    <header className="fixed top-0 left-0 right-0 h-16 z-50 flex items-center justify-center px-4"
      style={{
        background: "hsl(37 30% 91%)",
        borderBottom: "1px solid hsl(34 16% 82% / 0.5)",
        boxShadow: "0 2px 20px hsl(30 20% 20% / 0.07)",
      }}
    >
      {/* Center: Logo */}
      <div className="flex flex-col items-center gap-0.5 select-none pointer-events-none">
        <div className="flex items-center gap-2">
          <img src={lilleLogoImg} alt="" className="w-6 h-6 object-contain" />
          <span
            className="font-sans font-extrabold text-xl tracking-[0.35em] uppercase leading-none"
            style={{ color: "#3a5235" }}
          >
            LILLE
          </span>
        </div>
        <span
          className="font-sans text-[0.47rem] tracking-[0.3em] uppercase font-light leading-none"
          style={{ color: "#9a9080" }}
        >
          for nye forældre
        </span>
      </div>

      {/* Burger — mobile only */}
      <button
        onClick={onBurgerClick}
        className="absolute right-4 top-1/2 -translate-y-1/2 w-11 h-11 rounded-xl flex flex-col items-center justify-center gap-[5.5px] md:hidden active:bg-foreground/5 transition-colors"
        aria-label="Menu"
      >
        <span className="block w-5 h-[1.5px] rounded-sm" style={{ background: "#5a4e3c" }} />
        <span className="block w-[13px] h-[1.5px] rounded-sm ml-auto" style={{ background: "#5a4e3c" }} />
        <span className="block w-5 h-[1.5px] rounded-sm" style={{ background: "#5a4e3c" }} />
      </button>
    </header>
  );
}
