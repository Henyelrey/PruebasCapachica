import { Routes } from '@angular/router';
import { EventosComponent } from './eventos.component';
import { EventosdetalleComponent } from './eventosdetalle/eventosdetalle.component';

export const EVENTOS_ROUTES: Routes = [
  {
    path: '',
    component: EventosComponent,
    title: 'Eventos'
  },
  {
    path: 'eventosdetalle/:id',
    component: EventosdetalleComponent,
    title: 'Detalle de Evento'
  },

];
