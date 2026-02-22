import type { Match } from "./mockData";

export interface SimulationResult {
  homeGoals: number;
  awayGoals: number;
}

export interface MonteCarloOutput {
  simulations: SimulationResult[];
  homeWinPct: number;
  drawPct: number;
  awayWinPct: number;
  over25Pct: number;
  bttsPct: number;
  avgHomeGoals: number;
  avgAwayGoals: number;
  homeGoalDist: number[]; // index = goals, value = frequency %
  awayGoalDist: number[]; // index = goals, value = frequency %
  scoreDist: Record<string, number>; // "1-0" => frequency %
}

function poissonRandom(lambda: number): number {
  const L = Math.exp(-lambda);
  let k = 0;
  let p = 1;
  do {
    k++;
    p *= Math.random();
  } while (p > L);
  return k - 1;
}

export function runMonteCarlo(match: Match, numSims = 10000): MonteCarloOutput {
  const sims: SimulationResult[] = [];
  let homeWins = 0, draws = 0, awayWins = 0, over25 = 0, btts = 0;
  let totalHome = 0, totalAway = 0;
  const homeGoalCounts = new Array(8).fill(0);
  const awayGoalCounts = new Array(8).fill(0);
  const scoreMap: Record<string, number> = {};

  for (let i = 0; i < numSims; i++) {
    const hg = poissonRandom(match.homeLambda);
    const ag = poissonRandom(match.awayLambda);
    sims.push({ homeGoals: hg, awayGoals: ag });

    if (hg > ag) homeWins++;
    else if (hg === ag) draws++;
    else awayWins++;

    if (hg + ag > 2) over25++;
    if (hg > 0 && ag > 0) btts++;

    totalHome += hg;
    totalAway += ag;

    if (hg < 8) homeGoalCounts[hg]++;
    if (ag < 8) awayGoalCounts[ag]++;

    const key = `${hg}-${ag}`;
    scoreMap[key] = (scoreMap[key] || 0) + 1;
  }

  const toPct = (n: number) => (n / numSims) * 100;

  // Convert score map to percentages
  const scoreDist: Record<string, number> = {};
  Object.entries(scoreMap)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 15)
    .forEach(([key, val]) => { scoreDist[key] = toPct(val); });

  return {
    simulations: sims,
    homeWinPct: toPct(homeWins),
    drawPct: toPct(draws),
    awayWinPct: toPct(awayWins),
    over25Pct: toPct(over25),
    bttsPct: toPct(btts),
    avgHomeGoals: totalHome / numSims,
    avgAwayGoals: totalAway / numSims,
    homeGoalDist: homeGoalCounts.map(c => toPct(c)),
    awayGoalDist: awayGoalCounts.map(c => toPct(c)),
    scoreDist,
  };
}
