import { motion } from "framer-motion";
import { AlertTriangle, ArrowDown, CheckCircle2 } from "lucide-react";
import type { ValueBet } from "@/lib/mockData";

interface ValueBetsTableProps {
  bets: ValueBet[];
}

const ValueBetsTable = ({ bets }: ValueBetsTableProps) => {
  const confidenceStyles = {
    high: "text-primary border-primary/30 bg-primary/10",
    medium: "text-accent border-accent/30 bg-accent/10",
    low: "text-muted-foreground border-border bg-secondary",
  };

  return (
    <div className="card-shine rounded-lg border border-border p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-foreground">🎯 Apuestas de Valor Detectadas</h3>
        <span className="font-mono text-[10px] text-primary">{bets.length} señales activas</span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-border">
              {["Partido", "Mercado", "Prob IA", "Cuota", "Valor", "Kelly ¼", "Estado"].map(h => (
                <th key={h} className="pb-2 text-[10px] uppercase tracking-wider text-muted-foreground font-medium px-2">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {bets.map((bet, idx) => (
              <motion.tr
                key={bet.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.05 }}
                className="border-b border-border/50 hover:bg-secondary/30 transition-colors"
              >
                <td className="py-2.5 px-2">
                  <div className="text-xs font-medium text-foreground">{bet.match}</div>
                  <div className="text-[10px] text-muted-foreground">{bet.selection}</div>
                </td>
                <td className="py-2.5 px-2 text-xs text-secondary-foreground">{bet.market}</td>
                <td className="py-2.5 px-2 font-mono text-xs text-foreground">{(bet.modelProb * 100).toFixed(1)}%</td>
                <td className="py-2.5 px-2 font-mono text-xs text-accent font-bold">{bet.bookOdds.toFixed(2)}</td>
                <td className="py-2.5 px-2">
                  <span className="font-mono text-xs font-bold text-primary">+{(bet.value * 100).toFixed(1)}%</span>
                </td>
                <td className="py-2.5 px-2 font-mono text-xs text-foreground">{(bet.kellyStake * 100).toFixed(1)}%</td>
                <td className="py-2.5 px-2">
                  <div className="flex items-center gap-1.5">
                    <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium border ${confidenceStyles[bet.confidence]}`}>
                      {bet.confidence === "high" ? <CheckCircle2 className="h-2.5 w-2.5" /> : null}
                      {bet.confidence.toUpperCase()}
                    </span>
                    {bet.droppingOdds && (
                      <span className="flex items-center gap-0.5 text-destructive text-[10px]">
                        <ArrowDown className="h-2.5 w-2.5" />
                        <AlertTriangle className="h-2.5 w-2.5" />
                      </span>
                    )}
                  </div>
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ValueBetsTable;
