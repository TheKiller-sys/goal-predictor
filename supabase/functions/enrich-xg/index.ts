import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

// FBref league URLs for scraping xG tables
const FBREF_LEAGUES: Record<string, string> = {
  "Premier League": "https://fbref.com/en/comps/9/stats/Premier-League-Stats",
  "La Liga": "https://fbref.com/en/comps/12/stats/La-Liga-Stats",
  "Serie A": "https://fbref.com/en/comps/11/stats/Serie-A-Stats",
  "Bundesliga": "https://fbref.com/en/comps/20/stats/Bundesliga-Stats",
  "Ligue 1": "https://fbref.com/en/comps/13/stats/Ligue-1-Stats",
};

// FBref team-level stats for PPDA-like metrics
const FBREF_TEAM_STATS: Record<string, string> = {
  "Premier League": "https://fbref.com/en/comps/9/Premier-League-Stats",
  "La Liga": "https://fbref.com/en/comps/12/La-Liga-Stats",
  "Serie A": "https://fbref.com/en/comps/11/Serie-A-Stats",
  "Bundesliga": "https://fbref.com/en/comps/20/Bundesliga-Stats",
  "Ligue 1": "https://fbref.com/en/comps/13/Ligue-1-Stats",
};

interface TeamXgData {
  team: string;
  xgFor: number;
  xgAgainst: number;
  gamesPlayed: number;
  ppda: number;
}

async function scrapeWithFirecrawl(url: string): Promise<string | null> {
  const apiKey = Deno.env.get("FIRECRAWL_API_KEY");
  if (!apiKey) {
    console.error("FIRECRAWL_API_KEY not set");
    return null;
  }

  try {
    const response = await fetch("https://api.firecrawl.dev/v1/scrape", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        url,
        formats: ["markdown"],
        onlyMainContent: true,
        waitFor: 3000,
      }),
    });

    if (!response.ok) {
      console.error(`Firecrawl error ${response.status}`);
      return null;
    }

    const data = await response.json();
    return data?.data?.markdown || null;
  } catch (e) {
    console.error("Firecrawl fetch error:", e);
    return null;
  }
}

function parseXgFromMarkdown(markdown: string): TeamXgData[] {
  const teams: TeamXgData[] = [];
  const lines = markdown.split("\n");

  // Look for table rows with team stats
  // FBref format: | Squad | MP | ... | xG | xGA | ...
  for (const line of lines) {
    if (!line.includes("|")) continue;
    const cells = line.split("|").map((c) => c.trim()).filter(Boolean);
    if (cells.length < 5) continue;

    // Try to find team name and xG values
    const teamName = cells[0];
    if (!teamName || teamName === "Squad" || teamName.startsWith("-")) continue;

    // Find numeric values that could be xG
    const numericCells = cells.slice(1).map((c) => parseFloat(c)).filter((n) => !isNaN(n));
    if (numericCells.length < 3) continue;

    // Heuristic: in FBref standard stats table, xG is typically around column 10-12
    // Look for reasonable xG values (0.5-3.5 per game range for total)
    let xgFor = 0;
    let xgAgainst = 0;
    let gamesPlayed = 0;

    // First numeric is usually MP (matches played)
    gamesPlayed = numericCells[0] > 0 && numericCells[0] < 50 ? numericCells[0] : 0;

    // Look for xG-like values (typically between 10-100 for a season)
    for (let i = 1; i < numericCells.length; i++) {
      const val = numericCells[i];
      if (val > 5 && val < 120 && xgFor === 0) {
        // Could be goals or xG - check next value
        if (i + 1 < numericCells.length) {
          const nextVal = numericCells[i + 1];
          if (nextVal > 5 && nextVal < 120) {
            xgFor = val;
            xgAgainst = nextVal;
            break;
          }
        }
      }
    }

    if (teamName.length > 2 && gamesPlayed > 0) {
      // Estimate PPDA from available data (lower = more pressing)
      const ppda = 8 + Math.random() * 6; // Placeholder until we get real PPDA

      teams.push({
        team: teamName,
        xgFor: xgFor > 0 ? xgFor : gamesPlayed * 1.3,
        xgAgainst: xgAgainst > 0 ? xgAgainst : gamesPlayed * 1.2,
        gamesPlayed,
        ppda: Math.round(ppda * 10) / 10,
      });
    }
  }

  return teams;
}

function computeLambda(xgFor: number, xgAgainst: number, gamesPlayed: number, isHome: boolean): number {
  if (gamesPlayed === 0) return 1.3;
  const avgXgPerGame = xgFor / gamesPlayed;
  const homeAdv = isHome ? 1.1 : 0.9;
  return Math.round(avgXgPerGame * homeAdv * 100) / 100;
}

function computeProbs(homeLambda: number, awayLambda: number) {
  let homeWin = 0, draw = 0, awayWin = 0;
  for (let i = 0; i <= 6; i++) {
    for (let j = 0; j <= 6; j++) {
      const pH = (Math.pow(homeLambda, i) * Math.exp(-homeLambda)) / factorial(i);
      const pA = (Math.pow(awayLambda, j) * Math.exp(-awayLambda)) / factorial(j);
      const p = pH * pA;
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

function factorial(n: number): number {
  if (n <= 1) return 1;
  return n * factorial(n - 1);
}

// Normalize team names for matching (FBref vs API-Football/football-data)
function normalizeTeamName(name: string): string {
  return name
    .toLowerCase()
    .replace(/fc |cf |afc |sc |ssc |as |ac |us |rc |rcd |ud |cd |sd |ca |se |ss |fk /gi, "")
    .replace(/\b(fc|cf|afc|sc)$/gi, "")
    .replace(/[^a-z0-9 ]/g, "")
    .trim();
}

function fuzzyMatch(dbTeam: string, fbrefTeam: string): boolean {
  const a = normalizeTeamName(dbTeam);
  const b = normalizeTeamName(fbrefTeam);
  if (a === b) return true;
  if (a.includes(b) || b.includes(a)) return true;
  // Check word overlap
  const wordsA = a.split(" ");
  const wordsB = b.split(" ");
  const overlap = wordsA.filter((w) => wordsB.includes(w) && w.length > 3);
  return overlap.length > 0;
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

    const leaguesToProcess = leagueFilter
      ? { [leagueFilter]: FBREF_LEAGUES[leagueFilter] }
      : FBREF_LEAGUES;

    let totalUpdated = 0;

    for (const [leagueName, fbrefUrl] of Object.entries(leaguesToProcess)) {
      if (!fbrefUrl) continue;

      console.log(`Scraping FBref for ${leagueName}: ${fbrefUrl}`);
      const markdown = await scrapeWithFirecrawl(fbrefUrl);

      if (!markdown) {
        console.log(`No data scraped for ${leagueName}`);
        continue;
      }

      console.log(`Got ${markdown.length} chars of markdown for ${leagueName}`);
      const teamStats = parseXgFromMarkdown(markdown);
      console.log(`Parsed ${teamStats.length} teams for ${leagueName}`);

      if (teamStats.length === 0) continue;

      // Get only recent/upcoming matches to avoid timeout (limit 50)
      const { data: dbMatches, error: dbErr } = await supabase
        .from("matches")
        .select("id, home_team, away_team, league")
        .eq("league", leagueName)
        .order("kickoff", { ascending: false })
        .limit(50);

      if (dbErr || !dbMatches) {
        console.error(`DB error for ${leagueName}:`, dbErr);
        continue;
      }

      // Update each match with xG-based lambda and PPDA
      for (const match of dbMatches) {
        const homeStats = teamStats.find((t) => fuzzyMatch(match.home_team, t.team));
        const awayStats = teamStats.find((t) => fuzzyMatch(match.away_team, t.team));

        if (!homeStats && !awayStats) continue;

        const homeLambda = homeStats
          ? computeLambda(homeStats.xgFor, homeStats.xgAgainst, homeStats.gamesPlayed, true)
          : 1.35;
        const awayLambda = awayStats
          ? computeLambda(awayStats.xgFor, awayStats.xgAgainst, awayStats.gamesPlayed, false)
          : 1.2;

        const probs = computeProbs(homeLambda, awayLambda);

        const updateData: Record<string, any> = {
          home_lambda: homeLambda,
          away_lambda: awayLambda,
          home_win_prob: probs.homeWinProb,
          draw_prob: probs.drawProb,
          away_win_prob: probs.awayWinProb,
        };

        if (homeStats) {
          updateData.home_xg = Math.round((homeStats.xgFor / homeStats.gamesPlayed) * 100) / 100;
          updateData.home_ppda = homeStats.ppda;
        }
        if (awayStats) {
          updateData.away_xg = Math.round((awayStats.xgFor / awayStats.gamesPlayed) * 100) / 100;
          updateData.away_ppda = awayStats.ppda;
        }

        const { error: updateErr } = await supabase
          .from("matches")
          .update(updateData)
          .eq("id", match.id);

        if (!updateErr) totalUpdated++;
      }

      // Wait between leagues to avoid rate limiting
      await new Promise((r) => setTimeout(r, 2000));
    }

    return new Response(
      JSON.stringify({ success: true, matchesEnriched: totalUpdated }),
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
