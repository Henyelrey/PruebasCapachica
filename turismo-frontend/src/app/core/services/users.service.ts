import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../../environments/environments';
import { ApiResponse } from '../models/api.model';
import { User } from '../models/user.model';

@Injectable({
  providedIn: 'root'
})
export class UsersService {
  private http = inject(HttpClient);
  private readonly API_URL = environment.apiUrl;
  
  constructor() { }
  
  // Buscar usuarios por email o nombre
  searchUsers(query: string): Observable<User[]> {
    return this.http.get<ApiResponse<User[]>>(`${this.API_URL}/users/search`, { 
      params: { q: query }
    }).pipe(map(response => response.data || []));
  }
  
  // Obtener usuarios por rol
  getUsersByRole(role: string): Observable<User[]> {
    return this.http.get<ApiResponse<User[]>>(`${this.API_URL}/users/role/${role}`)
      .pipe(map(response => response.data || []));
  }
}