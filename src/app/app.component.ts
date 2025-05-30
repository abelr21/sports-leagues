import { Component, OnDestroy, OnInit, computed, signal } from "@angular/core";

import { Subject, takeUntil } from "rxjs";

import { DataService } from "./data.service";
import { DropdownComponent } from "./dropdown.component";
import { League } from "./app.model";
import { LeaguesComponent } from "./leagues.component";
import { SearchComponent } from "./search.component";

@Component({
  selector: 'app-root',
  imports: [DropdownComponent, LeaguesComponent, SearchComponent],

  styles: [`
    .wrapper {
      background-color: lightslategray;
      display: flex;
      justify-content: center;
      min-height: 100vh;
    }

    .container {
      align-items: center;
      display: flex;
      flex-direction: column;
      min-height: 100vh;
      padding: 1.5rem 1rem;
    }

    .toolbar {
      align-items: center;
      background-color: white;
      border-radius: 0.5rem;
      display: flex;
      flex-direction: column;
      gap: 1rem;
      margin-bottom: 2rem;
      padding: 1rem 1.5rem;
      width: 100%;
    }

    @media (min-width: 640px) {
      .toolbar {
        flex-direction: row;
        justify-content: space-between;
      }
    }

    .loading {
      color: gray;
      font-weight: bold;
    }

    .error {
      color: red;
    }
  `],

  template: `
    <div class="wrapper">
      <div class="container">
        <div class="toolbar">
          <app-search
            [searchTerm]="searchTerm"
            (onSearch)="searchTerm.set($event)"
          />

          <app-dropdown
            [selection]="selectedSport"
            [options]="sports"
            (select)="selectedSport.set($event)"
          />
        </div>

        @if (loading()) {
          <div class="loading">
            Loading leagues...
          </div>
        }

        @if (error()) {
          <div class="error">
            Error: {{error()}}
          </div>
        }

        @if (!loading() && !error()) {
          <app-leagues
            [leagues]="filteredLeagues"
            [selectedLeague]="selectedLeagueId"
            (onClick)="handleLeagueClick($event)"
          />
        }
      </div>
    </div>
  `,
})
export class AppComponent implements OnInit, OnDestroy {
  error = signal<string | null>(null);
  leagues = signal<League[]>([]);
  loading = signal<boolean>(true);
  searchTerm = signal<string>('');
  selectedLeagueId = signal<string | null>(null);
  selectedSport = signal<string>('All');

  sports = computed(() => {
    const allLeagues = this.leagues();
    return ['All', ...new Set(allLeagues.map(league => league.strSport))];
  });

  filteredLeagues = computed(() => {
    const allLeagues = this.leagues();
    const currentSearchTerm = this.searchTerm().toLowerCase();
    const currentSelectedSport = this.selectedSport();

    let currentFilteredLeagues = allLeagues;

    if (currentSelectedSport !== 'All') {
      currentFilteredLeagues = currentFilteredLeagues.filter(
        league => league.strSport === currentSelectedSport
      );
    }

    if (currentSearchTerm) {
      currentFilteredLeagues = currentFilteredLeagues.filter(
        league =>
          league.strLeague.toLowerCase().includes(currentSearchTerm) ||
          (league.strLeagueAlternate && league.strLeagueAlternate.toLowerCase().includes(currentSearchTerm))
      );
    }

    return currentFilteredLeagues;
  });

  private destroy$ = new Subject<void>();

  constructor(private dataService: DataService) {}

  ngOnInit(): void {
    this.fetchLeagues();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  fetchLeagues(): void {
    this.loading.set(true);
    this.error.set(null);

    this.dataService.getAllLeagues()
      .pipe(
        takeUntil(this.destroy$)
      )
      .subscribe({
        next: (validLeagues) => {
          this.leagues.set(validLeagues);
          this.loading.set(false);
        },
        error: (e) => {
          console.error("Failed to fetch leagues:", e);
          this.error.set(e.message || 'An unknown error occurred while fetching leagues.');
          this.loading.set(false);
        }
      });
  }

  handleLeagueClick(leagueId: string): void {
    if (this.selectedLeagueId() === leagueId) {
      this.selectedLeagueId.set(null);
    } else {
      this.selectedLeagueId.set(leagueId);
    }
  }
}
