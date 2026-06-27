import { Routes } from '@angular/router';
import { AuthGuard } from './core/auth.guard';

export const routes: Routes = [
  // 👇 MODIFIÉ TEMPORAIREMENT : On démarre directement sur l'historique pour squeizzer le Dashboard et Keycloak
  { path: '', redirectTo: 'historique', pathMatch: 'full' },
  {
    path: 'dashboard',
    loadComponent: () => import('./pages/dashboard/dashboard.component').then(m => m.DashboardComponent),
    // canActivate: [AuthGuard],
    data: { roles: [] }
  },
  {
    path: 'users',
    loadComponent: () => import('./pages/users/users.component').then(m => m.UsersComponent),
    // canActivate: [AuthGuard],
    data: { roles: ['ADMIN'] }
  },
  {
    path: 'profile',
    loadComponent: () => import('./pages/profile/profile.component').then(m => m.ProfileComponent),
    // canActivate: [AuthGuard],
    data: { roles: [] }
  },
  {
    path: 'livreur',
    loadComponent: () => import('./pages/livreur-status/livreur-status.component').then(m => m.LivreurStatusComponent),
    // canActivate: [AuthGuard],
    data: { roles: ['LIVREUR', 'ADMIN'] }
  },
  {
    path: 'historique',
    loadComponent: () => import('./pages/Delivery/historique.component').then(m => m.HistoriqueComponent),
    data: { roles: ['LIVREUR', 'ADMIN'] }
  },
  { path: '**', redirectTo: 'historique' } // 👇 Redirige aussi ici en cas de chemin inconnu
];