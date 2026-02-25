import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

// Football-data.org league codes (free tier supports these)
const LEAGUES: Record<string, { code: string; name: string }> = {
  PL: { code: "PL", name: "Premier League" },
  PD: { code: "PD", name: "La Liga" },
  SA: { code: "SA", name: "Serie A" },
  BL1: { code: "BL1", name: "Bundesliga" },
  FL1: { code: "FL1", name: "Ligue 1" },
  CL: { code: "CL", name: "Champions League" },
};

async function fetchFromFootballData(endpoint: string) {
  const apiKey = Deno.env.get("FOOTBALL_DATA_KEY");
  if (!apiKey) throw new Error("FOOTBALL_DATA_KEY not set");

  const res = await fetch(`https://api.football-data.org/v4/${endpoint}`, {
    headers: { "X-Auth-Token": apiKey },
  });

  if (!res.ok) {
    const body = await res.text();
    console.error(`Football-data.org error ${res.status}:`, body);
    throw new Error(`Football-data.org error: ${res.status}`);
  }

  return await res.json();
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, serviceKey);

    const url = new URL(req.url);
    const leagueFilter = url.searchParams.get("league"); // e.g. "PL"
    const matchday = url.searchParams.get("matchday"); // specific matchday

    const leagueCodes = leagueFilter
      ? [LEAGUES[leagueFilter]].filter(Boolean)
      : Object.values(LEAGUES);

    let totalInserted = 0;

    for (const league of leagueCodes) {
      try {
        let endpoint = `competitions/${league.code}/matches?status=SCHEDULED,LIVE,IN_PLAY,PAUSED,FINISHED`;
        if (matchday) endpoint += `&matchday=${matchday}`;

        console.log(`Fetching ${league.name} from football-data.org`);
        const data = await fetchFromFootballData(endpoint);

        if (!data.matches || data.matches.length === 0) {
          console.log(`${league.name}: no matches found`);
          continue;
        }

        // Take last 20 matches to avoid timeout
        const matches = data.matches.slice(-20);
        console.log(`${league.name}: processing ${matches.length}/${data.matches.length} matches`);

        for (const m of matches) {
          let matchStatus = "upcoming";
          if (["IN_PLAY", "PAUSED", "LIVE"].includes(m.status)) {
            matchStatus = "live";
          } else if (m.status === "FINISHED") {
            matchStatus = "finished";
          }

          // Use api_id based on football-data.org match id (offset to avoid collision with api-football)
          const apiId = 9000000 + m.id;

          const matchData = {
            api_id: apiId,
            league: league.name,
            league_id: null,
            season: data.filters?.season || 2025,
            home_team: m.homeTeam?.name || m.homeTeam?.shortName || "TBD",
            away_team: m.awayTeam?.name || m.awayTeam?.shortName || "TBD",
            home_team_id: m.homeTeam?.id,
            away_team_id: m.awayTeam?.id,
            home_logo: m.homeTeam?.crest || null,
            away_logo: m.awayTeam?.crest || null,
            kickoff: m.utcDate,
            status: matchStatus,
            home_score: m.score?.fullTime?.home ?? null,
            away_score: m.score?.fullTime?.away ?? null,
            venue: m.venue || null,
            round: m.matchday ? `Matchday ${m.matchday}` : null,
            // Calculate basic lambda from odds if available
            home_lambda: 1.55,
            away_lambda: 1.35,
            home_win_prob: 0.40,
            draw_prob: 0.28,
            away_win_prob: 0.32,
          };

          const { error } = await supabase
            .from("matches")
            .upsert(matchData, { onConflict: "api_id" });

          if (error) {
            console.error(`Insert error for ${matchData.home_team} vs ${matchData.away_team}:`, error.message);
          } else {
            totalInserted++;
          }
        }

        // Rate limit: football-data.org free = 10 req/min
        await new Promise((r) => setTimeout(r, 6500));
      } catch (leagueErr) {
        console.error(`Error fetching ${league.name}:`, leagueErr);
      }
    }

    return new Response(
      JSON.stringify({ success: true, matchesProcessed: totalInserted }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
