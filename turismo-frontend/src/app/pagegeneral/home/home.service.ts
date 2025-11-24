// home.service.ts
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '../../../environments/environments';
import { Home, HomeDTO, Reserva, Municipalidad, Evento } from './home.model';
import { PaginatedResponse } from '../../core/services/admin.service';

@Injectable({
  providedIn: 'root'
})
export class HomeService {
  private http = inject(HttpClient);
  private readonly API_URL = environment.apiUrl;

  getEmprendedores(page: number = 1, perPage: number = 10, search?: string): Observable<PaginatedResponse<Home>> {
    return this.http.get<{ success: boolean, data: PaginatedResponse<Home> }>(`${this.API_URL}/emprendedores`)
      .pipe(
        map(response => response.data)
      );
  }

  getEmprendedor(id: number): Observable<Home> {
    return this.http.get<{ success: boolean, data: Home }>(`${this.API_URL}/emprendedores/${id}`)
      .pipe(
        map(response => response.data)
      );
  }

  getReserva(): Observable<Reserva[]> {
    return this.http.get<{ success: boolean, data: Reserva[] }>(`${this.API_URL}/reservas`)
      .pipe(
        map(response => response.data)
      );
  }

  getMunicipalidad(): Observable<Municipalidad> {
    return this.http.get<{ success: boolean; data: Municipalidad }>(`${this.API_URL}/municipalidad/1`)
      .pipe(
        map(response => response.data)
      );
  }


  getCategorias(): Observable<any> {
    return this.http.get<any>(`${this.API_URL}/categorias`); // Ajusta el dominio según tu backend
  }

  getEventos(): Observable<any> {
    return this.http.get<any>(`${this.API_URL}/eventos`);
  }



}