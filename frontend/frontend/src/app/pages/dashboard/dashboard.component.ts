import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../core/auth.service';
import { UserApiService, User } from '../../core/user-api.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="page">
      <div class="page-header">
        <h1>Tableau de bord</h1>
        <p>Bienvenue, <strong>{{ auth.getUsername() }}</strong> 👋</p>
      </div>

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

      <div class="welcome-card" *ngIf="!auth.isAdmin()">
        <div class="welcome-icon">{{ getRoleIcon() }}</div>
        <h2>Espace {{ getRoleLabel() }}</h2>
        <p>Utilisez le menu à gauche pour naviguer.</p>
      </div>

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
  styles: []
})
export class DashboardComponent implements OnInit {
  users: User[] = [];
  totalUsers = 0;
  livreurCount = 0;
  restaurateurCount = 0;
  clientCount = 0;

  constructor(public auth: AuthService, private api: UserApiService) {}

  ngOnInit(): void {
    if (this.auth.isAdmin()) {
      this.api.getAllUsers().subscribe({
        next: (users) => {
          this.users = users;
          this.totalUsers = users.length;
          this.livreurCount = users.filter(u => u.role === 'LIVREUR').length;
          this.restaurateurCount = users.filter(u => u.role === 'RESTAURATEUR').length;
          this.clientCount = users.filter(u => u.role === 'CLIENT').length;
        },
        error: (err) => console.error('Erreur chargement users', err)
      });
    }
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
