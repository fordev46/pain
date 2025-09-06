import {
  Component,
  Input,
  Output,
  EventEmitter,
  ChangeDetectionStrategy,
  OnChanges,
  SimpleChanges,
} from '@angular/core';
import { SeatMap, SeatStatus, Coordinates } from '../../models';

/**
 * High-performance seat table component with virtual scrolling
 * Handles seat visualization and click events efficiently for large maps
 */
@Component({
  selector: 'app-seat-table',
  templateUrl: './seat-table.component.html',
  styleUrls: ['./seat-table.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SeatTableComponent implements OnChanges {
  @Input() seatMap: SeatMap | null = null;
  @Input() selectedSeats: Set<string> = new Set();
  @Input() disabled = false;

  @Output() seatClick = new EventEmitter<Coordinates>();

  // Expose SeatStatus enum to template
  readonly SeatStatus = SeatStatus;

  ngOnChanges(changes: SimpleChanges): void {
    // Handle any input changes if needed for optimization
    if (changes['seatMap'] && this.seatMap) {
      console.log(
        `Seat table updated: ${this.seatMap.rows}x${this.seatMap.columns} (${
          this.seatMap.rows * this.seatMap.columns
        } seats)`
      );
    }
  }

  /**
   * Handles seat table click events using event delegation
   * @param event The click event from the seat table container
   */
  onSeatTableClick(event: Event): void {
    if (this.disabled) return;

    const target = event.target as HTMLElement;
    const seatContainer = this.findSeatContainer(target);

    if (seatContainer) {
      const rowIndex = parseInt(seatContainer.getAttribute('data-row') || '0', 10);
      const colIndex = parseInt(seatContainer.getAttribute('data-col') || '0', 10);

      this.onSeatClick(rowIndex, colIndex);
    }
  }

  /**
   * Handles seat table keydown events using event delegation
   * @param event The keydown event from the seat table container
   */
  onSeatTableKeydown(event: KeyboardEvent): void {
    if (this.disabled) return;

    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      const target = event.target as HTMLElement;
      const seatContainer = this.findSeatContainer(target);

      if (seatContainer) {
        const rowIndex = parseInt(seatContainer.getAttribute('data-row') || '0', 10);
        const colIndex = parseInt(seatContainer.getAttribute('data-col') || '0', 10);

        this.onSeatClick(rowIndex, colIndex);
      }
    }
  }

  /**
   * Finds the seat container element from a click target
   * @param target The event target element
   * @returns The seat container element or null if not found
   */
  private findSeatContainer(target: HTMLElement): HTMLElement | null {
    // Check if target itself is a seat container
    if (target.classList.contains('seat-table__seat-container')) {
      return target;
    }

    // Check if target is inside a seat container (e.g., SVG icon)
    const seatContainer = target.closest('.seat-table__seat-container') as HTMLElement;
    return seatContainer;
  }

  /**
   * Handles seat click events - implements seat selection logic
   * @param rowIndex Row position (y coordinate)
   * @param colIndex Column position (x coordinate)
   */
  private onSeatClick(rowIndex: number, colIndex: number): void {
    if (!this.seatMap) return;

    const seatStatus = this.seatMap.seats[rowIndex][colIndex];

    // Only allow selection of available seats
    if (seatStatus === SeatStatus.RESERVED) {
      console.log(`Seat (${colIndex}, ${rowIndex}) is reserved and cannot be selected`);
      return;
    }

    const coordinates: Coordinates = { x: colIndex, y: rowIndex };
    this.seatClick.emit(coordinates);
  }

  /**
   * Gets the current status of a seat (available, reserved, or selected)
   * @param rowIndex Row position
   * @param colIndex Column position
   * @returns The current seat status
   */
  getSeatStatus(rowIndex: number, colIndex: number): SeatStatus {
    if (!this.seatMap) return SeatStatus.AVAILABLE;

    const originalStatus = this.seatMap.seats[rowIndex][colIndex];
    const seatKey = `${rowIndex}-${colIndex}`;

    if (originalStatus === SeatStatus.RESERVED) {
      return SeatStatus.RESERVED;
    }

    return this.selectedSeats.has(seatKey) ? SeatStatus.SELECTED : SeatStatus.AVAILABLE;
  }

  /**
   * Gets CSS class for seat styling based on its status
   * @param rowIndex Row position
   * @param colIndex Column position
   * @returns CSS class name
   */
  getSeatClass(rowIndex: number, colIndex: number): string {
    const status = this.getSeatStatus(rowIndex, colIndex);

    switch (status) {
      case SeatStatus.AVAILABLE:
        return 'seat-table__seat-container seat-table__seat-container--available';
      case SeatStatus.RESERVED:
        return 'seat-table__seat-container seat-table__seat-container--reserved';
      case SeatStatus.SELECTED:
        return 'seat-table__seat-container seat-table__seat-container--selected';
      default:
        return 'seat-table__seat-container';
    }
  }

  /**
   * Gets the height of each row for virtual scrolling
   * This should match the CSS height of .seat-table__seat-row
   * @returns Height in pixels
   */
  getRowHeight(): number {
    // Height matches CSS min-height + border-spacing + any margins
    // Values from CSS: Mobile: 18px, Tablet: 26px, Desktop: 32px
    if (window.innerWidth <= 480) {
      return 28; // Mobile: 18px min-height + 2px border-spacing
    } else if (window.innerWidth <= 768) {
      return 24; // Tablet: 26px min-height + 2px border-spacing
    } else if (window.innerWidth > 1024) {
      return 44; // Desktop: 32px min-height + 4px border-spacing
    }
    return 44; // Default: ~24px with border-spacing
  }

  /**
   * TrackBy function for ngFor optimization in seat rendering
   * @param index Row index
   * @param row Row data
   * @returns Unique identifier for the row
   */
  trackByRow(index: number, _row: number[]): number {
    return index;
  }

  /**
   * TrackBy function for seat columns
   * @param index Column index
   * @param seat Seat value or seat info object
   * @returns Unique identifier for the seat
   */
  trackBySeat(index: number, seat: unknown): number {
    return typeof seat === 'object' && seat !== null && 'index' in seat
      ? (seat as { index: number }).index
      : index;
  }
}
