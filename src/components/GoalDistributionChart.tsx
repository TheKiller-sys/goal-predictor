import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";

interface GoalDistributionChartProps {
  homeGoalDist: number[];
  awayGoalDist: number[];
  homeTeam: string;
  awayTeam: string;
}

const GoalDistributionChart = ({ homeGoalDist, awayGoalDist, homeTeam, awayTeam }: GoalDistributionChartProps) => {
  const data = homeGoalDist.slice(0, 6).map((_, i) => ({
    goals: `${i}`,
    [homeTeam]: homeGoalDist[i],
    [awayTeam]: awayGoalDist[i],
  }));

  return (
    <div className="card-shine rounded-lg border border-border p-4">
      <h3 className="text-sm font-semibold text-foreground mb-4">📊 Distribución de Goles (Monte Carlo)</h3>
      <ResponsiveContainer width="100%" height={220}>
        <BarChart data={data} barGap={2}>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 14%, 18%)" />
          <XAxis dataKey="goals" tick={{ fontSize: 10, fill: "hsl(220, 10%, 50%)" }} axisLine={false} tickLine={false} label={{ value: "Goles", position: "insideBottom", offset: -2, fontSize: 10, fill: "hsl(220, 10%, 50%)" }} />
          <YAxis tick={{ fontSize: 10, fill: "hsl(220, 10%, 50%)" }} axisLine={false} tickLine={false} tickFormatter={(v) => `${v.toFixed(0)}%`} />
          <Tooltip
            contentStyle={{
              background: "hsl(220, 18%, 10%)",
              border: "1px solid hsl(220, 14%, 18%)",
              borderRadius: "6px",
              fontSize: "11px",
              fontFamily: "JetBrains Mono",
            }}
            formatter={(value: number) => [`${value.toFixed(1)}%`]}
          />
          <Legend wrapperStyle={{ fontSize: 10 }} />
          <Bar dataKey={homeTeam} fill="hsl(152, 68%, 45%)" radius={[3, 3, 0, 0]} />
          <Bar dataKey={awayTeam} fill="hsl(38, 92%, 55%)" radius={[3, 3, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default GoalDistributionChart;
