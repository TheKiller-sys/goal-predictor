import { motion } from "framer-motion";
import { generatePoissonMatrix } from "@/lib/mockData";
import type { Match } from "@/lib/mockData";

interface PoissonMatrixProps {
  match: Match;
}

const PoissonMatrix = ({ match }: PoissonMatrixProps) => {
  const matrix = generatePoissonMatrix(match.homeLambda, match.awayLambda);

  const getHeatColor = (prob: number) => {
    if (prob > 0.10) return "bg-primary/80 text-primary-foreground";
    if (prob > 0.07) return "bg-primary/50 text-foreground";
    if (prob > 0.04) return "bg-primary/25 text-foreground";
    if (prob > 0.02) return "bg-primary/10 text-foreground";
    return "bg-secondary text-muted-foreground";
  };

  // Calculate market probabilities from matrix
  const over25 = matrix.reduce((sum, row, i) =>
    sum + row.reduce((s, val, j) => (i + j > 2 ? s + val : s), 0), 0);
  const btts = matrix.reduce((sum, row, i) =>
    sum + (i > 0 ? row.reduce((s, val, j) => (j > 0 ? s + val : s), 0) : 0), 0);

  return (
    <div className="card-shine rounded-lg border border-border p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-foreground">Matriz de Poisson</h3>
        <span className="font-mono text-[10px] text-muted-foreground">
          {match.homeTeam} vs {match.awayTeam}
        </span>
      </div>

      {/* Matrix Grid */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr>
              <th className="p-1 text-[10px] text-muted-foreground font-mono">{match.homeTeam.split(" ").pop()} ↓ / {match.awayTeam.split(" ").pop()} →</th>
              {[0, 1, 2, 3, 4, 5].map(j => (
                <th key={j} className="p-1 text-center text-[10px] font-mono text-muted-foreground font-bold">{j}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {matrix.map((row, i) => (
              <tr key={i}>
                <td className="p-1 text-[10px] font-mono text-muted-foreground font-bold text-center">{i}</td>
                {row.map((prob, j) => (
                  <motion.td
                    key={j}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: (i * 6 + j) * 0.02 }}
                    className={`p-1 text-center rounded ${getHeatColor(prob)}`}
                  >
                    <span className="font-mono text-[10px] font-medium">
                      {(prob * 100).toFixed(1)}
                    </span>
                  </motion.td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Derived Markets */}
      <div className="mt-4 pt-3 border-t border-border grid grid-cols-3 gap-3">
        <div className="text-center">
          <div className="text-[10px] text-muted-foreground uppercase tracking-wider">Over 2.5</div>
          <div className="font-mono text-sm font-bold text-foreground">{(over25 * 100).toFixed(1)}%</div>
        </div>
        <div className="text-center">
          <div className="text-[10px] text-muted-foreground uppercase tracking-wider">BTTS</div>
          <div className="font-mono text-sm font-bold text-foreground">{(btts * 100).toFixed(1)}%</div>
        </div>
        <div className="text-center">
          <div className="text-[10px] text-muted-foreground uppercase tracking-wider">Under 2.5</div>
          <div className="font-mono text-sm font-bold text-foreground">{((1 - over25) * 100).toFixed(1)}%</div>
        </div>
      </div>
    </div>
  );
};

export default PoissonMatrix;
