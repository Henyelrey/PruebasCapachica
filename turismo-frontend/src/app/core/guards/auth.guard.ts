// src/app/core/guards/auth.guard.ts
import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { Observable, of, map, catchError, take, switchMap, tap } from 'rxjs';
import { AuthService } from '../services/auth.service';

// Guard para rutas que requieren autenticación
export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  
  console.log('AuthGuard: Verificando autenticación...');
  
  // Si el usuario ya está cargado y autenticado, permitir acceso
  if (authService.isLoggedIn() && authService.currentUser()) {
    console.log('AuthGuard: Usuario ya autenticado, acceso permitido');
    return true;
  }
  
  // Si hay un token pero no tenemos el usuario, intentar cargarlo
  if (authService.getToken()) {
    console.log('AuthGuard: Token encontrado, intentando cargar perfil...');
    
    return authService.loadUserProfile(true).pipe(
      tap(user => console.log('AuthGuard: Resultado de carga de perfil:', user)),
      map(user => {
        if (user) {
          console.log('AuthGuard: Usuario cargado correctamente, acceso permitido');
          return true;
        } else {
          console.log('AuthGuard: No se pudo cargar el usuario, redirigiendo a login');
          return router.createUrlTree(['/login']);
        }
      }),
      catchError(err => {
        console.error('AuthGuard: Error al cargar perfil', err);
        return of(router.createUrlTree(['/login']));
      })
    );
  }
  
  // Si no hay token, redirigir al login
  console.log('AuthGuard: No hay token, redirigiendo a login');
  return router.createUrlTree(['/login']);
};

// Guard para rutas que requieren NO estar autenticado (login, register, etc.)
export const nonAuthGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);
  
  console.log('NonAuthGuard: Verificando que NO esté autenticado...');
  
  // Si el usuario NO está autenticado, permitir acceso
  if (!authService.isLoggedIn()) {
    console.log('NonAuthGuard: Usuario no autenticado, acceso permitido');
    return true;
  }
  
  // Si el usuario está autenticado, verificar si administra emprendimientos
  console.log('NonAuthGuard: Usuario autenticado, verificando estado de emprendimientos');
  
  // Si hay señal de que administra emprendimientos
  if (authService.administraEmprendimientos()) {
    console.log('NonAuthGuard: Usuario administra emprendimientos, redirigiendo a selección de panel');
    return router.createUrlTree(['/seleccion-panel']);
  }
  
  // Si no administra emprendimientos o no está cargada la información,
  // intentar cargar el perfil para obtener la información más reciente
  return authService.loadUserProfile(false).pipe(
    map(user => {
      if (authService.administraEmprendimientos()) {
        console.log('NonAuthGuard: Perfil cargado, usuario administra emprendimientos');
        return router.createUrlTree(['/seleccion-panel']);
      } else {
        console.log('NonAuthGuard: Perfil cargado, usuario no administra emprendimientos');
        return router.createUrlTree(['/dashboard']);
      }
    }),
    catchError(() => {
      console.log('NonAuthGuard: Error al cargar perfil, redirigiendo a dashboard por defecto');
      return of(router.createUrlTree(['/dashboard']));
    })
  );
};