import {
  Component,
  OnInit,
  OnDestroy,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { MapService } from '../services/map.service';
import {
  SeatMap,
  SeatStatus,
  Coordinates,
  TicketPurchaseRequest,
  TicketPurchaseResponse,
} from '../models';

/**
 * Component responsible for displaying and managing the stadium seat map
 * Handles seat visualization, selection, and coordinate logging
 * Implements efficient rendering for large maps (up to 100k+ seats)
 */
@Component({
  selector: 'app-plan',
  templateUrl: './plan.component.html',
  styleUrls: ['./plan.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PlanComponent implements OnInit, OnDestroy {
  // Component state
  seatMap: SeatMap | null = null;
  loading = false;
  error: string | null = null;
  mapId: string | null = null;

  // Selected seats tracking
  selectedSeats: Set<string> = new Set();

  // Purchase state
  purchasing = false;
  purchaseError: string | null = null;
  purchaseSuccess: string | null = null;

  // Component lifecycle
  private destroy$ = new Subject<void>();

  // Expose SeatStatus enum to template
  readonly SeatStatus = SeatStatus;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private mapService: MapService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    // Get map ID from route parameters
    this.route.paramMap.pipe(takeUntil(this.destroy$)).subscribe(params => {
      this.mapId = params.get('mapId');
      if (this.mapId) {
        this.loadSeatMap(this.mapId);
      } else {
        this.error = 'شناسه سالن نامعتبر است';
      }
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /**
   * Loads the seat map data for the specified map ID
   * @param mapId The map identifier to load
   */
  private loadSeatMap(mapId: string): void {
    this.loading = true;
    this.error = null;
    this.selectedSeats.clear();

    this.mapService
      .getSeatMap(mapId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (seatMap: SeatMap) => {
          this.seatMap = seatMap;
          this.loading = false;
          console.log(
            `Seat map loaded: ${seatMap.rows}x${seatMap.columns} (${
              seatMap.rows * seatMap.columns
            } seats)`
          );
          this.cdr.detectChanges();
        },
        error: err => {
          console.error('Error loading seat map:', err);
          this.error = 'خطا در بارگذاری نقشه صندلی‌ها. لطفا دوباره تلاش کنید.';
          this.loading = false;
          this.cdr.detectChanges();
        },
      });
  }

  /**
   * Handles seat grid click events using event delegation
   * @param event The click event from the seat grid container
   */
  onSeatGridClick(event: Event): void {
    const target = event.target as HTMLElement;
    const seatContainer = this.findSeatContainer(target);

    if (seatContainer) {
      const rowIndex = parseInt(seatContainer.getAttribute('data-row') || '0', 10);
      const colIndex = parseInt(seatContainer.getAttribute('data-col') || '0', 10);

      this.onSeatClick(rowIndex, colIndex);
    }
  }

  /**
   * Handles seat grid keydown events using event delegation
   * @param event The keydown event from the seat grid container
   */
  onSeatGridKeydown(event: KeyboardEvent): void {
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
    if (target.classList.contains('seat-container')) {
      return target;
    }

    // Check if target is inside a seat container (e.g., SVG icon)
    const seatContainer = target.closest('.seat-container') as HTMLElement;
    return seatContainer;
  }

  /**
   * Handles seat click events - implements seat selection logic
   * @param rowIndex Row position (y coordinate)
   * @param colIndex Column position (x coordinate)
   */
  onSeatClick(rowIndex: number, colIndex: number): void {
    if (!this.seatMap) return;

    const seatStatus = this.seatMap.seats[rowIndex][colIndex];

    // Only allow selection of available seats
    if (seatStatus === SeatStatus.RESERVED) {
      console.log(`Seat (${colIndex}, ${rowIndex}) is reserved and cannot be selected`);
      return;
    }

    const seatKey = `${rowIndex}-${colIndex}`;
    const coordinates: Coordinates = { x: colIndex, y: rowIndex };

    if (this.selectedSeats.has(seatKey)) {
      // Deselect seat
      this.selectedSeats.delete(seatKey);
      console.log(`Seat deselected at coordinates:`, coordinates);
    } else {
      // Select seat
      this.selectedSeats.add(seatKey);
      console.log(`Seat selected at coordinates:`, coordinates);
    }
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
        return 'seat-container available';
      case SeatStatus.RESERVED:
        return 'seat-container reserved';
      case SeatStatus.SELECTED:
        return 'seat-container selected';
      default:
        return 'seat-container';
    }
  }

  /**
   * Navigates back to the stadium selection
   */
  goBackToStadiums(): void {
    this.router.navigate(['/salons']);
  }

  /**
   * Retries loading the seat map in case of error
   */
  retry(): void {
    if (this.mapId) {
      this.loadSeatMap(this.mapId);
    }
  }

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
  getSelectedCoordinates(): Coordinates[] {
    return Array.from(this.selectedSeats).map(seatKey => {
      const [row, col] = seatKey.split('-').map(Number);
      return { x: col, y: row };
    });
  }

  /**
   * Clears all selected seats
   */
  clearSelection(): void {
    this.selectedSeats.clear();
    this.purchaseError = null;
    this.purchaseSuccess = null;
    console.log('All seat selections cleared');
  }

  /**
   * Purchases tickets for all selected seats
   * Implements the POST /map/<map_id>/ticket requirement
   */
  purchaseSelectedSeats(): void {
    if (!this.mapId || this.selectedSeats.size === 0 || this.purchasing) {
      return;
    }

    this.purchasing = true;
    this.purchaseError = null;
    this.purchaseSuccess = null;
    this.cdr.detectChanges();

    // Convert selected seats to coordinate array
    const selectedCoordinates = this.getSelectedCoordinates();
    const totalSeats = selectedCoordinates.length;
    let completedPurchases = 0;
    let successfulPurchases = 0;
    const failedPurchases: string[] = [];

    console.log(`Starting purchase process for ${totalSeats} seat(s)`);

    // Purchase each seat individually (as per API specification)
    selectedCoordinates.forEach((coord, index) => {
      const request: TicketPurchaseRequest = {
        x: coord.x,
        y: coord.y,
      };

      console.log(`Purchasing seat at coordinates (${coord.x}, ${coord.y})`);

      this.mapService
        .purchaseTicket(this.mapId!, request)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (response: TicketPurchaseResponse) => {
            completedPurchases++;

            if (response.success) {
              successfulPurchases++;
              console.log(`Purchase successful for seat (${coord.x}, ${coord.y}):`, response);

              // Update seat status to reserved
              if (
                this.seatMap &&
                this.seatMap.seats[coord.y] &&
                this.seatMap.seats[coord.y][coord.x] !== undefined
              ) {
                this.seatMap.seats[coord.y][coord.x] = SeatStatus.RESERVED;
              }

              // Remove from selection
              const seatKey = `${coord.y}-${coord.x}`;
              this.selectedSeats.delete(seatKey);
            } else {
              failedPurchases.push(`(${coord.x + 1}, ${coord.y + 1}): ${response.message}`);
              console.log(`Purchase failed for seat (${coord.x}, ${coord.y}):`, response.message);
            }

            // Check if all purchases completed
            if (completedPurchases === totalSeats) {
              this.handlePurchaseCompletion(successfulPurchases, failedPurchases);
            }
          },
          error: err => {
            completedPurchases++;
            failedPurchases.push(`(${coord.x + 1}, ${coord.y + 1}): خطا در اتصال به سرور`);
            console.error(`Error purchasing seat (${coord.x}, ${coord.y}):`, err);

            // Check if all purchases completed
            if (completedPurchases === totalSeats) {
              this.handlePurchaseCompletion(successfulPurchases, failedPurchases);
            }
          },
        });
    });
  }

  /**
   * Handles the completion of purchase process
   * @param successCount Number of successful purchases
   * @param failures Array of failure messages
   */
  private handlePurchaseCompletion(successCount: number, failures: string[]): void {
    this.purchasing = false;

    if (successCount > 0 && failures.length === 0) {
      // All purchases successful
      this.purchaseSuccess = `تمام ${successCount} صندلی با موفقیت خریداری شد!`;
      this.purchaseError = null;
    } else if (successCount > 0 && failures.length > 0) {
      // Partial success
      this.purchaseSuccess = `${successCount} صندلی با موفقیت خریداری شد.`;
      this.purchaseError = `خطا در خرید ${failures.length} صندلی: ${failures.join(', ')}`;
    } else {
      // All purchases failed
      this.purchaseSuccess = null;
      this.purchaseError = `خطا در خرید تمام صندلی‌ها: ${failures.join(', ')}`;
    }

    // Auto-hide success message after 5 seconds
    if (this.purchaseSuccess) {
      setTimeout(() => {
        this.purchaseSuccess = null;
        this.cdr.detectChanges();
      }, 5000);
    }

    this.cdr.detectChanges();
    console.log(
      `Purchase process completed: ${successCount} successful, ${failures.length} failed`
    );
  }

  /**
   * Dismisses purchase messages
   */
  dismissPurchaseMessages(): void {
    this.purchaseError = null;
    this.purchaseSuccess = null;
  }

  /**
   * TrackBy function for ngFor optimization in seat rendering
   * @param index Row index
   * @param row Row data
   * @returns Unique identifier for the row
   */
  trackByRow(index: number, row: number[]): number {
    return index;
  }

  /**
   * TrackBy function for seat columns
   * @param index Column index
   * @param seat Seat value or seat info object
   * @returns Unique identifier for the seat
   */
  trackBySeat(index: number, seat: any): number {
    return typeof seat === 'object' ? seat.index : index;
  }
}
