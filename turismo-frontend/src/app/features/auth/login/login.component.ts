import { Component, OnInit, inject, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { GoogleLoginButtonComponent } from '../../../shared/components/buttons/google-login-button.component';
import { GoogleAuthService } from '../../../core/services/google-auth.service';
import { ActivatedRoute } from '@angular/router';
import { ThemeService } from '../../../core/services/theme.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule, 
    ReactiveFormsModule, 
    RouterLink, 
    FormsModule, 
    GoogleLoginButtonComponent
  ],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private googleAuthService = inject(GoogleAuthService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  public themeService = inject(ThemeService);

  loginForm: FormGroup;
  loading = false;
  googleLoading = false;
  submitted = false;
  error = '';
  rememberMe = false;
  emailVerificationNeeded = false;

  // Para mostrar/ocultar contraseña
  showPassword = false;

  // Variable para evitar redirección en el primer clic
  private isFirstClick = true;

  constructor() {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required]
    });
  }

  ngOnInit() {
    // Inicializar el servicio de Google Auth
    this.googleAuthService.initGoogleOneTap(false);
    
    // Verificar si hay un token de Google en los parámetros de URL
    this.route.queryParams.subscribe(params => {
      const token = params['token'];
      if (token) {
        // Si hay un token, significa que venimos de un callback de Google
        // Guardamos el token y redirigimos al dashboard
        localStorage.setItem('auth_token', token);
        this.authService.loadUserProfile(true).subscribe({
          next: () => {
            this.router.navigate(['/dashboard']);
          },
          error: () => {
            this.error = 'Error al cargar el perfil de usuario';
          }
        });
      }
    });
  }

  get f() { 
    return this.loginForm.controls; 
  }
  
  // Método para mostrar/ocultar contraseña
  togglePasswordVisibility() {
    this.showPassword = !this.showPassword;
  }
  
  // Métodos para manejar el tema oscuro
  toggleDarkMode() {
    this.themeService.toggleDarkMode();
  }
  
  isDarkMode(): boolean {
    return this.themeService.isDarkMode();
  }

  onSubmit() {
    this.submitted = true;
    this.error = '';
    this.emailVerificationNeeded = false;

    if (this.loginForm.invalid) {
      return;
    }

    this.loading = true;
    this.authService.login(this.loginForm.value).subscribe({
      next: (response) => {
        // Verificar si el usuario necesita verificar su correo
        if (response.email_verified === false) {
          this.emailVerificationNeeded = true;
          this.error = 'Por favor, verifica tu correo electrónico antes de iniciar sesión.';
          this.loading = false;
          return;
        }
        
        // Esperar a que el perfil esté cargado antes de redirigir
        this.authService.loadUserProfile(true).subscribe({
          next: () => {
            this.loading = false;
            
            // USAR EL NUEVO MÉTODO para manejar redirección con queryParams
            this.authService.handlePostLoginRedirectWithParams(this.router, this.route);
          },
          error: () => {
            this.error = 'Error al cargar el perfil de usuario';
            this.loading = false;
          }
        });
      },
      error: err => {
        this.error = err.error?.message || 'Credenciales inválidas';
        this.loading = false;
      }
    });
  }
  
  resendVerificationEmail() {
    const email = this.loginForm.get('email')?.value;
    
    if (!email) {
      this.error = 'Por favor, ingresa tu correo electrónico.';
      return;
    }
    
    this.loading = true;
    this.authService.resendVerificationEmail().subscribe({
      next: () => {
        this.error = '';
        this.emailVerificationNeeded = true;
        this.loading = false;
        // Mostrar mensaje de éxito
        alert('Se ha enviado un nuevo correo de verificación. Por favor, revisa tu bandeja de entrada.');
      },
      error: (err) => {
        this.error = err.error?.message || 'Error al enviar el correo de verificación';
        this.loading = false;
      }
    });
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
}