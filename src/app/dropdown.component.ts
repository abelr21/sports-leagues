import { Component, Input, Output, EventEmitter } from "@angular/core";
import { FormsModule } from "@angular/forms";

@Component({
  selector: 'app-dropdown',
  imports: [FormsModule],

  styles: [`
    .dropdown {
      background-color: white;
      border-radius: 0.25rem;
      border: 1px solid lightgray;
      padding: 0.75rem;
    }
  `],

  template: `
    <select class="dropdown" [ngModel]="selection()" (change)="onSelect($event)">
      @for (option of options(); track option) {
        <option [value]="option">
          {{option}}
        </option>
      }
    </select>
  `
})
export class DropdownComponent {
  @Input({ required: true }) selection!: () => string;
  @Input({ required: true }) options!: () => string[];

  @Output() select = new EventEmitter<string>();

  onSelect(event: Event): void {
    const select = event.target as HTMLSelectElement;
    this.select.emit(select.value);
  }
}