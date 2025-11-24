import { Routes } from '@angular/router';
import { UserListComponent } from './user-list/user-list.component';
import { UserFormComponent } from './user-form/user-form.component';
import { UserPermissionsComponent } from './user-permissions/user-permissions.component';

export const USERS_ROUTES: Routes = [
  {
    path: '',
    component: UserListComponent,
    title: 'Listado de Usuarios'
  },
  {
    path: 'create',
    component: UserFormComponent,
    title: 'Crear Usuario'
  },
  {
    path: 'edit/:id',
    component: UserFormComponent,
    title: 'Editar Usuario'
  },
  {
    path: ':id/permissions',
    component: UserPermissionsComponent,
    title: 'Permisos de Usuario'
  }
];