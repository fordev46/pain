import { Component, Input, Output, EventEmitter, ChangeDetectionStrategy } from '@angular/core';
import { SeatMap } from '../../models';

/**
 * Component for the plan header containing navigation and stadium information
 * Displays stadium info, navigation controls, and seat status legend
 */
@Component({
  selector: 'app-plan-header',
  templateUrl: './plan-header.component.html',
  styleUrls: ['./plan-header.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PlanHeaderComponent {
  @Input() seatMap: SeatMap | null = null;
  @Input() selectedSeatCount = 0;

  @Output() backClicked = new EventEmitter<void>();

  /**
   * Handles back button click
   */
  onBackClick(): void {
    this.backClicked.emit();
  }
}
