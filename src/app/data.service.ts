import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";

import { Observable, of, map, catchError } from "rxjs";

import { League, Season } from "./app.model";

const BADGE_URL = 'https://www.thesportsdb.com/api/v1/json/3/search_all_seasons.php?badge=1&id=';
const LEAGUES_URL = 'https://www.thesportsdb.com/api/v1/json/3/all_leagues.php';

@Injectable({
  providedIn: 'root'
})
export class DataService {
  private cache = new Map<string, any>();

  constructor(private http: HttpClient) {}

  getAllLeagues(): Observable<League[]> {
    const cacheKey = 'all_leagues';

    if (this.cache.has(cacheKey)) {
      return of(this.cache.get(cacheKey));
    }

    return this.http.get<{ leagues: League[] }>(LEAGUES_URL)
      .pipe(
        map(data => {
          if (data && data.leagues) {
            const leagues = data.leagues.filter(league => league.strSport);
            this.cache.set(cacheKey, leagues);
            return leagues;
          } else {
            throw new Error('No leagues found');
          }
        }),
        catchError(e => {
          console.error("DataService: Failed to fetch leagues:", e);
          throw new Error(`Failed to fetch leagues: ${e.message || e.statusText}`);
        })
      );
  }

  getSeasonBadge(leagueId: string): Observable<string | null> {
    const cacheKey = `season_badge_${leagueId}`;

    if (this.cache.has(cacheKey)) {
      return of(this.cache.get(cacheKey));
    }

    return this.http.get<{ seasons: Season[] }>(`${BADGE_URL}${leagueId}`)
      .pipe(
        map(data => {
          if (data && data.seasons && data.seasons.length > 0 && data.seasons[0].strBadge) {
            const badgeUrl = data.seasons[0].strBadge;
            this.cache.set(cacheKey, badgeUrl);
            return badgeUrl;
          } else {
            return null;
          }
        }),
        catchError(e => {
          console.error("DataService: Failed to fetch season badge:", e);
          throw new Error(`Failed to fetch season badge: ${e.message || e.statusText}`);
        })
      );
  }
}