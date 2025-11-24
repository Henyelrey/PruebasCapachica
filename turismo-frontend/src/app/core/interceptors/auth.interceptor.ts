import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { AuthService } from '../services/auth.service';
import { Router } from '@angular/router';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  const token = authService.getToken();
  
  // Excluir las solicitudes de login y registro de la lógica de intercepción
  const isAuthRequest = 
    req.url.includes('/login') || 
    req.url.includes('/register') ||
    req.url.includes('/forgot-password');
  
  if (token && !isAuthRequest) {
    console.log(`AuthInterceptor: Añadiendo token a solicitud ${req.url}`);
    
    // Clonar la solicitud para agregar el encabezado de autorización
    const authReq = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`,
        'Accept': 'application/json'
      }
    });
    
    // Procesar la respuesta y manejar errores de autenticación
    return next(authReq).pipe(
      catchError((error: HttpErrorResponse) => {
        if (error.status === 401) {
          console.error('AuthInterceptor: Error 401 (No autorizado)', req.url);
          
          // Solo redirigir a login si estamos en una ruta protegida
          if (window.location.pathname.startsWith('/dashboard') || 
              window.location.pathname.startsWith('/admin') ||
              window.location.pathname.startsWith('/profile')) {
            console.log('AuthInterceptor: Redirigiendo a login desde ruta protegida...');
            authService['clearAuthData'](); // Acceder al método privado
            router.navigate(['/login']);
          }
        }
        
        return throwError(() => error);
      })
    );
  }
  
  return next(req);
};