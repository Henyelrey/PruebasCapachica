import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { AuthService } from '../services/auth.service';

/**
 * Guard para verificar que el usuario esté logueado antes de permitir inscripciones
 * Si no está logueado, redirige al login con la URL de retorno
 */
export const inscripcionGuard: CanActivateFn = (route) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (authService.isLoggedIn()) {
    return true;
  } else {
    // Obtener el ID del plan desde la ruta
    const planId = route.params['id'];
    const currentUrl = route.url.join('/');
    
    // Redirigir al login con la URL de retorno
    router.navigate(['/login'], { 
      queryParams: { 
        redirect: `/${currentUrl}`,
        action: 'inscripcion',
        planId: planId
      } 
    });
    return false;
  }
};

/**
 * Guard para verificar el acceso al detalle del plan
 * Los planes públicos se pueden ver sin login, pero para inscribirse necesita estar logueado
 */
export const planDetalleGuard: CanActivateFn = () => {
  // Los detalles de planes públicos siempre son accesibles
  // La verificación de autenticación se hará en el momento de la inscripción
  return true;
};