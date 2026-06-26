import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UserApiService, User } from '../../core/user-api.service';

@Component({
  selector: 'app-users',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="page">
      <div class="page-header">
        <div>
          <h1>👥 Gestion des Utilisateurs</h1>
          <p>Ajouter, modifier et supprimer les comptes utilisateurs.</p>
        </div>
        <button class="btn btn-primary" (click)="openCreateModal()">➕ Nouvel utilisateur</button>
      </div>

      <div *ngIf="message" class="toast" [class.toast-error]="messageType === 'error'">
        {{ message }}
      </div>

      <div class="table-container">
        <table class="data-table" *ngIf="users.length > 0; else empty">
          <thead>
            <tr>
              <th>ID</th>
              <th>Prénom</th>
              <th>Nom</th>
              <th>Email</th>
              <th>Rôle</th>
              <th>Créé le</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let user of users">
              <td>{{ user.id }}</td>
              <td>{{ user.prenom }}</td>
              <td>{{ user.nom }}</td>
              <td>{{ user.email }}</td>
              <td>
                <span class="badge" [class]="'badge-' + user.role.toLowerCase()">{{ user.role }}</span>
              </td>
              <td>{{ user.dateCreation | date:'dd/MM/yyyy HH:mm' }}</td>
              <td>
                <button class="btn-edit" title="Modifier" (click)="openEditModal(user)">✏️</button>
                <button class="btn-delete" title="Supprimer" (click)="deleteUser(user)">🗑️</button>
              </td>
            </tr>
          </tbody>
        </table>
        <ng-template #empty>
          <div class="empty-state">Aucun utilisateur trouvé. Cliquez sur « Nouvel utilisateur » pour commencer.</div>
        </ng-template>
      </div>
    </div>

    <!-- Create / Edit Modal -->
    <div class="modal-overlay" *ngIf="showModal" (click)="closeModal()">
      <div class="modal" (click)="$event.stopPropagation()">
        <h2>Créer un utilisateur</h2>

        <div class="grid-2-col">
          <div class="form-group">
            <label>Prénom *</label>
            <input [(ngModel)]="userForm.prenom" placeholder="Jean" />
          </div>
          <div class="form-group">
            <label>Nom *</label>
            <input [(ngModel)]="userForm.nom" placeholder="Dupont" />
          </div>
        </div>

        <div class="form-group">
          <label>Email *</label>
          <input [(ngModel)]="userForm.email" type="email" placeholder="jean.dupont@email.com" />
        </div>

        <div class="form-group" *ngIf="!editingUser">
          <label>Mot de passe *</label>
          <input [(ngModel)]="userForm.password" type="password" placeholder="••••••••" />
        </div>

        <div class="form-group">
          <label>Rôle *</label>
          <select [(ngModel)]="userForm.role">
            <option value="CLIENT">CLIENT</option>
            <option value="LIVREUR">LIVREUR</option>
            <option value="RESTAURATEUR">RESTAURATEUR</option>
            <option value="ADMIN">ADMIN</option>
          </select>
        </div>

        <div class="modal-actions">
          <button class="btn btn-secondary" (click)="closeModal()">Annuler</button>
          <button class="btn btn-primary" (click)="saveUser()" [disabled]="saving">
            {{ saving ? 'Enregistrement...' : (editingUser ? 'Mettre à jour' : 'Créer') }}
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .toast {
      padding: 0.85rem 1.25rem;
      border-radius: var(--radius-md);
      margin-bottom: 1.5rem;
      background: rgba(16, 185, 129, 0.15);
      border: 1px solid rgba(16, 185, 129, 0.3);
      color: #a7f3d0;
      animation: fadeIn 0.3s ease-out;
    }
    .toast-error {
      background: rgba(239, 68, 68, 0.15);
      border-color: rgba(239, 68, 68, 0.3);
      color: #fca5a5;
    }
  `]
})
export class UsersComponent implements OnInit {
  users: User[] = [];
  message = '';
  messageType: 'success' | 'error' = 'success';
  saving = false;

  showModal = false;
  editingUser: User | null = null;
  userForm: User = this.emptyUser();

  constructor(private api: UserApiService) {}

  ngOnInit(): void {
    this.loadUsers();
  }

  loadUsers(): void {
    this.api.getAllUsers().subscribe({
      next: (data) => (this.users = data),
      error: () => this.showMessage('Erreur lors du chargement des utilisateurs', 'error')
    });
  }

  openCreateModal(): void {
    this.editingUser = null;
    this.userForm = this.emptyUser();
    this.showModal = true;
  }

  openEditModal(user: User): void {
    this.editingUser = user;
    this.userForm = { ...user, password: undefined };
    this.showModal = true;
  }

  closeModal(): void {
    this.showModal = false;
    this.editingUser = null;
  }

  saveUser(): void {
    if (!this.userForm.nom?.trim() || !this.userForm.prenom?.trim() || !this.userForm.email?.trim()) {
      this.showMessage('Veuillez remplir tous les champs obligatoires', 'error');
      return;
    }
    if (!this.editingUser && !this.userForm.password?.trim()) {
      this.showMessage('Le mot de passe est requis pour un nouvel utilisateur', 'error');
      return;
    }

    this.saving = true;
    const request = this.editingUser
      ? this.api.updateUser(this.editingUser.id!, this.userForm)
      : this.api.createUser(this.userForm);

    request.subscribe({
      next: () => {
        this.showMessage(
          this.editingUser ? 'Utilisateur modifié avec succès' : 'Utilisateur créé avec succès',
          'success'
        );
        this.closeModal();
        this.loadUsers();
        this.saving = false;
      },
      error: () => {
        this.showMessage('Erreur lors de l\'enregistrement', 'error');
        this.saving = false;
      }
    });
  }

  deleteUser(user: User): void {
    if (!confirm(`Supprimer ${user.prenom} ${user.nom} ?`)) return;

    this.api.deleteUser(user.id!).subscribe({
      next: () => {
        this.showMessage('Utilisateur supprimé', 'success');
        this.loadUsers();
      },
      error: () => this.showMessage('Erreur lors de la suppression', 'error')
    });
  }

  private emptyUser(): User {
    return { nom: '', prenom: '', email: '', password: '', role: 'CLIENT' };
  }

  private showMessage(msg: string, type: 'success' | 'error'): void {
    this.message = msg;
    this.messageType = type;
    setTimeout(() => (this.message = ''), 3500);
  }
}
