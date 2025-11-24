import { Routes } from '@angular/router';
import { CategoriaListComponent } from './categoria-list/categoria-list.component';
import { CategoriaFormComponent } from './categoria-form/categoria-form.component';

export const CATEGORIAS_ROUTES: Routes = [
  { 
    path: '', 
    component: CategoriaListComponent 
  },
  { 
    path: 'create', 
    component: CategoriaFormComponent 
  },
  { 
    path: 'edit/:id', 
    component: CategoriaFormComponent 
  }
];
