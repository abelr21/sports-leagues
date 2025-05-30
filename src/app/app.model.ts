export interface League {
  idLeague: string;
  strLeague: string;
  strLeagueAlternate: string | null;
  strSport: string;
}

export interface Season {
  idLeague: string;
  strBadge: string;
}