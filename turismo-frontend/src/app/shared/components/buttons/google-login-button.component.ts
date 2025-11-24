import { Component, ElementRef, OnInit, ViewChild, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GoogleAuthService } from '../../../core/services/google-auth.service';

@Component({
  selector: 'app-google-login-button',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="google-login-container w-full">
      <!-- Contenedor para el botón de Google -->
      <div #googleBtnRef id="googleBtn" class="w-full h-10 flex items-center justify-center"></div>
      
      <!-- Botón de respaldo por si el de Google no carga -->
      <button 
        *ngIf="showFallbackButton"
        type="button" 
        class="w-full flex justify-center items-center gap-2 py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
        (click)="handleFallbackClick()">
        <svg class="h-5 w-5" viewBox="0 0 24 24">
          <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
          <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
          <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
          <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
        </svg>
        Iniciar con Google
      </button>
    </div>
  `,
  styles: [`
    .google-login-container {
      min-height: 40px;
      position: relative;
    }
  `]
})
export class GoogleLoginButtonComponent implements OnInit {
  @ViewChild('googleBtnRef') googleBtnRef!: ElementRef;
  
  private googleAuthService = inject(GoogleAuthService);
  
  showFallbackButton = false;
  private buttonInitAttempts = 0;
  private maxInitAttempts = 3;
  
  ngOnInit(): void {
    // Inicializar la configuración de Google (sin mostrar el popup automáticamente)
    this.googleAuthService.initGoogleOneTap(false);
    
    // Intentar renderizar el botón después de que la vista se inicialice
    setTimeout(() => this.initGoogleButton(), 100);
  }
  
  private initGoogleButton(): void {
    if (!window.google?.accounts?.id) {
      this.buttonInitAttempts++;
      
      if (this.buttonInitAttempts >= this.maxInitAttempts) {
        console.error('Google SDK no se pudo cargar después de varios intentos. Mostrando botón de respaldo.');
        this.showFallbackButton = true;
        return;
      }
      
      // Intentar nuevamente en 1 segundo
      setTimeout(() => this.initGoogleButton(), 1000);
      return;
    }
    
    try {
      // Renderizar el botón de inicio de sesión de Google
      this.googleAuthService.renderGoogleButton('googleBtn');
    } catch (error) {
      console.error('Error al renderizar el botón de Google:', error);
      this.showFallbackButton = true;
    }
  }
  
  /**
   * Manejador para el botón de respaldo en caso de que el SDK de Google no cargue
   */
  handleFallbackClick(): void {
    // Redireccionar al endpoint del backend para iniciar el flujo de OAuth
    window.location.href = `${environment.apiUrl}/auth/google`;
  }
}

// Importar environment al final para evitar problemas circulares
import { environment } from '../../../../environments/environments';