import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../core/auth.service';
import { UserApiService, User } from '../../core/user-api.service';
import { RouterLink } from '@angular/router';

const KEYCLOAK_TO_APP_ROLE: Record<string, string> = {
  admin: 'ADMIN',
  client: 'CLIENT',
  livreur: 'LIVREUR',
  restaurateur: 'RESTAURATEUR',
};

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="page">
      <div class="page-header">
        <h1>Tableau de bord</h1>
        <p>Bienvenue, <strong>{{ auth.getUsername() }}</strong> 👋</p>
      </div>

      <!-- Admin stats -->
      <div class="stats-grid" *ngIf="auth.isAdmin()">
        <div class="stat-card">
          <div class="stat-icon">👥</div>
          <div class="stat-info">
            <span class="stat-value">{{ totalUsers }}</span>
            <span class="stat-label">Utilisateurs</span>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon">🚴</div>
          <div class="stat-info">
            <span class="stat-value">{{ livreurCount }}</span>
            <span class="stat-label">Livreurs</span>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon">🍽️</div>
          <div class="stat-info">
            <span class="stat-value">{{ restaurateurCount }}</span>
            <span class="stat-label">Restaurateurs</span>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon">🛒</div>
          <div class="stat-info">
            <span class="stat-value">{{ clientCount }}</span>
            <span class="stat-label">Clients</span>
          </div>
        </div>
      </div>

      <!-- Role-specific welcome card for non-admins -->
      <div class="welcome-card" *ngIf="!auth.isAdmin() && roleResolved">
        <div class="welcome-icon">{{ getRoleIcon() }}</div>
        <h2>Espace {{ getRoleLabel() }}</h2>
        <p *ngIf="auth.isClient()">Passez vos commandes et suivez vos livraisons.</p>
        <p *ngIf="auth.isRestaurateur()">Gérez vos menus et vos commandes entrantes.</p>
        <p *ngIf="auth.isLivreur()">Mettez à jour votre statut et gérez vos livraisons.</p>
        <p *ngIf="!auth.isClient() && !auth.isRestaurateur() && !auth.isLivreur()">Utilisez le menu à gauche pour naviguer.</p>

        <div class="quick-actions" *ngIf="auth.isLivreur()">
          <a routerLink="/livreur" class="btn btn-primary">🚴 Voir mon statut</a>
          <a routerLink="/profile" class="btn btn-secondary">👤 Mon profil</a>
        </div>
        <div class="quick-actions" *ngIf="auth.isClient()">
          <a routerLink="/catalog/browse" class="btn btn-primary">🛒 Découvrir les restaurants</a>
          <a routerLink="/profile" class="btn btn-secondary">👤 Mon profil</a>
        </div>
        <div class="quick-actions" *ngIf="auth.isRestaurateur()">
          <a routerLink="/catalog/restaurants" class="btn btn-primary">🍽️ Mes restaurants</a>
          <a routerLink="/catalog/menus" class="btn btn-secondary">📋 Menus</a>
          <a routerLink="/catalog/produits" class="btn btn-secondary">🍕 Produits</a>
        </div>
      </div>

      <!-- Loading state while resolving role -->
      <div class="welcome-card" *ngIf="!auth.isAdmin() && !roleResolved">
        <div class="welcome-icon">⏳</div>
        <h2>Chargement...</h2>
        <p>Récupération de votre profil.</p>
      </div>

      <!-- Admin: recent users table -->
      <div class="recent-users" *ngIf="auth.isAdmin() && users.length > 0">
        <h2>Derniers utilisateurs</h2>
        <table class="data-table">
          <thead>
            <tr><th>Nom</th><th>Prénom</th><th>Email</th><th>Rôle</th></tr>
          </thead>
          <tbody>
            <tr *ngFor="let u of users.slice(0, 5)">
              <td>{{ u.nom }}</td>
              <td>{{ u.prenom }}</td>
              <td>{{ u.email }}</td>
              <td><span class="badge" [class]="'badge-' + u.role.toLowerCase()">{{ u.role }}</span></td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  `,
  styles: [`
    .quick-actions {
      display: flex;
      gap: 1rem;
      margin-top: 1.5rem;
      justify-content: center;
      flex-wrap: wrap;
    }
  `]
})
export class DashboardComponent implements OnInit {
  users: User[] = [];
  totalUsers = 0;
  livreurCount = 0;
  restaurateurCount = 0;
  clientCount = 0;
  roleResolved = false;

  constructor(public auth: AuthService, private api: UserApiService) {}

  ngOnInit(): void {
    this.loadUserAndResolveRole();
  }

  /**
   * Resolve the current user from the DB and set the DB role.
   * This is the single source of truth for role-based UI.
   */
  loadUserAndResolveRole(): void {
    const tokenInfo = this.auth.getTokenInfo();

    this.api.getAllUsers().subscribe({
      next: (users) => {
        // Try to match logged-in user by email
        const found = users.find(u =>
          u.email.toLowerCase() === tokenInfo.email.toLowerCase() ||
          u.email.toLowerCase() === tokenInfo.username.toLowerCase()
        );

        if (found) {
          this.auth.setUserDbRole(found.role);
          this.auth.setUserDbId(found.id!);
        } else {
          // Fallback: map Keycloak realm roles to app roles
          const kcRoles = this.auth.getRoles();
          const mappedRole = kcRoles
            .map(r => KEYCLOAK_TO_APP_ROLE[r.toLowerCase()])
            .find(r => !!r) || 'CLIENT';
          this.auth.setUserDbRole(mappedRole);
        }

        this.roleResolved = true;

        // Load stats only for admins
        if (this.auth.isAdmin()) {
          this.users = users;
          this.totalUsers = users.length;
          this.livreurCount = users.filter(u => u.role === 'LIVREUR').length;
          this.restaurateurCount = users.filter(u => u.role === 'RESTAURATEUR').length;
          this.clientCount = users.filter(u => u.role === 'CLIENT').length;
        }
      },
      error: (err) => {
        console.error('Erreur chargement users', err);
        // Even on error, resolve role from Keycloak token
        const kcRoles = this.auth.getRoles();
        const mappedRole = kcRoles
          .map(r => KEYCLOAK_TO_APP_ROLE[r.toLowerCase()])
          .find(r => !!r) || 'CLIENT';
        this.auth.setUserDbRole(mappedRole);
        this.roleResolved = true;
      }
    });
  }

  getRoleIcon(): string {
    if (this.auth.isLivreur()) return '🚴';
    if (this.auth.isRestaurateur()) return '🍽️';
    if (this.auth.isClient()) return '🛒';
    return '👤';
  }

  getRoleLabel(): string {
    if (this.auth.isLivreur()) return 'Livreur';
    if (this.auth.isRestaurateur()) return 'Restaurateur';
    if (this.auth.isClient()) return 'Client';
    return '';
  }
}
