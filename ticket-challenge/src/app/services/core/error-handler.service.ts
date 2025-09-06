import { Injectable } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { ToastService } from './toast.service';

/**
 * Service for handling errors and displaying appropriate toast notifications
 * Provides centralized error handling with user-friendly messages
 */
@Injectable({
  providedIn: 'root',
})
export class ErrorHandlerService {
  constructor(private toastService: ToastService) {}

  /**
   * Handles HTTP errors and displays appropriate toast messages
   * @param error The HTTP error response
   * @param context Optional context for more specific error messages
   */
  handleHttpError(error: HttpErrorResponse, context?: string): void {
    let errorMessage: string;

    if (error.error instanceof ErrorEvent) {
      // Client-side or network error
      errorMessage = `Network error: ${error.error.message}`;
    } else {
      // Server-side error
      switch (error.status) {
        case 400:
          errorMessage = 'Bad request. Please check your input and try again.';
          break;
        case 401:
          errorMessage = 'You are not authorized to perform this action.';
          break;
        case 403:
          errorMessage = 'Access forbidden. You do not have permission.';
          break;
        case 404:
          errorMessage = 'The requested resource was not found.';
          break;
        case 409:
          errorMessage = 'Conflict occurred. The resource may have been modified.';
          break;
        case 422:
          errorMessage = 'Invalid data provided. Please check your input.';
          break;
        case 429:
          errorMessage = 'Too many requests. Please wait and try again.';
          break;
        case 500:
          errorMessage = 'Internal server error. Please try again later.';
          break;
        case 502:
          errorMessage = 'Service temporarily unavailable. Please try again.';
          break;
        case 503:
          errorMessage = 'Service unavailable. Please try again later.';
          break;
        case 504:
          errorMessage = 'Request timeout. Please try again.';
          break;
        default:
          errorMessage = `An error occurred: ${error.status} ${error.statusText}`;
      }

      // Include server error message if available and meaningful
      if (error.error?.message && typeof error.error.message === 'string') {
        errorMessage += ` (${error.error.message})`;
      }
    }

    // Add context if provided
    if (context) {
      errorMessage = `${context}: ${errorMessage}`;
    }

    this.showError(errorMessage);
  }

  /**
   * Handles general errors (non-HTTP)
   * @param error The error object
   * @param context Optional context for the error
   */
  handleError(error: Error | string | unknown, context?: string): void {
    let errorMessage: string;

    if (error instanceof Error) {
      errorMessage = error.message;
    } else if (typeof error === 'string') {
      errorMessage = error;
    } else {
      errorMessage = 'An unexpected error occurred';
    }

    if (context) {
      errorMessage = `${context}: ${errorMessage}`;
    }

    this.showError(errorMessage);
  }

  /**
   * Shows a custom error message
   * @param message The error message to display
   * @param duration Optional duration in milliseconds
   */
  showError(message: string, duration?: number): void {
    this.toastService.showError(message, duration);
  }

  /**
   * Shows a network connectivity error
   */
  showNetworkError(): void {
    this.showError('Network connection lost. Please check your internet connection and try again.');
  }

  /**
   * Shows a validation error
   * @param fieldName The name of the field that failed validation
   * @param message Optional custom validation message
   */
  showValidationError(fieldName: string, message?: string): void {
    const errorMessage = message || `Please provide a valid ${fieldName}`;
    this.showError(errorMessage);
  }

  /**
   * Shows a timeout error
   * @param operation Optional operation that timed out
   */
  showTimeoutError(operation?: string): void {
    const message = operation
      ? `${operation} timed out. Please try again.`
      : 'Request timed out. Please try again.';
    this.showError(message);
  }

  /**
   * Shows a permission error
   * @param action Optional action that was denied
   */
  showPermissionError(action?: string): void {
    const message = action
      ? `You don't have permission to ${action}`
      : "You don't have permission to perform this action";
    this.showError(message);
  }
}
