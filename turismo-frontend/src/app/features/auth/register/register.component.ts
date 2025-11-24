import { Component, OnInit, inject, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink, ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../../core/services/auth.service';
import { GoogleLoginButtonComponent } from '../../../shared/components/buttons/google-login-button.component';
import { GoogleAuthService } from '../../../core/services/google-auth.service';
import { RegisterRequest } from '../../../core/models/user.model';
import { ThemeService } from '../../../core/services/theme.service';

// Custom validator function
export function MustMatch(controlName: string, matchingControlName: string) {
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
  }
}

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterLink,
    GoogleLoginButtonComponent
  ],
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent implements OnInit {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private googleAuthService = inject(GoogleAuthService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  public themeService = inject(ThemeService);

  registerForm: FormGroup;
  loading = false;
  googleLoading = false;
  submitted = false;
  error = '';
  fileError = '';
  registrationSuccess = false;
  selectedFile: File | null = null;
  
  // Password toggle properties
  showPassword = false;
  showConfirmPassword = false;

  // Variable para evitar redirección en el primer clic
  private isFirstClick = true;

  constructor() {
    this.registerForm = this.fb.group({
      name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', Validators.required],
      country: [''],
      birth_date: [''],
      address: [''],
      gender: [''],
      preferred_language: [''],
      password: ['', [Validators.required, Validators.minLength(8)]],
      password_confirmation: ['', Validators.required]
    }, {
      validators: MustMatch('password', 'password_confirmation')
    });
  }

  ngOnInit() {
    this.googleAuthService.initGoogleOneTap(false);
    this.route.queryParams.subscribe(params => {
      const token = params['token'];
      if (token) {
        localStorage.setItem('auth_token', token);
        this.authService.loadUserProfile(true).subscribe({
          next: () => this.router.navigate(['/dashboard']),
          error: () => this.error = 'Error al cargar perfil tras inicio con Google.'
        });
      }
    });
  }

  get f() { return this.registerForm.controls; }

  togglePasswordVisibility() {
    this.showPassword = !this.showPassword;
  }

  toggleConfirmPasswordVisibility() {
    this.showConfirmPassword = !this.showConfirmPassword;
  }

  onFileChange(event: Event) {
    const input = event.target as HTMLInputElement;
    this.fileError = '';
    this.selectedFile = null;

    if (input.files && input.files.length) {
      const file = input.files[0];
      if (!file.type.startsWith('image/')) {
        this.fileError = 'El archivo debe ser una imagen.';
        input.value = ''; return;
      }
      if (file.size > 5 * 1024 * 1024) {
        this.fileError = 'La imagen no debe superar los 5MB.';
        input.value = ''; return;
      }
      this.selectedFile = file;
    }
  }

  onSubmit() {
    this.submitted = true;
    this.error = '';
    this.fileError = '';
    Object.keys(this.f).forEach(key => {
      this.f[key].setErrors( this.f[key].errors ? { ...this.f[key].errors, serverError: null } : null );
      this.f[key].updateValueAndValidity({ onlySelf: true, emitEvent: false });
    });

    if (this.registerForm.invalid) {
      const firstInvalidControl = Object.keys(this.f).find(key => this.f[key].invalid);
      if (firstInvalidControl) {
         document.getElementById(firstInvalidControl)?.focus();
      }
      return;
    }

    this.loading = true;

    const registerData: RegisterRequest = {
      name: this.registerForm.value.name,
      email: this.registerForm.value.email,
      password: this.registerForm.value.password,
      password_confirmation: this.registerForm.value.password_confirmation,
      phone: this.registerForm.value.phone,
      // Nuevos campos
      country: this.registerForm.value.country || null,
      birth_date: this.registerForm.value.birth_date || null,
      address: this.registerForm.value.address || null,
      gender: this.registerForm.value.gender || null,
      preferred_language: this.registerForm.value.preferred_language || null,
      foto_perfil: this.selectedFile
    };

    this.authService.register(registerData).subscribe({
      next: () => {
        this.registrationSuccess = true;
        this.loading = false;
        this.registerForm.reset();
        this.submitted = false;
        this.selectedFile = null;
        const fileInput = document.getElementById('foto_perfil') as HTMLInputElement;
        if (fileInput) fileInput.value = '';
      },
      error: err => {
        const defaultError = 'Ha ocurrido un error durante el registro.';
        this.error = err.error?.message || defaultError;

        if (err.error?.errors) {
          let specificErrorHandled = false;
          const errors = err.error.errors;
          Object.keys(errors).forEach(key => {
            const control = this.registerForm.get(key);
            const message = Array.isArray(errors[key]) ? errors[key][0] : errors[key];

            if (key === 'foto_perfil') {
               this.fileError = message;
               specificErrorHandled = true;
            } else if (control) {
               control.setErrors({ ...control.errors, serverError: message });
               specificErrorHandled = true;
            }
          });
          if (!specificErrorHandled && typeof errors === 'object' && errors !== null) {
              const firstKey = Object.keys(errors)[0];
              if (firstKey && Array.isArray(errors[firstKey]) && errors[firstKey].length > 0) {
                  this.error = errors[firstKey][0];
              } else if (firstKey && typeof errors[firstKey] === 'string') {
                  this.error = errors[firstKey];
              }
          }
        }
        this.loading = false;
      }
    });
  }

  navigateToLogin() {
    this.router.navigate(['/login']);
  }

  // Añadir método para detectar clics fuera del modal
  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent) {
    // Ignorar el primer clic (el que abre el componente)
    if (this.isFirstClick) {
      this.isFirstClick = false;
      return;
    }
    
    // Obtener el elemento principal del modal (la tarjeta blanca)
    const modalCard = document.querySelector('.mx-auto.w-full.max-w-6xl.overflow-hidden.rounded-2xl');
    
    // Si no encontramos el modal, no hacemos nada
    if (!modalCard) return;
    
    // Verificar si el clic fue dentro del modal
    const clickedInside = modalCard.contains(event.target as Node);
    
    // Si el clic fue fuera del modal, redirigir a la página inicial
    if (!clickedInside) {
      this.router.navigate(['/']);
    }
  }

  // Prevenir que los clics dentro del modal se propaguen al documento
  preventPropagation(event: MouseEvent) {
    event.stopPropagation();
  }

  toggleDarkMode() {
    this.themeService.toggleDarkMode();
  }
  
  isDarkMode(): boolean {
    return this.themeService.isDarkMode();
  }
}
