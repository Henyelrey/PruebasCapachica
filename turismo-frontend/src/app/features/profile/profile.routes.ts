import { Routes } from '@angular/router';
import { ProfileComponent } from './profile.component';

export const PROFILE_ROUTES: Routes = [
  {
    path: '',
    component: ProfileComponent,
    title: 'Mi perfil'
  }
];

// Para exportación fácil de los componentes
export * from './profile.component';