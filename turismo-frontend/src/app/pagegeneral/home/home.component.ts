import { Component, OnInit, inject, ViewEncapsulation, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HomeService } from './home.service';
import { Home, HomeDTO, Reserva, ReservaDTO, Municipalidad, Evento } from './home.model';
import { PaginatedResponse } from '../../core/services/admin.service';
import { ThemeService } from '../../core/services/theme.service';
import { Router, RouterModule } from '@angular/router';
import { map, Observable } from 'rxjs';
import { EventoService } from '../../core/services/evento.service';

import Swiper from 'swiper';

import { Navigation, Pagination } from 'swiper/modules';

Swiper.use([Navigation, Pagination]);

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule, FormsModule],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css'],
  encapsulation: ViewEncapsulation.None
})
export class HomeComponent implements OnInit, AfterViewInit {
  private homeService = inject(HomeService);
  private themeService = inject(ThemeService);
  private router = inject(Router);

  eventos: Evento[] = [];
  eventoMasCercano: Evento | null = null;
  currentIndex: number = 0; // ✅ Cambio: Inicia en 0 en lugar de 1

  
  homes: Home[] = [];
  reservas: Reserva[] = [];
  municipalidad: Municipalidad | null = null;
  evento: Event | null = null;
  paginacion: PaginatedResponse<Home> | null = null;
  loading = true;
  currentPage = 1;
  searchTerm = '';
  selectedEmprendedor: Home | null = null;
  categorias: any[] = [];
  isDropdownOpen: boolean = false;
  swiperInitialized = false;

  mostrarTodo = false;
  maxVisible = 4;

  intervalId: any;
  
  filteredSliders: any[] = []; 


imagenSeleccionada: string | null = null;
imagenActualIndex: number = 0;
sliders: any[] = []; // tu lista original completa de imágenes

 get visibleSliders() {
  const sliders = this.municipalidad?.sliders_secundarios ?? [];
  
  // Filtra los sliders con orden igual a 2
  const filteredSliders = sliders.filter(slider => slider.orden === 2);

  // Si mostrarTodo es verdadero, retorna todos los sliders filtrados, sino, solo los primeros 'maxVisible'
  return this.mostrarTodo ? filteredSliders : filteredSliders.slice(0, this.maxVisible);
}


  get totalSliders(): number {
    return this.municipalidad?.sliders_secundarios?.length ?? 0;
  }

  get imagenHistoriacapachica(): any | null {
    return this.municipalidad?.sliders_secundarios?.find(
      slider => slider.descripcion?.titulo?.toLowerCase() === 'historia de capachica'
    ) ?? null;
  }

  get imagenComite(): any | null {
  console.log('municipalidad:', this.municipalidad);
  console.log('imagenComite:', this.municipalidad?.sliders_secundarios?.find(
    slider => slider.descripcion?.titulo?.toLowerCase() === 'comite'
  ));
  return this.municipalidad?.sliders_secundarios?.find(
    slider => slider.descripcion?.titulo?.toLowerCase() === 'comite'
  ) ?? null;
}


  get imagenHistoriafamilia(): any | null {
    return this.municipalidad?.sliders_secundarios?.find(
      slider => slider.descripcion?.titulo?.toLowerCase() === 'historias de familias'
    ) ?? null;
  }

  get slidersComunidad() {
    return this.municipalidad?.sliders_secundarios?.filter(slider =>
      slider.descripcion?.titulo?.toLowerCase().includes('comunidad')
    ) ?? [];
  }

  get emptyCellsForLastRow(): number[] {
  const cols = 4; // Número de columnas en xl
  const remainder = this.visibleSliders.length % cols;
  if (remainder === 0) return [];
  const emptySlots = Math.floor((cols - remainder) / 2); // centrar
  return Array(emptySlots).fill(0);
}

  // ✅ Mejora: Método mejorado con placeholder y validación
  getImagenesmuni(): any[] {
    const imagenes = this.municipalidad?.sliders_principales || [];
    
    // Si no hay imágenes, retorna un array con placeholder
    if (imagenes.length === 0) {
      return [{
        url_completa: '/assets/images/placeholder-hero.jpg',
        nombre: 'Cargando...',
        descripcion: 'Preparando contenido'
      }];
    }
    
    return imagenes;
  }

  // ✅ Mejora: Validación antes de cambiar slides
  nextSlide() {
    const imagenes = this.getImagenesmuni();
    if (imagenes.length <= 1) return;
    
    if (this.currentIndex < imagenes.length - 1) {
      this.currentIndex++;
    } else {
      this.currentIndex = 0; // Vuelve al inicio
    }
  }

  // ✅ Mejora: Validación antes de retroceder
  prevSlide() {
    const imagenes = this.getImagenesmuni();
    if (imagenes.length <= 1) return;
    
    if (this.currentIndex > 0) {
      this.currentIndex--;
    } else {
      this.currentIndex = imagenes.length - 1; // Vuelve al final
    }
  }

  // ✅ Mejora: Validación del índice
  goToSlide(index: number) {
    const imagenes = this.getImagenesmuni();
    if (index >= 0 && index < imagenes.length) {
      this.currentIndex = index;
    }
  }
  onImageLoad(event: Event): void {
    const img = event.target as HTMLImageElement;
    img.classList.add('loaded');
  }

  onImageError(event: Event): void {
    const img = event.target as HTMLImageElement;
    img.src = '/assets/images/default-landscape.jpg';
  }


  // ✅ Mejora: Mejor manejo de imagen por defecto
  getSliderImage(evento: Evento): string {
    const sliders_principales = evento.sliders?.find(s => s.es_principal);
    return sliders_principales?.url_completa || '/assets/images/placeholder-event.jpg';
  }

  eventoProximo: any;

  cargarEventos() {
    console.log('llego hasta aqui');
    this.homeService.getEventos().subscribe({
      next: (resp: any) => {
        // Accedemos a la propiedad data dentro de la respuesta
        const eventosArray = resp.data?.data;  // Aquí manejamos data.data
        if (Array.isArray(eventosArray)) {
          this.eventos = eventosArray;  // Asignamos los eventos
          console.log('Eventos cargados:', this.eventos);
          this.encontrarEventoMasCercano();
        } else {
          console.error('La propiedad data.data no es un array:', eventosArray);
          this.eventos = [];
        }
      },
      error: (err) => {
        console.error('Error cargando eventos', err);
      }
    });
  }


  ngOnDestroy(): void {
  this.stopAutoSlide();
}

// ✅ Mejora: Control más inteligente del autoplay
startAutoSlide(): void {
  // Solo inicia autoplay si hay más de una imagen
  if (this.getImagenesmuni().length > 1) {
    this.intervalId = setInterval(() => {
      this.nextSlide();
    }, 4000); // Aumenté a 4 segundos para mejor UX
  }
}

stopAutoSlide(): void {
  if (this.intervalId) {
    clearInterval(this.intervalId);
    this.intervalId = null;
  }
}

  encontrarEventoMasCercano() {
    const hoy = new Date();

    // Filtrar solo los eventos que no han pasado
    const eventosFuturos = this.eventos.filter(evento => new Date(evento.fecha_inicio) >= hoy);

    // Ordenar los eventos futuros por fecha de inicio, de más cercano a más lejano
    eventosFuturos.sort((a, b) => new Date(a.fecha_inicio).getTime() - new Date(b.fecha_inicio).getTime());

    // Seleccionar el primer evento, que será el más cercano
    this.eventoMasCercano = eventosFuturos[0] || null;
    console.log('Evento más cercano:', this.eventoMasCercano);
  }

  


  toggleMostrarTodo(galeria: HTMLElement) {
    this.mostrarTodo = !this.mostrarTodo;

    // Scroll suave solo cuando se expande
    if (this.mostrarTodo) {
      setTimeout(() => {
        galeria.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 100); // pequeño delay para esperar que renderice
    }
  }

  toggleZoom(event: Event) {
  const img = event.target as HTMLImageElement;
  img.classList.toggle('zoom-active');
}

navegarImagen(direccion: 'anterior' | 'siguiente') {
  const currentIndex = this.visibleSliders.findIndex(slider => slider.url_completa === this.imagenSeleccionada);
  let nextIndex = currentIndex;

  if (direccion === 'anterior') {
    nextIndex = currentIndex === 0 ? this.visibleSliders.length - 1 : currentIndex - 1;
  } else if (direccion === 'siguiente') {
    nextIndex = currentIndex === this.visibleSliders.length - 1 ? 0 : currentIndex + 1;
  }

  this.imagenSeleccionada = this.visibleSliders[nextIndex].url_completa;
}


  // Año actual para el footer
  currentYear = new Date().getFullYear();



  transitionEnabled = true;

  disableTransitionTemporarily() {
  this.transitionEnabled = false;
  setTimeout(() => {
    this.transitionEnabled = true;
  });
}
  cargando = true;
  historiaCapachicaSlider?: any;

  

calcularDuracion(fechaInicio: string, fechaFin: string): string {
  const inicio = new Date(fechaInicio);
  const fin = new Date(fechaFin);
  const diferencia = fin.getTime() - inicio.getTime();
  const dias = Math.ceil(diferencia / (1000 * 3600 * 24));
  
  if (dias === 0) {
    return 'Mismo día';
  } else if (dias === 1) {
    return '1 día';
  } else if (dias < 7) {
    return `${dias} días`;
  } else if (dias < 30) {
    const semanas = Math.floor(dias / 7);
    const diasRestantes = dias % 7;
    if (diasRestantes === 0) {
      return `${semanas} semana${semanas > 1 ? 's' : ''}`;
    } else {
      return `${semanas} semana${semanas > 1 ? 's' : ''} y ${diasRestantes} día${diasRestantes > 1 ? 's' : ''}`;
    }
  } else {
    const meses = Math.floor(dias / 30);
    return `${meses} mes${meses > 1 ? 'es' : ''}`;
  }
}

abrirImagen(url: string) {
  this.imagenSeleccionada = url;
  this.imagenActualIndex = this.sliders.findIndex(img => img.url_completa === url);
}

cerrarImagen() {
  this.imagenSeleccionada = null;
}

irASiguienteImagen() {
  if (this.imagenActualIndex < this.sliders.length - 1) {
    this.imagenActualIndex++;
    this.imagenSeleccionada = this.sliders[this.imagenActualIndex].url_completa;
  }
}

irAImagenAnterior() {
  if (this.imagenActualIndex > 0) {
    this.imagenActualIndex--;
    this.imagenSeleccionada = this.sliders[this.imagenActualIndex].url_completa;
  }
}

  // ✅ Mejora: Inicialización más robusta
  ngOnInit() {
    // Reiniciar autoplay cuando hay cambios
    this.stopAutoSlide();
    
    this.loadEmprendedores();
    this.loadReservas();
    this.loadCategorias();
    this.cargarEventos();
    this.loadMunicipalidad();

    this.homeService.getMunicipalidad().subscribe({
      next: (response) => {
        this.municipalidad = response;
        // ✅ Restart autoplay después de cargar imágenes
        setTimeout(() => {
          this.startAutoSlide();
        }, 500);
      },
      error: (err) => console.error('Error cargando municipalidad', err)
    });

    // ✅ Mejora: Tiempo de carga más realista
    setTimeout(() => {
      this.cargando = false;
    }, 1500); // Reducido de 2000 a 1500ms
  }

loadMunicipalidad() {
    this.homeService.getMunicipalidad().subscribe({
      next: (response) => {
        this.municipalidad = response; // Asumimos que municipalidad tiene los sliders
        this.filteredSliders = this.municipalidad?.sliders_secundarios?.filter(slider => slider.orden === 2) ?? [];
        
        // ✅ Validar que currentIndex esté dentro del rango
        const imagenes = this.getImagenesmuni();
        if (this.currentIndex >= imagenes.length) {
          this.currentIndex = 0;
        }
      },
      error: (err) => {
        console.error('Error cargando municipalidad', err);
      }
    });
  }
  
  ngAfterViewInit(): void {
    setTimeout(() => {
      if (!this.swiperInitialized) {
        const swiper = new Swiper('.mySwiper', {
          slidesPerView: 1,
          spaceBetween: 20,
          loop: true,  // Para que se repita infinitamente
          autoplay: {
            delay: 4000,  // Tiempo entre cada cambio de diapositiva (en milisegundos)
            disableOnInteraction: false,  // Para que no se desactive el autoplay si el usuario interactúa
          },
          pagination: {
            el: '.swiper-pagination',
            clickable: true,
          },
          navigation: {
            nextEl: '.swiper-button-next',
            prevEl: '.swiper-button-prev',
          },
          breakpoints: {
            640: { slidesPerView: 1 },
            768: { slidesPerView: 2 },
            1024: { slidesPerView: 3 },
          },
        });
        this.swiperInitialized = true;
      }
    }, 100);  // Asegúrate de que el DOM esté completamente cargado
  }




  loadEmprendedores(page: number = 1) {
    this.homeService.getEmprendedores(page, 10, this.searchTerm).subscribe({
      next: (data) => {
        this.paginacion = data;
        this.homes = data.data;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error al cargar emprendedores:', error);
        this.loading = false;
      }
    });
  }

  loadReservas() {
    this.homeService.getReserva().subscribe({
      next: (data) => {
        this.reservas = data;
      },
      error: (error) => {
        console.error('Error al cargar reservas:', error);
      }
    });
  }

  loadCategorias() {
    this.homeService.getCategorias().subscribe({
      next: (res) => {
        if (res.success) {
          this.categorias = res.data;
        }
      },
      error: (err) => {
        console.error('Error al obtener categorías', err);
      }
    });
  }

  viewEmprendedorDetails(id: number) {
    this.homeService.getEmprendedor(id).subscribe({
      next: (data) => {
        this.selectedEmprendedor = data;
        document.body.style.overflow = 'hidden';
      },
      error: (error) => {
        console.error('Error al cargar detalles del emprendedor:', error);
      }
    });
  }

  closeEmprendedorDetails() {
    this.selectedEmprendedor = null;
    document.body.style.overflow = '';
  }

  searchEmprendedores() {
    this.loadEmprendedores(1);
  }

  toggleDropdown() {
    this.isDropdownOpen = !this.isDropdownOpen;
  }

  closeDropdown(event: MouseEvent) {
    const target = event.target as HTMLElement;
    if (!target.closest('.dropdown-container')) {
      this.isDropdownOpen = false;
    }
  }

  isDarkMode(): boolean {
    return this.themeService.isDarkMode();
  }

  initSwiper() {
    if (typeof Swiper !== 'undefined' && !this.swiperInitialized) {
      try {
        const swiper = new Swiper('.mySwiper', {  // Cambié esto de '.swiper-container' a '.mySwiper'
          loop: true,
          autoplay: {
            delay: 3500,
            disableOnInteraction: false,
          },
          navigation: {
            nextEl: '.swiper-button-next',
            prevEl: '.swiper-button-prev',
          },
          pagination: {
            el: '.swiper-pagination',
            clickable: true,
          },
          effect: 'fade',
          fadeEffect: {
            crossFade: true
          },
          speed: 1000,
        });
        this.swiperInitialized = true;
        console.log('Swiper initialized successfully');
      } catch (error) {
        console.error('Error initializing Swiper:', error);
      }
    } else {
      console.warn('Swiper not loaded yet or already initialized');
    }
  }

  navigateTo(path: string) {
    this.router.navigate([path]);
  }
}