import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { MapService } from '../services/map.service';
import { AppMapIdList, AppSalon } from '../models';

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

  private loadSalons(): void {
    this.loading = true;
    this.error = null;

    this.mapService.getMapIds().subscribe({
      next: (mapIds: AppMapIdList) => {
        this.salons = mapIds.map((id, index) => ({
          // Add more properties just for better display
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

  onSalonSelect(salon: AppSalon): void {
    this.router.navigate(['/plan', salon.mapId]);
  }

  retry(): void {
    this.loadSalons();
  }

  trackBySalon(index: number, salon: AppSalon): string {
    return salon.id;
  }
}
