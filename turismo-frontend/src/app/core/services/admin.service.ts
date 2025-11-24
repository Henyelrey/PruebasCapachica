import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '../../../environments/environments';
import { User, Role } from '../models/user.model';
import { Observable, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';

export interface PaginatedResponse<T> {
  current_page: number;
  data: T[];
  first_page_url: string;
  from: number;
  last_page: number;
  last_page_url: string;
  links: {
    url: string | null;
    label: string;
    active: boolean;
  }[];
  next_page_url: string | null;
  path: string;
  per_page: number;
  prev_page_url: string | null;
  to: number;
  total: number;
}

export interface Permission {
  id: number;
  name: string;
  guard_name: string;
  created_at: string;
  updated_at: string;
}

export interface DashboardSummary {
  total_users: number;
  active_users: number;
  inactive_users: number;
  users_by_role: {
    role: string;
    count: number;
  }[];
  total_roles: number;
  total_permissions: number;
  recent_users: User[];
}

@Injectable({
  providedIn: 'root'
})
export class AdminService {
  private http = inject(HttpClient);
  private readonly API_URL = environment.apiUrl;

  // Users
  getUsers(page: number = 1, perPage: number = 10, active?: boolean, role?: string, search?: string): Observable<PaginatedResponse<User>> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('per_page', perPage.toString());

    if (active !== undefined) {
      params = params.set('active', active.toString());
    }

    if (role) {
      params = params.set('role', role);
    }

    if (search) {
      params = params.set('search', search);
    }

    return this.http.get<{success: boolean, data: PaginatedResponse<User>}>(`${this.API_URL}/users`, { params })
    .pipe(
      map(response => response.data)
    );
  }

  getUser(id: number): Observable<any> {
    return this.http.get<{success: boolean, data: any}>(`${this.API_URL}/users/${id}`);
  }

  // Método actualizado para usar FormData y manejar archivos
  createUser(userData: FormData): Observable<any> {
    return this.http.post<{success: boolean, message: string, data: User}>(`${this.API_URL}/users`, userData);
  }

  // Método actualizado para usar FormData y manejar archivos
  updateUser(id: number, userData: FormData): Observable<any> {
    return this.http.post<{success: boolean, message: string, data: User}>(`${this.API_URL}/users/${id}?_method=PUT`, userData);
  }

  deleteUser(id: number): Observable<any> {
    return this.http.delete(`${this.API_URL}/users/${id}`);
  }

  activateUser(id: number): Observable<User> {
    return this.http.post<User>(`${this.API_URL}/users/${id}/activate`, {});
  }

  deactivateUser(id: number): Observable<User> {
    return this.http.post<User>(`${this.API_URL}/users/${id}/deactivate`, {});
  }

  assignRolesToUser(userId: number, roles: string[]): Observable<any> {
    return this.http.post(`${this.API_URL}/users/${userId}/roles`, { roles });
  }

  // Método para actualizar la foto de perfil
  updateUserProfilePhoto(userId: number, photoData: FormData): Observable<any> {
    return this.http.post(`${this.API_URL}/users/${userId}/profile-photo`, photoData);
  }

  // Método para eliminar la foto de perfil
  deleteUserProfilePhoto(userId: number): Observable<any> {
    return this.http.delete(`${this.API_URL}/users/${userId}/profile-photo`);
  }

  getUserPermissions(userId: number): Observable<any> {
    return this.http.get(`${this.API_URL}/users/${userId}/permissions`);
  }

  // Roles
  getRoles(): Observable<Role[]> {
    return this.http.get<{success: boolean, data: Role[]}>(`${this.API_URL}/roles`).pipe(
      map(response => response.data || [])
    );
  }

  getRole(id: number): Observable<Role> {
    return this.http.get<{success: boolean, data: Role}>(`${this.API_URL}/roles/${id}`).pipe(
      map(response => response.data)
    );
  }

  createRole(role: { name: string, permissions: string[] }): Observable<Role> {
    return this.http.post<Role>(`${this.API_URL}/roles`, role);
  }

  updateRole(id: number, role: { name: string, permissions: string[] }): Observable<Role> {
    return this.http.put<Role>(`${this.API_URL}/roles/${id}`, role);
  }

  deleteRole(id: number): Observable<any> {
    return this.http.delete(`${this.API_URL}/roles/${id}`);
  }

  // Permissions
  getPermissions(): Observable<Permission[]> {
    return this.http.get<{ success: boolean, data: Permission[] }>(`${this.API_URL}/permissions`).pipe(
      map(response => response.data || [])
    );
  }
  
  assignPermissionsToUser(userId: number, permissions: string[]): Observable<any> {
    return this.http.post(`${this.API_URL}/permissions/assign-to-user`, {
      user_id: userId,
      permissions
    });
  }

  assignPermissionsToRole(roleId: number, permissions: string[]): Observable<any> {
    return this.http.post(`${this.API_URL}/permissions/assign-to-role`, {
      role_id: roleId,
      permissions
    });
  }

  // Dashboard
  getDashboardSummary(): Observable<DashboardSummary> {
    return this.http.get<{success: boolean, data: DashboardSummary}>(`${this.API_URL}/dashboard/summary`)
      .pipe(
        map(response => response.data)
      );
  }
}