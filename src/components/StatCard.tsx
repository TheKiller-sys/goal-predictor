import { TrendingUp, TrendingDown, Minus, Activity } from "lucide-react";

interface StatCardProps {
  label: string;
  value: string;
  change?: number;
  icon?: React.ReactNode;
  glowClass?: string;
}

const StatCard = ({ label, value, change, icon, glowClass = "glow-primary" }: StatCardProps) => {
  return (
    <div className={`card-shine rounded-lg border border-border p-4 ${glowClass} animate-slide-up`}>
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs uppercase tracking-wider text-muted-foreground font-medium">{label}</span>
        {icon || <Activity className="h-4 w-4 text-muted-foreground" />}
      </div>
      <div className="font-mono text-2xl font-bold text-foreground">{value}</div>
      {change !== undefined && (
        <div className="flex items-center gap-1 mt-1">
          {change > 0 ? (
            <TrendingUp className="h-3 w-3 text-primary" />
          ) : change < 0 ? (
            <TrendingDown className="h-3 w-3 text-destructive" />
          ) : (
            <Minus className="h-3 w-3 text-muted-foreground" />
          )}
          <span className={`font-mono text-xs ${change > 0 ? "text-primary" : change < 0 ? "text-destructive" : "text-muted-foreground"}`}>
            {change > 0 ? "+" : ""}{change}%
          </span>
        </div>
      )}
    </div>
  );
};

export default StatCard;
