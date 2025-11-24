import { Routes } from '@angular/router';
import { EventosComponent } from './eventos/eventos.component';
import { HomeComponent } from './home/home.component';
import { ServiciosComponent } from './servicio/servicios/servicios.component';
import { GeneralHeaderComponent } from '../shared/components/header/general-header.component';
import { ReservasComponent } from './reservas/reservas.component';
import { EmprendimientosComponent } from './emprendimientos/emprendimientos.component';

export const PAGEGENERAL_ROUTES: Routes = [
  {
    path: '',
    component: GeneralHeaderComponent,
    children: [
      {
        path: 'home',
        component: HomeComponent,
        title: 'Home'
      },
      {
        path: 'eventos',
        loadChildren: () =>
          import('./eventos/eventos.routes').then(m => m.EVENTOS_ROUTES)
      },
      {
        path: 'emprendimientos',
        loadChildren: () => import('./emprendimientos/emprendimientos.routes').then(m => m.emprendimientosRoutes)
      },
      {
        path: 'servicios',
        loadChildren: () =>
          import('./servicio/servicios/servicios.routes').then(m => m.SERVICIOS_ROUTES)
      },
      {
        path: 'planes',
        loadChildren: () =>
          import('./planes/planes.routes').then(m => m.PLANES_GENERAL_ROUTES)
      },
      { 
        path: 'reservas/:id', 
        component: ReservasComponent, 
        title: 'Reservas' 
      },
      {
        path: 'carrito',
        loadChildren: () =>
          import('./carrito/carrito.routes').then(m => m.CARRITO_ROUTES)
      },
      {
        path: '',
        redirectTo: 'home',
        pathMatch: 'full'
      }
    ]
  }
];

// Para exportación fácil de los componentes
export * from './eventos/eventos.component';
export * from './home/home.component';
export * from './servicio/servicios/servicios.component';
export * from './carrito/carrito.component';