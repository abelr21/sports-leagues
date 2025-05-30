import { Component, Input, Output, EventEmitter, OnDestroy } from "@angular/core";
import { FormsModule } from "@angular/forms";

import { Subject, debounceTime, distinctUntilChanged, takeUntil } from "rxjs";

@Component({
  selector: 'app-search',
  imports: [FormsModule],

  styles: [`
    .search {
      border-radius: 0.25rem;
      border: 1px solid lightgray;
      min-width: 300px;
      padding: 0.75rem;
    }
  `],

  template: `
    <input
      class="search"
      placeholder="Filter by name..."
      type="text"
      [ngModel]="searchTerm()"
      (input)="search($event)"
    />
  `,
})
export class SearchComponent implements OnDestroy {
  @Input({ required: true }) searchTerm!: () => string;
  @Output() onSearch = new EventEmitter<string>();

  private searchTerms = new Subject<string>();
  private destroy$ = new Subject<void>();

  constructor() {
    this.searchTerms.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      takeUntil(this.destroy$)
    ).subscribe(searchTerm => {
      this.onSearch.emit(searchTerm);
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  search(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.searchTerms.next(input.value);
  }
}