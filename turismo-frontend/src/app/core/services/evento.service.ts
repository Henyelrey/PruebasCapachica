import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environments';

@Injectable({
  providedIn: 'root'
})
export class EventoService {
  private readonly apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) { }

  // Event-related methods
  // Get all events
  getEventos(): Observable<any> {
    return this.http.get(`${this.apiUrl}/eventos`);
  }

  // Get a single event by ID
  getEvento(id: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/eventos/${id}`);
  }

  // Create a new event
  createEvento(evento: {
    titulo: string;
    descripcion: string;
    fecha_inicio: string;
    fecha_fin: string;
    lugar: string;
    capacidad: number;
    precio: number;
    imagen?: string;
  }): Observable<any> {
    return this.http.post(`${this.apiUrl}/eventos`, evento);
  }

  // Update an event
  updateEvento(id: number, evento: {
    titulo?: string;
    descripcion?: string;
    fecha_inicio?: string;
    fecha_fin?: string;
    lugar?: string;
    capacidad?: number;
    precio?: number;
    imagen?: string;
  }): Observable<any> {
    return this.http.put(`${this.apiUrl}/eventos/${id}`, evento);
  }

  // Delete an event
  deleteEvento(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/eventos/${id}`);
  }

  // Get events by category
  getEventosByCategoria(categoria: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/eventos/categoria/${categoria}`);
  }

  // Get upcoming events
  getEventosProximos(): Observable<any> {
    return this.http.get(`${this.apiUrl}/eventos/proximos`);
  }

  // Get past events
  getEventosPasados(): Observable<any> {
    return this.http.get(`${this.apiUrl}/eventos/pasados`);
  }

  // Search events
  buscarEventos(termino: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/eventos/buscar/${termino}`);
  }

  // Reservation-related methods
  // Get all reservations
  getReservas(): Observable<any> {
    return this.http.get(`${this.apiUrl}/reservas`);
  }

  // Get a single reservation by ID
  getReserva(id: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/reservas/${id}`);
  }

  // Create a new reservation
  createReserva(reserva: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/reservas`, reserva);
  }

  // Update a reservation
  updateReserva(id: number, reserva: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/reservas/${id}`, reserva);
  }

  // Delete a reservation
  deleteReserva(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/reservas/${id}`);
  }
} 