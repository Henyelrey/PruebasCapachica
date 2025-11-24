import { Routes } from '@angular/router';
import { HomeComponent } from './home.component';

export const EMPRENDEDORES_ROUTES: Routes = [
  {
    path: '',
    component: HomeComponent,
    title: 'Homes'
  }
];

// Para exportación fácil de los componentes
export * from './home.component';