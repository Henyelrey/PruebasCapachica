// src/app/core/services/menu.service.ts
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject, of } from 'rxjs';
import { map, tap, catchError } from 'rxjs/operators';
import { environment } from '../../../environments/environments';

export interface MenuItem {
  id: string;
  title: string;
  icon?: string;
  path: string;
  children?: MenuItem[];
}

@Injectable({
  providedIn: 'root'
})
export class MenuService {
  private http = inject(HttpClient);
  private readonly API_URL = environment.apiUrl;
  
  private menuItemsSubject = new BehaviorSubject<MenuItem[]>([]);
  menuItems$ = this.menuItemsSubject.asObservable();
  
  private menuLoaded = false;

  constructor() {}

  loadMenu(): Observable<MenuItem[]> {
    if (this.menuLoaded) {
      return this.menuItems$;
    }
    
    return this.http.get<{ success: boolean, data: MenuItem[] }>(`${this.API_URL}/menu`).pipe(
      map(response => response.data || []),
      tap(menuItems => {
        this.menuItemsSubject.next(menuItems);
        this.menuLoaded = true;
        console.log('Menú dinámico cargado:', menuItems);
      }),
      catchError(error => {
        console.error('Error al cargar el menú dinámico:', error);
        // Menú por defecto en caso de error
        const defaultMenu: MenuItem[] = [
          {
            id: 'dashboard',
            title: 'Dashboard',
            icon: 'dashboard',
            path: '/dashboard'
          },
          {
            id: 'profile',
            title: 'Mi Perfil',
            icon: 'user',
            path: '/profile'
          }
        ];
        this.menuItemsSubject.next(defaultMenu);
        return of(defaultMenu);
      })
    );
  }

  getMenuItems(): MenuItem[] {
    return this.menuItemsSubject.getValue();
  }

  getFirstAccessibleRoute(): string {
    const menuItems = this.getMenuItems();
    if (menuItems.length > 0) {
      return menuItems[0].path;
    }
    return '/dashboard'; // Ruta por defecto
  }

  resetMenu(): void {
    this.menuLoaded = false;
    this.menuItemsSubject.next([]);
  }
}