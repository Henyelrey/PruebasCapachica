import { Routes } from '@angular/router';
import { EmprendedorListComponent } from './emprendedor-list/emprendedor-list.component';
import { EmprendedorFormComponent } from './emprendedor-form/emprendedor-form.component';
import { EmprendedorServiciosComponent } from './emprendedor-servicios/emprendedor-servicios.component';
import { AsignarAdministradorComponent } from './emprededor-asignar/emprendedor-asignar.component';

export const EMPRENDEDORES_ROUTES: Routes = [
  {
    path: '',
    component: EmprendedorListComponent
  },
  {
    path: 'create',
    component: EmprendedorFormComponent
  },
  {
    path: 'edit/:id',
    component: EmprendedorFormComponent
  },
  {
    path: ':id/servicios',
    component: EmprendedorServiciosComponent
  },
  {
    path: ':id/asignaradministrador',
    component: AsignarAdministradorComponent
  },
];