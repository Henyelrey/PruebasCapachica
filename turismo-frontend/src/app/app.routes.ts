import { Routes } from '@angular/router';
import { authGuard, nonAuthGuard } from './core/guards/auth.guard';
import { AdminLayoutComponent } from './shared/layouts/admin-layout/admin-layout.component';
import { ServiciosComponent } from './pagegeneral/pagegeneral.routes';

export const routes: Routes = [
    // Ruta por defecto

    {
        path: '',
        redirectTo: 'home',
        pathMatch: 'full'
    },

    // Rutas de autenticación (login, register, etc.)
    {
        path: '',
        canActivate: [nonAuthGuard],
        loadChildren: () => import('./features/auth/auth.routes').then(m => m.AUTH_ROUTES)
    },

    // Rutas de página general pública
    {
        path: '',
        loadChildren: () => import('./pagegeneral/pagegeneral.routes').then(m => m.PAGEGENERAL_ROUTES)
    },

    {
        path: '',
        loadChildren: () => import('./features/admin-empredimientos/admin-emprendimientos.routes').then(m => m.ADMIN_EMPRENDEDORES_ROUTES)
    },
    

    // Todas las rutas protegidas por autenticación
    {
        path: '',
        component: AdminLayoutComponent,
        canActivate: [authGuard],
        children: [
            {
                path: 'dashboard',
                loadChildren: () => import('./features/dashboard/dashboard.routes').then(m => m.DASHBOARD_ROUTES)
            },
            {
                path: 'admin',
                loadChildren: () => import('./features/admin/admin.routes').then(m => m.ADMIN_ROUTES)
            },
            {
                path: 'categorias',
                loadChildren: () => import('./features/categorias/categorias.routes').then(m => m.CATEGORIAS_ROUTES)
            }
        ]
    },
    {
        path: 'pagos',
        loadChildren: () => import('./features/pagos/pagos.routes').then(m => m.PAGOS_ROUTES),
        canActivate: [authGuard]
    },
    // Ruta para manejar rutas no encontradas
    {
        path: '**',
        redirectTo: 'home', // Cambiado a 'home' en lugar de 'dashboard' para redirigir a una ruta pública
    }

];
