import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { ToastMessage } from 'src/app/shared';

@Injectable({
  providedIn: 'root',
})
export class ToastService {
  private toastsSubject = new BehaviorSubject<ToastMessage[]>([]);
  public toasts$ = this.toastsSubject.asObservable();

  private toastIdCounter = 0;

  showSuccess(message: string, duration: number = 5000): void {
    this.addToast({
      id: this.generateToastId(),
      message,
      type: 'success',
      duration,
    });
  }

  showError(message: string, duration: number = 8000): void {
    this.addToast({
      id: this.generateToastId(),
      message,
      type: 'error',
      duration,
    });
  }

  dismissToast(toastId: string): void {
    const currentToasts = this.toastsSubject.value;
    const updatedToasts = currentToasts.filter(toast => toast.id !== toastId);
    this.toastsSubject.next(updatedToasts);
  }

  private addToast(toast: ToastMessage): void {
    const currentToasts = this.toastsSubject.value;
    const updatedToasts = [...currentToasts, toast];
    this.toastsSubject.next(updatedToasts);

    if (toast.duration && toast.duration > 0) {
      setTimeout(() => {
        this.dismissToast(toast.id);
      }, toast.duration);
    }
  }

  private generateToastId(): string {
    return `toast-${++this.toastIdCounter}-${Date.now()}`;
  }
}
