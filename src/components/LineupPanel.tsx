import { motion } from "framer-motion";
import { Star, Shield } from "lucide-react";
import type { Lineup } from "@/lib/mockLineups";

interface LineupPanelProps {
  team: string;
  lineup: Lineup;
  isHome: boolean;
}

const posOrder = ["GK", "RB", "CB", "LB", "RWB", "LWB", "CDM", "CM", "CAM", "RW", "LW", "SS", "ST"];

const LineupPanel = ({ team, lineup, isHome }: LineupPanelProps) => {
  const sorted = [...lineup.players].sort(
    (a, b) => posOrder.indexOf(a.position) - posOrder.indexOf(b.position)
  );
  const avgRating = (lineup.players.reduce((s, p) => s + p.rating, 0) / lineup.players.length).toFixed(1);
  const keyPlayers = lineup.players.filter((p) => p.isKey);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="card-shine rounded-lg border border-border p-4"
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Shield className={`h-4 w-4 ${isHome ? "text-primary" : "text-accent"}`} />
          <h3 className="text-sm font-semibold text-foreground">{team}</h3>
        </div>
        <div className="flex items-center gap-3">
          <span className="font-mono text-[10px] text-muted-foreground">{lineup.formation}</span>
          <span className="font-mono text-xs font-bold text-foreground">⌀ {avgRating}</span>
        </div>
      </div>

      {/* Player list */}
      <div className="space-y-1">
        {sorted.map((player, i) => (
          <div
            key={i}
            className={`flex items-center justify-between py-1.5 px-2 rounded text-xs ${
              player.isKey ? "bg-primary/5 border border-primary/10" : ""
            }`}
          >
            <div className="flex items-center gap-2">
              <span className="font-mono text-[10px] text-muted-foreground w-6 text-center">{player.number}</span>
              <span className="text-foreground font-medium">{player.name}</span>
              {player.isKey && <Star className="h-3 w-3 text-accent fill-accent" />}
            </div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-[10px] text-muted-foreground uppercase">{player.position}</span>
              <span className={`font-mono text-[10px] font-bold ${player.rating >= 8.5 ? "text-primary" : player.rating >= 8.0 ? "text-foreground" : "text-muted-foreground"}`}>
                {player.rating}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Key players impact */}
      <div className="mt-3 pt-3 border-t border-border">
        <div className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">
          Jugadores Clave ({keyPlayers.length})
        </div>
        <div className="flex flex-wrap gap-1">
          {keyPlayers.map((p, i) => (
            <span key={i} className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-accent/10 border border-accent/20 text-[10px] font-mono text-accent">
              {p.name} <span className="text-accent/60">{p.rating}</span>
            </span>
          ))}
        </div>
      </div>
    </motion.div>
  );
};

export default LineupPanel;
