// src/app/core/services/auth.service.ts
import { Injectable, inject, signal } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, tap, catchError, throwError, map, of, BehaviorSubject, filter, take, switchMap, finalize, retry, timer } from 'rxjs';

import { User, RegisterRequest, LoginRequest, AuthResponse, ProfileResponse, Role, Permission } from '../models/user.model';
import { environment } from '../../../environments/environments';
import { ApiResponse } from '../models/api.model';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private http = inject(HttpClient);
  private router = inject(Router);
  
  private readonly API_URL = environment.apiUrl;
  private readonly TOKEN_KEY = 'auth_token';

  // Usar signals para manejar el estado de autenticación y usuario
  private readonly _isLoggedIn = signal<boolean>(this.hasToken());
  private readonly _currentUser = signal<User | null>(null);
  private readonly _isLoading = signal<boolean>(false);
  private readonly _profileLoaded = signal<boolean>(false);
  private readonly _emailVerified = signal<boolean>(false);
  private readonly _userRoles = signal<string[]>([]);
  private readonly _userPermissions = signal<string[]>([]);
  
  // Signals específicos para la gestión de emprendimientos
  private readonly _administraEmprendimientos = signal<boolean>(false);
  private readonly _emprendimientos = signal<any[]>([]);

  // Exponer los signals como readonly
  readonly isLoggedIn = this._isLoggedIn.asReadonly();
  readonly currentUser = this._currentUser.asReadonly();
  readonly isLoading = this._isLoading.asReadonly();
  readonly profileLoaded = this._profileLoaded.asReadonly();
  readonly emailVerified = this._emailVerified.asReadonly();
  readonly userRoles = this._userRoles.asReadonly();
  readonly userPermissions = this._userPermissions.asReadonly();
  readonly administraEmprendimientos = this._administraEmprendimientos.asReadonly();
  readonly emprendimientos = this._emprendimientos.asReadonly();

  private userLoadAttempted = false;
  private userLoading = new BehaviorSubject<boolean>(false);
  private profileLoadRetryCount = 0;
  private maxProfileLoadRetries = 3;

  constructor() {
    // Si hay un token, intenta cargar el perfil del usuario
    if (this.hasToken()) {
      // Añadimos un pequeño retraso para asegurar que los interceptores están registrados
      setTimeout(() => {
        this.loadInitialUser();
      }, 100);
    }
  }

  loadUserProfile(forceReload = false): Observable<User | null> {
    // Si ya estamos cargando, devuelve un observable que emite cuando termine
    if (this.userLoading.value) {
      return this.userLoading.pipe(
        filter(loading => !loading),
        take(1),
        switchMap(() => of(this.currentUser()))
      );
    }

    // Si ya intentamos cargar y no queremos forzar recarga, devuelve el usuario actual
    if (this.userLoadAttempted && !forceReload && this.currentUser()) {
      return of(this.currentUser());
    }

    // Si no hay token, no hay usuario autenticado
    if (!this.hasToken()) {
      this.userLoadAttempted = true;
      return of(null);
    }

    // Marcamos que estamos cargando
    this.userLoading.next(true);
    this._isLoading.set(true);
    
    console.log('Realizando petición para cargar perfil de usuario...');
    
    // Realiza la petición HTTP con reintentos
    return this.http.get<ProfileResponse>(`${this.API_URL}/profile`).pipe(
      retry({
        count: 2,
        delay: (error, retryCount) => {
          console.log(`Reintentando cargar perfil (${retryCount})...`);
          return timer(1000 * retryCount); // Incrementa el tiempo entre reintentos
        }
      }),
      tap(response => {
        console.log('Respuesta de perfil recibida:', response);
        this.profileLoadRetryCount = 0; // Reinicia el contador de reintentos
        
        // Actualizar estado de verificación de email
        if (response?.data?.email_verified !== undefined) {
          this._emailVerified.set(response.data.email_verified);
        }
        
        // Actualizar roles y permisos si están disponibles
        if (response?.data?.roles) {
          console.log('Roles recibidos:', response.data.roles);
          this._userRoles.set(response.data.roles);
        }
        
        if (response?.data?.permissions) {
          console.log('Permisos recibidos:', response.data.permissions);
          this._userPermissions.set(response.data.permissions);
        }
        
        // Actualizar información de emprendimientos
        if (response?.data?.administra_emprendimientos !== undefined) {
          console.log('Administra emprendimientos:', response.data.administra_emprendimientos);
          this._administraEmprendimientos.set(response.data.administra_emprendimientos);
        }
        
        if (response?.data?.emprendimientos) {
          console.log('Emprendimientos recibidos:', response.data.emprendimientos);
          this._emprendimientos.set(response.data.emprendimientos);
        }
      }),
      map(response => {
        // Extraer usuario de la respuesta según la estructura
        let user: User | null = null;
        
        if (response && response.success && response.data) {
          if (response.data.user) {
            user = response.data.user;
          } else {
            user = response.data as any;
          }
        } else if (response && !('success' in response)) {
          // Si la respuesta es directamente el usuario
          user = response as any;
        }
        
        console.log('Usuario extraído de la respuesta:', user);
        return user;
      }),
      tap(user => {
        // Actualiza el estado
        this.userLoadAttempted = true;
        this._profileLoaded.set(true);
        
        if (user) {
          console.log('Actualizando estado con usuario:', user);
          this._currentUser.set(user);
          this._isLoggedIn.set(true);
        } else {
          console.warn('No se pudo extraer el usuario de la respuesta');
          // Solo limpiamos si no estamos en un reintento
          if (this.profileLoadRetryCount >= this.maxProfileLoadRetries) {
            this.clearAuthData();
          }
        }
      }),
      catchError((error: HttpErrorResponse) => {
        console.error('Error al cargar perfil de usuario:', error);
        
        // Incrementar contador de reintentos
        this.profileLoadRetryCount++;
        
        // Solo limpiamos datos de auth si hemos agotado los reintentos
        if (this.profileLoadRetryCount >= this.maxProfileLoadRetries) {
          console.error(`Se agotaron los reintentos (${this.maxProfileLoadRetries})`);
          this.userLoadAttempted = true;
          
          // Si es un error 401, limpiar datos de auth
          if (error.status === 401) {
            console.error('Token no válido o expirado (401)');
            this.clearAuthData();
          }
        } else {
          // Si aún tenemos reintentos disponibles, programamos otro intento
          console.log(`Programando reintento ${this.profileLoadRetryCount} de ${this.maxProfileLoadRetries}...`);
          setTimeout(() => {
            console.log('Ejecutando reintento programado...');
            this.loadUserProfile(true).subscribe({
              error: err => console.error('Error en reintento:', err)
            });
          }, 2000 * this.profileLoadRetryCount); // Incrementamos el tiempo entre reintentos
        }
        
        return of(null);
      }),
      finalize(() => {
        // Marcar que ya no estamos cargando
        this.userLoading.next(false);
        this._isLoading.set(false);
      })
    );
  }

  private loadInitialUser() {
    console.log('Cargando perfil de usuario inicial...');
    this.loadUserProfile().subscribe({
      next: user => {
        console.log('Perfil de usuario cargado:', user);
      },
      error: err => {
        console.error('Error inesperado al cargar perfil:', err);
      }
    });
  }

  // Método auxiliar para limpiar datos de autenticación
  private clearAuthData() {
    console.log('Limpiando datos de autenticación...');
    localStorage.removeItem(this.TOKEN_KEY);
    this._isLoggedIn.set(false);
    this._currentUser.set(null);
    this._profileLoaded.set(false);
    this._emailVerified.set(false);
    this._userRoles.set([]);
    this._userPermissions.set([]);
    this._administraEmprendimientos.set(false);
    this._emprendimientos.set([]);
    
    // No redirigimos automáticamente en este método para evitar redirecciones innecesarias
    // Solo redirige si estamos en una ruta protegida
    if (window.location.pathname.startsWith('/dashboard') || 
        window.location.pathname.startsWith('/admin') ||
        window.location.pathname.startsWith('/profile') ||
        window.location.pathname.startsWith('/mis-emprendimientos') ||
        window.location.pathname.startsWith('/emprendimiento')) {
      console.log('Redirigiendo a login desde ruta protegida...');
      this.router.navigate(['/login']);
    }
  }

  register(data: RegisterRequest): Observable<AuthResponse> {
    // Convertir a FormData si se incluye foto de perfil
    const formData = new FormData();
    
    // Añadir todos los campos al FormData
    Object.keys(data).forEach(key => {
      if (data[key] !== null && data[key] !== undefined) {
        // Para los archivos, incluirlos directamente
        if (key === 'foto_perfil' && data[key] instanceof File) {
          formData.append(key, data[key] as File);
        } else {
          formData.append(key, data[key] as string);
        }
      }
    });
    
    return this.http.post<ApiResponse<AuthResponse>>(`${this.API_URL}/register`, formData)
      .pipe(
        map(response => response.data as AuthResponse),
        tap(response => {
          this.handleAuthResponse(response);
          if (response.email_verified !== undefined) {
            this._emailVerified.set(response.email_verified);
          }
        }),
        catchError(error => this.handleError(error))
      );
  }

  login(data: LoginRequest): Observable<AuthResponse> {
    return this.http.post<ApiResponse<AuthResponse>>(`${this.API_URL}/login`, data)
      .pipe(
        map(response => {
          if (!response.data) {
            throw new Error("No data in response");
          }
        
          return {
            access_token: response.data.access_token,
            token_type: response.data.token_type,
            expires_in: 0,
            user: response.data.user,
            email_verified: response.data.email_verified
          };
        }),
        tap(authResponse => {
          this.handleAuthResponse(authResponse);
          if (authResponse.email_verified !== undefined) {
            this._emailVerified.set(authResponse.email_verified);
          }
          
          // En lugar de redirigir directamente, usamos el nuevo método
          this.handlePostLoginRedirect();
        }),
        catchError(error => this.handleError(error))
      );
  }
  
  // Método para manejar la redirección después del login basado en si el usuario administra emprendimientos
  handlePostLoginRedirect() {
    // Primero verificar si hay queryParams guardados en localStorage
    const savedRedirect = this.getAndClearRedirectUrl();
    
    if (savedRedirect) {
      // Si hay una URL guardada, usarla
      this.router.navigateByUrl(savedRedirect);
      return;
    }

    // Verificar si el usuario administra emprendimientos
    if (this.currentUser() && this._profileLoaded() && this._isLoggedIn()) {
      // Obtener los datos del perfil actual
      this.http.get<ProfileResponse>(`${this.API_URL}/profile`).pipe(
        take(1)
      ).subscribe({
        next: (response) => {
          const administraEmprendimientos = response?.data?.administra_emprendimientos;
          
          if (administraEmprendimientos) {
            // Si administra emprendimientos, redirigir a la selección de panel
            this.router.navigate(['/seleccion-panel']);
          } else {
            // Si no administra emprendimientos, redirigir al dashboard normal
            this.router.navigate(['/dashboard']);
          }
        },
        error: () => {
          // En caso de error, redirigir al dashboard por defecto
          this.router.navigate(['/dashboard']);
        }
      });
    } else {
      // Por defecto, ir al dashboard
      this.router.navigate(['/dashboard']);
    }
  }

  // NUEVO MÉTODO: Manejar redirección con router y route (para usar desde componentes)
  handlePostLoginRedirectWithParams(router: any, route: any): void {
    const queryParams = route.snapshot.queryParams;
    
    if (queryParams['redirect']) {
      // Si hay una URL de redirección específica en queryParams
      router.navigateByUrl(queryParams['redirect']);
    } else if (queryParams['action'] === 'inscripcion' && queryParams['planId']) {
      // Si venía de intentar inscribirse a un plan
      router.navigate(['/planes/detalle', queryParams['planId']]);
    } else {
      // Usar el método existente para la lógica normal
      this.handlePostLoginRedirect();
    }
  }
  
  // Autenticación con Google
  loginWithGoogle(): Observable<string> {
    return this.http.get<ApiResponse<{ url: string }>>(`${this.API_URL}/auth/google`)
      .pipe(
        map(response => {
          if (!response.data || !response.data.url) {
            throw new Error("No URL in response");
          }
          
          return response.data.url;
        }),
        catchError(error => this.handleError(error))
      );
  }
  
  // Manejar callback de Google
  handleGoogleCallback(token: string, code: string): Observable<AuthResponse> {
    return this.http.get<ApiResponse<AuthResponse>>(`${this.API_URL}/auth/google/callback?code=${code}`)
      .pipe(
        map(response => response.data as AuthResponse),
        tap(authResponse => {
          this.handleAuthResponse(authResponse);
          this._emailVerified.set(true); // Los usuarios de Google siempre están verificados
          
          // Usar el método de redirección personalizado
          this.handlePostLoginRedirect();
        }),
        catchError(error => this.handleError(error))
      );
  }
  
  // Verificar correo electrónico
  verifyEmail(userId: number, hash: string): Observable<any> {
    return this.http.get<ApiResponse<any>>(`${this.API_URL}/email/verify/${userId}/${hash}`)
      .pipe(
        tap(() => {
          this._emailVerified.set(true);
        }),
        catchError(error => this.handleError(error))
      );
  }
  
  // Reenviar correo de verificación
  resendVerificationEmail(): Observable<any> {
    return this.http.post<ApiResponse<any>>(`${this.API_URL}/email/verification-notification`, {})
      .pipe(
        catchError(error => this.handleError(error))
      );
  }
  
  // Solicitar recuperación de contraseña
  forgotPassword(email: string): Observable<any> {
    return this.http.post<ApiResponse<any>>(`${this.API_URL}/forgot-password`, { email })
      .pipe(
        catchError(error => this.handleError(error))
      );
  }
  
  // Restablecer contraseña
  resetPassword(data: { email: string, token: string, password: string, password_confirmation: string }): Observable<any> {
    return this.http.post<ApiResponse<any>>(`${this.API_URL}/reset-password`, data)
      .pipe(
        catchError(error => this.handleError(error))
      );
  }

  logout(): Observable<any> {
    return this.http.post(`${this.API_URL}/logout`, {})
      .pipe(
        tap(() => {
          this.clearAuthData();
          this.router.navigate(['/login']);
        }),
        catchError(error => {
          this.clearAuthData();
          this.router.navigate(['/login']);
          return throwError(() => error);
        })
      );
  }

  getProfile(): Observable<User> {
    return this.http.get<ProfileResponse>(`${this.API_URL}/profile`)
      .pipe(
        map(response => {
          if (response.success && response.data) {
            // Actualizar estado de verificación de email
            if (response.data.email_verified !== undefined) {
              this._emailVerified.set(response.data.email_verified);
            }
            
            // Actualizar roles y permisos si están disponibles
            if (response.data.roles) {
              this._userRoles.set(response.data.roles);
            }
            
            if (response.data.permissions) {
              this._userPermissions.set(response.data.permissions);
            }
            
            // Actualizar información de emprendimientos
            if (response.data.administra_emprendimientos !== undefined) {
              this._administraEmprendimientos.set(response.data.administra_emprendimientos);
            }
            
            if (response.data.emprendimientos) {
              this._emprendimientos.set(response.data.emprendimientos);
            }
            
            if (response.data.user) {
              return response.data.user;
            }
          }
          throw new Error('Formato de respuesta no válido');
        }),
        tap(user => {
          this._currentUser.set(user);
        }),
        catchError(error => this.handleError(error))
      );
  }

  getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  private hasToken(): boolean {
    const token = localStorage.getItem(this.TOKEN_KEY);
    return !!token && token.length > 10; // Verificación básica de que el token parece válido
  }

  private handleAuthResponse(response: AuthResponse): void {
    if (response && response.access_token) {
      localStorage.setItem(this.TOKEN_KEY, response.access_token);
      this._isLoggedIn.set(true);
      this._currentUser.set(response.user);
      this._profileLoaded.set(true);
    } else {
      console.warn('Formato de respuesta de autenticación no válido:', response);
    }
  }

  private handleError(error: any): Observable<never> {
    console.error('Error en AuthService:', error);
    
    if (error.status === 401) {
      this.clearAuthData();
    }
    
    return throwError(() => error);
  }
  
  /**
 * Verify email with a complete URL
 * @param url Full verification URL
 * @returns Observable<any>
 */
  verifyEmailWithFullUrl(url: string): Observable<any> {
    return this.http.get<ApiResponse<any>>(url, {
      headers: {
        'X-Requested-With': 'XMLHttpRequest'
      }
    }).pipe(
      tap(() => {
        this._emailVerified.set(true);
        console.log('Email verification successful, updating state');
      }),
      catchError(error => {
        console.error('Error in email verification:', error);
        return this.handleError(error);
      })
    );
  }
  
  // Método para verificar si el usuario tiene un rol específico
  hasRole(role: string): boolean {
    const roles = this.userRoles();
    return roles.includes(role);
  }
  
  // Método para verificar si el usuario tiene un permiso específico
  hasPermission(permission: string): boolean {
    const permissions = this.userPermissions();
    return permissions.includes(permission);
  }
  
  updateProfile(data: FormData): Observable<User> {
    data.append('_method', 'PUT'); // Esto es clave para Laravel
  
    return this.http.post<ApiResponse<User>>(`${this.API_URL}/profile`, data)
      .pipe(
        map(response => {
          if (!response.data) {
            throw new Error("No data in response");
          }
          return response.data;
        }),
        tap(user => {
          this._currentUser.set(user);
        }),
        catchError(error => this.handleError(error))
      );
  }
  /**
   * Guarda la URL actual para redirección después del login
   */
  saveRedirectUrl(url: string): void {
    localStorage.setItem('redirect_after_login', url);
  }

  /**
   * Obtiene y limpia la URL de redirección guardada
   */
  getAndClearRedirectUrl(): string | null {
    const url = localStorage.getItem('redirect_after_login');
    if (url) {
      localStorage.removeItem('redirect_after_login');
    }
    return url;
  }
}