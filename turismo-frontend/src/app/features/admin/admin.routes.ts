// src/app/features/admin/admin.routes.ts
import { Routes } from '@angular/router';
import { AdminLayoutComponent } from '../../shared/layouts/admin-layout/admin-layout.component';
import { ProfileComponent } from '../profile/profile.component';

export const ADMIN_ROUTES: Routes = [
  {
    path: '',
    children: [
      {
        path: 'users',
        loadChildren: () => import('./users/users.routes').then(m => m.USERS_ROUTES),
        title: 'Gestión de Usuarios'
      },
      {
        path: 'profile',
        loadChildren: () => import('../profile/profile.routes').then(m => m.PROFILE_ROUTES),
        title: 'Mi perfil'
      },
      {
        path: 'roles',
        loadChildren: () => import('./roles/roles.routes').then(m => m.ROLES_ROUTES),
        title: 'Gestión de Roles'
      },
      {
        path: 'permissions',
        loadChildren: () => import('./permissions/permissions.routes').then(m => m.PERMISSIONS_ROUTES),
        title: 'Gestión de Permisos'
      },
      {
        path: 'categorias',
        loadChildren: () => import('./turismo/categorias/categorias.routes').then(m => m.CATEGORIAS_ROUTES),
        title: 'Gestión de Categorías'
      },
      {
        path: 'emprendedores',
        loadChildren: () => import('./turismo/emprendedores/emprendedores.routes').then(m => m.EMPRENDEDORES_ROUTES),
        title: 'Gestión de Emprendedores'
      },
      {
        path: 'servicios',
        loadChildren: () => import('./turismo/servicios/servicios.routes').then(m => m.SERVICIOS_ROUTES),
        title: 'Gestión de Servicios'
      },
      {
        path: 'reservas',
        loadChildren: () => import('./turismo/reservas/reservas.routes').then(m => m.RESERVAS_ROUTES),
        title: 'Gestión de Reservas'
      },
      {
        path: 'municipalidad',
        loadChildren: () => import('./turismo/municipalidad/municipalidad.routes').then(m => m.MUNICIPALIDAD_ROUTES),
        title: 'Gestión de Municipalidad'
      },
      {
        path: 'asociaciones',
        loadChildren: () => import('./turismo/asociaciones/asociaciones.routes').then(m => m.ASOCIACIONES_ROUTES),
        title: 'Gestión de Asociaciones'
      },
      {
        path: 'evento',
        loadChildren: () => import('./turismo/evento/eventos.routes').then(m => m.EVENTOS_ROUTES),
        title: 'Gestión de Eventos'
      },
        {
        path: 'planes',
        loadChildren: () => import('./turismo/planes/planes.routes').then(m => m.PLANES_ROUTES),
        title: 'Gestion de Planes'
      },
      {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full'
      }
    ]
  }
];