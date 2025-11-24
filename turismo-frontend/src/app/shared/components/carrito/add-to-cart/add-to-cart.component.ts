import { Component, Input, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CarritoService, CarritoItem } from '../../../../core/services/carrito.service';
import { AuthService } from '../../../../core/services/auth.service';
import { Router } from '@angular/router';
import { Servicio, Emprendedor } from '../../../../core/services/turismo.service';

@Component({
  selector: 'app-add-to-cart',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
      <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">
        Agregar a mi carrito
      </h3>

      <!-- Formulario de reserva -->
      <form (ngSubmit)="agregarAlCarrito()" class="space-y-4">
        <!-- Fecha -->
        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Fecha del servicio
          </label>
          <input 
            type="date" 
            [(ngModel)]="fechaInicio"
            name="fechaInicio"
            [min]="fechaMinima"
            required
            class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 dark:bg-gray-700 dark:text-white">
        </div>

        <!-- Hora de inicio -->
        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Hora de inicio
          </label>
          <input 
            type="time" 
            [(ngModel)]="horaInicio"
            name="horaInicio"
            required
            class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 dark:bg-gray-700 dark:text-white">
        </div>

        <!-- Duración -->
        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Duración (minutos)
          </label>
          <select 
            [(ngModel)]="duracionMinutos"
            name="duracionMinutos"
            required
            class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 dark:bg-gray-700 dark:text-white">
            <option value="60">1 hora</option>
            <option value="120">2 horas</option>
            <option value="180">3 horas</option>
            <option value="240">4 horas</option>
            <option value="480">8 horas (día completo)</option>
            <option value="custom">Personalizada</option>
          </select>
        </div>

        <!-- Duración personalizada -->
        <div *ngIf="duracionMinutos === 'custom'">
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Duración personalizada (minutos)
          </label>
          <input 
            type="number" 
            [(ngModel)]="duracionPersonalizada"
            name="duracionPersonalizada"
            min="30"
            max="1440"
            step="30"
            required
            class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 dark:bg-gray-700 dark:text-white">
        </div>

        <!-- Notas adicionales -->
        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Notas adicionales (opcional)
          </label>
          <textarea 
            [(ngModel)]="notasCliente"
            name="notasCliente"
            rows="3"
            placeholder="Menciona cualquier requerimiento especial..."
            class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 dark:bg-gray-700 dark:text-white resize-none">
          </textarea>
        </div>

        <!-- Mensaje de error -->
        <div *ngIf="errorMessage()" class="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md">
          <p class="text-sm text-red-700 dark:text-red-400">{{ errorMessage() }}</p>
        </div>

        <!-- Mensaje de éxito -->
        <div *ngIf="successMessage()" class="p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-md">
          <p class="text-sm text-green-700 dark:text-green-400">{{ successMessage() }}</p>
        </div>

        <!-- Botones -->
        <div class="flex flex-col gap-3">
          <button 
            type="submit"
            [disabled]="isLoading() || !authService.isLoggedIn()"
            class="w-full bg-amber-600 hover:bg-amber-700 disabled:bg-gray-400 text-white py-3 px-4 rounded-lg font-medium transition-colors duration-200 disabled:cursor-not-allowed">
            <span *ngIf="!isLoading()">
              <svg class="w-5 h-5 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-1.5 6M7 13l-1.5 6m0 0h9m-9 0v0M17 21v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6"></path>
              </svg>
              Agregar al carrito
            </span>
            <span *ngIf="isLoading()" class="flex items-center justify-center">
              <svg class="animate-spin h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Agregando...
            </span>
          </button>

          <button *ngIf="!authService.isLoggedIn()"
            type="button"
            (click)="redirectToLogin()"
            class="w-full bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 py-3 px-4 rounded-lg font-medium transition-colors duration-200">
            Inicia sesión para reservar
          </button>

          <button 
            type="button"
            (click)="verCarrito()"
            class="w-full text-amber-600 hover:text-amber-700 dark:text-amber-400 dark:hover:text-amber-300 font-medium transition-colors duration-200 text-center">
            Ver mi carrito ({{ carritoService.getTotalItems() }})
          </button>
        </div>
      </form>
    </div>
  `,
  styles: [`
    :host {
      display: block;
    }
  `]
})
export class AddToCartComponent {
  @Input() servicio!: Servicio;
  @Input() emprendedor!: Emprendedor;

  carritoService = inject(CarritoService);
  authService = inject(AuthService);
  private router = inject(Router);

  // Datos del formulario
  fechaInicio: string = '';
  horaInicio: string = '';
  duracionMinutos: string | number = 120;
  duracionPersonalizada: number = 120;
  notasCliente: string = '';

  // Estado del componente
  private readonly _isLoading = signal(false);
  private readonly _errorMessage = signal('');
  private readonly _successMessage = signal('');

  readonly isLoading = this._isLoading.asReadonly();
  readonly errorMessage = this._errorMessage.asReadonly();
  readonly successMessage = this._successMessage.asReadonly();

  // Fecha mínima (hoy)
  get fechaMinima(): string {
    return new Date().toISOString().split('T')[0];
  }

  agregarAlCarrito() {
    if (!this.authService.isLoggedIn()) {
      this.redirectToLogin();
      return;
    }

    if (!this.validarFormulario()) {
      return;
    }

    this._isLoading.set(true);
    this._errorMessage.set('');
    this._successMessage.set('');

    const duracionFinal = this.duracionMinutos === 'custom' 
      ? this.duracionPersonalizada 
      : Number(this.duracionMinutos);

    const horaFin = this.calcularHoraFin(this.horaInicio, duracionFinal);

    const item: CarritoItem = {
      servicio_id: this.servicio.id!,
      emprendedor_id: this.emprendedor.id!,
      fecha_inicio: this.fechaInicio,
      hora_inicio: this.horaInicio,
      hora_fin: horaFin,
      duracion_minutos: duracionFinal,
      cantidad: 1,
      notas_cliente: this.notasCliente.trim() || undefined
    };

    this.carritoService.agregarAlCarrito(item).subscribe({
      next: (response) => {
        this._successMessage.set('¡Servicio agregado al carrito exitosamente!');
        // Limpiar formulario
        this.limpiarFormulario();
        // Limpiar mensaje después de 3 segundos
        setTimeout(() => this._successMessage.set(''), 3000);
      },
      error: (error) => {
        console.error('Error al agregar al carrito:', error);
        this._errorMessage.set(error.message || 'Error al agregar el servicio al carrito');
      },
      complete: () => {
        this._isLoading.set(false);
      }
    });
  }

  private validarFormulario(): boolean {
    if (!this.fechaInicio) {
      this._errorMessage.set('Selecciona una fecha');
      return false;
    }

    if (!this.horaInicio) {
      this._errorMessage.set('Selecciona una hora de inicio');
      return false;
    }

    const fechaSeleccionada = new Date(this.fechaInicio);
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);

    if (fechaSeleccionada < hoy) {
      this._errorMessage.set('La fecha no puede ser anterior a hoy');
      return false;
    }

    if (this.duracionMinutos === 'custom' && (!this.duracionPersonalizada || this.duracionPersonalizada < 30)) {
      this._errorMessage.set('La duración mínima es de 30 minutos');
      return false;
    }

    return true;
  }

  private calcularHoraFin(horaInicio: string, duracionMinutos: number): string {
    const [horas, minutos] = horaInicio.split(':').map(Number);
    const fechaInicio = new Date();
    fechaInicio.setHours(horas, minutos, 0, 0);
    
    const fechaFin = new Date(fechaInicio.getTime() + duracionMinutos * 60000);
    
    return fechaFin.toTimeString().slice(0, 5);
  }

  private limpiarFormulario() {
    this.fechaInicio = '';
    this.horaInicio = '';
    this.duracionMinutos = 120;
    this.duracionPersonalizada = 120;
    this.notasCliente = '';
  }

  redirectToLogin() {
    this.router.navigate(['/login'], {
      queryParams: { redirect: this.router.url }
    });
  }

  verCarrito() {
    this.router.navigate(['/carrito']);
  }
}