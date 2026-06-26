import { Injectable } from '@angular/core';
import { KeycloakService } from 'keycloak-angular';

@Injectable({ providedIn: 'root' })
export class AuthService {

  constructor(private keycloak: KeycloakService) {}

  getUsername(): string {
    try {
      return this.keycloak.getUsername() || '';
    } catch {
      return '';
    }
  }

  getTokenInfo(): { firstName: string; lastName: string; email: string; username: string } {
    try {
      const profile = this.keycloak.getKeycloakInstance().tokenParsed as any;
      return {
        firstName: profile?.given_name || profile?.name?.split(' ')[0] || '',
        lastName: profile?.family_name || profile?.name?.split(' ').slice(1).join(' ') || '',
        email: profile?.email || profile?.preferred_username || '',
        username: profile?.preferred_username || ''
      };
    } catch {
      return { firstName: '', lastName: '', email: '', username: '' };
    }
  }

  getRoles(): string[] {
    try {
      return this.keycloak.getUserRoles();
    } catch {
      return [];
    }
  }

  hasRole(role: string): boolean {
    return this.getRoles().includes(role);
  }

  isAdmin(): boolean {
    return this.hasRole('ADMIN');
  }

  isLivreur(): boolean {
    return this.hasRole('LIVREUR');
  }

  isClient(): boolean {
    return this.hasRole('CLIENT');
  }

  isRestaurateur(): boolean {
    return this.hasRole('RESTAURATEUR');
  }

  logout(): void {
    this.keycloak.logout(window.location.origin);
  }

  async getToken(): Promise<string> {
    return this.keycloak.getToken();
  }
}