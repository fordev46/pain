import { Component, Input, Output, EventEmitter, ChangeDetectionStrategy } from '@angular/core';

/**
 * Component for displaying purchase success and error messages
 * Provides user feedback for purchase operations
 */
@Component({
  selector: 'app-purchase-messages',
  templateUrl: './purchase-messages.component.html',
  styleUrls: ['./purchase-messages.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PurchaseMessagesComponent {
  @Input() successMessage: string | null = null;
  @Input() errorMessage: string | null = null;

  @Output() dismissMessages = new EventEmitter<void>();

  /**
   * Handles message dismissal
   */
  onDismissMessages(): void {
    this.dismissMessages.emit();
  }
}
