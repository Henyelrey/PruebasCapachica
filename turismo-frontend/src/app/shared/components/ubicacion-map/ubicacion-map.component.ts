import { Component, Input, Output, EventEmitter, OnInit, OnChanges, SimpleChanges, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-ubicacion-map',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="relative w-full h-80 rounded-lg overflow-hidden border border-gray-300 dark:border-gray-600 shadow-inner">
      <div id="map" class="w-full h-full"></div>
      
      <!-- Loading overlay -->
      <div *ngIf="!mapReady" class="absolute inset-0 bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
        <div class="text-center">
          <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-amber-600"></div>
          <p class="mt-2 text-sm text-gray-600 dark:text-gray-400">Cargando mapa...</p>
        </div>
      </div>
      
      <!-- Radio circle indicator -->
      <div *ngIf="!readOnly && showRadiusIndicator" class="absolute bottom-4 right-4 bg-black/70 text-white text-xs px-2 py-1 rounded">
        Radio: {{ radiusKm }}km
      </div>
    </div>
    
    <div class="mt-2 text-sm text-gray-500 dark:text-gray-400" *ngIf="!readOnly">
      <div class="flex items-center">
        <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
        </svg>
        Haz clic en el mapa para seleccionar la ubicación exacta.
      </div>
      <div *ngIf="showRadiusIndicator" class="mt-1">
        <span class="inline-flex items-center">
          <span class="w-2 h-2 bg-blue-500 rounded-full mr-1 opacity-50"></span>
          Área de búsqueda
        </span>
      </div>
    </div>
  `,
  styles: [`
    ::ng-deep .leaflet-container {
      height: 100%;
      width: 100%;
      font-family: inherit;
    }
    
    ::ng-deep .leaflet-control-zoom a {
      background-color: white;
      color: #374151;
    }
    
    ::ng-deep .leaflet-control-zoom a:hover {
      background-color: #f3f4f6;
    }
    
    ::ng-deep .custom-radius-circle {
      fill: rgba(59, 130, 246, 0.1);
      stroke: rgba(59, 130, 246, 0.5);
      stroke-width: 2;
    }
  `]
})
export class UbicacionMapComponent implements OnInit, OnChanges, AfterViewInit {
  @Input() latitud?: number | null;
  @Input() longitud?: number | null;
  @Input() readOnly: boolean = false;
  @Input() radiusKm: number = 10;
  @Input() showRadiusIndicator: boolean = false;
  @Input() zoom: number = 13;
  @Output() ubicacionChange = new EventEmitter<{lat: number, lng: number}>();
  
  private map: any;
  private marker: any;
  private radiusCircle: any;
  private Leaflet: any;
  mapReady = false;
  
  constructor() {}
  
  ngOnInit() {
    this.loadLeaflet().then(() => {
      this.initMap();
    });
  }
  
  ngOnChanges(changes: SimpleChanges) {
    if (this.map && this.Leaflet) {
      if (changes['latitud'] || changes['longitud']) {
        this.updateMarkerPosition();
      }
      if (changes['radiusKm'] && this.showRadiusIndicator) {
        this.updateRadiusCircle();
      }
    }
  }
  
  ngAfterViewInit() {
    // Asegurar que el mapa se inicialice después de que la vista esté lista
    if (this.Leaflet && !this.map) {
      setTimeout(() => this.initMap(), 100);
    }
  }
  
  private loadLeaflet(): Promise<void> {
    return new Promise<void>((resolve) => {
      // Si Leaflet ya está cargado, resolver inmediatamente
      if (window.L) {
        this.Leaflet = window.L;
        resolve();
        return;
      }
      
      // Cargar CSS de Leaflet
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
      link.integrity = 'sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY=';
      link.crossOrigin = '';
      document.head.appendChild(link);
      
      // Cargar JavaScript de Leaflet
      const script = document.createElement('script');
      script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
      script.integrity = 'sha256-20nQCchB9co0qIjJZRGuk2/Z9VM+kNiyxNV1lvTlZBo=';
      script.crossOrigin = '';
      script.onload = () => {
        this.Leaflet = window.L;
        resolve();
      };
      document.head.appendChild(script);
    });
  }
  
  private initMap() {
    if (!this.Leaflet) return;
    
    // Coordenadas por defecto: Centro del Lago Titicaca, Capachica
    const defaultLat = this.latitud || -15.6428;
    const defaultLng = this.longitud || -69.8334;
    
    try {
      // Crear el mapa
      this.map = this.Leaflet.map('map', {
        zoomControl: true,
        scrollWheelZoom: true,
        doubleClickZoom: true,
        boxZoom: true,
        keyboard: true,
        dragging: true,
        touchZoom: true
      }).setView([defaultLat, defaultLng], this.zoom);
      
      // Añadir capa de mapa base (OpenStreetMap)
      this.Leaflet.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 19
      }).addTo(this.map);
      
      // Inicializar el marcador si hay coordenadas
      this.updateMarkerPosition();
      
      // Añadir círculo de radio si está habilitado
      if (this.showRadiusIndicator) {
        this.updateRadiusCircle();
      }
      
      // Añadir evento de clic en el mapa solo si no es readonly
      if (!this.readOnly) {
        this.map.on('click', (e: any) => {
          const lat = e.latlng.lat;
          const lng = e.latlng.lng;
          
          this.ubicacionChange.emit({ lat, lng });
          this.updateMarker(lat, lng);
          
          if (this.showRadiusIndicator) {
            this.updateRadiusCircle();
          }
        });
      }
      
      this.mapReady = true;
    } catch (error) {
      console.error('Error inicializando el mapa:', error);
    }
  }
  
  private updateMarkerPosition() {
    if (!this.map || !this.Leaflet) return;
    
    // Si no hay coordenadas, no hacer nada
    if (!this.latitud || !this.longitud) {
      if (this.marker) {
        this.map.removeLayer(this.marker);
        this.marker = null;
      }
      return;
    }
    
    this.updateMarker(this.latitud, this.longitud);
    
    // Solo centrar el mapa si es readonly o si es la primera vez
    if (this.readOnly || !this.marker) {
      this.map.setView([this.latitud, this.longitud], this.zoom);
    }
  }
  
  private updateMarker(lat: number, lng: number) {
    if (!this.map || !this.Leaflet) return;
    
    // Actualizar o crear el marcador
    if (!this.marker) {
      this.marker = this.Leaflet.marker([lat, lng], {
        draggable: !this.readOnly
      }).addTo(this.map);
      
      // Añadir evento de arrastre si no es readonly
      if (!this.readOnly) {
        this.marker.on('dragend', (e: any) => {
          const position = e.target.getLatLng();
          this.ubicacionChange.emit({ lat: position.lat, lng: position.lng });
          
          if (this.showRadiusIndicator) {
            this.updateRadiusCircle();
          }
        });
      }
    } else {
      this.marker.setLatLng([lat, lng]);
    }
    
    // Añadir popup con información
    let popupContent = 'Ubicación seleccionada';
    if (this.readOnly) {
      popupContent = 'Ubicación del servicio';
    }
    
    this.marker.bindPopup(popupContent);
  }
  
  private updateRadiusCircle() {
    if (!this.map || !this.Leaflet || !this.marker) return;
    
    // Remover círculo existente
    if (this.radiusCircle) {
      this.map.removeLayer(this.radiusCircle);
    }
    
    // Crear nuevo círculo
    const markerPosition = this.marker.getLatLng();
    this.radiusCircle = this.Leaflet.circle(markerPosition, {
      radius: this.radiusKm * 1000, // Convertir km a metros
      fillColor: '#3b82f6',
      fillOpacity: 0.1,
      color: '#3b82f6',
      weight: 2,
      opacity: 0.5
    }).addTo(this.map);
    
    // Ajustar la vista del mapa para mostrar todo el círculo
    const bounds = this.radiusCircle.getBounds();
    this.map.fitBounds(bounds, { padding: [20, 20] });
  }
  
  // Método público para actualizar el radio
  updateRadius(newRadius: number) {
    this.radiusKm = newRadius;
    if (this.showRadiusIndicator) {
      this.updateRadiusCircle();
    }
  }
  
  // Método público para limpiar el mapa
  clearMap() {
    if (this.marker) {
      this.map.removeLayer(this.marker);
      this.marker = null;
    }
    
    if (this.radiusCircle) {
      this.map.removeLayer(this.radiusCircle);
      this.radiusCircle = null;
    }
  }
  
  // Método público para centrar el mapa en Capachica
  centerOnCapachica() {
    if (this.map) {
      this.map.setView([-15.6428, -69.8334], 12);
    }
  }
}

// Declarar la interfaz de la ventana para tener acceso a Leaflet
declare global {
  interface Window {
    L: any;
  }
}