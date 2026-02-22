export interface Player {
  name: string;
  position: string;
  number: number;
  rating: number;
  isKey: boolean;
}

export interface Lineup {
  formation: string;
  players: Player[];
}

// Mock lineups keyed by team name
export const mockLineups: Record<string, Lineup> = {
  "Real Madrid": {
    formation: "4-3-3",
    players: [
      { name: "Courtois", position: "GK", number: 1, rating: 8.2, isKey: true },
      { name: "Carvajal", position: "RB", number: 2, rating: 7.5, isKey: false },
      { name: "Rüdiger", position: "CB", number: 22, rating: 7.8, isKey: false },
      { name: "Alaba", position: "CB", number: 4, rating: 7.6, isKey: false },
      { name: "Mendy", position: "LB", number: 23, rating: 7.3, isKey: false },
      { name: "Modric", position: "CM", number: 10, rating: 8.0, isKey: true },
      { name: "Tchouaméni", position: "CDM", number: 18, rating: 7.7, isKey: false },
      { name: "Bellingham", position: "CAM", number: 5, rating: 8.8, isKey: true },
      { name: "Rodrygo", position: "RW", number: 11, rating: 7.9, isKey: false },
      { name: "Vinícius Jr.", position: "LW", number: 7, rating: 8.9, isKey: true },
      { name: "Mbappé", position: "ST", number: 9, rating: 9.1, isKey: true },
    ],
  },
  "Man City": {
    formation: "4-3-3",
    players: [
      { name: "Ederson", position: "GK", number: 31, rating: 7.8, isKey: false },
      { name: "Walker", position: "RB", number: 2, rating: 7.4, isKey: false },
      { name: "Dias", position: "CB", number: 3, rating: 8.0, isKey: true },
      { name: "Akanji", position: "CB", number: 25, rating: 7.5, isKey: false },
      { name: "Gvardiol", position: "LB", number: 24, rating: 7.6, isKey: false },
      { name: "Rodri", position: "CDM", number: 16, rating: 8.7, isKey: true },
      { name: "De Bruyne", position: "CM", number: 17, rating: 9.0, isKey: true },
      { name: "Silva", position: "CM", number: 20, rating: 8.1, isKey: true },
      { name: "Foden", position: "RW", number: 47, rating: 8.5, isKey: true },
      { name: "Grealish", position: "LW", number: 10, rating: 7.6, isKey: false },
      { name: "Haaland", position: "ST", number: 9, rating: 9.2, isKey: true },
    ],
  },
  "Arsenal": {
    formation: "4-3-3",
    players: [
      { name: "Raya", position: "GK", number: 22, rating: 7.9, isKey: false },
      { name: "White", position: "RB", number: 4, rating: 7.6, isKey: false },
      { name: "Saliba", position: "CB", number: 2, rating: 8.3, isKey: true },
      { name: "Gabriel", position: "CB", number: 6, rating: 7.8, isKey: false },
      { name: "Zinchenko", position: "LB", number: 35, rating: 7.4, isKey: false },
      { name: "Rice", position: "CDM", number: 41, rating: 8.5, isKey: true },
      { name: "Ødegaard", position: "CAM", number: 8, rating: 8.8, isKey: true },
      { name: "Havertz", position: "CM", number: 29, rating: 7.7, isKey: false },
      { name: "Saka", position: "RW", number: 7, rating: 8.7, isKey: true },
      { name: "Martinelli", position: "LW", number: 11, rating: 7.9, isKey: false },
      { name: "Jesus", position: "ST", number: 9, rating: 7.5, isKey: false },
    ],
  },
  "Liverpool": {
    formation: "4-3-3",
    players: [
      { name: "Alisson", position: "GK", number: 1, rating: 8.4, isKey: true },
      { name: "Alexander-Arnold", position: "RB", number: 66, rating: 8.2, isKey: true },
      { name: "Konaté", position: "CB", number: 5, rating: 7.8, isKey: false },
      { name: "Van Dijk", position: "CB", number: 4, rating: 8.5, isKey: true },
      { name: "Robertson", position: "LB", number: 26, rating: 7.7, isKey: false },
      { name: "Mac Allister", position: "CM", number: 10, rating: 8.0, isKey: false },
      { name: "Szoboszlai", position: "CM", number: 8, rating: 7.8, isKey: false },
      { name: "Gravenberch", position: "CDM", number: 38, rating: 7.6, isKey: false },
      { name: "Salah", position: "RW", number: 11, rating: 9.0, isKey: true },
      { name: "Díaz", position: "LW", number: 7, rating: 7.9, isKey: false },
      { name: "Núñez", position: "ST", number: 9, rating: 7.6, isKey: false },
    ],
  },
  "Barcelona": {
    formation: "4-3-3",
    players: [
      { name: "Ter Stegen", position: "GK", number: 1, rating: 8.1, isKey: true },
      { name: "Koundé", position: "RB", number: 23, rating: 7.9, isKey: false },
      { name: "Araújo", position: "CB", number: 4, rating: 8.0, isKey: true },
      { name: "Cubarsí", position: "CB", number: 2, rating: 7.5, isKey: false },
      { name: "Balde", position: "LB", number: 3, rating: 7.4, isKey: false },
      { name: "Pedri", position: "CM", number: 8, rating: 8.6, isKey: true },
      { name: "De Jong", position: "CDM", number: 21, rating: 7.8, isKey: false },
      { name: "Gavi", position: "CM", number: 6, rating: 7.7, isKey: false },
      { name: "Yamal", position: "RW", number: 19, rating: 8.4, isKey: true },
      { name: "Raphinha", position: "LW", number: 11, rating: 8.0, isKey: false },
      { name: "Lewandowski", position: "ST", number: 9, rating: 8.5, isKey: true },
    ],
  },
  "Atlético Madrid": {
    formation: "3-5-2",
    players: [
      { name: "Oblak", position: "GK", number: 13, rating: 8.3, isKey: true },
      { name: "Savić", position: "CB", number: 15, rating: 7.3, isKey: false },
      { name: "Giménez", position: "CB", number: 2, rating: 7.7, isKey: false },
      { name: "Hermoso", position: "CB", number: 22, rating: 7.2, isKey: false },
      { name: "Llorente", position: "RWB", number: 14, rating: 7.8, isKey: false },
      { name: "Koke", position: "CM", number: 6, rating: 7.9, isKey: true },
      { name: "De Paul", position: "CM", number: 5, rating: 7.6, isKey: false },
      { name: "Barrios", position: "CDM", number: 17, rating: 7.5, isKey: false },
      { name: "Carrasco", position: "LWB", number: 21, rating: 7.4, isKey: false },
      { name: "Griezmann", position: "SS", number: 7, rating: 8.6, isKey: true },
      { name: "Álvarez", position: "ST", number: 19, rating: 8.1, isKey: true },
    ],
  },
  "Inter Milan": {
    formation: "3-5-2",
    players: [
      { name: "Sommer", position: "GK", number: 1, rating: 7.7, isKey: false },
      { name: "Pavard", position: "CB", number: 28, rating: 7.5, isKey: false },
      { name: "Acerbi", position: "CB", number: 15, rating: 7.4, isKey: false },
      { name: "Bastoni", position: "CB", number: 95, rating: 8.0, isKey: true },
      { name: "Dumfries", position: "RWB", number: 2, rating: 7.3, isKey: false },
      { name: "Barella", position: "CM", number: 23, rating: 8.4, isKey: true },
      { name: "Calhanoglu", position: "CDM", number: 20, rating: 8.2, isKey: true },
      { name: "Mkhitaryan", position: "CM", number: 22, rating: 7.6, isKey: false },
      { name: "Dimarco", position: "LWB", number: 32, rating: 7.8, isKey: false },
      { name: "Lautaro", position: "ST", number: 10, rating: 8.7, isKey: true },
      { name: "Thuram", position: "ST", number: 9, rating: 8.0, isKey: false },
    ],
  },
  "Juventus": {
    formation: "4-3-3",
    players: [
      { name: "Szczesny", position: "GK", number: 1, rating: 7.5, isKey: false },
      { name: "Danilo", position: "RB", number: 6, rating: 7.0, isKey: false },
      { name: "Bremer", position: "CB", number: 3, rating: 7.8, isKey: true },
      { name: "Gatti", position: "CB", number: 4, rating: 7.3, isKey: false },
      { name: "Cambiaso", position: "LB", number: 27, rating: 7.5, isKey: false },
      { name: "Locatelli", position: "CDM", number: 5, rating: 7.4, isKey: false },
      { name: "Rabiot", position: "CM", number: 25, rating: 7.6, isKey: false },
      { name: "McKennie", position: "CM", number: 8, rating: 7.2, isKey: false },
      { name: "Chiesa", position: "RW", number: 7, rating: 8.0, isKey: true },
      { name: "Yildiz", position: "LW", number: 10, rating: 7.7, isKey: false },
      { name: "Vlahovic", position: "ST", number: 9, rating: 8.1, isKey: true },
    ],
  },
};
