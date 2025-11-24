import { Routes } from '@angular/router';
import { RoleListComponent } from './role-list/role-list.component';
import { RoleFormComponent } from './role-form/role-form.component';

export const ROLES_ROUTES: Routes = [
  {
    path: '',
    component: RoleListComponent,
    title: 'Listado de Roles'
  },
  {
    path: 'create',
    component: RoleFormComponent,
    title: 'Crear Rol'
  },
  {
    path: 'edit/:id',
    component: RoleFormComponent,
    title: 'Editar Rol'
  }
];