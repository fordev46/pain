import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { ToastMessage } from '../shared/toast/toast.component';

/**
 * Service for managing toast notifications
 * Provides methods to show different types of toasts and manage their lifecycle
 */
@Injectable({
  providedIn: 'root',
})
export class ToastService {
  private toastsSubject = new BehaviorSubject<ToastMessage[]>([]);
  public toasts$ = this.toastsSubject.asObservable();

  private toastIdCounter = 0;

  /**
   * Shows a success toast
   * @param message The message to display
   * @param duration Duration in milliseconds (default: 5000)
   */
  showSuccess(message: string, duration: number = 5000): void {
    this.addToast({
      id: this.generateToastId(),
      message,
      type: 'success',
      duration,
    });
  }

  /**
   * Shows an error toast
   * @param message The message to display
   * @param duration Duration in milliseconds (default: 8000)
   */
  showError(message: string, duration: number = 8000): void {
    this.addToast({
      id: this.generateToastId(),
      message,
      type: 'error',
      duration,
    });
  }

  /**
   * Shows a warning toast
   * @param message The message to display
   * @param duration Duration in milliseconds (default: 6000)
   */
  showWarning(message: string, duration: number = 6000): void {
    this.addToast({
      id: this.generateToastId(),
      message,
      type: 'warning',
      duration,
    });
  }

  /**
   * Shows an info toast
   * @param message The message to display
   * @param duration Duration in milliseconds (default: 4000)
   */
  showInfo(message: string, duration: number = 4000): void {
    this.addToast({
      id: this.generateToastId(),
      message,
      type: 'info',
      duration,
    });
  }

  /**
   * Dismisses a specific toast
   * @param toastId The ID of the toast to dismiss
   */
  dismissToast(toastId: string): void {
    const currentToasts = this.toastsSubject.value;
    const updatedToasts = currentToasts.filter(toast => toast.id !== toastId);
    this.toastsSubject.next(updatedToasts);
  }

  /**
   * Clears all toasts
   */
  clearAllToasts(): void {
    this.toastsSubject.next([]);
  }

  /**
   * Adds a toast to the current list
   * @param toast The toast to add
   */
  private addToast(toast: ToastMessage): void {
    const currentToasts = this.toastsSubject.value;
    const updatedToasts = [...currentToasts, toast];
    this.toastsSubject.next(updatedToasts);

    // Auto-dismiss after duration
    if (toast.duration && toast.duration > 0) {
      setTimeout(() => {
        this.dismissToast(toast.id);
      }, toast.duration);
    }
  }

  /**
   * Generates a unique toast ID
   * @returns A unique string ID
   */
  private generateToastId(): string {
    return `toast-${++this.toastIdCounter}-${Date.now()}`;
  }
}
