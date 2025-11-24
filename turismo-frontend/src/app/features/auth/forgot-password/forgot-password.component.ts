import { Component, inject, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink, Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { ThemeService } from '../../../core/services/theme.service';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './forgot-password.component.html',
  styleUrls: ['./forgot-password.component.css']
})
export class ForgotPasswordComponent {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);
  public themeService = inject(ThemeService);

  forgotForm: FormGroup;
  loading = false;
  submitted = false;
  error = '';
  emailSent = false;

  // Variable para evitar redirección en el primer clic
  private isFirstClick = true;

  constructor() {
    this.forgotForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]]
    });
  }

  get f() { 
    return this.forgotForm.controls; 
  }

  onSubmit(): void {
    this.submitted = true;
    this.error = '';

    if (this.forgotForm.invalid) {
      return;
    }

    this.loading = true;
    
    this.authService.forgotPassword(this.forgotForm.value.email).subscribe({
      next: () => {
        this.emailSent = true;
        this.loading = false;
      },
      error: err => {
        this.error = err.error?.message || 'Error al enviar el correo de recuperación.';
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

  toggleDarkMode() {
    this.themeService.toggleDarkMode();
  }
  
  isDarkMode(): boolean {
    return this.themeService.isDarkMode();
  }
}