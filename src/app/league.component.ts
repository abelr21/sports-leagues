import { Component, Input, Output, EventEmitter, computed, effect, signal, OnDestroy } from "@angular/core";

import { Subject, takeUntil } from "rxjs";

import { DataService } from "./data.service";
import { League } from "./app.model";

@Component({
  selector: 'app-league',

  styles: [`
    .card {
      background-color: white;
      border-radius: 0.5rem;
      cursor: pointer;
      display: flex;
      flex-direction: column;
      height: 575px;
      justify-content: space-between;
      max-width: 432px;
      padding: 1.5rem;
    }

    @media (min-width: 1380px) {
      .card {
        width: 432px;
      }
    }

    .card-title {
      margin-bottom: 0.5rem;
    }

    .card-text-heading {
      font-size: 0.875rem;
    }

    .card-text {
      font-size: 0.875rem;
      margin-bottom: 0.25rem;
    }

    .badge {
      align-items: center;
      display: flex;
      flex-direction: column;
      margin-top: 1rem;
    }

    .badge--is-loading {
      color: gray;
    }

    .badge--has-error {
      color: red;
    }

    .badge-image {
      height: auto;
      max-width: 100%;
    }
  `],

  template: `
    <div class="card" (click)="onClick.emit(league.idLeague)">
      <div class="card-image">
        @if (isSelected()) {
          <div class="badge">
            @if (badgeLoading()) {
              <div class="badge--is-loading">
                Loading badge...
              </div>
            }

            @if (badgeError()) {
              <div class="badge--has-error">
                {{badgeError()}}
              </div>
            }

            @if (badge() && !badgeLoading() && !badgeError()) {
              <img
                class="badge-image"
                [alt]="league.strLeague + ' Season Badge'"
                [src]="badge()!"
              />
            }
          </div>
        }
      </div>

      <div class="card-content">
        <h3 class="card-title">
          {{league.strLeague}}
        </h3>

        <p class="card-text">
          <b class="card-text-heading">Sport:</b> {{league.strSport}}
        </p>

        @if (league.strLeagueAlternate) {
          <p class="card-text">
            <b class="card-text-heading">Alternate:</b> {{league.strLeagueAlternate}}
          </p>
        }
      </div>
    </div>
  `,
})
export class LeagueComponent implements OnDestroy {
  @Input({ required: true }) id!: () => string | null;
  @Input({ required: true }) league!: League;

  @Output() onClick = new EventEmitter<string>();

  badge = signal<string | null>(null);
  badgeError = signal<string | null>(null);
  badgeLoading = signal<boolean>(false);

  isSelected = computed(() => this.id() === this.league.idLeague);

  private destroy$ = new Subject<void>();

  constructor(private dataService: DataService) {
    effect(() => {
      const isSelected = this.isSelected();
      const leagueId = this.league.idLeague;

      if (isSelected && leagueId) {
        this.badgeLoading.set(true);
        this.badgeError.set(null);
        this.badge.set(null);

        this.dataService.getSeasonBadge(leagueId)
          .pipe(
            takeUntil(this.destroy$)
          )
          .subscribe({
            next: (badgeUrl) => {
              if (badgeUrl) {
                this.badge.set(badgeUrl);
              } else {
                this.badgeError.set('No badge found');
              }
              this.badgeLoading.set(false);
            },
            error: (e) => {
              console.error("Failed to fetch badge:", e);
              this.badgeError.set(`Failed to fetch badge: ${e.message || e.statusText}`);
              this.badgeLoading.set(false);
            }
          });
      } else if (!isSelected) {
        this.badge.set(null);
        this.badgeError.set(null);
        this.badgeLoading.set(false);
      }
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
