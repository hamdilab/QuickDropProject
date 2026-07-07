import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CatalogApiService, Ingredient } from '../../../core/catalog-api.service';

@Component({
  selector: 'app-ingredients',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="page">
      <div class="page-header">
        <div>
          <h1>🥬 Ingrédients</h1>
          <p>Composants des produits et gestion des allergènes.</p>
        </div>
        <button class="btn btn-primary" (click)="openCreateModal()">➕ Nouvel ingrédient</button>
      </div>

      <div class="filters">
        <button class="btn btn-secondary" [class.active-filter]="!allergenesOnly" (click)="setFilter(false)">
          Tous ({{ ingredients.length }})
        </button>
        <button class="btn btn-secondary" [class.active-filter]="allergenesOnly" (click)="setFilter(true)">
          Allergènes uniquement
        </button>
      </div>

      <div *ngIf="message" class="toast" [class.toast-error]="messageType === 'error'">{{ message }}</div>

      <div class="table-container">
        <table class="data-table" *ngIf="displayed.length > 0; else empty">
          <thead>
            <tr>
              <th>ID</th>
              <th>Nom</th>
              <th>Description</th>
              <th>Allergène</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let ing of displayed">
              <td>{{ ing.id }}</td>
              <td>{{ ing.nom }}</td>
              <td>{{ ing.description || '—' }}</td>
              <td>
                <span class="badge" [class.badge-danger]="ing.allergene" [class.badge-success]="!ing.allergene">
                  {{ ing.allergene ? 'Oui' : 'Non' }}
                </span>
              </td>
              <td>
                <button class="btn-edit" title="Modifier" (click)="openEditModal(ing)">✏️</button>
                <button class="btn-delete" title="Supprimer" (click)="confirmDelete(ing)">🗑️</button>
              </td>
            </tr>
          </tbody>
        </table>
        <ng-template #empty>
          <div class="empty-state">Aucun ingrédient trouvé.</div>
        </ng-template>
      </div>
    </div>

    <div class="modal-overlay" *ngIf="showModal" (click)="closeModal()">
      <div class="modal" (click)="$event.stopPropagation()">
        <h2>{{ editing ? 'Modifier l\'ingrédient' : 'Créer un ingrédient' }}</h2>
        <div class="form-group">
          <label>Nom *</label>
          <input [(ngModel)]="form.nom" placeholder="Tomate" />
        </div>
        <div class="form-group">
          <label>Description</label>
          <textarea [(ngModel)]="form.description" rows="2"></textarea>
        </div>
        <div class="form-group checkbox-row">
          <label><input type="checkbox" [(ngModel)]="form.allergene" /> Allergène</label>
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
    .filters { display: flex; gap: 0.75rem; margin-bottom: 1.25rem; }
    .active-filter { background: var(--primary); color: #fff; border-color: var(--primary); }
    .toast { padding: 0.85rem 1.25rem; border-radius: var(--radius-md); margin-bottom: 1.5rem;
      background: rgba(16,185,129,0.12); border: 1px solid rgba(16,185,129,0.25); color: #047857; }
    .toast-error { background: rgba(239,68,68,0.12); border-color: rgba(239,68,68,0.25); color: #dc2626; }
    .modal-sm { max-width: 420px; text-align: center; }
    .delete-icon { font-size: 3rem; margin-bottom: 0.5rem; }
    .delete-message { color: var(--text-secondary); margin: 0.75rem 0 1.5rem; }
    .btn-danger { background: linear-gradient(135deg,#ef4444,#dc2626); color: #fff; border: none;
      padding: 0.6rem 1.5rem; border-radius: var(--radius-md); font-weight: 600; cursor: pointer; }
    .checkbox-row label { display: flex; align-items: center; gap: 0.5rem; cursor: pointer; }
    textarea { width: 100%; padding: 0.65rem 0.85rem; border: 1px solid var(--glass-border);
      border-radius: var(--radius-sm); font-family: inherit; resize: vertical; }
    .badge-danger { background: rgba(239,68,68,0.15); color: #dc2626; }
    .badge-success { background: rgba(16,185,129,0.15); color: #047857; }
  `]
})
export class IngredientsComponent implements OnInit {
  ingredients: Ingredient[] = [];
  allergenes: Ingredient[] = [];
  displayed: Ingredient[] = [];
  allergenesOnly = false;
  message = '';
  messageType: 'success' | 'error' = 'success';
  saving = false;
  deleting = false;
  showModal = false;
  showDeleteModal = false;
  editing: Ingredient | null = null;
  toDelete: Ingredient | null = null;
  form: Ingredient = this.emptyForm();

  constructor(private api: CatalogApiService) {}

  ngOnInit(): void { this.load(); }

  load(): void {
    this.api.getIngredients().subscribe({
      next: (data) => {
        this.ingredients = data;
        this.refreshDisplay();
      },
      error: () => this.showMsg('Erreur lors du chargement', 'error')
    });
    this.api.getAllergenes().subscribe({
      next: (data) => (this.allergenes = data),
      error: () => {}
    });
  }

  setFilter(allergenesOnly: boolean): void {
    this.allergenesOnly = allergenesOnly;
    this.refreshDisplay();
  }

  refreshDisplay(): void {
    this.displayed = this.allergenesOnly ? this.allergenes : this.ingredients;
  }

  openCreateModal(): void {
    this.editing = null;
    this.form = this.emptyForm();
    this.showModal = true;
  }

  openEditModal(ing: Ingredient): void {
    this.editing = ing;
    this.form = { ...ing };
    this.showModal = true;
  }

  closeModal(): void { this.showModal = false; this.editing = null; }

  save(): void {
    if (!this.form.nom?.trim()) {
      this.showMsg('Le nom est obligatoire', 'error');
      return;
    }
    this.saving = true;
    const req = this.editing
      ? this.api.updateIngredient(this.editing.id!, this.form)
      : this.api.createIngredient(this.form);
    req.subscribe({
      next: () => {
        this.showMsg(this.editing ? 'Ingrédient modifié' : 'Ingrédient créé', 'success');
        this.closeModal();
        this.load();
        this.saving = false;
      },
      error: () => { this.showMsg('Erreur lors de l\'enregistrement', 'error'); this.saving = false; }
    });
  }

  confirmDelete(ing: Ingredient): void { this.toDelete = ing; this.showDeleteModal = true; }
  cancelDelete(): void { this.showDeleteModal = false; this.toDelete = null; }

  executeDelete(): void {
    if (!this.toDelete?.id) return;
    this.deleting = true;
    const id = this.toDelete.id;
    this.cancelDelete();
    this.api.deleteIngredient(id).subscribe({
      next: () => { this.showMsg('Ingrédient supprimé', 'success'); this.load(); this.deleting = false; },
      error: (err) => {
        if (err.status === 204 || err.status === 200) { this.showMsg('Ingrédient supprimé', 'success'); this.load(); }
        else { this.showMsg('Erreur lors de la suppression', 'error'); this.load(); }
        this.deleting = false;
      }
    });
  }

  private emptyForm(): Ingredient { return { nom: '', description: '', allergene: false }; }

  private showMsg(msg: string, type: 'success' | 'error'): void {
    this.message = msg;
    this.messageType = type;
    setTimeout(() => (this.message = ''), 3500);
  }
}
