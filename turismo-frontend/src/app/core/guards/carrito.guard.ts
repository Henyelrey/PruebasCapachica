import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const carritoGuard = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (authService.isLoggedIn()) {
    return true;
  } else {
    // Redirigir al login con la URL de retorno
    router.navigate(['/login'], { 
      queryParams: { redirect: '/carrito' } 
    });
    return false;
  }
};