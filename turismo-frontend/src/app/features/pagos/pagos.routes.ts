// src/app/features/pagos/pagos.routes.ts
import { Routes } from '@angular/router';
import { PagosComponent } from './pagos.component';
import { authGuard } from '../../core/guards/auth.guard';

export const PAGOS_ROUTES: Routes = [
  {
    path: '',
    redirectTo: 'yape',
    pathMatch: 'full'
  },
  {
    path: 'yape',
    component: PagosComponent,
    canActivate: [authGuard],
    data: { 
      title: 'Pago con Yape',
      description: 'Completa tu pago usando Yape'
    }
  },
  {
    path: 'visa',
    component: PagosComponent,
    canActivate: [authGuard],
    data: { 
      title: 'Pago con Visa',
      description: 'Completa tu pago con tarjeta Visa'
    }
  },
  {
    path: 'mastercard',
    component: PagosComponent,
    canActivate: [authGuard],
    data: { 
      title: 'Pago con Mastercard',
      description: 'Completa tu pago con tarjeta Mastercard'
    }
  },
  {
    path: '**',
    redirectTo: 'yape'
  }
];