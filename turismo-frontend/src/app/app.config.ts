/*import { ApplicationConfig, EnvironmentProviders, importProvidersFrom, ENVIRONMENT_INITIALIZER, inject, provideZoneChangeDetection } from '@angular/core';
import { provideRouter, withComponentInputBinding, withViewTransitions } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideAnimations } from '@angular/platform-browser/animations';

import { routes } from './app.routes';
import { authInterceptor } from './core/interceptors/auth.interceptor';

import { RegisterComponent } from './features/auth/register/register.component';
import { ThemeService } from './core/services/theme.service';
import { CalendarModule, DateAdapter } from 'angular-calendar';
import { adapterFactory } from 'angular-calendar/date-adapters/date-fns';

function initializeTheme() {
  return () => {
    const themeService = inject(ThemeService);
    themeService.initializeTheme();
  };
}

export const appConfig: ApplicationConfig = {
  providers: [
       importProvidersFrom(
      CalendarModule.forRoot({ provide: DateAdapter, useFactory: adapterFactory })
    ),
    provideZoneChangeDetection({ eventCoalescing: true }),
     provideRouter(routes,withViewTransitions(), withComponentInputBinding()),
    provideHttpClient(
      withInterceptors([authInterceptor])
    ),
    provideAnimations(),
    {
      provide: ENVIRONMENT_INITIALIZER,
      useFactory: initializeTheme,
      multi: true
    }
  ]
};*/
import { ApplicationConfig, EnvironmentProviders, importProvidersFrom, ENVIRONMENT_INITIALIZER, inject, provideZoneChangeDetection, APP_INITIALIZER } from '@angular/core'; 
import { provideRouter, withComponentInputBinding, withViewTransitions } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideAnimations } from '@angular/platform-browser/animations';

import { routes } from './app.routes';
import { authInterceptor } from './core/interceptors/auth.interceptor';

import { RegisterComponent } from './features/auth/register/register.component';
import { ThemeService } from './core/services/theme.service';

import { CalendarA11y, CalendarDateFormatter, CalendarEventTitleFormatter, CalendarModule, DateAdapter } from 'angular-calendar';
import { adapterFactory } from 'angular-calendar/date-adapters/date-fns';
import { AlertInterceptor } from './core/interceptors/alert.interceptor';

function initializeTheme() {
  return () => {
    const themeService = inject(ThemeService);
    themeService.initializeTheme();
  };
}
// forzar la creación del interceptor.
export function initializeAlertInterceptor(interceptor: AlertInterceptor) {
  return () => {};
}
export const appConfig: ApplicationConfig = {
  providers: [
    importProvidersFrom(CalendarModule),
    {
      provide: DateAdapter,
      useFactory: adapterFactory
    },
      CalendarA11y,  // <-- Agrega este proveedor aquí
       CalendarDateFormatter,  // <--- Agregar aquí también
        CalendarEventTitleFormatter,  // <--- agregar este también
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes, withViewTransitions(), withComponentInputBinding()),
    provideHttpClient(
      withInterceptors([authInterceptor])
    ),
    provideAnimations(),
    {
      provide: ENVIRONMENT_INITIALIZER,
      useFactory: initializeTheme,
      multi: true
    },
    AlertInterceptor, // Primero, provee el interceptor como un servicio normal
    {
      provide: APP_INITIALIZER,
      useFactory: initializeAlertInterceptor,
      deps: [AlertInterceptor], // Asegura que AlertInterceptor se inyecte en la factory
      multi: true
    }
  ]
};
