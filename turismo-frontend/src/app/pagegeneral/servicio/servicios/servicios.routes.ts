import { Routes } from '@angular/router';
import { ServiciosComponent } from './servicios.component';

export const SERVICIOS_ROUTES: Routes = [
  {
    path: '',
    component: ServiciosComponent,
    title: 'Servicios Turísticos - Capachica'
  },
  {
    path: ':id',
    loadComponent: () => import('./servicios-detalle/servicio-detalle.component').then(m => m.ServicioDetalleComponent),
    title: 'Detalle del Servicio - Capachica'
  }
];