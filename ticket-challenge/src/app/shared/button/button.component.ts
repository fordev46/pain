import { Component, Input, Output, EventEmitter, ChangeDetectionStrategy } from '@angular/core';

export type ButtonVariant = 'primary' | 'success' | 'danger' | 'ghost';
export type ButtonSize = 'small' | 'medium';

/**
 * General Angular Button Component
 * Provides a reusable button with different variants, sizes, and states
 */
@Component({
  selector: 'app-button',
  templateUrl: './button.component.html',
  styleUrls: ['./button.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ButtonComponent {
  /** Button text or content */
  @Input() text: string = '';

  /** Button variant for styling */
  @Input() variant: ButtonVariant = 'primary';

  /** Button size */
  @Input() size: ButtonSize = 'medium';

  /** Whether the button is disabled */
  @Input() disabled: boolean = false;

  /** Whether the button is in loading state */
  @Input() loading: boolean = false;

  /** Loading text to show when loading */
  @Input() loadingText: string = 'در حال بارگذاری...';

  /** Whether the button should take full width */
  @Input() fullWidth: boolean = false;

  /** Accessibility label */
  @Input() ariaLabel: string = '';

  /** Title attribute for tooltip */
  @Input() title: string = '';

  /** Click event emitter */
  @Output() clicked = new EventEmitter<Event>();

  /**
   * Handles button click events
   */
  onClick(event: Event): void {
    if (!this.disabled && !this.loading) {
      this.clicked.emit(event);
    }
  }

  /**
   * Gets computed CSS classes for the button
   */
  getButtonClasses(): string {
    const classes = ['app-button', `app-button--${this.variant}`, `app-button--${this.size}`];

    if (this.disabled) {
      classes.push('app-button--disabled');
    }

    if (this.loading) {
      classes.push('app-button--loading');
    }

    if (this.fullWidth) {
      classes.push('app-button--full-width');
    }

    return classes.join(' ');
  }
}
