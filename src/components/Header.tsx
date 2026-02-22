import { Activity, BarChart3, Target, Brain, Shield } from "lucide-react";

const Header = () => {
  return (
    <header className="border-b border-border bg-background/80 backdrop-blur-sm sticky top-0 z-50">
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-md bg-primary/20 flex items-center justify-center glow-primary">
              <Brain className="h-4 w-4 text-primary" />
            </div>
            <div>
              <h1 className="text-sm font-bold text-foreground tracking-tight">PREDICTIVO<span className="text-primary">FC</span></h1>
              <p className="text-[9px] uppercase tracking-[0.2em] text-muted-foreground">Motor de Análisis v2026</p>
            </div>
          </div>
        </div>

        <nav className="hidden md:flex items-center gap-1">
          {[
            { icon: Activity, label: "Dashboard", active: true },
            { icon: BarChart3, label: "Modelos" },
            { icon: Target, label: "Value Bets" },
            { icon: Shield, label: "Bankroll" },
          ].map(({ icon: Icon, label, active }) => (
            <button
              key={label}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                active
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:text-foreground hover:bg-secondary"
              }`}
            >
              <Icon className="h-3.5 w-3.5" />
              {label}
            </button>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-primary/10 border border-primary/20">
            <span className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse-glow" />
            <span className="font-mono text-[10px] text-primary font-medium">10,247 sims/min</span>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
