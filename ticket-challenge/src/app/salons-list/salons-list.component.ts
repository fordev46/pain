import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { MapService } from '../services/map.service';
import { Stadium } from '../models';

/**
 * Component responsible for displaying the list of available Iranian stadiums
 * Fetches stadium data from the API and allows users to select a stadium
 */
@Component({
  selector: 'app-salons-list',
  templateUrl: './salons-list.component.html',
  styleUrls: ['./salons-list.component.scss'],
})
export class SalonsListComponent implements OnInit {
  stadiums: Stadium[] = [];
  loading = false;
  error: string | null = null;

  constructor(
    private mapService: MapService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadStadiums();
  }

  /**
   * Loads the list of available Iranian stadiums from the API
   * Converts map IDs to Stadium objects with proper Iranian names for display
   */
  private loadStadiums(): void {
    this.loading = true;
    this.error = null;

    this.mapService.getMapIds().subscribe({
      next: (mapIds: string[]) => {
        // Convert map IDs to Stadium objects with Iranian stadium names
        this.stadiums = mapIds.map((id, index) => ({
          id: id,
          name: this.mapService.getStadiumName(id),
          mapId: id,
          image: `assets/bad-static-images-without-cdn/salon-${index + 1}.webp`,
        }));
        this.loading = false;
      },
      error: err => {
        console.error('Error loading stadiums:', err);
        this.error = 'خطا در بارگذاری ورزشگاه‌ها. لطفا دوباره تلاش کنید.';
        this.loading = false;
      },
    });
  }

  /**
   * Navigates to the plan view for the selected stadium
   * @param stadium The selected stadium
   */
  onStadiumSelect(stadium: Stadium): void {
    this.router.navigate(['/plan', stadium.mapId]);
  }

  /**
   * Retries loading stadiums in case of error
   */
  retry(): void {
    this.loadStadiums();
  }

  /**
   * TrackBy function for ngFor optimization
   * @param index Index of the item
   * @param stadium Stadium object
   * @returns Unique identifier for tracking
   */
  trackByStadium(index: number, stadium: Stadium): string {
    return stadium.id;
  }
}
