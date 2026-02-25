import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

// Top 5 leagues
// Limit to 3 leagues to stay within free plan rate limits
const LEAGUES = [
  { id: 39, name: "Premier League" },
  { id: 140, name: "La Liga" },
  { id: 135, name: "Serie A" },
];

// Free plan: seasons 2022-2024 only, no "next" param
const CURRENT_SEASON = 2024;

async function fetchFromAPIFootball(endpoint: string, params: Record<string, string>) {
  const apiKey = Deno.env.get("API_FOOTBALL_KEY");
  if (!apiKey) throw new Error("API_FOOTBALL_KEY not set");

  // Try RapidAPI first, then api-sports.io
  const attempts = [
    {
      url: `https://api-football-v1.p.rapidapi.com/v3/${endpoint}`,
      headers: {
        "x-rapidapi-key": apiKey,
        "x-rapidapi-host": "api-football-v1.p.rapidapi.com",
      },
    },
    {
      url: `https://v3.football.api-sports.io/${endpoint}`,
      headers: { "x-apisports-key": apiKey },
    },
  ];

  for (const attempt of attempts) {
    try {
      const url = new URL(attempt.url);
      Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));

      const res = await fetch(url.toString(), { headers: attempt.headers });
      if (!res.ok) continue;
      
      const data = await res.json();
      console.log(`API response (${attempt.url.split('/')[2]}):`, JSON.stringify(data).substring(0, 300));
      
      if (data.errors && Object.keys(data.errors).length > 0) {
        const errorStr = JSON.stringify(data.errors);
        if (errorStr.includes("token") || errorStr.includes("key")) {
          console.log("Auth error, trying next endpoint...");
          continue;
        }
        console.error("API errors:", errorStr);
      }
      
      if (data.response && data.response.length > 0) return data.response;
      return data.response || [];
    } catch (e) {
      console.log(`Attempt failed for ${attempt.url.split('/')[2]}:`, e.message);
      continue;
    }
  }
  
  return [];
}

function computePoisson(avgGoals: number): number[] {
  const dist: number[] = [];
  for (let k = 0; k <= 5; k++) {
    dist[k] = (Math.pow(avgGoals, k) * Math.exp(-avgGoals)) / factorial(k);
  }
  return dist;
}

function factorial(n: number): number {
  if (n <= 1) return 1;
  return n * factorial(n - 1);
}

function computeProbabilities(homeLambda: number, awayLambda: number) {
  const homeDist = computePoisson(homeLambda);
  const awayDist = computePoisson(awayLambda);

  let homeWin = 0, draw = 0, awayWin = 0;
  for (let i = 0; i <= 5; i++) {
    for (let j = 0; j <= 5; j++) {
      const p = homeDist[i] * awayDist[j];
      if (i > j) homeWin += p;
      else if (i === j) draw += p;
      else awayWin += p;
    }
  }

  return {
    homeWinProb: Math.round(homeWin * 1000) / 1000,
    drawProb: Math.round(draw * 1000) / 1000,
    awayWinProb: Math.round(awayWin * 1000) / 1000,
  };
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
    const leagueFilter = url.searchParams.get("league");
    const action = url.searchParams.get("action") || "upcoming";

    const leaguesToFetch = leagueFilter
      ? LEAGUES.filter((l) => l.id === parseInt(leagueFilter))
      : LEAGUES;

    let totalInserted = 0;

    for (const league of leaguesToFetch) {
      try {
        // Free plan: only seasons 2022-2024, no "next" param, no future dates
        // Fetch last round of the latest available season
        const params: Record<string, string> = {
          league: league.id.toString(),
          season: CURRENT_SEASON.toString(),
        };
        
        // For free plan, fetch a specific round or the last matches
        if (action === "last") {
          params.last = "10";
        }
        // Don't use from/to with future dates - just get all fixtures
        
        console.log(`Fetching ${league.name}:`, JSON.stringify(params));
        const fixtures = await fetchFromAPIFootball("fixtures", params);
        console.log(`${league.name}: ${fixtures?.length || 0} fixtures found`);
        
        if (!fixtures || fixtures.length === 0) continue;

        // Take only last 20 fixtures (most recent) to avoid timeout
        const recentFixtures = fixtures.slice(-20);
        console.log(`Processing ${recentFixtures.length} recent fixtures for ${league.name}`);

        for (const fix of recentFixtures) {
          const fixtureId = fix.fixture.id;
          const homeTeam = fix.teams.home.name;
          const awayTeam = fix.teams.away.name;

          // Calculate lambda based on league averages (~1.5 goals per team)
          // Adjust based on team strength heuristic
          const homeAdvantage = 1.15;
          const baseLambda = 1.35;
          const homeLambda = Math.round(baseLambda * homeAdvantage * 100) / 100;
          const awayLambda = baseLambda;

          const probs = computeProbabilities(homeLambda, awayLambda);

          const status = fix.fixture.status.short;
          let matchStatus = "upcoming";
          if (["1H", "2H", "HT", "ET", "P", "BT", "LIVE"].includes(status)) {
            matchStatus = "live";
          } else if (["FT", "AET", "PEN"].includes(status)) {
            matchStatus = "finished";
          }

          const matchData = {
            api_id: fixtureId,
            league: league.name,
            league_id: league.id,
            season: CURRENT_SEASON,
            home_team: homeTeam,
            away_team: awayTeam,
            home_team_id: fix.teams.home.id,
            away_team_id: fix.teams.away.id,
            home_logo: fix.teams.home.logo,
            away_logo: fix.teams.away.logo,
            home_lambda: homeLambda,
            away_lambda: awayLambda,
            home_win_prob: probs.homeWinProb,
            draw_prob: probs.drawProb,
            away_win_prob: probs.awayWinProb,
            kickoff: fix.fixture.date,
            status: matchStatus,
            home_score: fix.goals.home,
            away_score: fix.goals.away,
            venue: fix.fixture.venue?.name || null,
            round: fix.league.round,
          };

          const { error } = await supabase
            .from("matches")
            .upsert(matchData, { onConflict: "api_id" });

          if (!error) totalInserted++;
        }

        // Skip odds fetching for now to avoid rate limits on free plan
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
