import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../core/auth.service';
import { UserApiService, User, StatusLivreur } from '../../core/user-api.service';

interface LivreurWithStatus {
  user: User;
  statusInfo: StatusLivreur | null;
}

@Component({
  selector: 'app-livreur-status',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="page">
      <div class="page-header">
        <h1>🚴 Statut Livreur</h1>
        <p *ngIf="auth.isLivreur()">Mettez à jour votre statut de disponibilité en temps réel.</p>
        <p *ngIf="auth.isAdmin()">Gérez la disponibilité de tous les livreurs de la plateforme.</p>
      </div>

      <!-- Livreur view (own status) -->
      <div *ngIf="auth.isLivreur() && !auth.isAdmin()" class="status-container">
        <h2>Votre statut actuel</h2>
        
        <div *ngIf="currentStatus; else loadingStatus">
          <div class="status-badge-lg" [class]="getStatusClass(currentStatus.status)">
            <span class="pulse-dot" *ngIf="currentStatus.status === 'DISPONIBLE'"></span>
            {{ currentStatus.status }}
          </div>
          
          <p style="color: var(--text-secondary); margin-bottom: 2rem;">
            Dernière modification : {{ currentStatus.dateModification | date:'dd/MM/yyyy HH:mm' }}
          </p>

          <h3>Changer de statut</h3>
          <div class="status-actions">
            <button class="btn btn-secondary" 
                    [class.status-disponible]="currentStatus.status === 'DISPONIBLE'"
                    (click)="changeStatus('DISPONIBLE')">
              🟢 Disponible
            </button>
            <button class="btn btn-secondary" 
                    [class.status-occupe]="currentStatus.status === 'OCCUPE'"
                    (click)="changeStatus('OCCUPE')">
              🔴 Occupé
            </button>
            <button class="btn btn-secondary" 
                    [class.status-hors_ligne]="currentStatus.status === 'HORS_LIGNE'"
                    (click)="changeStatus('HORS_LIGNE')">
              ⚫ Hors Ligne
            </button>
          </div>
        </div>
      </div>

      <!-- Admin view (all livreurs status) -->
      <div *ngIf="auth.isAdmin()">
        <div class="table-container">
          <table class="data-table" *ngIf="livreurs.length > 0; else noLivreurs">
            <thead>
              <tr>
                <th>Livreur</th>
                <th>Email</th>
                <th>Statut Actuel</th>
                <th>Dernière modification</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let l of livreurs">
                <td>
                  <strong>{{ l.user.prenom }} {{ l.user.nom }}</strong>
                </td>
                <td>{{ l.user.email }}</td>
                <td>
                  <span class="badge" [class]="getStatusClass(l.statusInfo?.status || 'HORS_LIGNE')">
                    {{ l.statusInfo?.status || 'HORS_LIGNE' }}
                  </span>
                </td>
                <td>
                  {{ l.statusInfo?.dateModification ? (l.statusInfo?.dateModification | date:'dd/MM/yyyy HH:mm') : 'N/A' }}
                </td>
                <td>
                  <select [ngModel]="l.statusInfo?.status || 'HORS_LIGNE'" 
                          (ngModelChange)="updateLivreurStatusAdmin(l.user.id!, $event)"
                          class="status-select">
                    <option value="DISPONIBLE">🟢 Disponible</option>
                    <option value="OCCUPE">🔴 Occupé</option>
                    <option value="HORS_LIGNE">⚫ Hors Ligne</option>
                  </select>
                </td>
              </tr>
            </tbody>
          </table>
          <ng-template #noLivreurs>
            <div class="empty-state">Aucun livreur inscrit sur la plateforme.</div>
          </ng-template>
        </div>
      </div>

      <ng-template #loadingStatus>
        <div class="empty-state">Chargement de votre statut...</div>
      </ng-template>
    </div>
  `,
  styles: [`
    .status-select {
      background: #ffffff;
      border: 1px solid var(--glass-border);
      border-radius: var(--radius-sm);
      color: var(--text-primary);
      padding: 0.4rem 0.8rem;
      font-size: 0.85rem;
      cursor: pointer;
      outline: none;
      transition: var(--transition);
    }
    .status-select:focus {
      border-color: var(--primary);
    }
    .pulse-dot {
      display: inline-block;
      width: 10px;
      height: 10px;
      background-color: #10b981;
      border-radius: 50%;
      box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.7);
      animation: pulse 1.5s infinite;
      margin-right: 0.5rem;
    }
    @keyframes pulse {
      0% {
        transform: scale(0.95);
        box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.7);
      }
      70% {
        transform: scale(1);
        box-shadow: 0 0 0 6px rgba(16, 185, 129, 0);
      }
      100% {
        transform: scale(0.95);
        box-shadow: 0 0 0 0 rgba(16, 185, 129, 0);
      }
    }
  `]
})
export class LivreurStatusComponent implements OnInit {
  currentLivreurUser: User | null = null;
  currentStatus: StatusLivreur | null = null;
  livreurs: LivreurWithStatus[] = [];

  constructor(public auth: AuthService, private api: UserApiService) {}

  ngOnInit(): void {
    if (this.auth.isLivreur() && !this.auth.isAdmin()) {
      this.loadOwnStatus();
    } else if (this.auth.isAdmin()) {
      this.loadAllLivreurs();
    }
  }

  loadOwnStatus(): void {
    this.api.getAllUsers().subscribe({
      next: (users) => {
        const username = this.auth.getUsername();
        let found = users.find(u => u.email.toLowerCase() === username.toLowerCase() ||
                                   (u.prenom + ' ' + u.nom).toLowerCase() === username.toLowerCase() ||
                                   u.nom.toLowerCase() === username.toLowerCase());
        
        if (!found && users.length > 0) {
          // fallback to first livreur/user for demo
          found = users.find(u => u.role === 'LIVREUR') || users[0];
        }

        if (found) {
          this.currentLivreurUser = found;
          this.api.getLivreurStatus(found.id!).subscribe({
            next: (status) => {
              this.currentStatus = status || { status: 'HORS_LIGNE', user: found };
            },
            error: (err) => {
              console.warn('Could not load status, starting with HORS_LIGNE', err);
              this.currentStatus = { status: 'HORS_LIGNE', user: found };
            }
          });
        }
      }
    });
  }

  changeStatus(newStatus: 'DISPONIBLE' | 'OCCUPE' | 'HORS_LIGNE'): void {
    if (!this.currentLivreurUser || !this.currentLivreurUser.id) return;

    this.api.updateLivreurStatus(this.currentLivreurUser.id, newStatus).subscribe({
      next: (updated) => {
        this.currentStatus = updated;
      },
      error: (err) => {
        console.error('Error updating status', err);
        alert('Erreur lors du changement de statut.');
      }
    });
  }

  loadAllLivreurs(): void {
    this.api.getAllUsers().subscribe({
      next: (users) => {
        const livreurUsers = users.filter(u => u.role === 'LIVREUR');
        this.livreurs = [];
        
        livreurUsers.forEach((u) => {
          this.api.getLivreurStatus(u.id!).subscribe({
            next: (status) => {
              this.livreurs.push({ user: u, statusInfo: status });
            },
            error: () => {
              this.livreurs.push({ user: u, statusInfo: { status: 'HORS_LIGNE', user: u } });
            }
          });
        });
      }
    });
  }

  updateLivreurStatusAdmin(userId: number, newStatus: string): void {
    this.api.updateLivreurStatus(userId, newStatus).subscribe({
      next: (updated) => {
        const index = this.livreurs.findIndex(l => l.user.id === userId);
        if (index !== -1) {
          this.livreurs[index].statusInfo = updated;
        }
      },
      error: (err) => {
        console.error('Error updating status as admin', err);
        alert('Erreur de mise à jour du statut.');
      }
    });
  }

  getStatusClass(status: string): string {
    switch (status) {
      case 'DISPONIBLE': return 'status-disponible';
      case 'OCCUPE': return 'status-occupe';
      default: return 'status-hors_ligne';
    }
  }
}
