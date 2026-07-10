import { Component, OnInit } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from './core/auth.service';
import { UserApiService } from './core/user-api.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive, CommonModule],
  template: `
    <div class="app-shell">
      <nav class="sidebar">
        <div class="logo">
          <span class="logo-icon">🍔</span>
          <span class="logo-text">QuickDrop</span>
        </div>
        <ul class="nav-links">
          <li>
            <a routerLink="/dashboard" routerLinkActive="active">
              <span class="icon">🏠</span> Dashboard
            </a>
          </li>
          <li *ngIf="auth.isAdmin()">
            <a routerLink="/users" routerLinkActive="active">
              <span class="icon">👥</span> Utilisateurs
            </a>
          </li>
          <li>
            <a routerLink="/profile" routerLinkActive="active">
              <span class="icon">👤</span> Mon Profil
            </a>
          </li>
          <li>
            <a routerLink="/mes-commandes" routerLinkActive="active">
              <span class="icon">📦</span> Mes commandes
            </a>
          </li>
          <li *ngIf="auth.isLivreur() || auth.isAdmin()">
            <a routerLink="/livreur" routerLinkActive="active">
              <span class="icon">🚴</span> Statut Livreur
            </a>
          </li>
        </ul>
        <div class="user-info">
          <div class="user-avatar">{{ getInitials() }}</div>
          <div class="user-details">
            <span class="user-name">{{ auth.getUsername() }}</span>
            <span class="user-role">{{ getRoleLabel() }}</span>
          </div>
          <button class="logout-btn" (click)="auth.logout()">⏏</button>
        </div>
      </nav>
      <main class="main-content">
        <router-outlet></router-outlet>
      </main>
    </div>
  `,
  styles: []
})
export class AppComponent implements OnInit {
  constructor(public auth: AuthService, private api: UserApiService) {}

  ngOnInit(): void {
    this.loadUserAndResolveRole();
  }
  loadUserAndResolveRole(): void {
    const tokenInfo = this.auth.getTokenInfo();
    this.api.getAllUsers().subscribe({
      next: (users) => {
        const found = users.find(u =>
          u.email.toLowerCase() === tokenInfo.email.toLowerCase() ||
          u.email.toLowerCase() === tokenInfo.username.toLowerCase()
        );
        if (found) {
          this.auth.setUserDbRole(found.role);
        } else {
          const kcRoles = this.auth.getRoles();
          const mappedRole = kcRoles
            .map(r => {
              const m: Record<string, string> = {
                admin: 'ADMIN',
                client: 'CLIENT',
                livreur: 'LIVREUR',
                restaurateur: 'RESTAURATEUR',
              };
              return m[r.toLowerCase()];
            })
            .find(r => !!r) || 'CLIENT';
          this.auth.setUserDbRole(mappedRole);
        }
      },
      error: (err) => {
        console.error('Erreur chargement users dans AppComponent', err);
        const kcRoles = this.auth.getRoles();
        const mappedRole = kcRoles
          .map(r => {
            const m: Record<string, string> = {
              admin: 'ADMIN',
              client: 'CLIENT',
              livreur: 'LIVREUR',
              restaurateur: 'RESTAURATEUR',
            };
            return m[r.toLowerCase()];
          })
          .find(r => !!r) || 'CLIENT';
        this.auth.setUserDbRole(mappedRole);
      }
    });
  }
  getInitials(): string {
    const name = this.auth.getUsername();
    return name ? name.substring(0, 2).toUpperCase() : 'U';
  }

  getRoleLabel(): string {
    if (this.auth.isAdmin()) return 'Administrateur';
    if (this.auth.isLivreur()) return 'Livreur';
    if (this.auth.isRestaurateur()) return 'Restaurateur';
    if (this.auth.isClient()) return 'Client';
    return 'Utilisateur';
  }
}
