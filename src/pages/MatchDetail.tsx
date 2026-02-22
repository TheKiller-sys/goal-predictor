import { useParams, Link } from "react-router-dom";
import { useMemo } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, Zap, Target, Shield, Star } from "lucide-react";
import { mockMatches } from "@/lib/mockData";
import { runMonteCarlo } from "@/lib/monteCarlo";
import { mockLineups } from "@/lib/mockLineups";
import PoissonMatrix from "@/components/PoissonMatrix";
import GoalDistributionChart from "@/components/GoalDistributionChart";
import ScoreHeatmap from "@/components/ScoreHeatmap";
import LineupPanel from "@/components/LineupPanel";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell,
} from "recharts";

const MatchDetail = () => {
  const { id } = useParams<{ id: string }>();
  const match = mockMatches.find((m) => m.id === id);

  const mcResult = useMemo(
    () => (match ? runMonteCarlo(match, 10000) : null),
    [match]
  );

  if (!match || !mcResult) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <p className="text-muted-foreground">Partido no encontrado</p>
          <Link to="/" className="text-primary text-sm hover:underline">← Volver al dashboard</Link>
        </div>
      </div>
    );
  }

  const outcomeData = [
    { name: match.homeTeam.split(" ").pop(), value: mcResult.homeWinPct, color: "hsl(152, 68%, 45%)" },
    { name: "Empate", value: mcResult.drawPct, color: "hsl(220, 10%, 50%)" },
    { name: match.awayTeam.split(" ").pop(), value: mcResult.awayWinPct, color: "hsl(38, 92%, 55%)" },
  ];

  const homeLineup = mockLineups[match.homeTeam];
  const awayLineup = mockLineups[match.awayTeam];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-background/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-3 flex items-center gap-4">
          <Link to="/" className="text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div className="flex-1">
            <span className="text-[10px] uppercase tracking-widest text-muted-foreground">{match.league}</span>
            <h1 className="text-sm font-bold text-foreground">
              {match.homeTeam} <span className="text-muted-foreground font-normal">vs</span> {match.awayTeam}
            </h1>
          </div>
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-primary/10 border border-primary/20">
            <Zap className="h-3 w-3 text-primary" />
            <span className="font-mono text-[10px] text-primary font-medium">10,000 sims</span>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6 space-y-6">
        {/* Monte Carlo Results Summary */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="card-shine rounded-lg border border-border p-5"
        >
          <h2 className="text-sm font-semibold text-foreground mb-4 flex items-center gap-2">
            <Target className="h-4 w-4 text-primary" />
            Simulación Monte Carlo — 10,000 iteraciones
          </h2>

          {/* Outcome bars */}
          <div className="mb-4">
            <ResponsiveContainer width="100%" height={60}>
              <BarChart data={outcomeData} layout="vertical" barSize={24}>
                <XAxis type="number" domain={[0, 100]} hide />
                <YAxis type="category" dataKey="name" hide />
                <Bar dataKey="value" radius={[4, 4, 4, 4]}>
                  {outcomeData.map((entry, i) => (
                    <Cell key={i} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
            <div className="grid grid-cols-3 gap-2 mt-2">
              {outcomeData.map((d) => (
                <div key={d.name} className="text-center">
                  <div className="font-mono text-lg font-bold text-foreground">{d.value.toFixed(1)}%</div>
                  <div className="text-[10px] text-muted-foreground uppercase tracking-wider">{d.name}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Key metrics */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 pt-4 border-t border-border">
            <div className="text-center">
              <div className="text-[10px] text-muted-foreground uppercase tracking-wider">Avg Goles Local</div>
              <div className="font-mono text-sm font-bold text-foreground">{mcResult.avgHomeGoals.toFixed(2)}</div>
            </div>
            <div className="text-center">
              <div className="text-[10px] text-muted-foreground uppercase tracking-wider">Avg Goles Visita</div>
              <div className="font-mono text-sm font-bold text-foreground">{mcResult.avgAwayGoals.toFixed(2)}</div>
            </div>
            <div className="text-center">
              <div className="text-[10px] text-muted-foreground uppercase tracking-wider">Over 2.5</div>
              <div className="font-mono text-sm font-bold text-primary">{mcResult.over25Pct.toFixed(1)}%</div>
            </div>
            <div className="text-center">
              <div className="text-[10px] text-muted-foreground uppercase tracking-wider">BTTS</div>
              <div className="font-mono text-sm font-bold text-accent">{mcResult.bttsPct.toFixed(1)}%</div>
            </div>
          </div>
        </motion.div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <GoalDistributionChart
            homeGoalDist={mcResult.homeGoalDist}
            awayGoalDist={mcResult.awayGoalDist}
            homeTeam={match.homeTeam}
            awayTeam={match.awayTeam}
          />
          <ScoreHeatmap scoreDist={mcResult.scoreDist} homeTeam={match.homeTeam} awayTeam={match.awayTeam} />
        </div>

        {/* Poisson Matrix */}
        <PoissonMatrix match={match} />

        {/* Lineups */}
        {homeLineup && awayLineup && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <LineupPanel team={match.homeTeam} lineup={homeLineup} isHome />
            <LineupPanel team={match.awayTeam} lineup={awayLineup} isHome={false} />
          </div>
        )}
      </main>
    </div>
  );
};

export default MatchDetail;
