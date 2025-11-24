import { Routes } from '@angular/router';
import { EventoListComponent } from './evento-list/evento.component';
import { EventoFormComponent } from './evento-form/evento-form.component';
import { EventoDetalleComponent } from './evento-detalle/evento-detalle.component';

export const EVENTOS_ROUTES: Routes = [
  {
    path: '',
    component: EventoListComponent,
    title: 'Listado de Eventos'
  },
  {
    path: 'create',
    component: EventoFormComponent,
    title: 'Crear Evento'
  },
  {
    path: 'edit/:id',
    component: EventoFormComponent,
    title: 'Editar Evento'
  },
  {
    path: ':id',
    component: EventoDetalleComponent,
    title: 'Detalle de Evento'
  }
];
