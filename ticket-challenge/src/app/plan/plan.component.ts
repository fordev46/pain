import {
  Component,
  OnInit,
  OnDestroy,
  ElementRef,
  ViewChild,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  AfterViewInit,
} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject, takeUntil, combineLatest, fromEvent } from 'rxjs';
import { debounceTime, throttleTime } from 'rxjs/operators';
import { MapService } from '../services/map.service';
import { VirtualScrollService } from '../services/virtual-scroll.service';
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
export class PlanComponent implements OnInit, OnDestroy, AfterViewInit {
  // ViewChild references
  @ViewChild('seatMapContainer', { static: false })
  seatMapContainer!: ElementRef<HTMLDivElement>;

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

  // Virtual scrolling state
  useVirtualScroll = false;
  visibleRows: { start: number; end: number } = { start: 0, end: 0 };
  visibleCols: { start: number; end: number } = { start: 0, end: 0 };
  virtualRows: number[][] = [];

  // Component lifecycle
  private destroy$ = new Subject<void>();

  // Expose SeatStatus enum to template
  readonly SeatStatus = SeatStatus;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private mapService: MapService,
    private virtualScrollService: VirtualScrollService,
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

  ngAfterViewInit(): void {
    // Setup virtual scrolling after view is initialized
    this.setupVirtualScrolling();
  }

  ngOnDestroy(): void {
    this.virtualScrollService.reset();
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

          // Determine if virtual scrolling should be used
          this.useVirtualScroll = this.virtualScrollService.shouldUseVirtualScroll(
            seatMap.rows,
            seatMap.columns
          );

          if (this.useVirtualScroll) {
            console.log(
              `Large seat map detected: ${seatMap.rows}x${seatMap.columns} (${
                seatMap.rows * seatMap.columns
              } seats) - Using virtual scrolling`
            );
            this.initializeVirtualScrolling();
          } else {
            console.log(
              `Standard seat map: ${seatMap.rows}x${seatMap.columns} (${
                seatMap.rows * seatMap.columns
              } seats) - Using regular rendering`
            );
          }

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

  /**
   * Sets up virtual scrolling event listeners and configuration
   */
  private setupVirtualScrolling(): void {
    if (!this.seatMapContainer) return;

    // Setup scroll event listener with throttling for performance
    fromEvent(this.seatMapContainer.nativeElement, 'scroll')
      .pipe(
        throttleTime(16), // ~60fps
        takeUntil(this.destroy$)
      )
      .subscribe(() => {
        this.updateVirtualScrollViewport();
      });

    // Setup resize event listener
    fromEvent(window, 'resize')
      .pipe(debounceTime(250), takeUntil(this.destroy$))
      .subscribe(() => {
        this.updateVirtualScrollViewport();
      });

    // Subscribe to visible range changes
    combineLatest([this.virtualScrollService.visibleRows$, this.virtualScrollService.visibleCols$])
      .pipe(takeUntil(this.destroy$))
      .subscribe(([visibleRows, visibleCols]) => {
        this.visibleRows = visibleRows;
        this.visibleCols = visibleCols;
        this.updateVirtualRows();
        this.cdr.detectChanges();
      });
  }

  /**
   * Initializes virtual scrolling for large maps
   */
  private initializeVirtualScrolling(): void {
    if (!this.seatMap || !this.seatMapContainer) return;

    // Update item size based on current screen size
    const itemSize = this.getOptimalSeatSize();
    this.virtualScrollService.updateItemSize(itemSize);

    // Initial viewport update
    setTimeout(() => {
      this.updateVirtualScrollViewport();
    }, 0);
  }

  /**
   * Updates the virtual scroll viewport dimensions and position
   */
  private updateVirtualScrollViewport(): void {
    if (!this.seatMapContainer) return;

    const container = this.seatMapContainer.nativeElement;
    this.virtualScrollService.updateViewport({
      width: container.clientWidth,
      height: container.clientHeight,
      scrollTop: container.scrollTop,
      scrollLeft: container.scrollLeft,
    });
  }

  /**
   * Updates the virtual rows array with only visible rows
   */
  private updateVirtualRows(): void {
    if (!this.seatMap || !this.useVirtualScroll) return;

    this.virtualRows = [];
    const { start, end } = this.visibleRows;

    for (let i = start; i < Math.min(end, this.seatMap.rows); i++) {
      if (this.seatMap.seats[i]) {
        this.virtualRows.push(this.seatMap.seats[i]);
      }
    }
  }

  /**
   * Gets optimal seat size based on screen size and map dimensions
   */
  private getOptimalSeatSize(): {
    width: number;
    height: number;
    marginX: number;
    marginY: number;
  } {
    if (!this.seatMap) {
      return { width: 20, height: 20, marginX: 2, marginY: 2 };
    }

    const screenWidth = window.innerWidth;
    const totalSeats = this.seatMap.rows * this.seatMap.columns;

    // Optimize seat size based on map size and screen width
    if (totalSeats > 50000 || screenWidth < 768) {
      return { width: 12, height: 12, marginX: 1, marginY: 1 };
    } else if (totalSeats > 20000) {
      return { width: 16, height: 16, marginX: 1, marginY: 1 };
    } else {
      return { width: 20, height: 20, marginX: 2, marginY: 2 };
    }
  }

  /**
   * Gets the total height for virtual scrolling container
   */
  getTotalHeight(): number {
    if (!this.seatMap || !this.useVirtualScroll) return 0;
    return this.virtualScrollService.getTotalHeight(this.seatMap.rows);
  }

  /**
   * Gets the total width for virtual scrolling container
   */
  getTotalWidth(): number {
    if (!this.seatMap || !this.useVirtualScroll) return 0;
    return this.virtualScrollService.getTotalWidth(this.seatMap.columns);
  }

  /**
   * Gets the offset for a virtual row
   */
  getRowOffset(index: number): number {
    return this.virtualScrollService.getRowOffset(this.visibleRows.start + index);
  }

  /**
   * Gets visible row index adjusted for virtual scrolling
   */
  getVirtualRowIndex(index: number): number {
    return this.visibleRows.start + index;
  }

  /**
   * Checks if a column is visible in virtual scrolling mode
   */
  isColumnVisible(colIndex: number): boolean {
    if (!this.useVirtualScroll) return true;
    return colIndex >= this.visibleCols.start && colIndex < this.visibleCols.end;
  }

  /**
   * Gets visible seats in a row for virtual scrolling
   */
  getVisibleSeats(row: number[]): { seat: number; index: number }[] {
    if (!this.useVirtualScroll) {
      return row.map((seat, index) => ({ seat, index }));
    }

    const visibleSeats: { seat: number; index: number }[] = [];
    for (let i = this.visibleCols.start; i < Math.min(this.visibleCols.end, row.length); i++) {
      visibleSeats.push({ seat: row[i], index: i });
    }
    return visibleSeats;
  }
}
