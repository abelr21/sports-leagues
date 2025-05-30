import { Component, Input, Output, EventEmitter } from "@angular/core";

import { League } from "./app.model";
import { LeagueComponent } from "./league.component";

@Component({
  selector: 'app-leagues',
  imports: [LeagueComponent],

  styles: [`
    .grid {
      display: grid;
      gap: 1.5rem;
      grid-template-columns: 1fr;
      width: 100%;
    }

    @media (min-width: 640px) {
      .grid {
        grid-template-columns: repeat(2, minmax(0, 1fr));
      }
    }

    @media (min-width: 1024px) {
      .grid {
        grid-template-columns: repeat(3, minmax(0, 1fr));
      }
    }

    .no-content {
      background-color: white;
      border-radius: 0.5rem;
      grid-column: 1 / -1;
      padding: 2rem;
      text-align: center;
    }
  `],

  template: `
    <div class="grid">
      @for (league of leagues(); track league.idLeague) {
        <app-league
          [league]="league"
          [id]="selectedLeague"
          (onClick)="onClick.emit($event)"
        />
      } @empty {
        <div class="no-content">
          No leagues found
        </div>
      }
    </div>
  `,
})
export class LeaguesComponent {
  @Input({ required: true }) leagues!: () => League[];
  @Input({ required: true }) selectedLeague!: () => string | null;

  @Output() onClick = new EventEmitter<string>();
}
