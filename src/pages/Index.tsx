import { useState } from "react";
import { motion } from "framer-motion";
import Header from "@/components/Header";
import StatCard from "@/components/StatCard";
import MatchCard from "@/components/MatchCard";
import PoissonMatrix from "@/components/PoissonMatrix";
import ValueBetsTable from "@/components/ValueBetsTable";
import BankrollChart from "@/components/BankrollChart";
import { mockMatches, mockValueBets, mockBankroll } from "@/lib/mockData";
import { Target, TrendingUp, Percent, DollarSign } from "lucide-react";
import type { Match } from "@/lib/mockData";

const Index = () => {
  const [selectedMatch, setSelectedMatch] = useState<Match>(mockMatches[0]);

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="container mx-auto px-4 py-6 space-y-6">
        {/* Stats Row */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-3"
        >
          <StatCard label="Yield Mensual" value="+3.6%" change={12.5} icon={<TrendingUp className="h-4 w-4 text-primary" />} />
          <StatCard label="Value Bets Hoy" value="5" icon={<Target className="h-4 w-4 text-accent" />} glowClass="glow-accent" />
          <StatCard label="Hit Rate" value="58.3%" change={2.1} icon={<Percent className="h-4 w-4 text-primary" />} />
          <StatCard label="Capital" value="€14,320" change={43.2} icon={<DollarSign className="h-4 w-4 text-primary" />} />
        </motion.div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Matches Column */}
          <div className="lg:col-span-1 space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-xs uppercase tracking-widest text-muted-foreground font-semibold">Partidos Analizados</h2>
              <span className="font-mono text-[10px] text-muted-foreground">{mockMatches.length} partidos</span>
            </div>
            {mockMatches.map((match) => (
              <MatchCard
                key={match.id}
                match={match}
                onSelect={setSelectedMatch}
                isSelected={selectedMatch.id === match.id}
              />
            ))}
          </div>

          {/* Analysis Column */}
          <div className="lg:col-span-2 space-y-4">
            <PoissonMatrix match={selectedMatch} />
            <ValueBetsTable bets={mockValueBets} />
            <BankrollChart data={mockBankroll} />
          </div>
        </div>
      </main>
    </div>
  );
};

export default Index;
