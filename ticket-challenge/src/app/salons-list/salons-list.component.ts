import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { MapService } from '../services/map.service';
import { Stadium } from '../models';

/**
 * Component responsible for displaying the list of available stadiums
 * Fetches stadium data from the API and allows users to select a stadium
 * Implements random stadium selection as required
 */
@Component({
  selector: 'app-salons-list',
  templateUrl: './salons-list.component.html',
  styleUrls: ['./salons-list.component.scss']
})
export class SalonsListComponent implements OnInit {
  stadiums: Stadium[] = [];
  loading = false;
  error: string | null = null;

  constructor(
    private mapService: MapService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.loadStadiums();
  }

  /**
   * Loads the list of available stadiums from the API
   * Converts map IDs to Stadium objects for display
   */
  private loadStadiums(): void {
    this.loading = true;
    this.error = null;

    this.mapService.getMapIds().subscribe({
      next: (mapIds: string[]) => {
        // Convert map IDs to Stadium objects for better UX
        this.stadiums = mapIds.map((id, index) => ({
          id: id,
          name: `سالن ${this.convertToFarsiNumber(index + 1)}`,
          mapId: id
        }));
        this.loading = false;
      },
      error: (err) => {
        console.error('Error loading stadiums:', err);
        this.error = 'خطا در بارگذاری سالن‌ها. لطفا دوباره تلاش کنید.';
        this.loading = false;
      }
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
   * Implements the "pick one randomly" requirement
   * Selects a random stadium and navigates to its plan
   */
  selectRandomStadium(): void {
    if (this.stadiums.length === 0) {
      return;
    }

    this.mapService.getRandomMapId().subscribe({
      next: (randomMapId: string) => {
        this.router.navigate(['/plan', randomMapId]);
      },
      error: (err) => {
        console.error('Error selecting random stadium:', err);
        this.error = 'خطا در انتخاب سالن تصادفی.';
      }
    });
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

  /**
   * Converts English numbers to Farsi numbers for display
   * @param num Number to convert
   * @returns Farsi number string
   */
  private convertToFarsiNumber(num: number): string {
    const farsiDigits = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];
    return num.toString().replace(/\d/g, (digit) => farsiDigits[parseInt(digit)]);
  }
}
