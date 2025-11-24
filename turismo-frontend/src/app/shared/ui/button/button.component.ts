import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

type ButtonVariant = 'primary' | 'secondary' | 'danger' | 'success';
type ButtonSize = 'xs' | 'sm' | 'md' | 'lg';

@Component({
  selector: 'app-button',
  standalone: true,
  imports: [CommonModule],
  template: `
    <button
      [type]="type"
      [disabled]="disabled || loading"
      [ngClass]="[
        getVariantClasses(),
        getSizeClasses(),
        fullWidth ? 'w-full' : '',
        loading ? 'opacity-70 cursor-wait' : '',
        disabled ? 'opacity-50 cursor-not-allowed' : ''
      ]"
    >
      @if (loading) {
        <span class="inline-block mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"></span>
      }
      
      <ng-content></ng-content>
    </button>
  `,
})
export class ButtonComponent {
  @Input() variant: ButtonVariant = 'primary';
  @Input() size: ButtonSize = 'md';
  @Input() type: 'button' | 'submit' | 'reset' = 'button';
  @Input() disabled = false;
  @Input() loading = false;
  @Input() fullWidth = false;
  
  getVariantClasses(): string {
    const classes = {
      primary: 'bg-primary-600 text-white hover:bg-primary-700 focus:ring-primary-500',
      secondary: 'bg-gray-200 text-gray-800 hover:bg-gray-300 focus:ring-gray-400',
      danger: 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500',
      success: 'bg-green-600 text-white hover:bg-green-700 focus:ring-green-500'
    };
    
    return `${classes[this.variant]} focus:outline-none focus:ring-2 focus:ring-offset-2 transition-all duration-300`;
  }
  
  getSizeClasses(): string {
    const classes = {
      xs: 'px-2.5 py-1.5 text-xs rounded',
      sm: 'px-3 py-2 text-sm rounded-md',
      md: 'px-4 py-2 text-sm rounded-md',
      lg: 'px-4 py-2 text-base rounded-md'
    };
    
    return classes[this.size];
  }
}