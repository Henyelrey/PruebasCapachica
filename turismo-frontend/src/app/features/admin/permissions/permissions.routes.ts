import { Routes } from '@angular/router';
import { PermissionListComponent } from './permission-list/permission-list.component';

export const PERMISSIONS_ROUTES: Routes = [
  {
    path: '',
    component: PermissionListComponent,
    title: 'Listado de Permisos'
  }
];