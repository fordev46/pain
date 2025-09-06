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
import { ToastService } from '../services/core/toast.service';
import {
  AppSeatMap,
  AppSeatStatus,
  AppCoordinates,
  AppTicketPurchaseInput,
  AppTicketPurchaseOutput,
} from '../models';

/**
 * Main plan component that orchestrates seat map functionality
 * Uses sub-components for better organization and maintainability
 * Manages state and coordinates interactions between child components
 */
@Component({
  selector: 'app-plan',
  templateUrl: './plan.component.html',
  styleUrls: ['./plan.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PlanComponent implements OnInit, OnDestroy {
  // Component state
  seatMap: AppSeatMap | null = null;
  loading = false;
  error: string | null = null;
  mapId: string | null = null;

  // Selected seats tracking
  selectedSeats: Set<string> = new Set();

  // Purchase state
  purchasing = false;

  // Component lifecycle
  private destroy$ = new Subject<void>();

  // Expose SeatStatus enum to template
  readonly SeatStatus = AppSeatStatus;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private mapService: MapService,
    public toastService: ToastService,
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
        next: (seatMap: AppSeatMap) => {
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
   * Handles seat click events from the seat grid component
   * @param coordinates The coordinates of the clicked seat
   */
  onSeatClick(coordinates: AppCoordinates): void {
    if (!this.seatMap) return;

    const { x: colIndex, y: rowIndex } = coordinates;
    const seatStatus = this.seatMap.seats[rowIndex][colIndex];

    // Only allow selection of available seats
    if (seatStatus === AppSeatStatus.RESERVED) {
      console.log(`Seat (${colIndex}, ${rowIndex}) is reserved and cannot be selected`);
      return;
    }

    const seatKey = `${rowIndex}-${colIndex}`;

    if (this.selectedSeats.has(seatKey)) {
      // Deselect seat
      this.selectedSeats.delete(seatKey);
      // Create new Set reference to trigger change detection in child components
      this.selectedSeats = new Set(this.selectedSeats);
      console.log(`Seat deselected at coordinates:`, coordinates);
    } else {
      // Select seat
      this.selectedSeats.add(seatKey);
      // Create new Set reference to trigger change detection in child components
      this.selectedSeats = new Set(this.selectedSeats);
      console.log(`Seat selected at coordinates:`, coordinates);
    }

    // Trigger change detection since we're using OnPush strategy
    this.cdr.detectChanges();
  }

  /**
   * Navigates back to the stadium selection
   */
  onBackToStadiums(): void {
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
  getSelectedCoordinates(): AppCoordinates[] {
    return Array.from(this.selectedSeats).map(seatKey => {
      const [row, col] = seatKey.split('-').map(Number);
      return { x: col, y: row };
    });
  }

  /**
   * Handles clear selection request from selection summary component
   * Clears all selected seats
   */
  onClearSelection(): void {
    this.selectedSeats.clear();
    // Create new Set reference to trigger change detection in child components
    this.selectedSeats = new Set();
    console.log('All seat selections cleared');

    // Trigger change detection since we're using OnPush strategy
    this.cdr.detectChanges();
  }

  /**
   * Handles purchase request from selection summary component
   * Purchases tickets for all selected seats
   * Implements the POST /map/<map_id>/ticket requirement
   */
  onPurchaseSelectedSeats(): void {
    if (!this.mapId || this.selectedSeats.size === 0 || this.purchasing) {
      return;
    }

    this.purchasing = true;
    this.cdr.detectChanges();

    // Convert selected seats to coordinate array
    const selectedCoordinates = this.getSelectedCoordinates();
    const totalSeats = selectedCoordinates.length;
    let completedPurchases = 0;
    let successfulPurchases = 0;
    const failedPurchases: string[] = [];

    console.log(`Starting purchase process for ${totalSeats} seat(s)`);

    // Purchase each seat individually (as per API specification)
    selectedCoordinates.forEach((coord, _index) => {
      const request: AppTicketPurchaseInput = {
        x: coord.x,
        y: coord.y,
      };

      console.log(`Purchasing seat at coordinates (${coord.x}, ${coord.y})`);

      this.mapService
        .purchaseTicket(this.mapId!, request)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (response: AppTicketPurchaseOutput) => {
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
                this.seatMap.seats[coord.y][coord.x] = AppSeatStatus.RESERVED;
              }

              // Remove from selection
              const seatKey = `${coord.y}-${coord.x}`;
              this.selectedSeats.delete(seatKey);
              // Create new Set reference to trigger change detection in child components
              this.selectedSeats = new Set(this.selectedSeats);
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
      this.toastService.showSuccess(`تمام ${successCount} صندلی با موفقیت خریداری شد!`);
    } else if (successCount > 0 && failures.length > 0) {
      // Partial success
      this.toastService.showSuccess(`${successCount} صندلی با موفقیت خریداری شد.`);
      this.toastService.showError(`خطا در خرید ${failures.length} صندلی: ${failures.join(', ')}`);
    } else {
      // All purchases failed
      this.toastService.showError(`خطا در خرید تمام صندلی‌ها: ${failures.join(', ')}`);
    }

    this.cdr.detectChanges();
    console.log(
      `Purchase process completed: ${successCount} successful, ${failures.length} failed`
    );
  }
}
