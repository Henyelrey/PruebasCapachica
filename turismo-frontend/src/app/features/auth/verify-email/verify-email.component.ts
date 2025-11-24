import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { finalize } from 'rxjs';
import { environment } from '../../../../environments/environments';

@Component({
  selector: 'app-verify-email',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="flex min-h-screen items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div class="w-full max-w-md space-y-8 bg-white/80 backdrop-blur-md rounded-xl shadow-xl p-8 text-center">
        
        <div>
          <h2 class="mt-6 text-center text-3xl font-bold tracking-tight text-gray-900">
            Verificación de correo electrónico
          </h2>
        </div>
        
        <!-- Estado de carga -->
        <div *ngIf="verifying" class="flex flex-col items-center justify-center">
          <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
          <p class="mt-4 text-lg text-gray-600">Verificando tu correo electrónico...</p>
        </div>
        
        <!-- Éxito -->
        <div *ngIf="!verifying && success" class="rounded-md bg-green-50 p-4">
          <div class="flex">
            <div class="flex-shrink-0">
              <svg class="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
              </svg>
            </div>
            <div class="ml-3">
              <h3 class="text-sm font-medium text-green-800">
                ¡Correo electrónico verificado correctamente!
              </h3>
              <div class="mt-2 text-sm text-green-700">
                <p>
                  Tu cuenta ha sido verificada. Ahora puedes acceder a todas las funcionalidades de la plataforma.
                </p>
              </div>
              <div class="mt-4">
                <button 
                  type="button"
                  class="btn-primary"
                  (click)="navigateToLogin()">
                  Iniciar sesión
                </button>
              </div>
            </div>
          </div>
        </div>
        
        <!-- Error -->
        <div *ngIf="!verifying && !success" class="rounded-md bg-red-50 p-4">
          <div class="flex">
            <div class="flex-shrink-0">
              <svg class="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
              </svg>
            </div>
            <div class="ml-3">
              <h3 class="text-sm font-medium text-red-800">
                Error al verificar el correo electrónico
              </h3>
              <div class="mt-2 text-sm text-red-700">
                <p>{{ errorMessage }}</p>
                <p class="mt-2">
                  El enlace puede haber expirado o no ser válido. Si el problema persiste, por favor solicita un nuevo enlace de verificación.
                </p>
              </div>
              <div class="mt-4">
                <button 
                  type="button"
                  class="btn-secondary"
                  (click)="navigateToLogin()">
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
export class VerifyEmailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private authService = inject(AuthService);

  verifying = true;
  success = false;
  errorMessage = 'No se pudo verificar tu correo electrónico.';

  ngOnInit(): void {
    // Obtener parámetros de la URL
    this.route.queryParams.subscribe(params => {
      const id = params['id'];
      const hash = params['hash'];
      const expires = params['expires'];
      const signature = params['signature'];
      
      if (!id || !hash) {
        this.verifying = false;
        this.success = false;
        this.errorMessage = 'Enlace de verificación inválido. Faltan parámetros necesarios.';
        return;
      }
      
      // Si tenemos expires y signature, usamos la URL completa
      if (expires && signature) {
        this.verifyEmailWithFullUrl(id, hash, expires, signature);
      } else {
        // Caso de llamada directa a la API
        this.verifyEmail(Number(id), hash);
      }
    });
  }

  verifyEmail(id: number, hash: string): void {
    this.authService.verifyEmail(id, hash)
      .pipe(
        finalize(() => this.verifying = false)
      )
      .subscribe({
        next: () => {
          this.success = true;
          // Si el usuario está autenticado, actualizar su estado de verificación
          if (this.authService.isLoggedIn()) {
            this.authService.loadUserProfile(true).subscribe();
          }
        },
        error: (error) => {
          this.success = false;
          this.errorMessage = error.error?.message || 'Error al verificar el correo electrónico.';
        }
      });
  }
  
  verifyEmailWithFullUrl(id: number, hash: string, expires: string, signature: string): void {
    // Construir la URL completa para la verificación
    const verificationUrl = `${environment.apiUrl}/email/verify/${id}/${hash}?expires=${expires}&signature=${signature}`;
    
    this.authService.verifyEmailWithFullUrl(verificationUrl)
      .pipe(
        finalize(() => this.verifying = false)
      )
      .subscribe({
        next: () => {
          this.success = true;
          // Si el usuario está autenticado, actualizar su estado de verificación
          if (this.authService.isLoggedIn()) {
            this.authService.loadUserProfile(true).subscribe();
          }
        },
        error: (error) => {
          this.success = false;
          this.errorMessage = error.error?.message || 'Error al verificar el correo electrónico.';
          console.error('Error de verificación:', error);
        }
      });
  }

  navigateToLogin(): void {
    this.router.navigate(['/login']);
  }
}