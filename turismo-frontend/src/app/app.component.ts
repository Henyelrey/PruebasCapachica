import { Component, inject, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ThemeService } from './core/services/theme.service';
import { CommonModule } from '@angular/common';
import { NotificationComponent } from './shared/components/alert/notification.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, NotificationComponent],
  template: `<app-notifications></app-notifications><router-outlet></router-outlet>`,
})
export class AppComponent implements OnInit {
  private themeService = inject(ThemeService);

  ngOnInit() {
    // Initialize theme when the application starts
    console.log('App component initializing...');
    this.themeService.initializeTheme();
  }
}
