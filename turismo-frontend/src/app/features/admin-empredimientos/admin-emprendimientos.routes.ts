import { Routes } from '@angular/router';
import { authGuard } from '../../core/guards/auth.guard';

export const ADMIN_EMPRENDEDORES_ROUTES: Routes = [
  {
    path: 'seleccion-panel',
    loadComponent: () => import('./seleccion-panel/seleccion-panel.component').then(c => c.SeleccionPanelComponent),
    canActivate: [authGuard],
    title: 'Selección de Panel'
  },
  {
    path: 'mis-emprendimientos',
    loadComponent: () => import('./mis-emprendimientos/mis-emprendimientos.component').then(c => c.MisEmprendimientosComponent),
    canActivate: [authGuard],
    title: 'Mis Emprendimientos'
  },
  {
    path: 'mis-emprendimientos/:id',
    loadComponent: () => import('./mis-emprendimientos-detalle/mis-emprendimientos-detalle.component').then(c => c.MisEmprendimientoDetalleComponent),
    canActivate: [authGuard],
    title: 'Detalle de mi Emprendimiento'
  },
  // Layout padre para todas las rutas de gestión de emprendimiento
  {
    path: 'admin-emprendedores/emprendimiento/:id',
    loadComponent: () => import('./emprendimiento-layout/emprendimiento-layout.component').then(c => c.EmprendimientoLayoutComponent),
    canActivate: [authGuard],
    children: [
      {
        path: '',
        loadComponent: () => import('./mis-emprendimientos-detalle/mis-emprendimientos-detalle.component').then(c => c.MisEmprendimientoDetalleComponent),
        title: 'Detalle de mi Emprendimiento'
      },
      {
        path: 'mis-emprendimientos/:id',
        loadComponent: () => import('./emprendimiento-detalle/emprendimiento-detalle.component').then(c => c.EmprendimientoDetalleComponent),
        title: 'Información del Emprendimiento'
      },
      {
        path: 'dashboard',
        loadComponent: () => import('./emprendimiento-dashboard/emprendimiento-dashboard.component').then(c => c.EmprendimientoDashboardComponent),
        title: 'Dashboard del Emprendimiento'
      },
      {
        path: 'servicios',
        loadComponent: () => import('./servicios-list/servicios-list.component').then(c => c.ServiciosListComponent),
        title: 'Servicios del Emprendimiento'
      },
      {
        path: 'servicios/nuevo',
        loadComponent: () => import('./servicios-form/servicio-form.component').then(c => c.ServicioFormComponent),
        title: 'Nuevo Servicio'
      },
      {
        path: 'servicios/:servicioId',
        loadComponent: () => import('./servicios-form/servicio-form.component').then(c => c.ServicioFormComponent),
        title: 'Editar Servicio'
      },
      {
        path: 'administradores',
        loadComponent: () => import('./administradores-list/administradores-list.component').then(c => c.AdministradoresListComponent),
        title: 'Administradores del Emprendimiento'
      },
      {
        path: 'reservas',
        loadComponent: () => import('./reservas-list/reservas-list.component').then(c => c.ReservasListComponent),
        title: 'Reservas del Emprendimiento'
      },
      {
        path: 'calendario',
        loadComponent: () => import('./calendario-emprendimiento/calendario-emprendimiento.component').then(c => c.CalendarioEmprendimientoComponent),
        title: 'Calendario del Emprendimiento'
      },
      {
        path: 'planes',
        loadComponent: () => import('./planes-list/planes-list.component').then(c => c.PlanesListComponent),
        title: 'Planes del Emprendimiento'
      },
      {
        path: 'estadisticas',
        loadComponent: () => import('./estadisticas-emprendimiento/estadisticas-emprendimiento.component').then(c => c.EstadisticasEmprendimientoComponent),
        title: 'Estadísticas del Emprendimiento'
      }
    ]
  }
];