import { Component, inject, OnInit, OnDestroy, ElementRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-seleccion-panel',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="min-h-screen relative flex items-center justify-center p-2 sm:p-4 overflow-hidden" #container>
      <!-- Partículas flotantes animadas -->
      <div class="absolute inset-0 overflow-hidden pointer-events-none">
        <div *ngFor="let particle of particles"
             class="absolute rounded-full opacity-20 animate-float"
             [style.left.px]="particle.x"
             [style.top.px]="particle.y"
             [style.width.px]="particle.size"
             [style.height.px]="particle.size"
             [style.background]="particle.color"
             [style.animation-delay]="particle.delay + 's'"
             [style.animation-duration]="particle.duration + 's'">
        </div>
      </div>

      <!-- Fondo hero con imagen y overlay dinámico -->
      <div class="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1500&q=80')] bg-cover bg-center transform-gpu">
        <!-- Overlay dinámico con gradiente animado -->
        <div class="absolute inset-0 bg-gradient-to-br from-orange-400/20 via-amber-300/15 to-yellow-300/25 dark:from-blue-900/80 dark:via-indigo-900/70 dark:to-blue-800/80 backdrop-blur-md transition-all duration-1000 animate-gradient-shift"></div>

        <!-- Efectos de luz mejorados con movimiento -->
        <div class="absolute top-0 left-0 w-96 h-96 bg-gradient-to-br from-orange-300/30 to-amber-300/20 dark:from-blue-400/40 dark:to-indigo-400/20 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2 transition-all duration-1000 animate-pulse-slow animate-drift-1"></div>
        <div class="absolute bottom-0 right-0 w-80 h-80 bg-gradient-to-tr from-amber-400/30 to-orange-400/20 dark:from-indigo-400/30 dark:to-blue-400/20 rounded-full blur-2xl translate-x-1/3 translate-y-1/3 transition-all duration-1000 animate-pulse-slow animate-drift-2"></div>
        <div class="absolute top-1/2 left-1/2 w-64 h-64 bg-gradient-to-r from-yellow-300/20 to-orange-300/15 dark:from-cyan-400/25 dark:to-blue-400/15 rounded-full blur-2xl -translate-x-1/2 -translate-y-1/2 transition-all duration-1000 animate-drift-3"></div>
      </div>

      <!-- Tarjeta central con efectos mejorados -->
      <div class="relative w-full max-w-4xl mx-auto rounded-3xl shadow-2xl border border-orange-500/60 dark:border-blue-400/40 bg-white/15 dark:bg-gray-900/30 backdrop-blur-2xl animate-fade-in-up transition-all duration-700 hover:shadow-3xl transform-gpu"
           [class.scale-105]="isHovering"
           (mouseenter)="onCardHover(true)"
           (mouseleave)="onCardHover(false)">

        <div class="p-4 sm:p-6 lg:p-8">
          <!-- Header con animación de texto -->
          <div class="text-center mb-6 sm:mb-8">
            <h2 class="text-2xl sm:text-3xl lg:text-4xl font-extrabold bg-gradient-to-r from-orange-600 to-amber-600 dark:from-blue-300 dark:to-cyan-300 bg-clip-text text-transparent drop-shadow-lg animate-slide-in-down transition-all duration-700 animate-text-shimmer">
              Bienvenido, {{ userName }}
            </h2>
            <p class="text-base sm:text-lg text-gray-900 dark:text-gray-200 mt-2 animate-fade-in transition-colors duration-700"
               [style.animation-delay]="'0.3s'">
              Selecciona dónde quieres ir
            </p>

            <!-- Línea decorativa animada -->
            <div class="mt-4 mx-auto w-24 h-1 bg-gradient-to-r from-orange-500 to-amber-500 dark:from-blue-400 dark:to-cyan-400 rounded-full animate-expand"></div>
          </div>

          <!-- Grid de opciones con efectos mejorados -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 lg:gap-8">
            <!-- Panel de Administración -->
            <div
              class="group relative bg-white/40 dark:bg-gray-800/30 border border-orange-500/60 dark:border-blue-400/40 rounded-2xl p-4 sm:p-6 shadow-xl hover:shadow-2xl transition-all duration-500 cursor-pointer flex flex-col items-center animate-fade-in-left overflow-hidden transform-gpu"
              [style.animation-delay]="'0.5s'"
              (click)="navigateTo('/dashboard')"
              (mouseenter)="onOptionHover('admin', true)"
              (mouseleave)="onOptionHover('admin', false)">

              <!-- Efecto de onda al hover -->
              <div class="absolute inset-0 bg-gradient-to-r from-orange-500/10 to-amber-500/10 dark:from-blue-500/10 dark:to-cyan-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500 animate-pulse"></div>

              <!-- Brillo en las esquinas -->
              <div class="absolute top-0 left-0 w-full h-full opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                <div class="absolute top-2 left-2 w-6 h-6 bg-gradient-to-br from-white/30 to-transparent rounded-full animate-ping"></div>
                <div class="absolute bottom-2 right-2 w-4 h-4 bg-gradient-to-tl from-white/20 to-transparent rounded-full animate-ping" style="animation-delay: 0.2s;"></div>
              </div>

              <div class="relative z-10 flex justify-center mb-4">
                <div class="w-16 h-16 sm:w-18 sm:h-18 lg:w-20 lg:h-20 bg-gradient-to-br from-orange-200/70 to-amber-200/70 dark:from-blue-500/70 dark:to-cyan-500/70 rounded-full flex items-center justify-center shadow-lg group-hover:scale-110 transition-all duration-500"
                    [class.animate-float-medium]="hoveredOption !== 'admin'"
                    [class.animate-spin-medium]="hoveredOption === 'admin'">
                  <svg xmlns="http://www.w3.org/2000/svg"
                       class="h-8 w-8 sm:h-9 sm:w-9 lg:h-10 lg:w-10 text-orange-600 dark:text-blue-100 transition-colors duration-500"
                       fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                          d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                  </svg>
                </div>
              </div>
              <h3 class="relative z-10 text-lg sm:text-xl font-bold text-orange-800 dark:text-blue-300 text-center mb-2 transition-all duration-500 group-hover:scale-105">
                Panel de Administración
              </h3>
              <p class="relative z-10 text-sm sm:text-base text-slate-800 dark:text-white text-center mb-3 sm:mb-4 transition-colors duration-500">
                Accede a las funciones completas de administración con todas las herramientas del sistema.
              </p>

              <button class="relative z-10 mt-auto px-4 sm:px-6 py-2 sm:py-3 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 dark:from-blue-600 dark:to-cyan-600 text-white font-bold shadow-lg hover:from-orange-600 hover:to-amber-600 dark:hover:from-blue-700 dark:hover:to-cyan-700 transition-all duration-500 active:scale-95 transform hover:scale-105 text-sm sm:text-base animate-button-glow">
                <span class="relative z-10">Ir al Panel</span>
                <div class="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-300 rounded-xl animate-shimmer"></div>
              </button>
            </div>

            <!-- Gestión de Emprendimientos -->
            <div
              class="group relative bg-white/40 dark:bg-gray-800/30 border border-amber-400/40 dark:border-cyan-400/40 rounded-2xl p-4 sm:p-6 shadow-xl hover:shadow-2xl transition-all duration-500 cursor-pointer flex flex-col items-center animate-fade-in-right overflow-hidden transform-gpu"
              [style.animation-delay]="'0.7s'"
              (click)="navigateTo('/mis-emprendimientos')"
              (mouseenter)="onOptionHover('business', true)"
              (mouseleave)="onOptionHover('business', false)">

              <!-- Efecto de onda al hover -->
              <div class="absolute inset-0 bg-gradient-to-r from-amber-500/10 to-orange-500/10 dark:from-cyan-500/10 dark:to-blue-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500 animate-pulse"></div>

              <!-- Brillo en las esquinas -->
              <div class="absolute top-0 left-0 w-full h-full opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                <div class="absolute top-2 right-2 w-6 h-6 bg-gradient-to-bl from-white/30 to-transparent rounded-full animate-ping"></div>
                <div class="absolute bottom-2 left-2 w-4 h-4 bg-gradient-to-tr from-white/20 to-transparent rounded-full animate-ping" style="animation-delay: 0.3s;"></div>
              </div>

              <div class="relative z-10 flex justify-center mb-4">
                <div class="w-16 h-16 sm:w-18 sm:h-18 lg:w-20 lg:h-20 bg-gradient-to-br from-amber-200/70 to-orange-200/70 dark:from-cyan-500/70 dark:to-blue-500/70 rounded-full flex items-center justify-center shadow-lg group-hover:scale-110 transition-all duration-500"
                    [class.animate-sway-gentle]="hoveredOption !== 'business'"
                    [class.animate-building-shake]="hoveredOption === 'business'">
                  <svg xmlns="http://www.w3.org/2000/svg"
                       class="h-8 w-8 sm:h-9 sm:w-9 lg:h-10 lg:w-10 text-amber-600 dark:text-cyan-100 transition-colors duration-500"
                       fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                          d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                </div>
              </div>
              <h3 class="relative z-10 text-lg sm:text-xl font-bold text-amber-800 dark:text-cyan-300 text-center mb-2 transition-all duration-500 group-hover:scale-105">
                Gestión de Emprendimientos
              </h3>
              <p class="relative z-10 text-sm sm:text-base text-slate-800 dark:text-white text-center mb-3 sm:mb-4 transition-colors duration-500">
                Administra tus emprendimientos, servicios y reservas de forma fácil y eficiente.
              </p>

              <button class="relative z-10 mt-auto px-4 sm:px-6 py-2 sm:py-3 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 dark:from-cyan-600 dark:to-blue-600 text-white font-bold shadow-lg hover:from-amber-600 hover:to-orange-600 dark:hover:from-cyan-700 dark:hover:to-blue-700 transition-all duration-500 active:scale-95 transform hover:scale-105 text-sm sm:text-base animate-button-glow">
                <span class="relative z-10">Ir a Emprendimientos</span>
                <div class="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-300 rounded-xl animate-shimmer"></div>
              </button>
            </div>
          </div>
          <!-- Botón para regresar al Home mejorado -->
          <div class="mt-6 sm:mt-8 text-center animate-fade-in-up" [style.animation-delay]="'0.9s'">
            <button
              (click)="navigateToHome()"
              class="relative inline-flex items-center px-6 sm:px-8 py-3 sm:py-4 rounded-2xl bg-gradient-to-r from-orange-500 to-amber-500 dark:from-blue-600 dark:to-cyan-600 text-white font-bold shadow-xl hover:from-orange-600 hover:to-amber-600 dark:hover:from-blue-700 dark:hover:to-cyan-700 transition-all duration-500 transform hover:scale-105 active:scale-95 group overflow-hidden">

              <!-- Efecto de ondas -->
              <div class="absolute inset-0 bg-gradient-to-r from-white/20 via-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 animate-wave"></div>

              <svg xmlns="http://www.w3.org/2000/svg"
                   class="h-5 w-5 sm:h-6 sm:w-6 mr-2 sm:mr-3 group-hover:-translate-x-1 transition-transform duration-300 relative z-10"
                   fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                      d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>

              <span class="text-base sm:text-lg relative z-10">Regresar al Home</span>

              <svg xmlns="http://www.w3.org/2000/svg"
                   class="h-5 w-5 sm:h-6 sm:w-6 ml-2 sm:ml-3 group-hover:translate-x-1 transition-transform duration-300 relative z-10"
                   fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                      d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>

              <!-- Partículas en el botón -->
              <div class="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                <div class="absolute top-1 left-4 w-1 h-1 bg-white rounded-full animate-ping"></div>
                <div class="absolute top-3 right-6 w-1 h-1 bg-white rounded-full animate-ping" style="animation-delay: 0.2s;"></div>
                <div class="absolute bottom-2 left-1/3 w-1 h-1 bg-white rounded-full animate-ping" style="animation-delay: 0.4s;"></div>
              </div>
            </button>

            <div class="mt-4 sm:mt-5 flex items-center justify-center animate-fade-in" [style.animation-delay]="'1.1s'">
              <div class="relative bg-white/20 dark:bg-gray-800/20 backdrop-blur-sm border border-orange-300/30 dark:border-blue-300/30 rounded-xl px-4 py-3 shadow-lg group hover:scale-105 transition-all duration-300">
                <!-- Icono informativo -->
                <div class="flex items-center space-x-3">
                  <div class="flex-shrink-0">
                    <svg class="w-5 h-5 text-orange-600 dark:text-blue-400 animate-pulse-gentle" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                    </svg>
                  </div>
                  <p class="text-sm sm:text-base text-slate-900 dark:text-white font-medium leading-relaxed">
                    Puedes cambiar entre paneles en cualquier momento desde el
                    <span class="font-bold text-orange-900 dark:text-blue-300 relative">
                      menú lateral
                      <div class="absolute -bottom-1 left-0 w-full h-0.5 bg-gradient-to-r from-orange-500 to-amber-500 dark:from-blue-400 dark:to-cyan-400 rounded-full animate-expand"></div>
                    </span>
                  </p>
                </div>

                <!-- Efecto de brillo sutil -->
                <div class="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-xl animate-shimmer"></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Botón Día/Noche mejorado con efectos -->
      <button
        (click)="toggleDarkMode()"
        class="fixed top-6 right-6 z-50 p-4 rounded-full bg-gradient-to-br from-orange-400 to-amber-500 dark:from-blue-500 dark:to-cyan-500 shadow-xl text-white hover:scale-110 transition-all duration-500 transform hover:rotate-12 active:scale-95 animate-float-button group"
        [attr.aria-label]="isDarkMode ? 'Modo Día' : 'Modo Noche'">

        <!-- Aura del botón -->
        <div class="absolute inset-0 rounded-full bg-gradient-to-br from-orange-400/50 to-amber-500/50 dark:from-blue-500/50 dark:to-cyan-500/50 blur-md opacity-0 group-hover:opacity-100 transition-opacity duration-500 animate-pulse"></div>

        <div class="relative z-10">
          <ng-container *ngIf="isDarkMode; else sunIcon">
            <svg class="h-7 w-7 transition-all duration-500 text-blue-100 animate-pulse-gentle"
                 fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M21 12.79A9 9 0 1111.21 3a7 7 0 009.79 9.79z" />
            </svg>
          </ng-container>

          <ng-template #sunIcon>
            <svg class="h-7 w-7 transition-all duration-500 animate-spin-very-slow"
                 fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <circle cx="12" cy="12" r="5" stroke-width="2" />
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M12 1v2m0 18v2m9-9h2M1 12H3m15.364-6.364l1.414 1.414M4.222 19.778l1.414-1.414M19.778 19.778l-1.414-1.414M4.222 4.222l1.414 1.414" />
            </svg>
          </ng-template>
        </div>

        <!-- Rayos de luz -->
        <div class="absolute inset-0 opacity-0 group-hover:opacity-30 transition-opacity duration-500">
          <div class="absolute top-0 left-1/2 w-0.5 h-8 bg-white transform -translate-x-1/2 -translate-y-4 animate-pulse"></div>
          <div class="absolute bottom-0 left-1/2 w-0.5 h-8 bg-white transform -translate-x-1/2 translate-y-4 animate-pulse"></div>
          <div class="absolute left-0 top-1/2 w-8 h-0.5 bg-white transform -translate-y-1/2 -translate-x-4 animate-pulse"></div>
          <div class="absolute right-0 top-1/2 w-8 h-0.5 bg-white transform -translate-y-1/2 translate-x-4 animate-pulse"></div>
        </div>
      </button>

      <!-- Indicador de tema mejorado -->
      <div class="fixed bottom-6 left-6 z-50 px-4 py-2 rounded-full bg-white/40 dark:bg-gray-900/30 backdrop-blur-md border border-orange-400/30 dark:border-blue-400/30 transition-all duration-500 animate-slide-in-left group hover:scale-105">
        <span class="text-sm font-medium text-orange-800 dark:text-blue-300 transition-colors duration-500 group-hover:animate-pulse">
          {{ isDarkMode ? '🌙 Modo Oscuro' : '☀️ Modo Claro' }}
        </span>

        <!-- Indicador de estado -->
        <div class="absolute -top-1 -right-1 w-3 h-3 rounded-full transition-all duration-500"
             [class]="isDarkMode ? 'bg-blue-400 animate-pulse' : 'bg-orange-400 animate-bounce-subtle'"></div>
      </div>

      <!-- Elementos decorativos adicionales -->
      <div class="fixed top-1/4 left-4 w-2 h-2 bg-orange-400/30 dark:bg-blue-400/30 rounded-full animate-ping" style="animation-delay: 1s;"></div>
      <div class="fixed top-3/4 right-8 w-1 h-1 bg-amber-400/40 dark:bg-cyan-400/40 rounded-full animate-ping" style="animation-delay: 2s;"></div>
      <div class="fixed top-1/2 left-12 w-1.5 h-1.5 bg-yellow-400/20 dark:bg-indigo-400/20 rounded-full animate-pulse" style="animation-delay: 3s;"></div>
    </div>
  `,
  styles: [`
    :host {
      display: block;
    }

    /* Animaciones existentes mejoradas */
    @keyframes float-medium {
      0%, 100% { transform: translateY(0px) rotate(0deg); }
      25% { transform: translateY(-4px) rotate(1deg); }
      50% { transform: translateY(-8px) rotate(0deg); }
      75% { transform: translateY(-4px) rotate(-1deg); }
    }

    @keyframes spin-medium {
      0% { transform: rotate(0deg) scale(1); }
      25% { transform: rotate(90deg) scale(1.05); }
      50% { transform: rotate(180deg) scale(1); }
      75% { transform: rotate(270deg) scale(1.05); }
      100% { transform: rotate(360deg) scale(1); }
    }

    @keyframes sway-gentle {
      0%, 100% { transform: translateX(0px) rotate(0deg); }
      25% { transform: translateX(-3px) rotate(-2deg); }
      50% { transform: translateX(0px) rotate(0deg); }
      75% { transform: translateX(3px) rotate(2deg); }
    }

    @keyframes building-shake {
      0%, 100% { transform: translateY(0px) rotate(0deg); }
      10% { transform: translateY(-2px) rotate(1deg); }
      20% { transform: translateY(0px) rotate(0deg); }
      30% { transform: translateY(-1px) rotate(-1deg); }
      40% { transform: translateY(0px) rotate(0deg); }
      50% { transform: translateY(-3px) rotate(2deg); }
      60% { transform: translateY(0px) rotate(0deg); }
      70% { transform: translateY(-1px) rotate(-1deg); }
      80% { transform: translateY(0px) rotate(0deg); }
      90% { transform: translateY(-2px) rotate(1deg); }
    }

    /* Aplicar las nuevas animaciones */
    .animate-float-medium { animation: float-medium 2s ease-in-out infinite; }
    .animate-spin-medium { animation: spin-medium 2s ease-in-out infinite; }
    .animate-sway-gentle { animation: sway-gentle 2s ease-in-out infinite; }
    .animate-building-shake { animation: building-shake 1.5s ease-in-out infinite; }

    /* Mejoras de accesibilidad */
    .group:focus-visible {
      outline: 2px solid theme('colors.orange.400');
      outline-offset: 2px;
    }

    .dark .group:focus-visible {
      outline-color: theme('colors.blue.400');
    }

    /* Transiciones suaves para cambios de tema */
    * {
      transition-property: color, background-color, border-color, text-decoration-color, fill, stroke, opacity, transform;
      transition-duration: 500ms;
      transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
    }

    /* Efectos de hover más avanzados */
    .group:hover .animate-bounce-subtle {
      animation-duration: 1s;
    }

    /* Optimizaciones de rendimiento */
    .transform-gpu {
      transform: translateZ(0);
      backface-visibility: hidden;
      perspective: 1000px;
    }

    /* Responsive animations */
    @media (prefers-reduced-motion: reduce) {
      * {
        animation-duration: 0.01ms !important;
        animation-iteration-count: 1 !important;
        transition-duration: 0.01ms !important;
      }
    }

    /* Shadow variations */
    .shadow-3xl {
      box-shadow: 0 35px 60px -12px rgba(0, 0, 0, 0.25);
    }

    /* Glassmorphism effects */
    .backdrop-blur-2xl {
      backdrop-filter: blur(40px);
    }

    /* Custom gradients for dark mode */
    .dark .animate-button-glow {
      animation: button-glow 2s ease-in-out infinite;
      box-shadow: 0 0 10px rgba(59, 130, 246, 0.4);
    }

    .dark .animate-button-glow:hover {
      box-shadow: 0 0 25px rgba(59, 130, 246, 0.7);
    }
  `]
})
export class SeleccionPanelComponent implements OnInit, OnDestroy {
  @ViewChild('container', { static: true }) container!: ElementRef;

  private router = inject(Router);
  private authService = inject(AuthService);
  private animationFrame: number = 0;
  private particleAnimationFrame: number = 0;

  isDarkMode = false;
  isHovering = false;
  hoveredOption: string | null = null;
  particles: Array<{
    x: number;
    y: number;
    size: number;
    color: string;
    delay: number;
    duration: number;
    vx: number;
    vy: number;
  }> = [];

  constructor() {
    // Verificar tema guardado
    const saved = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

    if (saved === 'dark' || (!saved && prefersDark)) {
      this.isDarkMode = true;
      document.documentElement.classList.add('dark');
    } else {
      this.isDarkMode = false;
      document.documentElement.classList.remove('dark');
    }

    // Generar partículas iniciales
    this.generateParticles();
  }

  ngOnInit(): void {
    // Iniciar animación de partículas
    this.animateParticles();

    // Efecto de entrada suave
    setTimeout(() => {
      if (this.container) {
        this.container.nativeElement.classList.add('opacity-100');
      }
    }, 100);
  }

  ngOnDestroy(): void {
    if (this.animationFrame) {
      cancelAnimationFrame(this.animationFrame);
    }
    if (this.particleAnimationFrame) {
      cancelAnimationFrame(this.particleAnimationFrame);
    }
  }

  get userName(): string {
    return this.authService.currentUser()?.name || 'Usuario';
  }

  generateParticles(): void {
    this.particles = [];
    const particleCount = 15;

    for (let i = 0; i < particleCount; i++) {
      this.particles.push({
        x: Math.random() * (typeof window !== 'undefined' ? window.innerWidth : 1200),
        y: Math.random() * (typeof window !== 'undefined' ? window.innerHeight : 800),
        size: Math.random() * 8 + 4,
        color: this.isDarkMode
          ? `rgba(${Math.random() * 100 + 100}, ${Math.random() * 100 + 150}, 255, 0.3)`
          : `rgba(255, ${Math.random() * 100 + 150}, ${Math.random() * 50 + 50}, 0.4)`,
        delay: Math.random() * 5,
        duration: Math.random() * 10 + 8,
        vx: (Math.random() - 0.5) * 0.5,
        vy: (Math.random() - 0.5) * 0.5
      });
    }
  }

  animateParticles(): void {
    this.particles.forEach(particle => {
      particle.x += particle.vx;
      particle.y += particle.vy;

      // Rebote en los bordes
      if (particle.x <= 0 || particle.x >= (typeof window !== 'undefined' ? window.innerWidth : 1200)) {
        particle.vx *= -1;
      }
      if (particle.y <= 0 || particle.y >= (typeof window !== 'undefined' ? window.innerHeight : 800)) {
        particle.vy *= -1;
      }

      // Mantener dentro de los límites
      particle.x = Math.max(0, Math.min(particle.x, typeof window !== 'undefined' ? window.innerWidth : 1200));
      particle.y = Math.max(0, Math.min(particle.y, typeof window !== 'undefined' ? window.innerHeight : 800));
    });

    this.particleAnimationFrame = requestAnimationFrame(() => this.animateParticles());
  }

  onCardHover(isHovering: boolean): void {
    this.isHovering = isHovering;
  }

  onOptionHover(option: string, isHovering: boolean): void {
    this.hoveredOption = isHovering ? option : null;
  }

  navigateTo(path: string): void {
    // Efecto de transición antes de navegar
    const element = document.querySelector('.min-h-screen');
    if (element) {
      element.classList.add('animate-pulse');
      setTimeout(() => {
        this.router.navigate([path]);
      }, 200);
    } else {
      this.router.navigate([path]);
    }
  }

  navigateToHome(): void {
    // Efecto especial para el botón home
    const button = event?.target as HTMLElement;
    if (button) {
      button.classList.add('animate-pulse');
      setTimeout(() => {
        this.router.navigate(['/home']);
      }, 300);
    } else {
      this.router.navigate(['/home']);
    }
  }

  toggleDarkMode(): void {
    this.isDarkMode = !this.isDarkMode;

    // Efecto de transición más dramático
    document.documentElement.style.transition = 'all 0.8s cubic-bezier(0.4, 0, 0.2, 1)';

    if (this.isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }

    // Regenerar partículas con nuevos colores
    this.generateParticles();

    // Efecto de pulso en toda la pantalla
    const container = this.container.nativeElement;
    container.style.transform = 'scale(0.98)';
    container.style.transition = 'transform 0.3s ease-out';

    setTimeout(() => {
      container.style.transform = 'scale(1)';
      setTimeout(() => {
        container.style.transition = '';
        document.documentElement.style.transition = '';
      }, 300);
    }, 150);
  }
}
