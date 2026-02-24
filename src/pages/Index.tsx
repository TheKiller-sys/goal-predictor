import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Header from "@/components/Header";
import StatCard from "@/components/StatCard";
import MatchCard from "@/components/MatchCard";
import PoissonMatrix from "@/components/PoissonMatrix";
import ValueBetsTable from "@/components/ValueBetsTable";
import BankrollChart from "@/components/BankrollChart";
import { mockMatches, mockValueBets, mockBankroll } from "@/lib/mockData";
import type { Match } from "@/lib/mockData";
import { Target, TrendingUp, Percent, DollarSign, RefreshCw } from "lucide-react";
import { useMatches, dbMatchToMatch } from "@/hooks/useMatches";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";

const Index = () => {
  const { data: dbMatches, isLoading, refetch } = useMatches();
  const [syncing, setSyncing] = useState(false);
  const { toast } = useToast();

  // Convert DB matches or fall back to mock data
  const matches: Match[] = dbMatches && dbMatches.length > 0
    ? dbMatches.map(dbMatchToMatch)
    : mockMatches;

  const [selectedMatch, setSelectedMatch] = useState<Match | null>(null);

  useEffect(() => {
    if (matches.length > 0 && !selectedMatch) {
      setSelectedMatch(matches[0]);
    }
  }, [matches, selectedMatch]);

  const handleSync = async () => {
    setSyncing(true);
    try {
      const { data, error } = await supabase.functions.invoke("fetch-matches");
      if (error) throw error;
      toast({
        title: "Datos sincronizados",
        description: `${data?.matchesProcessed || 0} partidos procesados desde API-Football`,
      });
      refetch();
    } catch (err: any) {
      toast({
        title: "Error al sincronizar",
        description: err.message,
        variant: "destructive",
      });
    } finally {
      setSyncing(false);
    }
  };

  if (!selectedMatch) return null;

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
              <div className="flex items-center gap-2">
                <span className="font-mono text-[10px] text-muted-foreground">{matches.length} partidos</span>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6"
                  onClick={handleSync}
                  disabled={syncing}
                >
                  <RefreshCw className={`h-3 w-3 ${syncing ? "animate-spin" : ""}`} />
                </Button>
              </div>
            </div>
            {isLoading ? (
              <div className="text-center py-8 text-muted-foreground text-sm">Cargando partidos...</div>
            ) : (
              matches.map((match) => (
                <MatchCard
                  key={match.id}
                  match={match}
                  onSelect={setSelectedMatch}
                  isSelected={selectedMatch.id === match.id}
                />
              ))
            )}
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
