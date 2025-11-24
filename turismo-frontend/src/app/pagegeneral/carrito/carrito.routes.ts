import { Routes } from '@angular/router';
import { CarritoComponent } from './carrito.component';
import { carritoGuard } from '../../core/guards/carrito.guard';

export const CARRITO_ROUTES: Routes = [
  {
    path: '',
    component: CarritoComponent,
    canActivate: [carritoGuard],
    title: 'Mi Carrito - Emprendedores Capachica'
  }
];
export { CarritoComponent };