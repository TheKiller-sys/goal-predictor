import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

// Top 5 leagues
const LEAGUES = [
  { id: 39, name: "Premier League" },
  { id: 140, name: "La Liga" },
  { id: 135, name: "Serie A" },
  { id: 78, name: "Bundesliga" },
  { id: 61, name: "Ligue 1" },
  { id: 2, name: "Champions League" },
];

const CURRENT_SEASON = 2025;

async function fetchFromAPIFootball(endpoint: string, params: Record<string, string>) {
  const apiKey = Deno.env.get("API_FOOTBALL_KEY");
  if (!apiKey) throw new Error("API_FOOTBALL_KEY not set");

  const url = new URL(`https://v3.football.api-sports.io/${endpoint}`);
  Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));

  const res = await fetch(url.toString(), {
    headers: { "x-apisports-key": apiKey },
  });

  if (!res.ok) throw new Error(`API-Football error: ${res.status}`);
  const data = await res.json();
  console.log(`API response for ${endpoint}:`, JSON.stringify(data).substring(0, 500));
  if (data.errors && Object.keys(data.errors).length > 0) {
    console.error("API errors:", JSON.stringify(data.errors));
  }
  return data.response;
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
        // Fetch fixtures - "next" doesn't work with "season" param
        let params: Record<string, string>;
        if (action === "live") {
          params = { live: "all" };
        } else if (action === "upcoming") {
          // Get next 10 from this league
          const today = new Date().toISOString().split("T")[0];
          const future = new Date(Date.now() + 14 * 86400000).toISOString().split("T")[0];
          params = {
            league: league.id.toString(),
            season: CURRENT_SEASON.toString(),
            from: today,
            to: future,
          };
        } else {
          params = {
            league: league.id.toString(),
            season: CURRENT_SEASON.toString(),
            last: "10",
          };
        }

        console.log(`Fetching ${league.name} with params:`, JSON.stringify(params));
        const fixtures = await fetchFromAPIFootball("fixtures", params);
        console.log(`${league.name}: ${fixtures?.length || 0} fixtures found`);

        if (!fixtures || fixtures.length === 0) continue;

        for (const fix of fixtures) {
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

        // Fetch odds for this league's fixtures
        try {
          const odds = await fetchFromAPIFootball("odds", {
            league: league.id.toString(),
            season: CURRENT_SEASON.toString(),
          });

          if (odds && odds.length > 0) {
            for (const oddFixture of odds.slice(0, 10)) {
              const fixtureApiId = oddFixture.fixture.id;

              // Get match from DB
              const { data: matchRow } = await supabase
                .from("matches")
                .select("id")
                .eq("api_id", fixtureApiId)
                .maybeSingle();

              if (!matchRow) continue;

              for (const bookmaker of oddFixture.bookmakers?.slice(0, 3) || []) {
                const matchWinner = bookmaker.bets?.find(
                  (b: any) => b.name === "Match Winner"
                );
                const overUnder = bookmaker.bets?.find(
                  (b: any) => b.name === "Goals Over/Under"
                );
                const btts = bookmaker.bets?.find(
                  (b: any) => b.name === "Both Teams Score"
                );

                const homeOdd = matchWinner?.values?.find(
                  (v: any) => v.value === "Home"
                )?.odd;
                const drawOdd = matchWinner?.values?.find(
                  (v: any) => v.value === "Draw"
                )?.odd;
                const awayOdd = matchWinner?.values?.find(
                  (v: any) => v.value === "Away"
                )?.odd;
                const over25 = overUnder?.values?.find(
                  (v: any) => v.value === "Over 2.5"
                )?.odd;
                const under25 = overUnder?.values?.find(
                  (v: any) => v.value === "Under 2.5"
                )?.odd;
                const bttsYes = btts?.values?.find(
                  (v: any) => v.value === "Yes"
                )?.odd;
                const bttsNo = btts?.values?.find(
                  (v: any) => v.value === "No"
                )?.odd;

                if (homeOdd) {
                  // Update match odds
                  await supabase
                    .from("matches")
                    .update({
                      home_odds: parseFloat(homeOdd),
                      draw_odds: drawOdd ? parseFloat(drawOdd) : null,
                      away_odds: awayOdd ? parseFloat(awayOdd) : null,
                    })
                    .eq("id", matchRow.id);

                  // Record odds history
                  await supabase.from("odds_history").insert({
                    match_id: matchRow.id,
                    bookmaker: bookmaker.name,
                    home_odds: homeOdd ? parseFloat(homeOdd) : null,
                    draw_odds: drawOdd ? parseFloat(drawOdd) : null,
                    away_odds: awayOdd ? parseFloat(awayOdd) : null,
                    over25_odds: over25 ? parseFloat(over25) : null,
                    under25_odds: under25 ? parseFloat(under25) : null,
                    btts_yes_odds: bttsYes ? parseFloat(bttsYes) : null,
                    btts_no_odds: bttsNo ? parseFloat(bttsNo) : null,
                  });
                }
              }
            }
          }
        } catch (oddsErr) {
          console.log(`Odds fetch skipped for ${league.name}:`, oddsErr);
        }
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
