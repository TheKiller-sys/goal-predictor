import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";

export type DBMatch = Tables<"matches">;

export function useMatches() {
  return useQuery({
    queryKey: ["matches"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("matches")
        .select("*")
        .order("kickoff", { ascending: true });

      if (error) throw error;
      return data as DBMatch[];
    },
  });
}

export function useMatch(id: string) {
  // Only query DB if id looks like a UUID
  const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
  
  return useQuery({
    queryKey: ["match", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("matches")
        .select("*")
        .eq("id", id)
        .maybeSingle();

      if (error) throw error;
      return data as DBMatch | null;
    },
    enabled: isUUID && !!id,
  });
}

export function useFetchMatches() {
  return useQuery({
    queryKey: ["fetch-matches-trigger"],
    queryFn: async () => {
      const { data, error } = await supabase.functions.invoke("fetch-matches", {
        body: null,
      });
      if (error) throw error;
      return data;
    },
    enabled: false, // Only trigger manually
  });
}

// Adapter: convert DB row to the Match type used by existing components
export function dbMatchToMatch(m: DBMatch) {
  return {
    id: m.id,
    league: m.league,
    homeTeam: m.home_team,
    awayTeam: m.away_team,
    homeElo: m.home_elo ?? 1500,
    awayElo: m.away_elo ?? 1500,
    homeLambda: Number(m.home_lambda) || 1.35,
    awayLambda: Number(m.away_lambda) || 1.2,
    homeWinProb: Number(m.home_win_prob) || 0.33,
    drawProb: Number(m.draw_prob) || 0.33,
    awayWinProb: Number(m.away_win_prob) || 0.33,
    homeOdds: Number(m.home_odds) || 2.0,
    drawOdds: Number(m.draw_odds) || 3.5,
    awayOdds: Number(m.away_odds) || 3.0,
    kickoff: m.kickoff
      ? new Date(m.kickoff).toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit" }) + " CET"
      : "TBD",
    status: (m.status as "upcoming" | "live" | "finished") || "upcoming",
    homeXg: Number(m.home_xg) || 0,
    awayXg: Number(m.away_xg) || 0,
    homePpda: Number(m.home_ppda) || 0,
    awayPpda: Number(m.away_ppda) || 0,
    homeLogo: m.home_logo,
    awayLogo: m.away_logo,
  };
}
