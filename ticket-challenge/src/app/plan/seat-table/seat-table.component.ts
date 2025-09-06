import { Component, Input, Output, EventEmitter, ChangeDetectionStrategy } from '@angular/core';
import { AppSeatMap, AppSeatStatus, AppCoordinates } from '../../models';

@Component({
  selector: 'app-seat-table',
  templateUrl: './seat-table.component.html',
  styleUrls: ['./seat-table.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SeatTableComponent {
  @Input() seatMap: AppSeatMap | null = null;
  @Input() selectedSeats: Set<string> = new Set();
  @Input() disabled = false;

  @Output() seatClick = new EventEmitter<AppCoordinates>();

  readonly SeatStatus = AppSeatStatus;

  /**
   * Handles seat table click events using event delegation pattern.
   *
   * This function uses event delegation to efficiently handle clicks on any seat within
   * the seat table container. Instead of adding individual click listeners to each seat,
   * a single listener is attached to the parent container, which then determines which
   * specific seat was clicked based on the event target.
   *
   * **How it works:**
   * 1. Checks if the component is disabled - if so, ignores the click
   * 2. Gets the actual HTML element that was clicked (event.target)
   * 3. Traverses up the DOM tree to find the closest seat container element
   * 4. Extracts row and column indices from the seat container's data attributes
   * 5. Delegates to the onSeatClick method with the determined coordinates
   *
   * @param event - The click event from anywhere within the seat table container
   * @returns void
   *
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
   * Handles seat table keydown events using event delegation as described in onSeatTableClick
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
    if (seatStatus === AppSeatStatus.RESERVED) {
      console.log(`Seat (${colIndex}, ${rowIndex}) is reserved and cannot be selected`);
      return;
    }

    const coordinates: AppCoordinates = { x: colIndex, y: rowIndex };
    this.seatClick.emit(coordinates);
  }

  /**
   * Gets the current status of a seat (available, reserved, or selected)
   * @param rowIndex Row position
   * @param colIndex Column position
   * @returns The current seat status
   */
  getSeatStatus(rowIndex: number, colIndex: number): AppSeatStatus {
    if (!this.seatMap) return AppSeatStatus.AVAILABLE;

    const originalStatus = this.seatMap.seats[rowIndex][colIndex];
    const seatKey = `${rowIndex}-${colIndex}`;

    if (originalStatus === AppSeatStatus.RESERVED) {
      return AppSeatStatus.RESERVED;
    }

    return this.selectedSeats.has(seatKey) ? AppSeatStatus.SELECTED : AppSeatStatus.AVAILABLE;
  }

  getSeatClass(rowIndex: number, colIndex: number): string {
    const status = this.getSeatStatus(rowIndex, colIndex);

    switch (status) {
      case AppSeatStatus.AVAILABLE:
        return 'seat-table__seat-container seat-table__seat-container--available';
      case AppSeatStatus.RESERVED:
        return 'seat-table__seat-container seat-table__seat-container--reserved';
      case AppSeatStatus.SELECTED:
        return 'seat-table__seat-container seat-table__seat-container--selected';
      default:
        return 'seat-table__seat-container';
    }
  }

  /**
   * Gets the height of each row for virtual scrolling with hard-coded values.
   *
   * **⚠️ HARD-CODED VALUES WARNING:**
   * This function uses hard-coded height values which is not optimal practice.
   * However, this approach was chosen after evaluating three alternatives:
   *
   * 1. **Calculate dynamically**: Too costly for performance (requires DOM measurements)
   * 2. **Avoid CSS properties**: Remove margins/borders/border-spacing - limits design flexibility
   * 3. **Hard-code values**: Current approach - requires manual maintenance but performant
   *
   * **Why hard-coding was chosen:**
   * - Virtual scrolling requires precise, consistent row heights for performance
   * - Tables with margins, borders, and border-spacing create complex box-sizing calculations
   * - CSS `height` property doesn't account for border-spacing and other table-specific styling
   * - Dynamic calculation would impact scroll performance due to frequent DOM queries
   
   * @warning This is a hard-coded value and must be manually updated when CSS changes
   * @warning Breakpoints must match CSS media queries exactly

   * @returns Height in pixels for each table row at current viewport size
   *
   * @todo Consider using CSS custom properties or a design token system
   * @todo Investigate CSS `container-query` for more maintainable responsive heights
   */
  getRowHeight(): number {
    if (window.innerWidth <= 480) {
      return 28;
    } else if (window.innerWidth <= 768) {
      return 24;
    } else if (window.innerWidth > 1024) {
      return 44;
    }
    return 44;
  }

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
