import { Routes } from '@angular/router';
import { ServicioListComponent } from './servicio-list/servicio-list.component';
import { ServicioFormComponent } from './servicio-form/servicio-form.component';

export const SERVICIOS_ROUTES: Routes = [
  {
    path: '',
    component: ServicioListComponent
  },
  {
    path: 'create',
    component: ServicioFormComponent
  },
  {
    path: 'edit/:id',
    component: ServicioFormComponent
  }
];