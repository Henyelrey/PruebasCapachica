import { Component, Input, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ThemeService } from '../../../core/services/theme.service';

@Component({
  selector: 'app-admin-header',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="relative overflow-hidden bg-gradient-to-r from-primary-600 to-primary-800 dark:from-primary-700 dark:to-primary-900 transition-colors duration-300">
      <!-- Patrón de fondo con animación sutil -->
      <div class="absolute inset-0 opacity-10 bg-pattern"></div>
      
      <!-- Efecto de puntos/círculos decorativos (solo visibles en pantallas más grandes) -->
      <div class="absolute top-0 right-0 hidden lg:block">
        <div class="w-48 h-48 rounded-full bg-white dark:bg-gray-800 opacity-5 -translate-y-20 translate-x-10"></div>
      </div>
      <div class="absolute bottom-0 left-0 hidden lg:block">
        <div class="w-32 h-32 rounded-full bg-white dark:bg-gray-800 opacity-5 translate-y-10 -translate-x-10"></div>
      </div>
      
      <!-- Contenido principal del header -->
      <div class="container mx-auto px-4 py-6 lg:py-8">
        <div class="flex flex-col md:flex-row md:items-center md:justify-between">
          <!-- Título y subtítulo con ícono decorativo -->
          <div class="flex items-center mb-4 md:mb-0">
            
            
            <div class="ml-4">
              <h1 class="text-2xl md:text-3xl font-bold text-white tracking-tight">
                {{ title }}
                <div class="h-1 w-10 bg-white/40 dark:bg-white/30 rounded mt-1"></div>
              </h1>
              <p class="text-white/80 dark:text-white/70 mt-1 text-sm md:text-base font-light">{{ subtitle }}</p>
            </div>
          </div>
          
          <!-- Contenido adicional (slot para acciones) -->
          <div class="flex items-center justify-start md:justify-end space-x-2">
            <ng-content></ng-content>
            @if(showThemeToggle) {
              <button 
                (click)="toggleTheme()" 
                class="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-white/30"
                aria-label="Cambiar tema"
              >
                @if(isDarkMode()) {
                  <!-- Ícono de sol para modo claro -->
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                } @else {
                  <!-- Ícono de luna para modo oscuro -->
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                  </svg>
                }
              </button>
            }
          </div>
        </div>
      </div>
      
      <!-- Franja inferior con degradado más oscuro para transición suave -->
      <div class="h-3 bg-gradient-to-b from-transparent to-primary-900/20 dark:to-black/20"></div>
    </div>
  `,
  styles: [`
    :host {
      display: block;
    }
    
    .bg-pattern {
      background-image: url("data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M11 18c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm48 25c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm-43-7c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm63 31c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM34 90c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm56-76c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM12 86c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm28-65c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm23-11c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-6 60c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm29 22c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zM32 63c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm57-13c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-9-21c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM60 91c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM35 41c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM12 60c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2z' fill='%23ffffff' fill-opacity='1' fill-rule='evenodd'/%3E%3C/svg%3E");
      animation: subtleMovement 60s linear infinite;
    }

    @keyframes subtleMovement {
      0% {
        background-position: 0 0;
      }
      100% {
        background-position: 100px 100px;
      }
    }
  `]
})
export class AdminHeaderComponent {
  @Input() title: string = 'Panel de Administración';
  @Input() subtitle: string = 'Gestiona los recursos del sistema';
  @Input() profileImage: string | null = null;
  @Input() showThemeToggle: boolean = true;
  
  private themeService = inject(ThemeService);
  
  isDarkMode(): boolean {
    return this.themeService.isDarkMode();
  }
  
  toggleTheme(): void {
    this.themeService.toggleDarkMode();
  }
}