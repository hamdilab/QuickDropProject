import { Component } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from './core/auth.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive, CommonModule],
  template: `
    <div class="app-shell">
      <nav class="sidebar">
        <div class="logo">
          <span class="logo-icon">🚀</span>
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
export class AppComponent {
  constructor(public auth: AuthService) {}

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
