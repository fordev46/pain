import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { MapService } from '../services/map.service';
import { SeatMap, SeatStatus, Coordinates } from '../models';

/**
 * Component responsible for displaying and managing the stadium seat map
 * Handles seat visualization, selection, and coordinate logging
 * Implements efficient rendering for large maps (up to 100k+ seats)
 */
@Component({
  selector: 'app-plan',
  templateUrl: './plan.component.html',
  styleUrls: ['./plan.component.scss']
})
export class PlanComponent implements OnInit, OnDestroy {
  // Component state
  seatMap: SeatMap | null = null;
  loading = false;
  error: string | null = null;
  mapId: string | null = null;
  
  // Selected seats tracking
  selectedSeats: Set<string> = new Set();
  
  // Component lifecycle
  private destroy$ = new Subject<void>();

  // Expose SeatStatus enum to template
  readonly SeatStatus = SeatStatus;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private mapService: MapService
  ) { }

  ngOnInit(): void {
    // Get map ID from route parameters
    this.route.paramMap.pipe(
      takeUntil(this.destroy$)
    ).subscribe(params => {
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

    this.mapService.getSeatMap(mapId).pipe(
      takeUntil(this.destroy$)
    ).subscribe({
      next: (seatMap: SeatMap) => {
        this.seatMap = seatMap;
        this.loading = false;
        console.log(`Loaded seat map: ${seatMap.rows}x${seatMap.columns} (${seatMap.rows * seatMap.columns} seats)`);
      },
      error: (err) => {
        console.error('Error loading seat map:', err);
        this.error = 'خطا در بارگذاری نقشه صندلی‌ها. لطفا دوباره تلاش کنید.';
        this.loading = false;
      }
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
        return 'seat available';
      case SeatStatus.RESERVED:
        return 'seat reserved';
      case SeatStatus.SELECTED:
        return 'seat selected';
      default:
        return 'seat';
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
    console.log('All seat selections cleared');
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
   * @param seat Seat value
   * @returns Unique identifier for the seat
   */
  trackBySeat(index: number, seat: number): number {
    return index;
  }
}
