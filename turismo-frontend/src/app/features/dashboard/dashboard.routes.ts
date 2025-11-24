
import { Routes } from '@angular/router';
import { DashboardComponent } from './dashboard.component';

export const DASHBOARD_ROUTES: Routes = [
  {
    path: '',
    component: DashboardComponent,
    title: 'Dashboard'
  }
];

// Para exportación fácil de los componentes
export * from './dashboard.component';