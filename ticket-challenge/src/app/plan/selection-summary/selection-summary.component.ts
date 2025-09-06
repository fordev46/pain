import { Component, Input, Output, EventEmitter, ChangeDetectionStrategy } from '@angular/core';
import { AppCoordinates } from '../../models';

@Component({
  selector: 'app-selection-summary',
  templateUrl: './selection-summary.component.html',
  styleUrls: ['./selection-summary.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SelectionSummaryComponent {
  @Input() selectedSeats: Set<string> = new Set();
  @Input() purchasing = false;

  @Output() purchaseClicked = new EventEmitter<void>();
  @Output() clearSelectionClicked = new EventEmitter<void>();

  getSelectedSeatCount(): number {
    return this.selectedSeats.size;
  }

  getSelectedCoordinates(): AppCoordinates[] {
    return Array.from(this.selectedSeats).map(seatKey => {
      const [row, col] = seatKey.split('-').map(Number);
      return { x: col, y: row };
    });
  }

  onPurchaseClick(): void {
    if (!this.purchasing && this.selectedSeats.size > 0) {
      this.purchaseClicked.emit();
    }
  }

  onClearSelectionClick(): void {
    if (!this.purchasing) {
      this.clearSelectionClicked.emit();
    }
  }
}
