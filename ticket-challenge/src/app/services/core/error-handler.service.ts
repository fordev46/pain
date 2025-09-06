import { Injectable } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { ToastService } from '../toast.service';

/**
 * This service acts as a unified error management system that handles both HTTP errors
 * and general application errors. It processes errors, translates them into user-friendly
 * Persian messages, and displays them using toast notifications.
 * @example
 * ```typescript
 * // Handle HTTP error
 * this.errorHandler.handleHttpError(httpError, 'Loading salon data');
 *
 * // Handle general error
 * this.errorHandler.handleError(new Error('Something went wrong'), 'User action');
 *
 * // Show custom error message
 * this.errorHandler.showError('Custom error message');
 * ```
 */
@Injectable({
  providedIn: 'root',
})
export class ErrorHandlerService {
  constructor(private toastService: ToastService) {}

  handleHttpError(error: HttpErrorResponse, context?: string): void {
    let errorMessage: string;

    if (error.error instanceof ErrorEvent) {
      errorMessage = `خطای شبکه: ${error.error.message}`;
    } else {
      // Server-side error
      switch (error.status) {
        case 400:
          errorMessage = 'درخواست نامعتبر. لطفاً ورودی خود را بررسی کرده و دوباره تلاش کنید.';
          break;
        case 401:
          errorMessage = 'شما مجاز به انجام این عمل نیستید.';
          break;
        case 403:
          errorMessage = 'دسترسی ممنوع. شما مجوز لازم را ندارید.';
          break;
        case 404:
          errorMessage = 'منبع درخواستی یافت نشد.';
          break;
        case 409:
          errorMessage = 'تداخل رخ داده است. ممکن است منبع تغییر کرده باشد.';
          break;
        case 422:
          errorMessage = 'داده‌های نامعتبر ارائه شده است. لطفاً ورودی خود را بررسی کنید.';
          break;
        case 429:
          errorMessage = 'درخواست‌های بیش از حد. لطفاً صبر کرده و دوباره تلاش کنید.';
          break;
        case 500:
          errorMessage = 'خطای داخلی سرور. لطفاً بعداً دوباره تلاش کنید.';
          break;
        case 502:
          errorMessage = 'سرویس موقتاً در دسترس نیست. لطفاً دوباره تلاش کنید.';
          break;
        case 503:
          errorMessage = 'سرویس در دسترس نیست. لطفاً بعداً دوباره تلاش کنید.';
          break;
        case 504:
          errorMessage = 'زمان درخواست تمام شد. لطفاً دوباره تلاش کنید.';
          break;
        default:
          errorMessage = `خطایی رخ داد: ${error.status} ${error.statusText}`;
      }

      if (error.error?.message && typeof error.error.message === 'string') {
        errorMessage += ` (${error.error.message})`;
      }
    }

    if (context) {
      errorMessage = `${context}: ${errorMessage}`;
    }

    this.showError(errorMessage);
  }

  handleError(error: Error | string | unknown, context?: string): void {
    let errorMessage: string;

    if (error instanceof Error) {
      errorMessage = error.message;
    } else if (typeof error === 'string') {
      errorMessage = error;
    } else {
      errorMessage = 'خطای غیرمنتظره‌ای رخ داد';
    }

    if (context) {
      errorMessage = `${context}: ${errorMessage}`;
    }

    this.showError(errorMessage);
  }

  showError(message: string, duration?: number): void {
    this.toastService.showError(message, duration);
  }
}
