import { Routes } from '@angular/router';
import { AuthGuard } from './core/auth.guard';

export const routes: Routes = [
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
  {
    path: 'dashboard',
    loadComponent: () =>
      import('./pages/dashboard/dashboard.component').then(
        (m) => m.DashboardComponent,
      ),
    canActivate: [AuthGuard],
    data: { roles: [] },
  },
  {
    path: 'users',
    loadComponent: () =>
      import('./pages/users/users.component').then((m) => m.UsersComponent),
    canActivate: [AuthGuard],
    data: { roles: ['ADMIN'] },
  },
  {
    path: 'profile',
    loadComponent: () =>
      import('./pages/profile/profile.component').then(
        (m) => m.ProfileComponent,
      ),
    canActivate: [AuthGuard],
    data: { roles: [] },
  },
  {
    path: 'livreur',
    loadComponent: () =>
      import('./pages/livreur-status/livreur-status.component').then(
        (m) => m.LivreurStatusComponent,
      ),
    canActivate: [AuthGuard],
    data: { roles: ['LIVREUR', 'ADMIN'] },
  },
  {
    path: 'historique',
    loadComponent: () =>
      import('./pages/Delivery/historique.component').then(
        (m) => m.HistoriqueComponent,
      ),
    canActivate: [AuthGuard],
    data: { roles: ['LIVREUR', 'ADMIN'] },
  },
  // TRACKING SERVICE PAGES
  {
    path: 'tracking',
    loadComponent: () =>
      import('./pages/tracking/tracking-map.component').then(
        (m) => m.TrackingMapComponent,
      ),
    canActivate: [AuthGuard],
    data: { roles: ['LIVREUR', 'ADMIN'] },
  },
  {
    path: 'suivi-commande',
    loadComponent: () =>
      import('./pages/tracking-live/order-tracking.component').then(
        (m) => m.OrderTrackingComponent,
      ),
    canActivate: [AuthGuard],
    data: { roles: [] },
  },
  { path: '**', redirectTo: 'dashboard' },
];
