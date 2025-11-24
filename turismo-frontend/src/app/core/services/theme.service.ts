// core/services/theme.service.ts
import { Injectable, inject } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { environment } from '../../../environments/environments';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  private darkModeKey = 'darkMode';
  private darkModeSubject = new BehaviorSubject<boolean>(this.getInitialDarkModeState());
  
  darkMode$ = this.darkModeSubject.asObservable();

  constructor() {
    // Apply theme immediately on service creation
    this.updateBodyClass(this.darkModeSubject.value);
    
    // Listen for system preference changes if possible
    if (window.matchMedia) {
      window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', e => {
        if (localStorage.getItem(this.darkModeKey) === null) {
          this.setDarkMode(e.matches);
        }
      });
    }
  }

  private getInitialDarkModeState(): boolean {
    const savedMode = localStorage.getItem(this.darkModeKey);
    if (savedMode !== null) {
      return savedMode === 'true';
    }
    
    // If no saved preference, use system preference or default config
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      return true;
    }
    
    return environment.defaultDarkMode || false;
  }

  toggleDarkMode(): void {
    this.setDarkMode(!this.darkModeSubject.value);
  }

  setDarkMode(value: boolean): void {
    localStorage.setItem(this.darkModeKey, String(value));
    this.darkModeSubject.next(value);
    this.updateBodyClass(value);
  }

  isDarkMode(): boolean {
    return this.darkModeSubject.value;
  }

  // Update class on the document element to apply global styles
  private updateBodyClass(isDarkMode: boolean): void {
    console.log('Updating theme to dark mode:', isDarkMode);
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }

  // Initialize theme when application starts
  initializeTheme(): void {
    console.log('Initializing theme, dark mode:', this.darkModeSubject.value);
    this.updateBodyClass(this.darkModeSubject.value);
  }
}