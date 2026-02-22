// Mock data for the football analytics platform

export interface Match {
  id: string;
  league: string;
  homeTeam: string;
  awayTeam: string;
  homeElo: number;
  awayElo: number;
  homeLambda: number;
  awayLambda: number;
  homeWinProb: number;
  drawProb: number;
  awayWinProb: number;
  homeOdds: number;
  drawOdds: number;
  awayOdds: number;
  kickoff: string;
  status: "upcoming" | "live" | "finished";
  homeXg: number;
  awayXg: number;
  homePpda: number;
  awayPpda: number;
}

export interface ValueBet {
  id: string;
  match: string;
  market: string;
  selection: string;
  modelProb: number;
  bookOdds: number;
  value: number;
  kellyStake: number;
  droppingOdds: boolean;
  confidence: "high" | "medium" | "low";
}

export interface BankrollEntry {
  date: string;
  balance: number;
  roi: number;
}

export const mockMatches: Match[] = [
  {
    id: "1", league: "Champions League", homeTeam: "Real Madrid", awayTeam: "Man City",
    homeElo: 2045, awayElo: 2012, homeLambda: 1.82, awayLambda: 1.35,
    homeWinProb: 0.44, drawProb: 0.26, awayWinProb: 0.30,
    homeOdds: 2.10, drawOdds: 3.50, awayOdds: 3.20,
    kickoff: "21:00 CET", status: "upcoming",
    homeXg: 1.92, awayXg: 1.48, homePpda: 8.2, awayPpda: 7.1,
  },
  {
    id: "2", league: "Premier League", homeTeam: "Arsenal", awayTeam: "Liverpool",
    homeElo: 1985, awayElo: 2030, homeLambda: 1.65, awayLambda: 1.58,
    homeWinProb: 0.38, drawProb: 0.28, awayWinProb: 0.34,
    homeOdds: 2.45, drawOdds: 3.40, awayOdds: 2.80,
    kickoff: "17:30 CET", status: "live",
    homeXg: 1.72, awayXg: 1.85, homePpda: 9.1, awayPpda: 7.8,
  },
  {
    id: "3", league: "La Liga", homeTeam: "Barcelona", awayTeam: "Atlético Madrid",
    homeElo: 2035, awayElo: 1920, homeLambda: 2.10, awayLambda: 0.95,
    homeWinProb: 0.58, drawProb: 0.22, awayWinProb: 0.20,
    homeOdds: 1.65, drawOdds: 3.80, awayOdds: 5.00,
    kickoff: "20:00 CET", status: "upcoming",
    homeXg: 2.35, awayXg: 0.88, homePpda: 7.5, awayPpda: 12.3,
  },
  {
    id: "4", league: "Serie A", homeTeam: "Inter Milan", awayTeam: "Juventus",
    homeElo: 1970, awayElo: 1945, homeLambda: 1.55, awayLambda: 1.10,
    homeWinProb: 0.45, drawProb: 0.28, awayWinProb: 0.27,
    homeOdds: 2.00, drawOdds: 3.30, awayOdds: 3.80,
    kickoff: "20:45 CET", status: "upcoming",
    homeXg: 1.62, awayXg: 1.15, homePpda: 9.8, awayPpda: 10.5,
  },
];

export const mockValueBets: ValueBet[] = [
  { id: "1", match: "Real Madrid vs Man City", market: "Over 2.5", selection: "Over", modelProb: 0.62, bookOdds: 1.85, value: 0.147, kellyStake: 0.038, droppingOdds: true, confidence: "high" },
  { id: "2", match: "Arsenal vs Liverpool", market: "1X2", selection: "Draw", modelProb: 0.32, bookOdds: 3.40, value: 0.088, kellyStake: 0.025, droppingOdds: false, confidence: "medium" },
  { id: "3", match: "Barcelona vs Atlético", market: "Asian Handicap -1.5", selection: "Barcelona", modelProb: 0.41, bookOdds: 2.60, value: 0.066, kellyStake: 0.018, droppingOdds: false, confidence: "medium" },
  { id: "4", match: "Inter vs Juventus", market: "Under 2.5", selection: "Under", modelProb: 0.55, bookOdds: 2.05, value: 0.127, kellyStake: 0.032, droppingOdds: true, confidence: "high" },
  { id: "5", match: "Real Madrid vs Man City", market: "BTTS", selection: "Yes", modelProb: 0.68, bookOdds: 1.72, value: 0.170, kellyStake: 0.042, droppingOdds: false, confidence: "high" },
];

export const mockBankroll: BankrollEntry[] = [
  { date: "Ene", balance: 10000, roi: 0 },
  { date: "Feb", balance: 10450, roi: 4.5 },
  { date: "Mar", balance: 10280, roi: 2.8 },
  { date: "Abr", balance: 11100, roi: 11.0 },
  { date: "May", balance: 11580, roi: 15.8 },
  { date: "Jun", balance: 11320, roi: 13.2 },
  { date: "Jul", balance: 12050, roi: 20.5 },
  { date: "Ago", balance: 12480, roi: 24.8 },
  { date: "Sep", balance: 12150, roi: 21.5 },
  { date: "Oct", balance: 13200, roi: 32.0 },
  { date: "Nov", balance: 13850, roi: 38.5 },
  { date: "Dic", balance: 14320, roi: 43.2 },
];

// Poisson probability matrix for a match
export function generatePoissonMatrix(lambdaHome: number, lambdaAway: number): number[][] {
  const matrix: number[][] = [];
  for (let i = 0; i <= 5; i++) {
    matrix[i] = [];
    for (let j = 0; j <= 5; j++) {
      const probHome = (Math.pow(lambdaHome, i) * Math.exp(-lambdaHome)) / factorial(i);
      const probAway = (Math.pow(lambdaAway, j) * Math.exp(-lambdaAway)) / factorial(j);
      matrix[i][j] = probHome * probAway;
    }
  }
  return matrix;
}

function factorial(n: number): number {
  if (n <= 1) return 1;
  return n * factorial(n - 1);
}
