import { Routes } from '@angular/router';

export const emprendimientosRoutes: Routes = [
  {
    path: '',
    loadComponent: () => import('./emprendimientos.component').then(m => m.EmprendimientosComponent),
    title: 'Emprendimientos - Capachica Turismo'
  },
  {
    path: ':id',
    loadComponent: () => import('./detalle-emprendimiento/emprendimiento-detalle.component').then(m => m.EmprendimientoDetalleComponent),
    title: 'Detalle de Emprendimiento - Capachica Turismo'
  }
];