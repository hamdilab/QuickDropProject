import { Routes } from '@angular/router';
import { AuthGuard } from './core/auth.guard';

export const routes: Routes = [
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
  {
    path: 'dashboard',
    loadComponent: () => import('./pages/dashboard/dashboard.component').then(m => m.DashboardComponent),
    canActivate: [AuthGuard],
    data: { roles: [] }
  },
  {
    path: 'users',
    loadComponent: () => import('./pages/users/users.component').then(m => m.UsersComponent),
    canActivate: [AuthGuard],
    data: { roles: ['ADMIN'] }
  },
  {
    path: 'profile',
    loadComponent: () => import('./pages/profile/profile.component').then(m => m.ProfileComponent),
    canActivate: [AuthGuard],
    data: { roles: [] }
  },
  {
    path: 'livreur',
    loadComponent: () => import('./pages/livreur-status/livreur-status.component').then(m => m.LivreurStatusComponent),
    canActivate: [AuthGuard],
    data: { roles: ['LIVREUR', 'ADMIN'] }
  },
  {
    path: 'historique',
    loadComponent: () => import('./pages/Delivery/historique.component').then(m => m.HistoriqueComponent),
    canActivate: [AuthGuard],
    data: { roles: ['LIVREUR', 'ADMIN'] },
  },
  {
    path: 'tracking',
    loadComponent: () =>
      import('./pages/tracking/tracking-map.component').then(
        (m) => m.TrackingMapComponent,
      ),
    data: { roles: [] },
  },
  {
    path: 'catalog/browse',
    loadComponent: () => import('./pages/catalog/catalog-browse/catalog-browse.component').then(m => m.CatalogBrowseComponent),
    data: { roles: [] }
  },
  {
    path: 'catalog/categories',
    loadComponent: () => import('./pages/catalog/categories/categories.component').then(m => m.CategoriesComponent),
    data: { roles: ['ADMIN', 'RESTAURATEUR'] }
  },
  {
    path: 'catalog/restaurants',
    loadComponent: () => import('./pages/catalog/restaurants/restaurants.component').then(m => m.RestaurantsComponent),
    data: { roles: ['ADMIN', 'RESTAURATEUR'] }
  },
  {
    path: 'catalog/menus',
    loadComponent: () => import('./pages/catalog/menus/menus.component').then(m => m.MenusComponent),
    data: { roles: ['ADMIN', 'RESTAURATEUR'] }
  },
  {
    path: 'catalog/produits',
    loadComponent: () => import('./pages/catalog/produits/produits.component').then(m => m.ProduitsComponent),
    data: { roles: ['ADMIN', 'RESTAURATEUR'] }
  },
  {
    path: 'catalog/ingredients',
    loadComponent: () => import('./pages/catalog/ingredients/ingredients.component').then(m => m.IngredientsComponent),
    data: { roles: ['ADMIN', 'RESTAURATEUR'] }
  },
  { path: '**', redirectTo: 'dashboard' }
  {
    path: 'tracking-demo',
    loadComponent: () =>
      import('./pages/tracking-live/tracking-demo.component').then(
        (m) => m.TrackingDemoComponent,
      ),
    data: { roles: [] },
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
