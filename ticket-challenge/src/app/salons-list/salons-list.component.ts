import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { MapService } from '../services/map.service';
import { AppSalon } from '../models';

/**
 * Component responsible for displaying the list of available Iranian salons
 * Fetches salon data from the API and allows users to select a salon
 */
@Component({
  selector: 'app-salons-list',
  templateUrl: './salons-list.component.html',
  styleUrls: ['./salons-list.component.scss'],
})
export class SalonsListComponent implements OnInit {
  salons: AppSalon[] = [];
  loading = false;
  error: string | null = null;

  constructor(
    private mapService: MapService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadSalons();
  }

  /**
   * Loads the list of available Iranian salons from the API
   * Converts map IDs to salon objects with proper Iranian names for display
   */
  private loadSalons(): void {
    this.loading = true;
    this.error = null;

    this.mapService.getMapIds().subscribe({
      next: (mapIds: string[]) => {
        // Convert map IDs to salon objects with Iranian salon names
        this.salons = mapIds.map((id, index) => ({
          id: id,
          name: this.mapService.getStadiumNameBecauseIsWasNotInTheApi(id),
          mapId: id,
          image: `assets/bad-static-images-without-cdn/salon-${index + 1}.webp`,
        }));
        this.loading = false;
      },
      error: err => {
        console.error('Error loading salons:', err);
        this.error = 'خطا در بارگذاری ورزشگاه‌ها. لطفا دوباره تلاش کنید.';
        this.loading = false;
      },
    });
  }

  /**
   * Navigates to the plan view for the selected salon
   * @param salon The selected salon
   */
  onSalonSelect(salon: AppSalon): void {
    this.router.navigate(['/plan', salon.mapId]);
  }

  /**
   * Retries loading salons in case of error
   */
  retry(): void {
    this.loadSalons();
  }

  /**
   * TrackBy function for ngFor optimization
   * @param index Index of the item
   * @param salon Salon object
   * @returns Unique identifier for tracking
   */
  trackBySalon(index: number, salon: AppSalon): string {
    return salon.id;
  }
}
