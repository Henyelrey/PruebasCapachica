import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-google-callback',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="flex min-h-screen items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div class="w-full max-w-md space-y-8 bg-white/80 backdrop-blur-md rounded-xl shadow-xl p-8 text-center">
        
        <div>
          <h2 class="mt-6 text-center text-3xl font-bold tracking-tight text-gray-900">
            Autenticación con Google
          </h2>
        </div>
        
        <!-- Estado de carga -->
        <div *ngIf="loading" class="flex flex-col items-center justify-center">
          <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
          <p class="mt-4 text-lg text-gray-600">Procesando autenticación con Google...</p>
        </div>
        
        <!-- Error -->
        <div *ngIf="!loading && error" class="rounded-md bg-red-50 p-4">
          <div class="flex">
            <div class="flex-shrink-0">
              <svg class="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
              </svg>
            </div>
            <div class="ml-3">
              <h3 class="text-sm font-medium text-red-800">Error al autenticar con Google</h3>
              <div class="mt-2 text-sm text-red-700">
                <p>{{ error }}</p>
              </div>
              <div class="mt-4">
                <button type="button" class="btn-secondary" (click)="navigateToLogin()">
                  Volver al inicio de sesión
                </button>
              </div>
            </div>
          </div>
        </div>
        
      </div>
    </div>
  `,
  styles: []
})
export class GoogleCallbackComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private authService = inject(AuthService);

  loading = true;
  error = '';

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      const code = params['code'];
      const state = params['state'] || '';
      
      if (!code) {
        this.error = 'No se pudo completar la autenticación con Google. Código de autorización no encontrado.';
        this.loading = false;
        return;
      }
      
      this.handleGoogleCallback(code, state);
    });
  }

  handleGoogleCallback(code: string, state: string): void {
    this.authService.handleGoogleCallback(state, code).subscribe({
      next: (response) => {
        // Redirigir al dashboard o página de inicio
        this.router.navigate(['/dashboard']);
      },
      error: (error) => {
        this.error = error.error?.message || 'Ocurrió un error durante la autenticación con Google.';
        this.loading = false;
      }
    });
  }

  navigateToLogin(): void {
    this.router.navigate(['/login']);
  }
}