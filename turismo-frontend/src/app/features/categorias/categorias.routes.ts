// src/app/features/categorias/categorias.routes.ts
import { Routes } from '@angular/router';
import { CategoriasComponent } from './categorias.component';

export const CATEGORIAS_ROUTES: Routes = [
  {
    path: '',
    component: CategoriasComponent,
    title: 'Categorias'
  }
];

// Para exportación fácil de los componentes
export * from './categorias.component';