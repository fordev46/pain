import { Component, Input, Output, EventEmitter, ChangeDetectionStrategy } from '@angular/core';

export interface ToastMessage {
  id: string;
  message: string;
  type: 'success' | 'error' | 'warning' | 'info';
  duration?: number;
}

/**
 * Toast component for displaying temporary notification messages
 * Supports different types: success, error, warning, info
 */
@Component({
  selector: 'app-toast',
  templateUrl: './toast.component.html',
  styleUrls: ['./toast.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ToastComponent {
  @Input() toasts: ToastMessage[] = [];
  @Output() dismissToast = new EventEmitter<string>();

  /**
   * Handles toast dismissal
   * @param toastId The ID of the toast to dismiss
   */
  onDismissToast(toastId: string): void {
    this.dismissToast.emit(toastId);
  }

  /**
   * Gets the appropriate icon for the toast type
   * @param type The toast type
   * @returns Icon string for the toast type
   */
  getToastIcon(type: ToastMessage['type']): string {
    switch (type) {
      case 'success':
        return '✓';
      case 'error':
        return '✕';
      case 'warning':
        return '⚠';
      case 'info':
        return 'ℹ';
      default:
        return 'ℹ';
    }
  }

  /**
   * TrackBy function for toast list
   * @param index The index of the toast
   * @param toast The toast item
   * @returns The unique identifier for the toast
   */
  trackByToastId(index: number, toast: ToastMessage): string {
    return toast.id;
  }
}
