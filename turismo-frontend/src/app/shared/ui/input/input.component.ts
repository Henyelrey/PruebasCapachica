import { Component, Input, forwardRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ControlValueAccessor, NG_VALUE_ACCESSOR, ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-input',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => InputComponent),
      multi: true
    }
  ],
  template: `
    <div class="mb-4">
      @if (label) {
        <label 
          [for]="id" 
          class="block text-sm font-medium text-gray-700 mb-1"
        >
          {{ label }}
        </label>
      }

      <input
        [type]="type"
        [id]="id"
        [placeholder]="placeholder"
        [disabled]="disabled"
        [value]="value"
        (input)="onChange($event)"
        (blur)="onTouched()"
        [ngClass]="{
          'border-red-500 focus:ring-red-500 focus:border-red-500': error,
          'bg-gray-100 cursor-not-allowed': disabled,
          'focus:ring-primary focus:border-primary border-gray-300': !error
        }"
        class="block w-full rounded-2xl border px-4 py-2 text-sm shadow-sm transition focus:outline-none focus:ring-2"
      />

      @if (error) {
        <p class="mt-1 text-xs text-red-500 font-medium">{{ error }}</p>
      } @else if (hint) {
        <p class="mt-1 text-xs text-gray-500">{{ hint }}</p>
      }
    </div>
  `,
})
export class InputComponent implements ControlValueAccessor {
  @Input() label = '';
  @Input() type = 'text';
  @Input() id = '';
  @Input() placeholder = '';
  @Input() error = '';
  @Input() hint = '';

  value = '';
  disabled = false;

  onChange: any = () => {};
  onTouched: any = () => {};

  writeValue(value: string): void {
    this.value = value;
  }

  registerOnChange(fn: any): void {
    this.onChange = (event: Event) => {
      const target = event.target as HTMLInputElement;
      fn(target.value);
    };
  }

  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }
}
