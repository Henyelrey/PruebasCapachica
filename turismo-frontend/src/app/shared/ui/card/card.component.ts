import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-card',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="bg-white rounded-lg shadow-md overflow-hidden">
      @if (title) {
        <div class="px-6 py-4 border-b border-gray-200">
          <h3 class="text-lg font-medium text-gray-900">{{ title }}</h3>
          @if (subtitle) {
            <p class="mt-1 text-sm text-gray-600">{{ subtitle }}</p>
          }
        </div>
      }
      
      <div class="px-6 py-4" [class.pt-6]="!title">
        <ng-content></ng-content>
      </div>
      
      @if (footerTemplate) {
        <div class="px-6 py-4 bg-gray-50 border-t border-gray-200">
          <ng-container [ngTemplateOutlet]="footerTemplate"></ng-container>
        </div>
      }
    </div>
  `,
})
export class CardComponent {
  @Input() title = '';
  @Input() subtitle = '';
  @Input() footerTemplate: any;
}