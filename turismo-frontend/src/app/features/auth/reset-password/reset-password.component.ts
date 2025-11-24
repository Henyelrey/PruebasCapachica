import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../../core/services/auth.service';
import { ResetPasswordRequest } from '../../../core/models/user.model';
import { ThemeService } from '../../../core/services/theme.service';

@Component({
  selector: 'app-reset-password',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="flex min-h-screen items-center justify-center bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <div class="w-full max-w-md space-y-8 bg-white dark:bg-gray-800 backdrop-blur-md rounded-xl shadow-xl p-8" style="height: 520px; max-height: 520px;">
        
        <div class="flex justify-between items-center">
          <h2 class="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
            Restablecer contraseña
          </h2>
          <button (click)="toggleDarkMode()" class="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700">
            <svg *ngIf="!isDarkMode()" xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
            </svg>
            <svg *ngIf="isDarkMode()" xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-yellow-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
          </button>
        </div>
        
        <p class="mt-2 text-sm text-gray-600 dark:text-gray-300">
          Ingresa tu nueva contraseña
        </p>
        
        <!-- Formulario -->
        <form class="mt-8 space-y-6" [formGroup]="resetForm" (ngSubmit)="onSubmit()" *ngIf="!resetSuccess">
          <div class="space-y-4 rounded-md shadow-sm">
            <!-- Email (oculto pero presente por requerimiento de la API) -->
            <input 
              type="hidden" 
              formControlName="email"
            />
            
            <!-- Token (oculto pero presente por requerimiento de la API) -->
            <input 
              type="hidden" 
              formControlName="token"
            />
            
            <!-- Nueva Contraseña -->
            <div>
              <label for="password" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Nueva contraseña</label>
              <input 
                id="password" 
                type="password" 
                formControlName="password" 
                class="w-full rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white px-3 py-2 focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500"
                [ngClass]="{'border-red-500 focus:border-red-500 focus:ring-red-500': submitted && f['password'].errors}" />
              <div *ngIf="submitted && f['password'].errors">
                <p class="text-sm text-red-600 dark:text-red-400 mt-1" *ngIf="f['password'].errors['required']">La contraseña es requerida</p>
                <p class="text-sm text-red-600 dark:text-red-400 mt-1" *ngIf="f['password'].errors['minlength']">La contraseña debe tener al menos 8 caracteres</p>
              </div>
            </div>
            
            <!-- Confirmar Contraseña -->
            <div>
              <label for="password_confirmation" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Confirmar contraseña</label>
              <input 
                id="password_confirmation" 
                type="password" 
                formControlName="password_confirmation" 
                class="w-full rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white px-3 py-2 focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500"
                [ngClass]="{'border-red-500 focus:border-red-500 focus:ring-red-500': submitted && f['password_confirmation'].errors}" />
              <div *ngIf="submitted && f['password_confirmation'].errors">
                <p class="text-sm text-red-600 dark:text-red-400 mt-1" *ngIf="f['password_confirmation'].errors['required']">La confirmación de contraseña es requerida</p>
                <p class="text-sm text-red-600 dark:text-red-400 mt-1" *ngIf="f['password_confirmation'].errors['mustMatch']">Las contraseñas no coinciden</p>
              </div>
            </div>
          </div>
          
          <!-- Mensajes de error -->
          <div *ngIf="error" class="rounded-md bg-red-50 dark:bg-red-900 dark:border-red-800 border border-red-300 p-4">
            <div class="flex">
              <div class="ml-3">
                <h3 class="text-sm font-medium text-red-800 dark:text-red-300">{{ error }}</h3>
              </div>
            </div>
          </div>
          
          <!-- Botón de envío -->
          <div>
            <button 
              type="submit" 
              class="w-full rounded-lg bg-orange-500 py-2 text-center font-semibold text-white hover:bg-orange-600 active:bg-orange-700"
              [disabled]="loading">
              <span *ngIf="loading" class="inline-block h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></span>
              <span *ngIf="!loading">Restablecer contraseña</span>
            </button>
          </div>
        </form>
        
        <!-- Mensaje de éxito -->
        <div *ngIf="resetSuccess" class="rounded-md bg-green-50 dark:bg-green-900 dark:border-green-800 border border-green-300 p-4">
          <div class="flex">
            <div class="flex-shrink-0">
              <svg class="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
              </svg>
            </div>
            <div class="ml-3">
              <h3 class="text-sm font-medium text-green-800 dark:text-green-300">
                ¡Contraseña restablecida!
              </h3>
              <div class="mt-2 text-sm text-green-700 dark:text-green-400">
                <p>
                  Tu contraseña ha sido restablecida exitosamente.
                </p>
              </div>
              <div class="mt-4">
                <button 
                  type="button"
                  class="rounded-lg bg-orange-500 py-2 px-4 text-sm font-medium text-white hover:bg-orange-600"
                  (click)="navigateToLogin()">
                  Iniciar sesión
                </button>
              </div>
            </div>
          </div>
        </div>
        
      </div>
    </div>
  `,
  styles: [`
    :host {
      display: block;
      min-height: 100vh;
      background-image: url('/assets/images/foto05.jpg');
      background-size: cover;
      background-position: center;
    }
    
    input:focus {
      border-color: #FFA500;
      box-shadow: 0 0 0 1px #FFA500;
    }
    
    button[type="submit"] {
      transition: all 0.2s ease;
      background-color: #FFA500;
    }

    button[type="submit"]:hover {
      background-color: #e69500;
    }

    button[type="submit"]:active {
      background-color: #CC8400;
    }

    button[type="submit"]:disabled {
      background-color: #FFD280;
      cursor: not-allowed;
    }
  `]
})
export class ResetPasswordComponent implements OnInit {
  private fb = inject(FormBuilder);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private authService = inject(AuthService);
  public themeService = inject(ThemeService);

  resetForm: FormGroup;
  loading = false;
  submitted = false;
  error = '';
  resetSuccess = false;

  constructor() {
    this.resetForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      token: ['', Validators.required],
      password: ['', [Validators.required, Validators.minLength(8)]],
      password_confirmation: ['', Validators.required]
    }, {
      validators: this.mustMatch('password', 'password_confirmation')
    });
  }

  ngOnInit(): void {
    // Obtener token y email de los parámetros
    this.route.queryParams.subscribe(params => {
      const token = params['token'];
      const email = params['email'];
      
      if (token && email) {
        this.resetForm.patchValue({
          token: token,
          email: email
        });
      } else {
        this.error = 'Enlace de restablecimiento inválido. Faltan parámetros necesarios.';
      }
    });
  }

  get f() { 
    return this.resetForm.controls; 
  }

  mustMatch(controlName: string, matchingControlName: string) {
    return (formGroup: FormGroup) => {
      const control = formGroup.controls[controlName];
      const matchingControl = formGroup.controls[matchingControlName];
      
      if (matchingControl.errors && !matchingControl.errors['mustMatch']) {
        return;
      }
      
      if (control.value !== matchingControl.value) {
        matchingControl.setErrors({ mustMatch: true });
      } else {
        matchingControl.setErrors(null);
      }
    };
  }

  onSubmit(): void {
    this.submitted = true;
    this.error = '';
    
    if (this.resetForm.invalid) {
      return;
    }
    
    this.loading = true;
    
    const resetData: ResetPasswordRequest = this.resetForm.value;
    
    this.authService.resetPassword(resetData).subscribe({
      next: () => {
        this.resetSuccess = true;
        this.loading = false;
      },
      error: (error) => {
        this.error = error.error?.message || 'Error al restablecer la contraseña.';
        this.loading = false;
      }
    });
  }

  navigateToLogin(): void {
    this.router.navigate(['/login']);
  }
  
  toggleDarkMode() {
    this.themeService.toggleDarkMode();
  }
  
  isDarkMode(): boolean {
    return this.themeService.isDarkMode();
  }
}