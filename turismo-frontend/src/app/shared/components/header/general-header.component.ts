import { Component, inject, OnInit, signal, HostListener, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, RouterLink, RouterLinkActive, RouterOutlet, Router, NavigationEnd } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { ThemeService } from '../../../core/services/theme.service';
import { CarritoService } from '../../../core/services/carrito.service';
import { MiniCarritoComponent } from '../carrito/mini-carrito/mini-carrito.component';
import { Subscription, filter } from 'rxjs';

@Component({
  selector: 'app-general-header',
  standalone: true,
  imports: [CommonModule, RouterModule, RouterLink, RouterLinkActive, RouterOutlet, MiniCarritoComponent],
  template: `
    <div class="flex flex-col min-h-screen">
      <!-- Header - Transparent with scroll class -->
      <header 
        class="fixed inset-x-0 top-0 z-50 transition-all duration-300"
        [ngClass]="{
          'backdrop-blur-md bg-white/70 dark:bg-gray-900/80 shadow-lg': scrolled() || mobileMenuOpen(),
          'bg-transparent': !scrolled() && !mobileMenuOpen()
        }"
      >
        <div class="container mx-auto px-4 py-3">
          <div class="flex items-center justify-between">
            <!-- Logo y título -->
            <div class="flex items-center">
              <a routerLink="/home" class="flex items-center">
                <img src="/assets/general/logo.png" alt="Logo Capachica" class="h-16 w-auto mr-3">
                <div class="flex flex-col">
                  <h1 class="text-xl font-bold text-amber-800 dark:text-amber-400 transition-colors duration-200">Emprendedores</h1>
                  <h2 class="text-lg font-semibold text-amber-700 dark:text-amber-500 transition-colors duration-200">Capachica</h2>
                </div>
              </a>
            </div>

            <!-- Navegación principal - Versión escritorio -->
            <nav class="hidden md:flex items-center space-x-6">
              <a routerLink="/home" 
                routerLinkActive="text-amber-800 dark:text-amber-400 font-medium border-b-2 border-amber-600 dark:border-amber-500" 
                [routerLinkActiveOptions]="{exact: true}" 
                class="flex items-center text-gray-800 dark:text-gray-200 hover:text-amber-600 dark:hover:text-amber-400 py-1 transition-colors duration-200 relative group"
              >
                <svg class="w-5 h-5 mr-1 group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"></path>
                </svg>
                <span>Inicio</span>
                <span class="absolute bottom-0 left-0 w-0 h-0.5 bg-amber-600 dark:bg-amber-500 transition-all duration-300 group-hover:w-full"></span>
              </a>
              <a routerLink="/emprendimientos" 
                routerLinkActive="text-amber-800 dark:text-amber-400 font-medium border-b-2 border-amber-600 dark:border-amber-500" 
                class="flex items-center text-gray-800 dark:text-gray-200 hover:text-amber-600 dark:hover:text-amber-400 py-1 transition-colors duration-200 relative group"
              >
                <svg class="w-5 h-5 mr-1 group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path>
                </svg>
                <span>Emprendimientos</span>
                <span class="absolute bottom-0 left-0 w-0 h-0.5 bg-amber-600 dark:bg-amber-500 transition-all duration-300 group-hover:w-full"></span>
              </a>
              <a routerLink="/servicios" 
                routerLinkActive="text-amber-800 dark:text-amber-400 font-medium border-b-2 border-amber-600 dark:border-amber-500" 
                [routerLinkActiveOptions]="{exact: false}" 
                class="flex items-center text-gray-800 dark:text-gray-200 hover:text-amber-600 dark:hover:text-amber-400 py-1 transition-colors duration-200 relative group"
              >
                <svg class="w-5 h-5 mr-1 group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path>
                </svg>
                <span>Servicios</span>
                <span class="absolute bottom-0 left-0 w-0 h-0.5 bg-amber-600 dark:bg-amber-500 transition-all duration-300 group-hover:w-full"></span>
              </a>
              <a routerLink="/eventos" 
                routerLinkActive="text-amber-800 dark:text-amber-400 font-medium border-b-2 border-amber-600 dark:border-amber-500" 
                class="flex items-center text-gray-800 dark:text-gray-200 hover:text-amber-600 dark:hover:text-amber-400 py-1 transition-colors duration-200 relative group"
              >
                <svg class="w-5 h-5 mr-1 group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
                <span>Eventos</span>
                <span class="absolute bottom-0 left-0 w-0 h-0.5 bg-amber-600 dark:bg-amber-500 transition-all duration-300 group-hover:w-full"></span>
              </a>
              <a routerLink="/planes" 
                routerLinkActive="text-amber-800 dark:text-amber-400 font-medium border-b-2 border-amber-600 dark:border-amber-500" 
                class="flex items-center text-gray-800 dark:text-gray-200 hover:text-amber-600 dark:hover:text-amber-400 py-1 transition-colors duration-200 relative group"
              >
                <svg class="w-5 h-5 mr-1 group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path>
                </svg>
                <span>Planes</span>
                <span class="absolute bottom-0 left-0 w-0 h-0.5 bg-amber-600 dark:bg-amber-500 transition-all duration-300 group-hover:w-full"></span>
              </a>
            </nav>

            <!-- Botones de acción - sólo visible en escritorio cuando no hay menú móvil abierto -->
            <div class="items-center space-x-3 hidden md:flex">
              <!-- Carrito de reservas - Solo si está logueado -->
              <app-mini-carrito *ngIf="isLoggedIn()"></app-mini-carrito>

              <!-- Theme toggle button -->
              <button 
                (click)="toggleDarkMode()" 
                class="p-2 rounded-full text-gray-800 dark:text-gray-200 hover:bg-amber-100 dark:hover:bg-gray-700 focus:outline-none transition-colors duration-200"
                [title]="isDarkMode() ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'"
              >
                <svg *ngIf="!isDarkMode()" class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                </svg>
                <svg *ngIf="isDarkMode()" class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              </button>

              <!-- Auth buttons -->
              <button *ngIf="!isLoggedIn()" 
                routerLink="/login" 
                class="bg-amber-600 hover:bg-amber-700 dark:bg-amber-600 dark:hover:bg-amber-700 text-white rounded-md px-4 py-2 text-sm font-medium transition-colors duration-200 shadow-sm"
              >
                Iniciar sesión
              </button>
              <button *ngIf="!isLoggedIn()" 
                routerLink="/register" 
                class="bg-amber-500 hover:bg-amber-600 dark:bg-amber-600 dark:hover:bg-amber-700 text-white rounded-md px-4 py-2 text-sm font-medium transition-colors duration-200 shadow-sm"
              >
                Registrarse
              </button>
              <button *ngIf="isLoggedIn()" 
                routerLink="/dashboard" 
                class="bg-amber-600 hover:bg-amber-700 dark:bg-amber-600 dark:hover:bg-amber-700 text-white rounded-md px-4 py-2 text-sm font-medium transition-colors duration-200 shadow-sm"
              >
                Mi cuenta
              </button>
              <button *ngIf="isLoggedIn()" 
                (click)="logout()" 
                class="bg-amber-700 hover:bg-amber-800 dark:bg-amber-700 dark:hover:bg-amber-800 text-white rounded-md px-4 py-2 text-sm font-medium transition-colors duration-200 shadow-sm"
              >
                Salir
              </button>
            </div>

            <!-- Botones de acción en móvil - solo visible cuando NO hay menú abierto -->
            <div class="flex items-center space-x-3 md:hidden" *ngIf="!mobileMenuOpen()">
              <!-- Carrito en móvil -->
              <button *ngIf="isLoggedIn()" 
                routerLink="/carrito" 
                class="relative p-2 rounded-full text-gray-800 dark:text-gray-200 hover:bg-amber-100 dark:hover:bg-gray-700 focus:outline-none transition-colors duration-200"
              >
                <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-1.5 6M7 13l-1.5 6m0 0h9m-9 0v0M17 21v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6"></path>
                </svg>
                <span *ngIf="getTotalItemsCarrito() > 0" 
                  class="absolute -top-1 -right-1 bg-amber-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center font-medium"
                >
                  {{ getTotalItemsCarrito() }}
                </span>
              </button>

              <!-- Theme toggle button -->
              <button 
                (click)="toggleDarkMode()" 
                class="p-2 rounded-full text-gray-800 dark:text-gray-200 hover:bg-amber-100 dark:hover:bg-gray-700 focus:outline-none transition-colors duration-200"
                [title]="isDarkMode() ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'"
              >
                <svg *ngIf="!isDarkMode()" class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                </svg>
                <svg *ngIf="isDarkMode()" class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              </button>

              <!-- Auth buttons móvil - Solo mostrar login si no está autenticado -->
              <button *ngIf="!isLoggedIn()" 
                routerLink="/login" 
                class="bg-amber-600 hover:bg-amber-700 dark:bg-amber-600 dark:hover:bg-amber-700 text-white rounded-md px-3 py-2 text-sm font-medium transition-colors duration-200 shadow-sm"
              >
                Login
              </button>
            </div>

            <!-- Botón de menú móvil - siempre visible en móvil -->
            <button 
              class="md:hidden flex items-center p-2 rounded-md text-gray-800 dark:text-gray-200 hover:bg-amber-100 dark:hover:bg-gray-700 focus:outline-none transition-colors duration-200"
              (click)="toggleMobileMenu()"
            >
              <svg class="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path *ngIf="!mobileMenuOpen()" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"></path>
                <path *ngIf="mobileMenuOpen()" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
              </svg>
            </button>
          </div>

          <!-- Menú móvil -->
          <div *ngIf="mobileMenuOpen()" class="md:hidden mt-3 pt-3 border-t border-amber-200/30 dark:border-gray-700/50 transition-colors duration-200">
            <nav class="flex flex-col space-y-3">
              <a routerLink="/home" 
                routerLinkActive="text-amber-800 dark:text-amber-400 font-medium" 
                [routerLinkActiveOptions]="{exact: true}" 
                class="flex items-center text-gray-800 dark:text-gray-200 hover:text-amber-600 dark:hover:text-amber-400 py-2 px-1 transition-colors duration-200" 
                (click)="closeMobileMenu()"
              >
                <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"></path>
                </svg>
                <span>Inicio</span>
              </a>
              <a routerLink="/familias" 
                routerLinkActive="text-amber-800 dark:text-amber-400 font-medium" 
                class="flex items-center text-gray-800 dark:text-gray-200 hover:text-amber-600 dark:hover:text-amber-400 py-2 px-1 transition-colors duration-200" 
                (click)="closeMobileMenu()"
              >
                <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path>
                </svg>
                <span>Familias</span>
              </a>
              <a routerLink="/servicios" 
                routerLinkActive="text-amber-800 dark:text-amber-400 font-medium" 
                [routerLinkActiveOptions]="{exact: false}" 
                class="flex items-center text-gray-800 dark:text-gray-200 hover:text-amber-600 dark:hover:text-amber-400 py-2 px-1 transition-colors duration-200" 
                (click)="closeMobileMenu()"
              >
                <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path>
                </svg>
                <span>Servicios</span>
              </a>
              <a routerLink="/eventos" 
                routerLinkActive="text-amber-800 dark:text-amber-400 font-medium" 
                class="flex items-center text-gray-800 dark:text-gray-200 hover:text-amber-600 dark:hover:text-amber-400 py-2 px-1 transition-colors duration-200" 
                (click)="closeMobileMenu()"
              >
                <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
                <span>Eventos</span>
              </a>
              <a routerLink="/contactos" 
                routerLinkActive="text-amber-800 dark:text-amber-400 font-medium" 
                class="flex items-center text-gray-800 dark:text-gray-200 hover:text-amber-600 dark:hover:text-amber-400 py-2 px-1 transition-colors duration-200" 
                (click)="closeMobileMenu()"
              >
                <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path>
                </svg>
                <span>Contacto</span>
              </a>
              
              <!-- Carrito en menú móvil - Solo si está logueado -->
              <a *ngIf="isLoggedIn()" 
                routerLink="/carrito" 
                routerLinkActive="text-amber-800 dark:text-amber-400 font-medium" 
                class="flex items-center text-gray-800 dark:text-gray-200 hover:text-amber-600 dark:hover:text-amber-400 py-2 px-1 transition-colors duration-200" 
                (click)="closeMobileMenu()"
              >
                <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-1.5 6M7 13l-1.5 6m0 0h9m-9 0v0M17 21v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6"></path>
                </svg>
                <span>Mi Carrito ({{ getTotalItemsCarrito() }})</span>
              </a>
              
              <!-- Theme toggle in mobile menu -->
              <a 
                (click)="toggleDarkMode(); $event.preventDefault();" 
                class="flex items-center text-gray-800 dark:text-gray-200 hover:text-amber-600 dark:hover:text-amber-400 py-2 px-1 transition-colors duration-200 cursor-pointer"
              >
                <svg *ngIf="!isDarkMode()" class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                </svg>
                <svg *ngIf="isDarkMode()" class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
                <span>{{ isDarkMode() ? 'Modo claro' : 'Modo oscuro' }}</span>
              </a>

              <!-- Chatbot en menú móvil -->
              <a 
                (click)="toggleChatbot(); $event.preventDefault();" 
                class="flex items-center text-gray-800 dark:text-gray-200 hover:text-amber-600 dark:hover:text-amber-400 py-2 px-1 transition-colors duration-200 cursor-pointer"
              >
                <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
                <span>Asistente Virtual</span>
              </a>
            </nav>

            <!-- Botones de autenticación móvil -->
            <div class="flex flex-col space-y-2 mt-4 pt-3 border-t border-amber-200/30 dark:border-gray-700/50 transition-colors duration-200">
              <button *ngIf="!isLoggedIn()" 
                routerLink="/login" 
                class="bg-amber-600 hover:bg-amber-700 dark:bg-amber-600 dark:hover:bg-amber-700 text-white rounded-md px-4 py-2 text-sm font-medium transition-colors duration-200 w-full shadow-sm" 
                (click)="closeMobileMenu()"
              >
                Iniciar sesión
              </button>
              <button *ngIf="!isLoggedIn()" 
                routerLink="/register" 
                class="bg-amber-500 hover:bg-amber-600 dark:bg-amber-600 dark:hover:bg-amber-700 text-white rounded-md px-4 py-2 text-sm font-medium transition-colors duration-200 w-full shadow-sm" 
                (click)="closeMobileMenu()"
              >
                Registrarse
              </button>
              <button *ngIf="isLoggedIn()" 
                routerLink="/dashboard" 
                class="bg-amber-600 hover:bg-amber-700 dark:bg-amber-600 dark:hover:bg-amber-700 text-white rounded-md px-4 py-2 text-sm font-medium transition-colors duration-200 w-full shadow-sm" 
                (click)="closeMobileMenu()"
              >
                Mi cuenta
              </button>
              <button *ngIf="isLoggedIn()" 
                (click)="logout()" 
                class="bg-amber-700 hover:bg-amber-800 dark:bg-amber-700 dark:hover:bg-amber-800 text-white rounded-md px-4 py-2 text-sm font-medium transition-colors duration-200 w-full shadow-sm"
              >
                Salir
              </button>
            </div>
          </div>
        </div>
      </header>

      <!-- Botón flotante del chatbot - Fijo en la parte inferior derecha -->
      <div class="fixed bottom-6 right-6 z-50">
        <button 
          (click)="toggleChatbot()" 
          class="group relative bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 dark:from-amber-600 dark:to-amber-700 dark:hover:from-amber-700 dark:hover:to-amber-800 text-white rounded-full p-4 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-amber-300 dark:focus:ring-amber-600"
          [class.animate-pulse]="!chatbotOpened()"
          [title]="chatbotOpened() ? 'Cerrar asistente' : 'Abrir asistente virtual'"
        >
          <!-- Icono del chatbot cuando está cerrado -->
          <svg *ngIf="!chatbotOpened()" 
            class="w-6 h-6 transition-transform duration-300 group-hover:scale-110" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
          
          <!-- Icono de cerrar cuando está abierto -->
          <svg *ngIf="chatbotOpened()" 
            class="w-6 h-6 transition-transform duration-300 group-hover:rotate-90" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>

          <!-- Indicador de notificación (opcional) -->
          <span *ngIf="!chatbotOpened() && hasNewChatMessages()" 
            class="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-6 w-6 flex items-center justify-center font-bold animate-bounce"
          >
            !
          </span>

          <!-- Tooltip personalizado -->
          <div class="absolute bottom-full right-0 mb-3 px-3 py-2 bg-gray-900 dark:bg-gray-700 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none whitespace-nowrap">
            {{ chatbotOpened() ? 'Cerrar asistente' : '¡Pregúntame algo!' }}
            <div class="absolute top-full right-4 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900 dark:border-t-gray-700"></div>
          </div>
        </button>
      </div>

      <!-- Ventana del chatbot (se mostrará cuando esté abierto) -->
      <div *ngIf="chatbotOpened()" 
        class="fixed bottom-24 right-6 w-96 h-96 bg-white dark:bg-gray-800 rounded-lg shadow-2xl border border-gray-200 dark:border-gray-700 z-40 flex flex-col overflow-hidden transition-all duration-300 transform"
        [@slideInOut]
      >
        <!-- Header del chatbot -->
        <div class="bg-gradient-to-r from-amber-500 to-amber-600 dark:from-amber-600 dark:to-amber-700 text-white p-4 flex items-center justify-between">
          <div class="flex items-center space-x-3">
            <div class="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
              <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2C6.477 2 2 6.477 2 12c0 1.68.41 3.267 1.138 4.668L2 22l5.332-1.138C8.733 21.59 10.32 22 12 22c5.523 0 10-4.477 10-10S17.523 2 12 2z"/>
              </svg>
            </div>
            <div>
              <h3 class="font-semibold text-sm">Asistente Virtual</h3>
              <p class="text-xs opacity-90">¿En qué puedo ayudarte?</p>
            </div>
          </div>
          <button 
            (click)="toggleChatbot()" 
            class="text-white/80 hover:text-white transition-colors duration-200 p-1 rounded"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <!-- Contenido del chatbot -->
        <div class="flex-1 p-4 bg-gray-50 dark:bg-gray-900">
          <!-- Aquí irá el contenido de tu chatbot -->
          <div class="text-center text-gray-500 dark:text-gray-400 mt-8">
            <svg class="w-12 h-12 mx-auto mb-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
            <p class="text-sm">El chatbot se integrará aquí</p>
            <p class="text-xs mt-2">Próximamente...</p>
          </div>
        </div>

        <!-- Footer del chatbot con input -->
        <div class="p-3 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
          <div class="flex space-x-2">
            <input 
              type="text" 
              placeholder="Escribe tu mensaje..." 
              class="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 dark:focus:ring-amber-400 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 text-sm"
              (keyup.enter)="sendMessage($event)"
            >
            <button 
              class="bg-amber-500 hover:bg-amber-600 dark:bg-amber-600 dark:hover:bg-amber-700 text-white px-4 py-2 rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-amber-500 dark:focus:ring-amber-400"
              (click)="sendMessage($event)"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      <!-- Contenido principal -->
      <main class="relative z-0 transition-all duration-300">
        <router-outlet></router-outlet>
      </main>
    </div>
  `,
  styles: [`
    /* Custom color definitions */
    :host {
      display: block;
      width: 100%;
    }
    
    /* Transparent backdrop blur filter for modern browsers */
    .backdrop-blur-md {
      backdrop-filter: blur(10px);
      -webkit-backdrop-filter: blur(10px);
    }
    
    /* Custom dark mode hover state */
    .dark .dark\:hover\:bg-gray-750:hover {
      background-color: rgba(55, 65, 81, 0.5);
    }
    
    /* Animation for scroll transition */
    @keyframes fadeInDown {
      from {
        opacity: 0;
        transform: translateY(-10px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }
    
    .scrolled-header {
      animation: fadeInDown 0.3s ease-out forwards;
    }

    /* Badge animation */
    .badge-bounce {
      animation: bounce 2s infinite;
    }
    
    @keyframes bounce {
      0%, 20%, 53%, 80%, 100% {
        transform: translateY(0);
      }
      40%, 43% {
        transform: translateY(-3px);
      }
      70% {
        transform: translateY(-2px);
      }
      90% {
        transform: translateY(-1px);
      }
    }

    /* Chatbot animations */
    @keyframes slideInOut {
      from {
        opacity: 0;
        transform: translateY(20px) scale(0.95);
      }
      to {
        opacity: 1;
        transform: translateY(0) scale(1);
      }
    }

    /* Responsive adjustments for chatbot */
    @media (max-width: 640px) {
      .chatbot-window {
        width: calc(100vw - 3rem);
        height: 70vh;
        right: 1.5rem;
        bottom: 6rem;
      }
    }
  `],
  animations: [
    // Agregar esta importación al inicio del archivo: import { trigger, transition, style, animate } from '@angular/animations';
    // trigger('slideInOut', [
    //   transition(':enter', [
    //     style({ opacity: 0, transform: 'translateY(20px) scale(0.95)' }),
    //     animate('300ms ease-out', style({ opacity: 1, transform: 'translateY(0) scale(1)' }))
    //   ]),
    //   transition(':leave', [
    //     animate('200ms ease-in', style({ opacity: 0, transform: 'translateY(20px) scale(0.95)' }))
    //   ])
    // ])
  ]
})
export class GeneralHeaderComponent implements OnInit, OnDestroy {
  private authService = inject(AuthService);
  private themeService = inject(ThemeService);
  private carritoService = inject(CarritoService);
  private router = inject(Router);
  private routerSubscription: Subscription | null = null;
  
  mobileMenuOpen = signal(false);
  scrolled = signal(false);
  chatbotOpened = signal(false); // Nuevo signal para el estado del chatbot
  
  ngOnInit() {
    // Initialize the theme
    this.themeService.initializeTheme();
    
    // Inicializar carrito si está logueado
    if (this.isLoggedIn()) {
      this.carritoService.inicializarCarrito();
    }
    
    // Reset scroll position on navigation
    this.routerSubscription = this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe(() => {
      window.scrollTo(0, 0);
      this.scrolled.set(false);
      this.closeMobileMenu();
    });
  }
  
  ngOnDestroy() {
    // Clean up subscription when component is destroyed
    if (this.routerSubscription) {
      this.routerSubscription.unsubscribe();
    }
  }
  
  // Detect scroll position
  @HostListener('window:scroll', [])
  onWindowScroll() {
    const scrollPosition = window.scrollY || document.documentElement.scrollTop || document.body.scrollTop || 0;
    this.scrolled.set(scrollPosition > 10);
  }
  
  isLoggedIn(): boolean {
    return this.authService.isLoggedIn();
  }
  
  toggleMobileMenu() {
    this.mobileMenuOpen.update(value => !value);
  }
  
  closeMobileMenu() {
    this.mobileMenuOpen.set(false);
  }
  
  logout() {
    this.authService.logout().subscribe({
      next: () => {
        // Limpiar carrito al cerrar sesión
        this.carritoService.limpiarCarritoAlCerrarSesion();
        // Redirect to home after logout
        window.location.href = '/home';
      },
      error: (err) => {
        console.error('Error al cerrar sesión:', err);
        // Limpiar carrito incluso si hay error
        this.carritoService.limpiarCarritoAlCerrarSesion();
      }
    });
  }
  
  toggleDarkMode() {
    this.themeService.toggleDarkMode();
  }
  
  isDarkMode(): boolean {
    return this.themeService.isDarkMode();
  }
  
  // Métodos para el carrito
  getTotalItemsCarrito(): number {
    return this.carritoService.getTotalItems();
  }
  
  tieneItemsEnCarrito(): boolean {
    return this.carritoService.tieneItems();
  }

  // Métodos para el chatbot
  toggleChatbot() {
    this.chatbotOpened.update(value => !value);
    // Cerrar menú móvil si está abierto
    if (this.mobileMenuOpen()) {
      this.closeMobileMenu();
    }
  }

  sendMessage(event: any) {
    // Aquí implementarás la lógica para enviar mensajes al chatbot
    const input = event.target;
    const message = input.value?.trim();
    
    if (message) {
      console.log('Mensaje enviado:', message);
      // Limpiar el input
      if (input.tagName === 'INPUT') {
        input.value = '';
      }
      
      // Aquí llamarás a tu servicio de chatbot
      // this.chatbotService.sendMessage(message);
    }
  }

  hasNewChatMessages(): boolean {
    // Aquí implementarás la lógica para verificar si hay mensajes nuevos
    // Por ahora retorna false, pero puedes conectarlo con tu servicio de chatbot
    return false;
  }
}