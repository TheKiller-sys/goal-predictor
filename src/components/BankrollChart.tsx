import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from "recharts";
import type { BankrollEntry } from "@/lib/mockData";

interface BankrollChartProps {
  data: BankrollEntry[];
}

const BankrollChart = ({ data }: BankrollChartProps) => {
  const currentBalance = data[data.length - 1]?.balance ?? 0;
  const initialBalance = data[0]?.balance ?? 0;
  const totalRoi = ((currentBalance - initialBalance) / initialBalance * 100).toFixed(1);
  const yield_ = (parseFloat(totalRoi) / 12).toFixed(1);

  return (
    <div className="card-shine rounded-lg border border-border p-4">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-sm font-semibold text-foreground">📈 Capital & Rendimiento</h3>
          <p className="text-[10px] text-muted-foreground mt-0.5">Criterio Kelly Fraccionado (¼)</p>
        </div>
        <div className="text-right">
          <div className="font-mono text-lg font-bold text-foreground">€{currentBalance.toLocaleString()}</div>
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs text-primary">ROI +{totalRoi}%</span>
            <span className="font-mono text-xs text-accent">Yield {yield_}%</span>
          </div>
        </div>
      </div>

      <ResponsiveContainer width="100%" height={200}>
        <AreaChart data={data} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
          <defs>
            <linearGradient id="colorBalance" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="hsl(152, 68%, 45%)" stopOpacity={0.3} />
              <stop offset="95%" stopColor="hsl(152, 68%, 45%)" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 14%, 18%)" />
          <XAxis dataKey="date" tick={{ fontSize: 10, fill: "hsl(220, 10%, 50%)" }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fontSize: 10, fill: "hsl(220, 10%, 50%)" }} axisLine={false} tickLine={false} />
          <Tooltip
            contentStyle={{
              background: "hsl(220, 18%, 10%)",
              border: "1px solid hsl(220, 14%, 18%)",
              borderRadius: "6px",
              fontSize: "11px",
              fontFamily: "JetBrains Mono",
            }}
            labelStyle={{ color: "hsl(160, 10%, 82%)" }}
          />
          <ReferenceLine y={initialBalance} stroke="hsl(220, 10%, 50%)" strokeDasharray="3 3" />
          <Area
            type="monotone"
            dataKey="balance"
            stroke="hsl(152, 68%, 45%)"
            strokeWidth={2}
            fill="url(#colorBalance)"
            animationDuration={1500}
          />
        </AreaChart>
      </ResponsiveContainer>

      {/* Drawdown monitor */}
      <div className="mt-3 pt-3 border-t border-border flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-primary animate-pulse-glow" />
          <span className="text-[10px] uppercase tracking-wider text-muted-foreground">Estado del Sistema</span>
        </div>
        <span className="font-mono text-xs text-primary font-bold">ACTIVO — Drawdown 3.2%</span>
      </div>
    </div>
  );
};

export default BankrollChart;
