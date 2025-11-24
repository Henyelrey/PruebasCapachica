import { Routes } from '@angular/router';

export const TURISMO_ROUTES: Routes = [
  {
    path: 'categorias',
    loadChildren: () => import('./categorias/categorias.routes').then(m => m.CATEGORIAS_ROUTES),
    title: 'Gestión de Categorías'
  },
  {
    path: 'emprendedores',
    loadChildren: () => import('./emprendedores/emprendedores.routes').then(m => m.EMPRENDEDORES_ROUTES),
    title: 'Gestión de Emprendedores'
  },
  {
    path: 'servicios',
    loadChildren: () => import('./servicios/servicios.routes').then(m => m.SERVICIOS_ROUTES),
    title: 'Gestión de Servicios'
  },
  {
    path: 'reservas',
    loadChildren: () => import('./reservas/reservas.routes').then(m => m.RESERVAS_ROUTES),
    title: 'Gestión de Reservas'
  },
  {
    path: 'municipalidad',
    loadChildren: () => import('./municipalidad/municipalidad.routes').then(m => m.MUNICIPALIDAD_ROUTES),
    title: 'Gestión de Municipalidad'
  },
  {
    path: 'evento',
    loadChildren: () => import('./evento/eventos.routes').then(m => m.EVENTOS_ROUTES),
    title: 'Gestión de Evento'
  },
  {
    path: 'asociaciones',
    loadChildren: () => import('./asociaciones/asociaciones.routes').then(m => m.ASOCIACIONES_ROUTES),
    title: 'Gestión de Asociaciones'
  },
  
];