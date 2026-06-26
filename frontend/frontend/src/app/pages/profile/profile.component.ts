import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../core/auth.service';
import { UserApiService, User, Profil, Adresse } from '../../core/user-api.service';

// Map Keycloak realm roles (lowercase) to app roles
const KEYCLOAK_TO_APP_ROLE: Record<string, string> = {
  admin: 'ADMIN',
  client: 'CLIENT',
  livreur: 'LIVREUR',
  restaurateur: 'RESTAURATEUR',
};

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="page">
      <div class="page-header">
        <h1>👤 Mon Profil</h1>
        <p>Gérez vos informations personnelles et vos coordonnées.</p>
      </div>

      <div class="profile-card" *ngIf="user; else loading">
        <div class="profile-avatar-container">
          <div class="profile-avatar-large">
            <span *ngIf="!profilForm.photo">{{ getInitials() }}</span>
            <img *ngIf="profilForm.photo" [src]="profilForm.photo" class="profile-avatar-img" alt="Avatar" />
          </div>
          <span class="badge" [class]="'badge-' + user.role.toLowerCase()">{{ user.role }}</span>
          <div style="margin-top: 1rem; width: 100%;">
            <div class="form-group">
              <label>Lien Photo de profil</label>
              <input [(ngModel)]="profilForm.photo" placeholder="https://example.com/photo.jpg" />
            </div>
          </div>
        </div>

        <div class="profile-details-form">
          <h2 class="profile-section-title">Informations de Compte</h2>
          <div class="grid-2-col">
            <div class="form-group">
              <label>Prénom</label>
              <input [value]="user.prenom" disabled style="opacity: 0.7; cursor: not-allowed;" />
            </div>
            <div class="form-group">
              <label>Nom</label>
              <input [value]="user.nom" disabled style="opacity: 0.7; cursor: not-allowed;" />
            </div>
          </div>
          <div class="form-group">
            <label>Adresse Email</label>
            <input [value]="user.email" disabled style="opacity: 0.7; cursor: not-allowed;" />
          </div>

          <h2 class="profile-section-title">Détails de Contact</h2>
          <div class="form-group">
            <label>Numéro de Téléphone</label>
            <input [(ngModel)]="profilForm.telephone" placeholder="+33 6 12 34 56 78" />
          </div>

          <h2 class="profile-section-title">Adresse de Livraison</h2>
          <div class="form-group">
            <label>Rue</label>
            <input [(ngModel)]="adresseForm.rue" placeholder="123 Rue de la Paix" />
          </div>
          <div class="grid-2-col">
            <div class="form-group">
              <label>Ville</label>
              <input [(ngModel)]="adresseForm.ville" placeholder="Paris" />
            </div>
            <div class="form-group">
              <label>Code Postal</label>
              <input [(ngModel)]="adresseForm.codePostal" placeholder="75001" />
            </div>
          </div>
          <div class="form-group">
            <label>Pays</label>
            <input [(ngModel)]="adresseForm.pays" placeholder="France" />
          </div>

          <div style="margin-top: 1.5rem; display: flex; justify-content: flex-end;">
            <button class="btn btn-primary" (click)="saveProfile()">Enregistrer les modifications</button>
          </div>
        </div>
      </div>

      <ng-template #loading>
        <div class="empty-state">Chargement du profil...</div>
      </ng-template>
    </div>
  `,
  styles: []
})
export class ProfileComponent implements OnInit {
  user: User | null = null;
  profil: Profil | null = null;
  tempPhoto = '';

  profilForm: Profil = {
    telephone: '',
    photo: ''
  };

  adresseForm: Adresse = {
    rue: '',
    ville: '',
    codePostal: '',
    pays: ''
  };

  constructor(private auth: AuthService, private api: UserApiService) {}

  ngOnInit(): void {
    this.loadUserAndProfile();
  }

  loadUserAndProfile(): void {
    const tokenInfo = this.auth.getTokenInfo();

    this.api.getAllUsers().subscribe({
      next: (users) => {
        // Match by email or username
        let found = users.find(u =>
          (u.email && tokenInfo.email && u.email.toLowerCase() === tokenInfo.email.toLowerCase()) ||
          (u.email && tokenInfo.username && u.email.toLowerCase() === tokenInfo.username.toLowerCase()) ||
          (u.nom && tokenInfo.username && u.nom.toLowerCase() === tokenInfo.username.toLowerCase()) ||
          (u.prenom && tokenInfo.username && u.prenom.toLowerCase() === tokenInfo.username.toLowerCase())
        );

        if (found) {
          this.user = found;
          // Set the role from DB so isAdmin(), isLivreur(), etc. work correctly
          this.auth.setUserDbRole(found.role);
          this.loadProfile(found.id!);
        } else {
          // User is authenticated via Keycloak but not yet in MySQL — build from token
          // Try to determine role from Keycloak realm roles
          const kcRoles = this.auth.getRoles();
          const mappedRole = kcRoles
            .map(r => KEYCLOAK_TO_APP_ROLE[r.toLowerCase()])
            .find(r => !!r) || 'CLIENT';

          this.user = {
            nom: tokenInfo.lastName || tokenInfo.username,
            prenom: tokenInfo.firstName,
            email: tokenInfo.email || tokenInfo.username,
            role: mappedRole as User['role']
          };
          this.auth.setUserDbRole(mappedRole);
          this.initEmptyProfile(0);
        }
      },
      error: () => {
        // Gateway/network error — still show data from token
        const kcRoles = this.auth.getRoles();
        const mappedRole = kcRoles
          .map(r => KEYCLOAK_TO_APP_ROLE[r.toLowerCase()])
          .find(r => !!r) || 'CLIENT';

        this.user = {
          nom: tokenInfo.lastName || tokenInfo.username,
          prenom: tokenInfo.firstName,
          email: tokenInfo.email || tokenInfo.username,
          role: mappedRole as User['role']
        };
        this.auth.setUserDbRole(mappedRole);
        this.initEmptyProfile(0);
      }
    });
  }

  loadProfile(userId: number): void {
    this.api.getProfilByUserId(userId).subscribe({
      next: (p) => {
        if (p) {
          this.profil = p;
          this.profilForm = { ...p };
          this.tempPhoto = p.photo || '';
          if (p.adresse) {
            this.adresseForm = { ...p.adresse };
          }
        } else {
          this.initEmptyProfile(userId);
        }
      },
      error: (err) => {
        console.warn('Profile not found, initializing empty profile', err);
        this.initEmptyProfile(userId);
      }
    });
  }

  initEmptyProfile(userId: number): void {
    this.profil = {
      telephone: '',
      photo: '',
      user: this.user || undefined,
      adresse: { rue: '', ville: '', codePostal: '', pays: '' }
    };
    this.profilForm = { ...this.profil };
    this.adresseForm = { ...this.profil.adresse! };
  }

  getInitials(): string {
    if (!this.user) return 'U';
    const first = this.user.prenom ? this.user.prenom.charAt(0) : '';
    const last = this.user.nom ? this.user.nom.charAt(0) : '';
    return (first + last).toUpperCase() || 'U';
  }

  onPhotoChange(): void {
    this.profilForm.photo = this.tempPhoto;
    if (this.profil) {
      this.profil.photo = this.tempPhoto;
    }
  }

  saveProfile(): void {
    if (!this.user || !this.user.id) {
      alert('Impossible d\'enregistrer le profil : ID utilisateur introuvable.');
      return;
    }

    const hasAddressContent = 
      (this.adresseForm.rue && this.adresseForm.rue.trim() !== '') ||
      (this.adresseForm.ville && this.adresseForm.ville.trim() !== '') ||
      (this.adresseForm.codePostal && this.adresseForm.codePostal.trim() !== '') ||
      (this.adresseForm.pays && this.adresseForm.pays.trim() !== '');

    const updatedProfil: Profil = {
      ...this.profilForm,
      user: this.user,
      adresse: hasAddressContent ? { ...this.adresseForm } : undefined
    };

    this.api.updateProfil(this.user.id, updatedProfil).subscribe({
      next: (saved) => {
        this.profil = saved;
        this.profilForm = { ...saved };
        this.tempPhoto = saved.photo || '';
        if (saved.adresse) {
          this.adresseForm = { ...saved.adresse };
        } else {
          this.adresseForm = { rue: '', ville: '', codePostal: '', pays: '' };
        }
        alert('Profil mis à jour avec succès !');
      },
      error: (err) => {
        console.error('Error saving profile', err);
        alert('Erreur lors de la mise à jour du profil.');
      }
    });
  }
}
