import { motion } from "framer-motion";

interface ScoreHeatmapProps {
  scoreDist: Record<string, number>;
  homeTeam: string;
  awayTeam: string;
}

const ScoreHeatmap = ({ scoreDist, homeTeam, awayTeam }: ScoreHeatmapProps) => {
  const maxProb = Math.max(...Object.values(scoreDist));

  const getColor = (prob: number) => {
    const intensity = prob / maxProb;
    if (intensity > 0.8) return "bg-primary/80 text-primary-foreground";
    if (intensity > 0.5) return "bg-primary/50 text-foreground";
    if (intensity > 0.3) return "bg-primary/25 text-foreground";
    return "bg-secondary text-muted-foreground";
  };

  // Build 6x6 grid
  const rows = [];
  for (let h = 0; h <= 5; h++) {
    const cols = [];
    for (let a = 0; a <= 5; a++) {
      const key = `${h}-${a}`;
      const prob = scoreDist[key] || 0;
      cols.push({ key, prob, home: h, away: a });
    }
    rows.push(cols);
  }

  return (
    <div className="card-shine rounded-lg border border-border p-4">
      <h3 className="text-sm font-semibold text-foreground mb-4">🎯 Marcadores Más Probables (Monte Carlo)</h3>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr>
              <th className="p-1 text-[10px] text-muted-foreground font-mono">
                {homeTeam.split(" ").pop()} ↓ / {awayTeam.split(" ").pop()} →
              </th>
              {[0, 1, 2, 3, 4, 5].map((j) => (
                <th key={j} className="p-1 text-center text-[10px] font-mono text-muted-foreground font-bold">{j}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, i) => (
              <tr key={i}>
                <td className="p-1 text-[10px] font-mono text-muted-foreground font-bold text-center">{i}</td>
                {row.map((cell) => (
                  <motion.td
                    key={cell.key}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: (cell.home * 6 + cell.away) * 0.015 }}
                    className={`p-1.5 text-center rounded ${cell.prob > 0 ? getColor(cell.prob) : "bg-secondary/30 text-muted-foreground/50"}`}
                  >
                    <span className="font-mono text-[10px] font-medium">
                      {cell.prob > 0 ? `${cell.prob.toFixed(1)}%` : "–"}
                    </span>
                  </motion.td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ScoreHeatmap;
