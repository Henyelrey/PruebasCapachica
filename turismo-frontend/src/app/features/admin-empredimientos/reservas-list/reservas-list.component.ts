import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { EmprendimientoAdminService } from '../../../core/services/emprendimiento-admin.service';
import { 
  Emprendimiento, 
  Reserva, 
  PaginatedResponse,
  UpdateEstadoServicioRequest,
  ReservaServicio
} from '../../../core/models/emprendimiento-admin.model';

// Extendemos ReservaServicio para incluir la propiedad updating
interface ReservaServicioWithUpdating extends ReservaServicio {
  updating?: boolean;
}

// Extendemos Reserva para usar el ReservaServicio con updating
interface ReservaWithUpdating extends Omit<Reserva, 'servicios'> {
  servicios: ReservaServicioWithUpdating[];
}

// Interface para mensajes de chat (estático por ahora)
interface ChatMessage {
  id: number;
  sender: 'cliente' | 'emprendedor';
  message: string;
  timestamp: Date;
  read: boolean;
}

@Component({
  selector: 'app-reservas-list',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  template: `
    <!-- Loading state glassmorphism -->
    <div *ngIf="loading && !reservasData" class="flex items-center justify-center h-64">
      <div class="relative">
        <div class="w-16 h-16 border-4 border-orange-200/30 rounded-full"></div>
        <div class="w-16 h-16 border-4 border-orange-400 border-t-transparent rounded-full animate-spin absolute top-0"></div>
      </div>
    </div>

    <!-- Main content glassmorphism -->
    <div *ngIf="!loading || reservasData" class="space-y-8">
      <!-- Header -->
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-3xl font-bold bg-gradient-to-r from-orange-400 via-orange-300 to-amber-300 bg-clip-text text-transparent">
            Reservas
          </h1>
          <p class="text-slate-300 dark:text-slate-400 mt-1">
            Administra todas las reservas de {{ emprendimiento?.nombre || 'tu emprendimiento' }}
          </p>
        </div>
        <div class="flex items-center gap-3">
          <button (click)="exportToCSV()" 
                  [disabled]="loading || !reservasData?.data?.length"
                  class="group flex items-center px-4 py-2.5 rounded-xl bg-white/10 dark:bg-slate-800/40 text-white hover:bg-white/20 dark:hover:bg-slate-700/60 transition-all duration-300 shadow-lg border border-white/10 dark:border-slate-700/50 disabled:opacity-50">
            <svg class="w-5 h-5 mr-2 group-hover:scale-110 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
            </svg>
            <span class="font-medium">Exportar CSV</span>
          </button>
          <button (click)="refreshData()" 
                  [disabled]="loading"
                  class="group flex items-center px-4 py-2.5 rounded-xl bg-white/10 dark:bg-slate-800/60 text-white hover:bg-white/20 dark:hover:bg-slate-700/80 transition-all duration-300 shadow-lg hover:shadow-xl border border-white/10 dark:border-slate-700/50 hover:border-white/20 dark:hover:border-slate-600/60 disabled:opacity-50">
            <svg *ngIf="!loading" class="h-5 w-5 mr-2 group-hover:rotate-180 transition-transform duration-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/>
            </svg>
            <div *ngIf="loading" class="w-5 h-5 mr-2 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
            <span class="font-medium">Actualizar</span>
          </button>
        </div>
      </div>

      <!-- Filters glassmorphism -->
      <div class="backdrop-blur-sm bg-white/10 dark:bg-slate-800/40 rounded-2xl p-6 border border-white/20 dark:border-slate-700/50 shadow-xl">
        <div class="grid grid-cols-1 md:grid-cols-4 gap-6">
          <!-- Estado Filter -->
          <div class="space-y-2">
            <label for="estado" class="block text-sm font-medium text-slate-300">Estado</label>
            <select
              id="estado"
              [(ngModel)]="filters.estado"
              (change)="applyFilters()"
              class="w-full px-3 py-2 border border-slate-600/50 rounded-xl bg-white/10 dark:bg-slate-800/30 text-white focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-orange-400 transition-all duration-300">
              <option value="" class="bg-slate-800 text-white">Todos</option>
              <option value="pendiente" class="bg-slate-800 text-white">Pendiente</option>
              <option value="confirmada" class="bg-slate-800 text-white">Confirmada</option>
              <option value="cancelada" class="bg-slate-800 text-white">Cancelada</option>
              <option value="completada" class="bg-slate-800 text-white">Completada</option>
            </select>
          </div>

          <!-- Fecha Inicio -->
          <div class="space-y-2">
            <label for="fecha_inicio" class="block text-sm font-medium text-slate-300">Fecha Desde</label>
            <input
              type="date"
              id="fecha_inicio"
              [(ngModel)]="filters.fecha_inicio"
              (change)="applyFilters()"
              class="w-full px-3 py-2 border border-slate-600/50 rounded-xl bg-white/10 dark:bg-slate-800/30 text-white focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-orange-400 transition-all duration-300">
          </div>

          <!-- Fecha Fin -->
          <div class="space-y-2">
            <label for="fecha_fin" class="block text-sm font-medium text-slate-300">Fecha Hasta</label>
            <input
              type="date"
              id="fecha_fin"
              [(ngModel)]="filters.fecha_fin"
              (change)="applyFilters()"
              class="w-full px-3 py-2 border border-slate-600/50 rounded-xl bg-white/10 dark:bg-slate-800/30 text-white focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-orange-400 transition-all duration-300">
          </div>

          <!-- Clear Filters -->
          <div class="flex items-end">
            <button
              (click)="clearFilters()"
              class="w-full px-4 py-2 border border-white/20 dark:border-slate-600/50 rounded-xl text-sm font-medium text-slate-300 bg-white/10 dark:bg-slate-800/30 hover:bg-white/20 dark:hover:bg-slate-700/50 transition-all duration-300">
              Limpiar filtros
            </button>
          </div>
        </div>
      </div>

      <!-- Error state glassmorphism -->
      <div *ngIf="error" class="backdrop-blur-sm bg-red-500/20 border border-red-500/30 rounded-2xl p-6">
        <div class="flex items-center gap-3">
          <svg class="w-6 h-6 text-red-300 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
          </svg>
          <div>
            <h3 class="text-red-200 font-semibold">Error al cargar las reservas</h3>
            <p class="text-red-300 text-sm">{{ error }}</p>
            <button (click)="loadReservas()" 
                    class="mt-2 px-4 py-2 rounded-xl bg-red-500/20 text-red-200 hover:bg-red-500/30 transition-all duration-300 text-sm font-medium">
              Reintentar
            </button>
          </div>
        </div>
      </div>

      <!-- Empty state glassmorphism -->
      <div *ngIf="!loading && !error && (!reservasData?.data || reservasData?.data?.length === 0)" 
           class="text-center py-16">
        <svg class="mx-auto h-20 w-20 text-slate-400 mb-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
        </svg>
        <h3 class="text-xl font-semibold text-white mb-2">No hay reservas</h3>
        <p class="text-slate-300 dark:text-slate-400 mb-6">
          {{ hasActiveFilters() ? 'No se encontraron reservas con los filtros aplicados.' : 'Aún no tienes reservas para este emprendimiento.' }}
        </p>
        <button *ngIf="hasActiveFilters()" 
                (click)="clearFilters()"
                class="px-6 py-3 rounded-xl bg-gradient-to-r from-orange-500 to-orange-400 text-white font-semibold hover:from-orange-600 hover:to-orange-500 transition-all duration-300">
          Limpiar filtros
        </button>
      </div>

      <!-- Summary Stats glassmorphism -->
      <div *ngIf="!loading && !error && reservasData?.data?.length" class="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div class="backdrop-blur-sm bg-white/10 dark:bg-slate-800/40 rounded-2xl p-6 border border-white/20 dark:border-slate-700/50 shadow-xl">
          <div class="flex items-center gap-3">
            <div class="p-3 rounded-xl bg-blue-500/20 text-blue-300">
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/>
              </svg>
            </div>
            <div>
              <p class="text-slate-300 text-sm font-medium">Total</p>
              <p class="text-2xl font-bold text-white">{{ reservasData?.total }}</p>
            </div>
          </div>
        </div>

        <div class="backdrop-blur-sm bg-white/10 dark:bg-slate-800/40 rounded-2xl p-6 border border-white/20 dark:border-slate-700/50 shadow-xl">
          <div class="flex items-center gap-3">
            <div class="p-3 rounded-xl bg-yellow-500/20 text-yellow-300">
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
              </svg>
            </div>
            <div>
              <p class="text-slate-300 text-sm font-medium">Pendientes</p>
              <p class="text-2xl font-bold text-white">{{ getReservasByEstado('pendiente').length }}</p>
            </div>
          </div>
        </div>

        <div class="backdrop-blur-sm bg-white/10 dark:bg-slate-800/40 rounded-2xl p-6 border border-white/20 dark:border-slate-700/50 shadow-xl">
          <div class="flex items-center gap-3">
            <div class="p-3 rounded-xl bg-green-500/20 text-green-300">
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
              </svg>
            </div>
            <div>
              <p class="text-slate-300 text-sm font-medium">Confirmadas</p>
              <p class="text-2xl font-bold text-white">{{ getReservasByEstado('confirmada').length }}</p>
            </div>
          </div>
        </div>

        <div class="backdrop-blur-sm bg-white/10 dark:bg-slate-800/40 rounded-2xl p-6 border border-white/20 dark:border-slate-700/50 shadow-xl">
          <div class="flex items-center gap-3">
            <div class="p-3 rounded-xl bg-purple-500/20 text-purple-300">
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"/>
              </svg>
            </div>
            <div>
              <p class="text-slate-300 text-sm font-medium">Ingresos Total</p>
              <p class="text-2xl font-bold text-white">S/ {{ calculateTotalIngresos() | number:'1.2-2' }}</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Reservas Cards glassmorphism -->
      <div *ngIf="!loading && !error && reservasData?.data?.length" class="space-y-6">
        <div *ngFor="let reserva of reservasData?.data; trackBy: trackByReserva" 
             class="backdrop-blur-sm bg-white/10 dark:bg-slate-800/40 rounded-2xl border border-white/20 dark:border-slate-700/50 shadow-xl overflow-hidden">
          
          <!-- Reserva Header glassmorphism -->
          <div class="px-6 py-4 bg-white/10 dark:bg-slate-700/40 border-b border-white/20 dark:border-slate-600/50">
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-4">
                <div class="w-12 h-12 bg-gradient-to-br from-orange-500/20 to-orange-600/20 rounded-xl flex items-center justify-center border border-orange-400/30">
                  <svg class="w-6 h-6 text-orange-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
                  </svg>
                </div>
                <div>
                  <h3 class="text-lg font-semibold text-white">{{ reserva.usuario.name || 'Usuario' }}</h3>
                  <p class="text-sm text-slate-300">Código: {{ reserva.codigo_reserva }}</p>
                </div>
              </div>
              <div class="flex items-center gap-4">
                <!-- Chat Button -->
                <button (click)="toggleChat(reserva.id)"
                        class="relative group flex items-center px-4 py-2 rounded-xl bg-blue-500/20 text-blue-300 hover:bg-blue-500/30 transition-all duration-300 border border-blue-400/30 hover:border-blue-400/50">
                  <svg class="w-5 h-5 mr-2 group-hover:scale-110 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"/>
                  </svg>
                  <span class="font-medium">Chat</span>
                  <!-- Notification badge -->
                  <span *ngIf="getUnreadMessagesCount(reserva.id) > 0" 
                        class="absolute -top-2 -right-2 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center animate-pulse">
                    {{ getUnreadMessagesCount(reserva.id) }}
                  </span>
                </button>
                
                <span class="inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold border"
                      [ngClass]="getEstadoBadgeClass(reserva.estado)">
                  {{ reserva.estado | titlecase }}
                </span>
                <span class="text-sm text-slate-400">
                  {{ reserva.created_at | date:'short' }}
                </span>
              </div>
            </div>
          </div>

          <!-- Chat Section (collapsible) -->
          <div *ngIf="activeChatReserva === reserva.id" 
               class="border-b border-white/20 dark:border-slate-600/50 bg-white/5 dark:bg-slate-800/20">
            <div class="p-6">
              <div class="flex items-center gap-3 mb-4">
                <div class="p-2 rounded-lg bg-blue-500/20 text-blue-300">
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"/>
                  </svg>
                </div>
                <h4 class="text-lg font-semibold text-white">Chat con {{ reserva.usuario.name }}</h4>
                <button (click)="toggleChat(0)"
                        class="ml-auto p-2 rounded-lg bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white transition-all duration-300">
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
                  </svg>
                </button>
              </div>

              <!-- Chat Messages -->
              <div class="bg-white/5 dark:bg-slate-800/30 rounded-xl p-4 mb-4 max-h-64 overflow-y-auto border border-white/10 dark:border-slate-600/30">
                <div *ngFor="let message of getChatMessages(reserva.id)" 
                     class="mb-3 flex"
                     [ngClass]="message.sender === 'emprendedor' ? 'justify-end' : 'justify-start'">
                  <div class="max-w-xs lg:max-w-md px-4 py-2 rounded-xl"
                       [ngClass]="{
                         'bg-orange-500/20 text-orange-100 border border-orange-400/30': message.sender === 'emprendedor',
                         'bg-blue-500/20 text-blue-100 border border-blue-400/30': message.sender === 'cliente'
                       }">
                    <p class="text-sm">{{ message.message }}</p>
                    <p class="text-xs opacity-70 mt-1">{{ message.timestamp | date:'short' }}</p>
                  </div>
                </div>
                
                <!-- Empty state -->
                <div *ngIf="getChatMessages(reserva.id).length === 0" 
                     class="text-center py-8 text-slate-400">
                  <svg class="w-12 h-12 mx-auto mb-3 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"/>
                  </svg>
                  <p class="text-sm">No hay mensajes aún</p>
                  <p class="text-xs">Inicia una conversación con el cliente</p>
                </div>
              </div>

              <!-- Chat Input -->
              <div class="flex gap-3">
                <input 
                  type="text" 
                  [(ngModel)]="newMessage"
                  (keyup.enter)="sendMessage(reserva.id)"
                  placeholder="Escribe un mensaje..."
                  class="flex-1 px-4 py-3 border border-slate-600/50 rounded-xl bg-white/10 dark:bg-slate-800/30 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-orange-400 transition-all duration-300">
                <button (click)="sendMessage(reserva.id)"
                        [disabled]="!newMessage.trim()"
                        class="px-6 py-3 rounded-xl bg-gradient-to-r from-orange-500 to-orange-400 text-white font-semibold hover:from-orange-600 hover:to-orange-500 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl">
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"/>
                  </svg>
                </button>
              </div>
            </div>
          </div>

          <!-- Servicios de la Reserva -->
          <div class="p-6">
            <div *ngIf="reserva.servicios && reserva.servicios.length > 0" class="space-y-4">
              <div class="flex items-center gap-3 mb-4">
                <div class="p-2 rounded-lg bg-green-500/20 text-green-300">
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/>
                  </svg>
                </div>
                <h4 class="text-lg font-semibold text-white">
                  Servicios Reservados ({{ reserva.servicios.length }})
                </h4>
              </div>
              
              <div *ngFor="let servicioReserva of reserva.servicios; trackBy: trackByServicioReserva" 
                   class="backdrop-blur-sm bg-white/5 dark:bg-slate-800/30 border border-white/10 dark:border-slate-600/30 rounded-xl p-5">
                <div class="flex items-start justify-between">
                  <div class="flex-1">
                    <div class="flex items-center justify-between mb-3">
                      <h5 class="font-semibold text-white text-lg">
                        {{ servicioReserva.servicio?.nombre || 'Servicio' }}
                      </h5>
                      <span class="inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold border"
                            [ngClass]="getEstadoBadgeClass(servicioReserva.estado)">
                        {{ servicioReserva.estado | titlecase }}
                      </span>
                    </div>
                    
                    <div class="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm mb-4">
                      <div class="flex items-center gap-2">
                        <svg class="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
                        </svg>
                        <div>
                          <span class="text-slate-400">Fecha:</span>
                          <p class="font-medium text-white">
                            {{ servicioReserva.fecha_inicio | date:'mediumDate' }}
                          </p>
                        </div>
                      </div>
                      <div class="flex items-center gap-2">
                        <svg class="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
                        </svg>
                        <div>
                          <span class="text-slate-400">Horario:</span>
                          <p class="font-medium text-white">
                            {{ servicioReserva.hora_inicio }} - {{ servicioReserva.hora_fin }}
                          </p>
                        </div>
                      </div>
                      <div class="flex items-center gap-2">
                        <svg class="w-4 h-4 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"/>
                        </svg>
                        <div>
                          <span class="text-slate-400">Precio:</span>
                          <p class="font-medium text-green-300">
                            S/ {{ servicioReserva.precio | number:'1.2-2' }}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div *ngIf="servicioReserva.notas_cliente" class="mb-3 p-3 bg-blue-500/10 border border-blue-400/30 rounded-lg">
                      <span class="text-blue-300 text-sm font-medium flex items-center gap-2">
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
                        </svg>
                        Notas del cliente:
                      </span>
                      <p class="text-sm text-blue-100 mt-1">{{ servicioReserva.notas_cliente }}</p>
                    </div>

                    <div *ngIf="servicioReserva.notas_emprendedor" class="mb-3 p-3 bg-orange-500/10 border border-orange-400/30 rounded-lg">
                      <span class="text-orange-300 text-sm font-medium flex items-center gap-2">
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/>
                        </svg>
                        Notas del emprendedor:
                      </span>
                      <p class="text-sm text-orange-100 mt-1">{{ servicioReserva.notas_emprendedor }}</p>
                    </div>
                  </div>

                  <!-- Actions for Service -->
                  <div class="ml-6 flex flex-col gap-3">
                    <button *ngIf="servicioReserva.estado === 'pendiente'"
                            (click)="updateEstadoServicio(servicioReserva, 'confirmado')"
                            [disabled]="servicioReserva.updating"
                            class="flex items-center px-4 py-2 text-sm font-medium rounded-xl text-green-300 bg-green-500/20 hover:bg-green-500/30 border border-green-400/30 hover:border-green-400/50 transition-all duration-300 disabled:opacity-50">
                      <svg *ngIf="servicioReserva.updating" class="w-4 h-4 mr-2 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/>
                      </svg>
                      <svg *ngIf="!servicioReserva.updating" class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
                      </svg>
                      {{ servicioReserva.updating ? 'Confirmando...' : 'Confirmar' }}
                    </button>
                    
                    <button *ngIf="servicioReserva.estado === 'confirmado'"
                            (click)="updateEstadoServicio(servicioReserva, 'completado')"
                            [disabled]="servicioReserva.updating"
                            class="flex items-center px-4 py-2 text-sm font-medium rounded-xl text-blue-300 bg-blue-500/20 hover:bg-blue-500/30 border border-blue-400/30 hover:border-blue-400/50 transition-all duration-300 disabled:opacity-50">
                      <svg *ngIf="servicioReserva.updating" class="w-4 h-4 mr-2 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/>
                      </svg>
                      <svg *ngIf="!servicioReserva.updating" class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                      </svg>
                      {{ servicioReserva.updating ? 'Completando...' : 'Completar' }}
                    </button>
                    
                    <button *ngIf="servicioReserva.estado === 'pendiente' || servicioReserva.estado === 'confirmado'"
                            (click)="updateEstadoServicio(servicioReserva, 'cancelado')"
                            [disabled]="servicioReserva.updating"
                            class="flex items-center px-4 py-2 text-sm font-medium rounded-xl text-red-300 bg-red-500/20 hover:bg-red-500/30 border border-red-400/30 hover:border-red-400/50 transition-all duration-300 disabled:opacity-50">
                      <svg *ngIf="servicioReserva.updating" class="w-4 h-4 mr-2 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/>
                      </svg>
                      <svg *ngIf="!servicioReserva.updating" class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
                      </svg>
                      {{ servicioReserva.updating ? 'Cancelando...' : 'Cancelar' }}
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <!-- Reserva Notes -->
            <div *ngIf="reserva.notas" class="mt-6 pt-4 border-t border-white/20 dark:border-slate-600/50">
              <div class="p-4 bg-white/5 dark:bg-slate-800/30 border border-white/10 dark:border-slate-600/30 rounded-xl">
                <span class="text-slate-400 text-sm font-medium flex items-center gap-2">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
                  </svg>
                  Notas de la reserva:
                </span>
                <p class="text-sm text-slate-300 mt-2">{{ reserva.notas }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Pagination glassmorphism -->
      <div *ngIf="reservasData && reservasData.last_page > 1" 
           class="flex items-center justify-between backdrop-blur-sm bg-white/10 dark:bg-slate-800/40 rounded-2xl p-6 border border-white/20 dark:border-slate-700/50 shadow-xl">
        <div class="text-sm text-slate-300">
          Mostrando {{ reservasData.from }} a {{ reservasData.to }} de {{ reservasData.total }} reservas
        </div>
        <div class="flex items-center gap-3">
          <button
            (click)="loadPage(currentPage - 1)"
            [disabled]="currentPage <= 1 || loading"
            class="px-4 py-2 border border-white/20 dark:border-slate-600/50 rounded-xl text-sm font-medium text-slate-300 bg-white/10 dark:bg-slate-800/30 hover:bg-white/20 dark:hover:bg-slate-700/50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300">
            Anterior
          </button>
          
          <span class="px-4 py-2 text-sm font-medium text-white">
            Página {{ currentPage }} de {{ reservasData.last_page }}
          </span>
          
          <button
            (click)="loadPage(currentPage + 1)"
            [disabled]="currentPage >= (reservasData.last_page || 1) || loading"
            class="px-4 py-2 border border-white/20 dark:border-slate-600/50 rounded-xl text-sm font-medium text-slate-300 bg-white/10 dark:bg-slate-800/30 hover:bg-white/20 dark:hover:bg-slate-700/50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300">
            Siguiente
          </button>
        </div>
      </div>
    </div>
    `
})
export class ReservasListComponent implements OnInit {
  private emprendimientoAdminService = inject(EmprendimientoAdminService);
  private route = inject(ActivatedRoute);

  emprendimientoId!: number;
  emprendimiento?: Emprendimiento;
  reservasData?: PaginatedResponse<ReservaWithUpdating>;
  loading = true;
  error = '';
  currentPage = 1;

  // Chat functionality
  activeChatReserva = 0;
  newMessage = '';
  chatMessages: { [reservaId: number]: ChatMessage[] } = {};

  filters = {
    estado: '',
    fecha_inicio: '',
    fecha_fin: '',
    servicio_id: undefined as number | undefined,
    usuario_id: undefined as number | undefined
  };

  ngOnInit(): void {
    // Obtener el ID de la ruta padre
    this.route.parent?.paramMap.subscribe(params => {
      const id = params.get('id');
      console.log('Reservas - ID recibido:', id); // Debug
      
      if (id && !isNaN(+id)) {
        this.emprendimientoId = +id;
        this.loadData();
        this.initializeMockChatData();
      } else {
        console.error('Reservas - ID inválido:', id);
        this.error = 'ID de emprendimiento inválido';
      }
    });
  }

  private loadData(): void {
    this.loadReservas();
  }

  loadReservas(page: number = 1): void {
    this.loading = true;
    this.error = '';
    this.currentPage = page;

    const filters = this.getActiveFilters();
    filters.page = page;

    this.emprendimientoAdminService.filterReservas(this.emprendimientoId, filters).subscribe({
      next: (data) => {
        // Transformar los datos para incluir la propiedad updating
        this.reservasData = {
          ...data,
          data: data.data.map(reserva => ({
            ...reserva,
            servicios: reserva.servicios.map(servicio => ({
              ...servicio,
              updating: false
            }))
          }))
        };
        this.loading = false;
      },
      error: (err) => {
        console.error('Error al cargar reservas:', err);
        this.error = err.error?.message || 'Error al cargar las reservas';
        this.loading = false;
      }
    });
  }

  private getActiveFilters(): any {
    const activeFilters: any = {};
    
    if (this.filters.estado) activeFilters.estado = this.filters.estado;
    if (this.filters.fecha_inicio) activeFilters.fecha_inicio = this.filters.fecha_inicio;
    if (this.filters.fecha_fin) activeFilters.fecha_fin = this.filters.fecha_fin;
    if (this.filters.servicio_id) activeFilters.servicio_id = this.filters.servicio_id;
    if (this.filters.usuario_id) activeFilters.usuario_id = this.filters.usuario_id;

    return activeFilters;
  }

  applyFilters(): void {
    this.currentPage = 1;
    this.loadReservas(1);
  }

  clearFilters(): void {
    this.filters = {
      estado: '',
      fecha_inicio: '',
      fecha_fin: '',
      servicio_id: undefined,
      usuario_id: undefined
    };
    this.applyFilters();
  }

  hasActiveFilters(): boolean {
    return !!(this.filters.estado || this.filters.fecha_inicio || this.filters.fecha_fin || 
              this.filters.servicio_id || this.filters.usuario_id);
  }

  refreshData(): void {
    this.loadReservas(this.currentPage);
  }

  loadPage(page: number): void {
    if (page >= 1 && page <= (this.reservasData?.last_page || 1)) {
      this.loadReservas(page);
    }
  }

  getEstadoBadgeClass(estado: string): string {
    const classes = {
      'pendiente': 'bg-yellow-500/20 text-yellow-300 border-yellow-400/30',
      'confirmada': 'bg-green-500/20 text-green-300 border-green-400/30',
      'confirmado': 'bg-green-500/20 text-green-300 border-green-400/30',
      'cancelada': 'bg-red-500/20 text-red-300 border-red-400/30',
      'cancelado': 'bg-red-500/20 text-red-300 border-red-400/30',
      'completada': 'bg-blue-500/20 text-blue-300 border-blue-400/30',
      'completado': 'bg-blue-500/20 text-blue-300 border-blue-400/30'
    };
    return classes[estado as keyof typeof classes] || 'bg-gray-500/20 text-gray-300 border-gray-400/30';
  }

  getReservasByEstado(estado: string): ReservaWithUpdating[] {
    if (!this.reservasData?.data) return [];
    return this.reservasData.data.filter(reserva => reserva.estado === estado);
  }

  calculateTotalIngresos(): number {
    if (!this.reservasData?.data) return 0;
    
    return this.reservasData.data.reduce((total, reserva) => {
      if (reserva.estado === 'confirmada' || reserva.estado === 'completada') {
        const reservaTotal = reserva.servicios?.reduce((servicioTotal, servicio) => {
          return servicioTotal + (parseFloat(servicio.precio.toString()) || 0);
        }, 0) || 0;
        return total + reservaTotal;
      }
      return total;
    }, 0);
  }

  async updateEstadoServicio(servicioReserva: ReservaServicioWithUpdating, nuevoEstado: string): Promise<void> {
    if (servicioReserva.updating) return;

    const confirmMessage = `¿Estás seguro de que quieres ${nuevoEstado === 'confirmado' ? 'confirmar' : 
                            nuevoEstado === 'completado' ? 'completar' : 'cancelar'} este servicio?`;
    
    if (!confirm(confirmMessage)) return;

    servicioReserva.updating = true;

    try {
      const updateData: UpdateEstadoServicioRequest = {
        estado: nuevoEstado as any
      };

      await this.emprendimientoAdminService.updateEstadoServicioReserva(
        servicioReserva.id, 
        updateData
      ).toPromise();

      // Update local state
      servicioReserva.estado = nuevoEstado as any;
      
      // Show success message
      const actionText = nuevoEstado === 'confirmado' ? 'confirmado' : 
                        nuevoEstado === 'completado' ? 'completado' : 'cancelado';
      alert(`Servicio ${actionText} correctamente`);
      
    } catch (err: any) {
      console.error('Error al actualizar estado del servicio:', err);
      alert(err.error?.message || 'Error al actualizar el estado del servicio');
    } finally {
      servicioReserva.updating = false;
    }
  }

  async exportToCSV(): Promise<void> {
    if (!this.reservasData?.data?.length) return;

    try {
      const filters = this.getActiveFilters();
      const blob = await this.emprendimientoAdminService.exportReservasCSV(
        this.emprendimientoId, 
        filters
      ).toPromise();

      if (blob) {
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `reservas-${this.emprendimiento?.nombre}-${new Date().toISOString().split('T')[0]}.csv`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
      }
    } catch (err: any) {
      console.error('Error al exportar CSV:', err);
      alert('Error al exportar los datos');
    }
  }

  // Chat functionality methods
  toggleChat(reservaId: number): void {
    this.activeChatReserva = this.activeChatReserva === reservaId ? 0 : reservaId;
    if (this.activeChatReserva === reservaId) {
      // Mark messages as read when opening chat
      this.markMessagesAsRead(reservaId);
    }
  }

  getChatMessages(reservaId: number): ChatMessage[] {
    return this.chatMessages[reservaId] || [];
  }

  getUnreadMessagesCount(reservaId: number): number {
    const messages = this.chatMessages[reservaId] || [];
    return messages.filter(msg => !msg.read && msg.sender === 'cliente').length;
  }

  sendMessage(reservaId: number): void {
    if (!this.newMessage.trim()) return;

    if (!this.chatMessages[reservaId]) {
      this.chatMessages[reservaId] = [];
    }

    const newMsg: ChatMessage = {
      id: Date.now(),
      sender: 'emprendedor',
      message: this.newMessage.trim(),
      timestamp: new Date(),
      read: true
    };

    this.chatMessages[reservaId].push(newMsg);
    this.newMessage = '';

    // Simulate auto-response (remove this in real implementation)
    setTimeout(() => {
      const autoResponse: ChatMessage = {
        id: Date.now() + 1,
        sender: 'cliente',
        message: 'Gracias por tu mensaje. Te responderé pronto.',
        timestamp: new Date(),
        read: false
      };
      this.chatMessages[reservaId].push(autoResponse);
    }, 2000);
  }

  private markMessagesAsRead(reservaId: number): void {
    if (this.chatMessages[reservaId]) {
      this.chatMessages[reservaId].forEach(msg => {
        if (msg.sender === 'cliente') {
          msg.read = true;
        }
      });
    }
  }

  private initializeMockChatData(): void {
    // Mock data for demonstration - remove in real implementation
    this.chatMessages = {
      1: [
        {
          id: 1,
          sender: 'cliente',
          message: 'Hola, tengo una pregunta sobre mi reserva.',
          timestamp: new Date(Date.now() - 3600000),
          read: false
        },
        {
          id: 2,
          sender: 'emprendedor',
          message: 'Hola! Claro, dime en qué te puedo ayudar.',
          timestamp: new Date(Date.now() - 3300000),
          read: true
        },
        {
          id: 3,
          sender: 'cliente',
          message: '¿Puedo cambiar la hora de mi reserva?',
          timestamp: new Date(Date.now() - 1800000),
          read: false
        }
      ]
    };
  }

  // Track by functions for performance
  trackByReserva(index: number, reserva: ReservaWithUpdating): number {
    return reserva.id;
  }

  trackByServicioReserva(index: number, servicio: ReservaServicioWithUpdating): number {
    return servicio.id;
  }
}