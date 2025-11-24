import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '../../../environments/environments';
import { Categoria, CategoriaDTO } from './categoria.model';
import { PaginatedResponse } from '../../core/services/admin.service';

@Injectable({
  providedIn: 'root'
})
export class CategoriasService {
  private http = inject(HttpClient);
  private readonly API_URL = environment.apiUrl;

  getCategorias(page: number = 1, perPage: number = 10, search?: string): Observable<PaginatedResponse<Categoria>> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('per_page', perPage.toString());

    if (search) {
      params = params.set('search', search);
    }

    return this.http.get<{ success: boolean, data: PaginatedResponse<Categoria> }>(`${this.API_URL}/categorias`, { params })
      .pipe(map(response => response.data));
  }

  getCategoria(id: number): Observable<Categoria> {
    return this.http.get<{ success: boolean, data: Categoria }>(`${this.API_URL}/categorias/${id}`)
      .pipe(map(response => response.data));
  }

  createCategoria(categoria: CategoriaDTO): Observable<Categoria> {
    return this.http.post<{ success: boolean, data: Categoria }>(`${this.API_URL}/categorias`, categoria)
      .pipe(map(response => response.data));
  }

  updateCategoria(id: number, categoria: CategoriaDTO): Observable<Categoria> {
    return this.http.put<{ success: boolean, data: Categoria }>(`${this.API_URL}/categorias/${id}`, categoria)
      .pipe(map(response => response.data));
  }

  deleteCategoria(id: number): Observable<any> {
    return this.http.delete<{ success: boolean, message: string }>(`${this.API_URL}/categorias/${id}`);
  }

  toggleEstado(id: number, estado: boolean): Observable<Categoria> {
    return this.http.patch<{ success: boolean, data: Categoria }>(`${this.API_URL}/categorias/${id}/estado`, { estado })
      .pipe(map(response => response.data));
  }
}
