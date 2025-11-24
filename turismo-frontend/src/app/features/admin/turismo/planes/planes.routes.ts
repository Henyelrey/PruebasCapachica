import { Routes } from '@angular/router';
import { PlanesListComponent } from './planes-list/planes-list.component';
import { PlanesDetailComponent } from './planes-detail/planes-detail.component';
import { PlanesEstadisticasComponent } from './planes-estadisticas/planes-estadisticas.component';
import { PlanesInscripcionesComponent } from './planes-inscripciones/planes-inscripciones.component';
import { PlanesFormComponent } from './planes-form/planes-form.component';

export const PLANES_ROUTES: Routes = [
  { 
    path: '', 
    component: PlanesListComponent,
    title: 'Gestión de Planes'
  },
  { 
    path: 'create', 
    component: PlanesFormComponent,
    title: 'Crear Plan'
  },
  { 
    path: 'edit/:id', 
    component: PlanesFormComponent,
    title: 'Editar Plan'
  },
  { 
    path: ':id/detail', 
    component: PlanesDetailComponent,
    title: 'Detalle del Plan'
  },
  { 
    path: 'estadisticas', 
    component: PlanesEstadisticasComponent,
    title: 'Estadísticas de Planes'
  },
  { 
    path: 'inscripciones', 
    component: PlanesInscripcionesComponent,
    title: 'Gestión de Inscripciones'
  }
];