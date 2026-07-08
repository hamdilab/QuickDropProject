import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CatalogApiService, Categorie } from '../../../core/catalog-api.service';

@Component({
  selector: 'app-categories',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="page">
      <div class="page-header">
        <div>
          <h1>🏷️ Catégories</h1>
          <p>Types de cuisine (pizza, sushi, burger…).</p>
        </div>
        <button class="btn btn-primary" (click)="openCreateModal()">➕ Nouvelle catégorie</button>
      </div>

      <div *ngIf="message" class="toast" [class.toast-error]="messageType === 'error'">{{ message }}</div>

      <div class="table-container">
        <table class="data-table" *ngIf="categories.length > 0; else empty">
          <thead>
            <tr>
              <th>Image</th>
              <th>Nom</th>
              <th>Description</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let cat of categories">
              <td>
                <div class="category-image">
                  <img *ngIf="cat.imageUrl; else noImage" [src]="cat.imageUrl" [alt]="cat.nom" />
                  <ng-template #noImage>
                    <span>{{ getInitial(cat.nom) }}</span>
                  </ng-template>
                </div>
              </td>
              <td>{{ cat.nom }}</td>
              <td>{{ cat.description || '—' }}</td>
              <td>
                <button class="btn-edit" title="Modifier" (click)="openEditModal(cat)">✏️</button>
                <button class="btn-delete" title="Supprimer" (click)="confirmDelete(cat)">🗑️</button>
              </td>
            </tr>
          </tbody>
        </table>
        <ng-template #empty>
          <div class="empty-state">Aucune catégorie. Cliquez sur « Nouvelle catégorie » pour commencer.</div>
        </ng-template>
      </div>
    </div>

    <div class="modal-overlay" *ngIf="showModal" (click)="closeModal()">
      <div class="modal" (click)="$event.stopPropagation()">
        <h2>{{ editing ? 'Modifier la catégorie' : 'Créer une catégorie' }}</h2>
        <div class="form-group">
          <label>Nom *</label>
          <input [(ngModel)]="form.nom" placeholder="Pizza" />
        </div>
        <div class="form-group">
          <label>Description</label>
          <textarea [(ngModel)]="form.description" rows="3" placeholder="Cuisine italienne…"></textarea>
        </div>
        <div class="form-group">
          <label>Image</label>
          <input type="file" accept="image/*" (change)="onImageSelected($event)" />
          <div class="image-preview" *ngIf="form.imageUrl">
            <img [src]="form.imageUrl" alt="Apercu de la categorie" />
            <button class="btn-clear-image" type="button" (click)="removeImage()">Retirer l'image</button>
          </div>
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
          <button class="btn btn-danger" (click)="executeDelete()" [disabled]="deleting">
            {{ deleting ? 'Suppression…' : 'Supprimer' }}
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .toast { padding: 0.85rem 1.25rem; border-radius: var(--radius-md); margin-bottom: 1.5rem;
      background: rgba(16,185,129,0.12); border: 1px solid rgba(16,185,129,0.25); color: #047857; }
    .toast-error { background: rgba(239,68,68,0.12); border-color: rgba(239,68,68,0.25); color: #dc2626; }
    .modal-sm { max-width: 420px; text-align: center; }
    .delete-icon { font-size: 3rem; margin-bottom: 0.5rem; }
    .delete-message { color: var(--text-secondary); margin: 0.75rem 0 1.5rem; }
    .btn-danger { background: linear-gradient(135deg,#ef4444,#dc2626); color: #fff; border: none;
      padding: 0.6rem 1.5rem; border-radius: var(--radius-md); font-weight: 600; cursor: pointer; }
    .btn-danger:disabled { opacity: 0.5; cursor: not-allowed; }
    textarea { width: 100%; padding: 0.65rem 0.85rem; border: 1px solid var(--glass-border);
      border-radius: var(--radius-sm); font-family: inherit; resize: vertical; }
    .category-image { width: 58px; height: 58px; border-radius: 12px; overflow: hidden; background: rgba(99,102,241,0.12);
      display: inline-flex; align-items: center; justify-content: center; color: #4f46e5; font-weight: 800; }
    .category-image img { width: 100%; height: 100%; object-fit: cover; display: block; }
    .image-preview { margin-top: 0.75rem; display: flex; align-items: center; gap: 1rem; }
    .image-preview img { width: 96px; height: 96px; border-radius: 12px; object-fit: cover; border: 1px solid var(--glass-border); }
    .btn-clear-image { border: 1px solid var(--glass-border); background: #fff; color: var(--text-secondary);
      padding: 0.55rem 0.85rem; border-radius: var(--radius-sm); cursor: pointer; font-weight: 600; }
  `]
})
export class CategoriesComponent implements OnInit {
  categories: Categorie[] = [];
  message = '';
  messageType: 'success' | 'error' = 'success';
  saving = false;
  deleting = false;
  showModal = false;
  showDeleteModal = false;
  editing: Categorie | null = null;
  toDelete: Categorie | null = null;
  form: Categorie = this.emptyForm();

  constructor(private api: CatalogApiService) {}

  ngOnInit(): void { this.load(); }

  load(): void {
    this.api.getCategories().subscribe({
      next: (data) => (this.categories = data),
      error: () => this.showMsg('Erreur lors du chargement', 'error')
    });
  }

  openCreateModal(): void {
    this.editing = null;
    this.form = this.emptyForm();
    this.showModal = true;
  }

  openEditModal(cat: Categorie): void {
    this.editing = cat;
    this.form = { ...cat };
    this.showModal = true;
  }

  closeModal(): void { this.showModal = false; this.editing = null; }

  onImageSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      this.showMsg('Veuillez selectionner une image valide', 'error');
      input.value = '';
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      this.form.imageUrl = reader.result as string;
    };
    reader.onerror = () => this.showMsg("Erreur lors de la lecture de l'image", 'error');
    reader.readAsDataURL(file);
  }

  removeImage(): void {
    this.form.imageUrl = '';
  }

  save(): void {
    if (!this.form.nom?.trim()) {
      this.showMsg('Le nom est obligatoire', 'error');
      return;
    }
    this.saving = true;
    const req = this.editing
      ? this.api.updateCategory(this.editing.id!, this.form)
      : this.api.createCategory(this.form);
    req.subscribe({
      next: () => {
        this.showMsg(this.editing ? 'Catégorie modifiée' : 'Catégorie créée', 'success');
        this.closeModal();
        this.load();
        this.saving = false;
      },
      error: () => { this.showMsg('Erreur lors de l\'enregistrement', 'error'); this.saving = false; }
    });
  }

  confirmDelete(cat: Categorie): void { this.toDelete = cat; this.showDeleteModal = true; }
  cancelDelete(): void { this.showDeleteModal = false; this.toDelete = null; }

  executeDelete(): void {
    if (!this.toDelete?.id) return;
    this.deleting = true;
    const id = this.toDelete.id;
    this.cancelDelete();
    this.api.deleteCategory(id).subscribe({
      next: () => { this.showMsg('Catégorie supprimée', 'success'); this.load(); this.deleting = false; },
      error: (err) => {
        if (err.status === 204 || err.status === 200) { this.showMsg('Catégorie supprimée', 'success'); this.load(); }
        else { this.showMsg('Erreur lors de la suppression', 'error'); this.load(); }
        this.deleting = false;
      }
    });
  }

  private emptyForm(): Categorie { return { nom: '', description: '', imageUrl: '' }; }

  getInitial(nom?: string): string {
    return nom?.trim().charAt(0).toUpperCase() || '?';
  }

  private showMsg(msg: string, type: 'success' | 'error'): void {
    this.message = msg;
    this.messageType = type;
    setTimeout(() => (this.message = ''), 3500);
  }
}
