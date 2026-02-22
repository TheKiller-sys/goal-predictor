import { motion } from "framer-motion";
import { Zap, Clock } from "lucide-react";
import type { Match } from "@/lib/mockData";

interface MatchCardProps {
  match: Match;
  onSelect: (match: Match) => void;
  isSelected: boolean;
}

const MatchCard = ({ match, onSelect, isSelected }: MatchCardProps) => {
  const probBars = [
    { label: "1", prob: match.homeWinProb, odds: match.homeOdds },
    { label: "X", prob: match.drawProb, odds: match.drawOdds },
    { label: "2", prob: match.awayWinProb, odds: match.awayOdds },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.01 }}
      onClick={() => onSelect(match)}
      className={`card-shine rounded-lg border p-4 cursor-pointer transition-all ${
        isSelected ? "border-primary glow-primary" : "border-border hover:border-primary/40"
      }`}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <span className="text-[10px] uppercase tracking-widest text-muted-foreground font-medium">
          {match.league}
        </span>
        <div className="flex items-center gap-1.5">
          {match.status === "live" && (
            <span className="flex items-center gap-1 text-[10px] font-mono text-destructive">
              <span className="h-1.5 w-1.5 rounded-full bg-destructive animate-pulse-glow" />
              EN VIVO
            </span>
          )}
          <span className="flex items-center gap-1 text-[10px] text-muted-foreground font-mono">
            <Clock className="h-3 w-3" />
            {match.kickoff}
          </span>
        </div>
      </div>

      {/* Teams */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex-1">
          <div className="font-semibold text-sm text-foreground">{match.homeTeam}</div>
          <div className="font-mono text-[10px] text-muted-foreground">ELO {match.homeElo} · λ {match.homeLambda}</div>
        </div>
        <div className="px-3 text-muted-foreground text-xs font-bold">vs</div>
        <div className="flex-1 text-right">
          <div className="font-semibold text-sm text-foreground">{match.awayTeam}</div>
          <div className="font-mono text-[10px] text-muted-foreground">ELO {match.awayElo} · λ {match.awayLambda}</div>
        </div>
      </div>

      {/* Probability bars */}
      <div className="grid grid-cols-3 gap-2">
        {probBars.map((bar) => (
          <div key={bar.label} className="text-center">
            <div className="h-1.5 rounded-full bg-secondary overflow-hidden mb-1">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${bar.prob * 100}%` }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                className="h-full rounded-full bg-primary"
              />
            </div>
            <span className="font-mono text-[10px] text-muted-foreground">{bar.label}</span>
            <div className="font-mono text-xs font-bold text-foreground">{(bar.prob * 100).toFixed(0)}%</div>
            <div className="font-mono text-[10px] text-accent">{bar.odds.toFixed(2)}</div>
          </div>
        ))}
      </div>

      {/* Metrics */}
      <div className="mt-3 pt-3 border-t border-border grid grid-cols-2 gap-2">
        <div className="flex items-center gap-1.5">
          <Zap className="h-3 w-3 text-primary" />
          <span className="text-[10px] text-muted-foreground">xG</span>
          <span className="font-mono text-[10px] text-foreground">{match.homeXg} - {match.awayXg}</span>
        </div>
        <div className="flex items-center gap-1.5 justify-end">
          <span className="text-[10px] text-muted-foreground">PPDA</span>
          <span className="font-mono text-[10px] text-foreground">{match.homePpda} - {match.awayPpda}</span>
        </div>
      </div>
    </motion.div>
  );
};

export default MatchCard;
