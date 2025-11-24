import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { PlanesService } from '../../../app/core/services/planes.service';
import { Plan, PlanFiltros } from '../../../app/core/models/plan.model';
import { PaginatedResponse } from '../../core/models/api.model';
import { AuthService } from '../../core/services/auth.service';
import { ThemeService } from '../../core/services/theme.service';
import { environment } from '../../../environments/environments';

@Component({
  selector: 'app-planes',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  template: `
    <section class="relative bg-[#fdf4ec] dark:bg-gray-900 text-gray-800 dark:text-gray-200 py-20 font-sans transition-colors duration-300">
      <!-- Imagen de fondo solo para encabezado -->
      <div class="absolute top-0 left-0 right-0 h-[550px] z-0">
        <img src="https://img.freepik.com/fotos-premium/vista-sobre-paisaje-lago-titicaca_653449-9944.jpg"
             alt="Encabezado"
             class="w-full h-full object-cover">
        <!-- Overlay oscuro para modo oscuro -->
        <div class="absolute inset-0 bg-black opacity-0 dark:opacity-40 transition-opacity duration-300"></div>
      </div>
    
      <!-- Encabezado sobre imagen -->
      <div class="relative z-10 text-center container mx-auto px-6 py-32">
        <h1 class="text-5xl md:text-6xl font-extrabold text-white drop-shadow-2xl font-serif mb-4 tracking-wide">
          Turismo Comunitario en Capachica
        </h1>
        <p class="text-xl md:text-2xl text-white font-medium italic drop-shadow-md tracking-wide">
          Un viaje auténtico hacia nuestras raíces.
        </p>
      </div>
    
      <!-- Fondo suave para contenido restante -->
      <div class="relative z-10 bg-[#fdf4ec] dark:bg-gray-900 mt-[-100px] pt-20 transition-colors duration-300">
        
        <!-- Filtros -->
        <div class="container mx-auto px-6 mb-8">
          <div class="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 transition-colors duration-300">
            <h3 class="text-lg font-semibold mb-4 text-amber-600 dark:text-amber-400">Filtrar Planes</h3>
            <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
              
              <!-- Búsqueda -->
              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Buscar</label>
                <input 
                  type="text" 
                  [(ngModel)]="filtros().buscar"
                  (input)="onFiltroChange()"
                  placeholder="Buscar planes..."
                  class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500 transition-colors duration-300"
                >
              </div>

              <!-- Dificultad -->
              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Dificultad</label>
                <select 
                  [(ngModel)]="filtros().dificultad"
                  (change)="onFiltroChange()"
                  class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500 transition-colors duration-300"
                >
                  <option value="">Todas</option>
                  <option value="facil">Fácil</option>
                  <option value="moderado">Moderado</option>
                  <option value="dificil">Difícil</option>
                </select>
              </div>

              <!-- Duración -->
              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Duración</label>
                <select 
                  [(ngModel)]="filtros().duracion_max"
                  (change)="onFiltroChange()"
                  class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500 transition-colors duration-300"
                >
                  <option value="">Cualquier duración</option>
                  <option value="1">1 día</option>
                  <option value="2">Hasta 2 días</option>
                  <option value="3">Hasta 3 días</option>
                  <option value="7">Hasta 1 semana</option>
                </select>
              </div>

              <!-- Con cupos disponibles -->
              <div class="flex items-center">
                <input 
                  type="checkbox" 
                  id="con_cupos"
                  [(ngModel)]="filtros().con_cupos"
                  (change)="onFiltroChange()"
                  class="h-4 w-4 text-amber-600 focus:ring-amber-500 border-gray-300 dark:border-gray-600 rounded"
                >
                <label for="con_cupos" class="ml-2 block text-sm text-gray-700 dark:text-gray-300">
                  Solo con cupos disponibles
                </label>
              </div>
            </div>
          </div>
        </div>

        <!-- Loading -->
        <div *ngIf="loading()" class="container mx-auto px-6 text-center py-8">
          <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-amber-600"></div>
          <p class="mt-2 text-gray-600 dark:text-gray-400">Cargando planes...</p>
        </div>

        <!-- Error -->
        <div *ngIf="error()" class="container mx-auto px-6 text-center py-8">
          <div class="bg-red-100 dark:bg-red-900/30 border border-red-400 dark:border-red-600 text-red-700 dark:text-red-400 px-4 py-3 rounded transition-colors duration-300">
            <p>{{ error() }}</p>
            <button 
              (click)="cargarPlanes()"
              class="mt-2 bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 transition-colors duration-300"
            >
              Reintentar
            </button>
          </div>
        </div>

        <!-- Resultados -->
        <div class="text-center animate-fade-in-up">
          <h2 class="text-4xl font-bold text-amber-500 dark:text-amber-400 mb-4 font-serif">
            Planes Turísticos en Capachica
          </h2>
          <p class="text-lg max-w-3xl mx-auto mb-12 text-gray-700 dark:text-gray-300">
            Descubre las experiencias auténticas que ofrecen nuestras familias anfitrionas: 
            hospedaje, cultura, agricultura, talleres y naturaleza en su máxima expresión.
          </p>
          
          <!-- Información de resultados -->
          <div *ngIf="!loading() && paginatedPlanes()" class="container mx-auto px-6 mb-6">
            <p class="text-gray-600 dark:text-gray-400">
              Mostrando {{ paginatedPlanes()?.from || 0 }} - {{ paginatedPlanes()?.to || 0 }} 
              de {{ paginatedPlanes()?.total || 0 }} planes
            </p>
          </div>
    
          <!-- Planes estilo tarjetas -->
          <div class="relative z-10 container mx-auto px-6 py-8">
            
            <!-- Sin resultados -->
            <div *ngIf="!loading() && planes().length === 0" class="text-center py-12">
              <div class="bg-gray-100 dark:bg-gray-800 rounded-lg p-8 transition-colors duration-300">
                <h3 class="text-xl font-semibold text-gray-600 dark:text-gray-300 mb-2">No se encontraron planes</h3>
                <p class="text-gray-500 dark:text-gray-400 mb-4">Intenta ajustar los filtros de búsqueda</p>
                <button 
                  (click)="limpiarFiltros()"
                  class="bg-amber-600 text-white px-6 py-2 rounded-lg hover:bg-amber-700 transition-colors duration-300"
                >
                  Limpiar filtros
                </button>
              </div>
            </div>

            <!-- Tarjetas de planes -->
            <div *ngIf="planes().length > 0" class="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
              <div 
                *ngFor="let plan of planes()" 
                [routerLink]="['/planes/detalle', plan.id]" 
                class="block rounded-2xl overflow-hidden shadow-lg relative group hover:scale-105 transition-transform duration-300 cursor-pointer bg-white dark:bg-gray-800"
              >
                <!-- Imagen -->
                <div class="relative h-64 overflow-hidden">
                  @if (plan.imagen_principal_url) {
                    <img 
                      [src]="env.assetsUrl + plan.imagen_principal_url" 
                      [alt]="plan.nombre"
                      class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                      (error)="onImageError($event)"
                    >
                  } @else {
                    <div class="w-full h-full bg-gradient-to-br from-amber-100 to-amber-200 dark:from-amber-900/30 dark:to-amber-800/30 flex items-center justify-center">
                      <svg class="h-16 w-16 text-amber-400 dark:text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                      </svg>
                    </div>
                  }
                  
                  <!-- Overlay gradient -->
                  <div class="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent"></div>
                </div>
                
                <!-- Badge de duración -->
                <div class="absolute top-4 left-4 bg-teal-600 text-white px-3 py-1 rounded-full text-xs font-bold backdrop-blur-sm">
                  {{ plan.duracion_dias }} {{ plan.duracion_dias === 1 ? 'Día' : 'Días' }}
                  <span *ngIf="plan.duracion_dias > 1">
                    / {{ plan.duracion_dias - 1 }} {{ plan.duracion_dias === 2 ? 'Noche' : 'Noches' }}
                  </span>
                </div>

                <!-- Badge de dificultad -->
                <div class="absolute top-4 right-4" 
                     [ngClass]="{
                       'bg-green-600': plan.dificultad === 'facil',
                       'bg-yellow-600': plan.dificultad === 'moderado', 
                       'bg-red-600': plan.dificultad === 'dificil'
                     }"
                     class="text-white px-2 py-1 rounded-full text-xs backdrop-blur-sm">
                  {{ getDificultadLabel(plan.dificultad) }}
                </div>
                
                <!-- Información principal -->
                <div class="absolute bottom-4 left-4 text-white">
                  <div class="text-yellow-400 font-semibold text-sm">
                    {{ plan.organizador_principal?.nombre || 'Sin organizador' }}
                  </div>
                  <h3 class="text-xl font-bold">{{ plan.nombre }}</h3>
                  <p class="text-sm opacity-90 mt-1" *ngIf="plan.descripcion">
                    {{ plan.descripcion.length > 80 ? plan.descripcion.substring(0, 80) + '...' : plan.descripcion }}
                  </p>
                </div>
                
                <!-- Precio y disponibilidad -->
                <div class="absolute bottom-0 right-0 bg-yellow-400 px-4 py-2 text-right rounded-tl-lg">
                  <div class="text-blue-900 text-lg font-bold">
                    S/ {{ plan.precio_total || 0 }}
                  </div>
                  <div class="text-xs text-blue-800">
                    <span *ngIf="plan.cupos_disponibles !== undefined && plan.cupos_disponibles > 0" 
                          class="text-green-800">
                      {{ plan.cupos_disponibles }} cupos
                    </span>
                    <span *ngIf="plan.cupos_disponibles === 0" class="text-red-800">
                      Sin cupos
                    </span>
                  </div>
                </div>

                <!-- Overlay para sin cupos -->
                <div *ngIf="plan.cupos_disponibles === 0" 
                     class="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                  <div class="bg-red-600 text-white px-4 py-2 rounded-lg font-semibold">
                    SIN CUPOS DISPONIBLES
                  </div>
                </div>
              </div>
            </div>

            <!-- Paginación -->
            <div *ngIf="paginatedPlanes() && paginatedPlanes()!.total > paginatedPlanes()!.per_page" 
                 class="mt-12 flex justify-center">
              <nav class="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                
                <!-- Anterior -->
                <button 
                  *ngIf="paginatedPlanes()!.prev_page_url"
                  (click)="cambiarPagina(paginatedPlanes()!.current_page - 1)"
                  class="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm font-medium text-gray-500 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors duration-300"
                >
                  Anterior
                </button>
                
                <!-- Números de página -->
                <button 
                  *ngFor="let link of paginatedPlanes()!.links.slice(1, -1)"
                  (click)="link.url ? cambiarPagina(+link.label) : null"
                  [disabled]="!link.url"
                  class="relative inline-flex items-center px-4 py-2 border text-sm font-medium transition-colors duration-300"
                  [ngClass]="{
                    'bg-amber-50': link.active && !isDarkMode(),
                    'bg-amber-900/40': link.active && isDarkMode(),
                    'text-amber-600': link.active && !isDarkMode(),
                    'text-amber-300': link.active && isDarkMode(),
                    'border-amber-500': link.active,
                    'bg-white': !link.active && !isDarkMode(),
                    'bg-gray-700': !link.active && isDarkMode(),
                    'text-gray-500': !link.active && !isDarkMode(),
                    'text-gray-300': !link.active && isDarkMode(),
                    'border-gray-300': !link.active && !isDarkMode(),
                    'border-gray-600': !link.active && isDarkMode(),
                    'hover:bg-gray-50': !link.active && !isDarkMode(),
                    'hover:bg-gray-600': !link.active && isDarkMode()
                  }"
                >
                  {{ link.label }}
                </button>
                
                <!-- Siguiente -->
                <button 
                  *ngIf="paginatedPlanes()!.next_page_url"
                  (click)="cambiarPagina(paginatedPlanes()!.current_page + 1)"
                  class="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm font-medium text-gray-500 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors duration-300"
                >
                  Siguiente
                </button>
              </nav>
            </div>
          </div>
        </div>
      </div>
    </section>
  `
})
export class PlanesComponent implements OnInit {
  env = environment;
  private planesService = inject(PlanesService);
  private authService = inject(AuthService);
  private themeService = inject(ThemeService);

  // Signals
  loading = signal<boolean>(false);
  error = signal<string>('');
  paginatedPlanes = signal<PaginatedResponse<Plan> | null>(null);
  filtros = signal<PlanFiltros>({
    buscar: '',
    dificultad: '',
    duracion_max: undefined,
    con_cupos: true,
    per_page: 9,
    page: 1
  });

  // Computed
  planes = computed(() => this.paginatedPlanes()?.data || []);

  // Variables para debounce de búsqueda
  private searchTimeout: any;

  ngOnInit() {
    this.cargarPlanes();
  }

  isDarkMode(): boolean {
    return this.themeService.isDarkMode();
  }

  cargarPlanes(pagina: number = 1) {
    this.loading.set(true);
    this.error.set('');
    
    const filtrosActuales = { ...this.filtros(), page: pagina };
    
    this.planesService.getPlanesPublicos(filtrosActuales).subscribe({
      next: (response) => {
        this.paginatedPlanes.set(response);
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set('Error al cargar los planes. Por favor, intenta nuevamente.');
        this.loading.set(false);
        console.error('Error al cargar planes:', err);
      }
    });
  }

  onFiltroChange() {
    // Limpiar timeout anterior
    if (this.searchTimeout) {
      clearTimeout(this.searchTimeout);
    }

    // Aplicar filtros con debounce
    this.searchTimeout = setTimeout(() => {
      this.cargarPlanes(1); // Reiniciar a página 1 cuando cambian filtros
    }, 500);
  }

  cambiarPagina(pagina: number) {
    if (pagina > 0) {
      this.cargarPlanes(pagina);
      // Scroll hacia arriba
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  limpiarFiltros() {
    this.filtros.set({
      buscar: '',
      dificultad: '',
      duracion_max: undefined,
      con_cupos: true,
      per_page: 9,
      page: 1
    });
    this.cargarPlanes(1);
  }

  getDificultadLabel(dificultad: string): string {
    const labels: {[key: string]: string} = {
      'facil': 'Fácil',
      'moderado': 'Moderado',
      'dificil': 'Difícil'
    };
    return labels[dificultad] || dificultad;
  }

  onImageError(event: any) {
    event.target.src = '/assets/images/default-plan.jpg';
  }
}