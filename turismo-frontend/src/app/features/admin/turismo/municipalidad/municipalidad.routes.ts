import { Routes } from '@angular/router';
import { MunicipalidadListComponent } from './municipalidad-list/municipalidad-list.component';
import { MunicipalidadFormComponent } from './municipalidad-form/municipalidad-form.component';
import { MunicipalidadAsociacionesComponent } from './municipalidad-asociaciones/municipalidad-asociaciones.component';

export const MUNICIPALIDAD_ROUTES: Routes = [
  { 
    path: '', 
    component: MunicipalidadListComponent 
  },
  { 
    path: 'create', 
    component: MunicipalidadFormComponent 
  },
  { 
    path: 'edit/:id', 
    component: MunicipalidadFormComponent 
  },
  { 
    path: ':id/asociaciones', 
    component: MunicipalidadAsociacionesComponent 
  }
];