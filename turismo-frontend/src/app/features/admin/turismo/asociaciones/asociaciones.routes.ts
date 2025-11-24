import { Routes } from '@angular/router';
import { AsociacionListComponent } from './asociacion-list/asociacion-list.component';
import { AsociacionFormComponent } from './asociacion-form/asociacion-form.component';
import { AsociacionEmprendedoresComponent } from './asociacion-emprendedores/asociacion-emprendedores.component';

export const ASOCIACIONES_ROUTES: Routes = [
  { 
    path: '', 
    component: AsociacionListComponent 
  },
  { 
    path: 'create', 
    component: AsociacionFormComponent 
  },
  { 
    path: 'edit/:id', 
    component: AsociacionFormComponent 
  },
  { 
    path: ':id/emprendedores', 
    component: AsociacionEmprendedoresComponent 
  }
];