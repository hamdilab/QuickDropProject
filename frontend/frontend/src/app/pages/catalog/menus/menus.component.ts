import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CatalogApiService, Menu, Restaurant } from '../../../core/catalog-api.service';

@Component({
  selector: 'app-menus',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="page">
      <div class="page-header">
        <div>
          <h1>📋 Menus</h1>
          <p>Cartes des restaurants — création et activation.</p>
        </div>
        <button class="btn btn-primary" (click)="openCreateModal()">➕ Nouveau menu</button>
      </div>

      <div class="filters">
        <label>Restaurant :</label>
        <select [(ngModel)]="selectedRestaurantId" (change)="loadMenus()">
          <option [ngValue]="null">— Sélectionner un restaurant —</option>
          <option *ngFor="let r of restaurants" [ngValue]="r.id">{{ r.nom }} ({{ r.ville }})</option>
        </select>
      </div>

      <div *ngIf="message" class="toast" [class.toast-error]="messageType === 'error'">{{ message }}</div>

      <div class="table-container">
        <table class="data-table" *ngIf="menus.length > 0; else empty">
          <thead>
            <tr>
              <th>ID</th>
              <th>Nom</th>
              <th>Restaurant</th>
              <th>Statut</th>
              <th>Créé le</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let m of menus">
              <td>{{ m.id }}</td>
              <td>{{ m.nom }}</td>
              <td>{{ m.restaurantNom || '—' }}</td>
              <td>
                <span class="badge" [class.badge-success]="m.actif" [class.badge-danger]="!m.actif">
                  {{ m.actif ? 'Actif' : 'Inactif' }}
                </span>
              </td>
              <td>{{ m.createdAt | date:'dd/MM/yyyy' }}</td>
              <td>
                <button class="btn-edit" title="Modifier" (click)="openEditModal(m)">✏️</button>
                <button class="btn-toggle" title="Activer/Désactiver" (click)="toggleActif(m)">🔄</button>
                <button class="btn-delete" title="Supprimer" (click)="confirmDelete(m)">🗑️</button>
              </td>
            </tr>
          </tbody>
        </table>
        <ng-template #empty>
          <div class="empty-state">
            {{ selectedRestaurantId ? 'Aucun menu pour ce restaurant.' : 'Sélectionnez un restaurant pour voir ses menus.' }}
          </div>
        </ng-template>
      </div>
    </div>

    <div class="modal-overlay" *ngIf="showModal" (click)="closeModal()">
      <div class="modal" (click)="$event.stopPropagation()">
        <h2>{{ editing ? 'Modifier le menu' : 'Créer un menu' }}</h2>
        <div class="form-group">
          <label>Restaurant *</label>
          <select [(ngModel)]="form.restaurantId" [disabled]="!!editing">
            <option [ngValue]="undefined">— Sélectionner —</option>
            <option *ngFor="let r of restaurants" [ngValue]="r.id">{{ r.nom }}</option>
          </select>
        </div>
        <div class="form-group">
          <label>Nom *</label>
          <input [(ngModel)]="form.nom" placeholder="Menu du midi" />
        </div>
        <div class="form-group">
          <label>Description</label>
          <textarea [(ngModel)]="form.description" rows="2"></textarea>
        </div>
        <div class="form-group">
          <label>URL image</label>
          <input [(ngModel)]="form.imageUrl" placeholder="https://…" />
        </div>
        <div class="modal-actions">
          <button class="btn btn-secondary" (click)="closeModal()">Annuler</button>
          <button class="btn btn-primary" (click)="save()" [disabled]="saving">
            {{ saving ? 'Enregistrement…' : (editing ? 'Mettre à jour' : 'Créer') }}
          </button>
        </div>
      </div>
    </div>

    <div class="modal-overlay" *ngIf="showDeleteModal" (click)="cancelDelete()">
      <div class="modal modal-sm" (click)="$event.stopPropagation()">
        <div class="delete-icon">🗑️</div>
        <h2>Confirmer la suppression</h2>
        <p class="delete-message">Supprimer <strong>{{ toDelete?.nom }}</strong> ?</p>
        <div class="modal-actions">
          <button class="btn btn-secondary" (click)="cancelDelete()">Annuler</button>
          <button class="btn btn-danger" (click)="executeDelete()" [disabled]="deleting">Supprimer</button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .filters { display: flex; align-items: center; gap: 0.75rem; margin-bottom: 1.25rem; }
    .filters select { padding: 0.55rem 0.85rem; border: 1px solid var(--glass-border);
      border-radius: var(--radius-sm); font-family: inherit; min-width: 280px; }
    .btn-toggle { background: none; border: none; cursor: pointer; font-size: 1.1rem; padding: 0.25rem; }
    .toast { padding: 0.85rem 1.25rem; border-radius: var(--radius-md); margin-bottom: 1.5rem;
      background: rgba(16,185,129,0.12); border: 1px solid rgba(16,185,129,0.25); color: #047857; }
    .toast-error { background: rgba(239,68,68,0.12); border-color: rgba(239,68,68,0.25); color: #dc2626; }
    .modal-sm { max-width: 420px; text-align: center; }
    .delete-icon { font-size: 3rem; margin-bottom: 0.5rem; }
    .delete-message { color: var(--text-secondary); margin: 0.75rem 0 1.5rem; }
    .btn-danger { background: linear-gradient(135deg,#ef4444,#dc2626); color: #fff; border: none;
      padding: 0.6rem 1.5rem; border-radius: var(--radius-md); font-weight: 600; cursor: pointer; }
    textarea { width: 100%; padding: 0.65rem 0.85rem; border: 1px solid var(--glass-border);
      border-radius: var(--radius-sm); font-family: inherit; resize: vertical; }
    .badge-success { background: rgba(16,185,129,0.15); color: #047857; }
    .badge-danger { background: rgba(239,68,68,0.15); color: #dc2626; }
  `]
})
export class MenusComponent implements OnInit {
  restaurants: Restaurant[] = [];
  menus: Menu[] = [];
  selectedRestaurantId: number | null = null;
  message = '';
  messageType: 'success' | 'error' = 'success';
  saving = false;
  deleting = false;
  showModal = false;
  showDeleteModal = false;
  editing: Menu | null = null;
  toDelete: Menu | null = null;
  form: Menu = this.emptyForm();

  constructor(private api: CatalogApiService) {}

  ngOnInit(): void {
    this.api.getRestaurants().subscribe({
      next: (data) => (this.restaurants = data),
      error: () => this.showMsg('Erreur chargement restaurants', 'error')
    });
  }

  loadMenus(): void {
    if (!this.selectedRestaurantId) {
      this.menus = [];
      return;
    }
    this.api.getMenusByRestaurant(this.selectedRestaurantId).subscribe({
      next: (data) => (this.menus = data),
      error: () => this.showMsg('Erreur chargement menus', 'error')
    });
  }

  openCreateModal(): void {
    this.editing = null;
    this.form = this.emptyForm();
    if (this.selectedRestaurantId) this.form.restaurantId = this.selectedRestaurantId;
    this.showModal = true;
  }

  openEditModal(m: Menu): void {
    this.editing = m;
    this.form = { nom: m.nom, description: m.description, imageUrl: m.imageUrl, restaurantId: m.restaurantId };
    this.showModal = true;
  }

  closeModal(): void { this.showModal = false; this.editing = null; }

  save(): void {
    if (!this.form.nom?.trim() || !this.form.restaurantId) {
      this.showMsg('Nom et restaurant sont obligatoires', 'error');
      return;
    }
    this.saving = true;
    const req = this.editing
      ? this.api.updateMenu(this.editing.id!, this.form)
      : this.api.createMenu(this.form);
    req.subscribe({
      next: () => {
        this.showMsg(this.editing ? 'Menu modifié' : 'Menu créé', 'success');
        this.closeModal();
        if (!this.selectedRestaurantId) this.selectedRestaurantId = this.form.restaurantId!;
        this.loadMenus();
        this.saving = false;
      },
      error: () => { this.showMsg('Erreur lors de l\'enregistrement', 'error'); this.saving = false; }
    });
  }

  toggleActif(m: Menu): void {
    if (!m.id) return;
    this.api.toggleMenuActif(m.id).subscribe({
      next: (updated) => {
        m.actif = updated.actif;
        this.showMsg(`Menu ${updated.actif ? 'activé' : 'désactivé'}`, 'success');
      },
      error: () => this.showMsg('Erreur changement statut', 'error')
    });
  }

  confirmDelete(m: Menu): void { this.toDelete = m; this.showDeleteModal = true; }
  cancelDelete(): void { this.showDeleteModal = false; this.toDelete = null; }

  executeDelete(): void {
    if (!this.toDelete?.id) return;
    this.deleting = true;
    const id = this.toDelete.id;
    this.cancelDelete();
    this.api.deleteMenu(id).subscribe({
      next: () => { this.showMsg('Menu supprimé', 'success'); this.loadMenus(); this.deleting = false; },
      error: (err) => {
        if (err.status === 204 || err.status === 200) { this.showMsg('Menu supprimé', 'success'); this.loadMenus(); }
        else { this.showMsg('Erreur suppression', 'error'); this.loadMenus(); }
        this.deleting = false;
      }
    });
  }

  private emptyForm(): Menu { return { nom: '', description: '', imageUrl: '' }; }

  private showMsg(msg: string, type: 'success' | 'error'): void {
    this.message = msg;
    this.messageType = type;
    setTimeout(() => (this.message = ''), 3500);
  }
}
