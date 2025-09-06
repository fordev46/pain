import { Component, Input, Output, EventEmitter, ChangeDetectionStrategy } from '@angular/core';
import { AppCoordinates } from '../../models';

/**
 * Component for displaying selected seats and handling purchase actions
 * Provides clear feedback about seat selection and purchase controls
 */
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

  /**
   * Gets the count of selected seats
   * @returns Number of currently selected seats
   */
  getSelectedSeatCount(): number {
    return this.selectedSeats.size;
  }

  /**
   * Gets array of selected seat coordinates for display
   * @returns Array of coordinate objects
   */
  getSelectedCoordinates(): AppCoordinates[] {
    return Array.from(this.selectedSeats).map(seatKey => {
      const [row, col] = seatKey.split('-').map(Number);
      return { x: col, y: row };
    });
  }

  /**
   * Handles purchase button click
   */
  onPurchaseClick(): void {
    if (!this.purchasing && this.selectedSeats.size > 0) {
      this.purchaseClicked.emit();
    }
  }

  /**
   * Handles clear selection button click
   */
  onClearSelectionClick(): void {
    if (!this.purchasing) {
      this.clearSelectionClicked.emit();
    }
  }
}
