import { Routes } from '@angular/router';
import { PlanesDetalleComponent } from './planesdetalle/planes-detalle.component';
import { PlanesComponent } from './planes.component';
import { planDetalleGuard } from '../../core/guards/planes.guard';

export const PLANES_GENERAL_ROUTES: Routes = [
  {
    path: '',
    component: PlanesComponent,
    title: 'Planes Turísticos - Capachica'
  },
  {
    path: 'detalle/:id',
    component: PlanesDetalleComponent,
    title: 'Detalle del Plan',
    canActivate: [planDetalleGuard]
  }
];