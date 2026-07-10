import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CatalogApiService, Ingredient, Menu, Produit, Restaurant } from '../../../core/catalog-api.service';
import { AuthService } from '../../../core/auth.service';

@Component({
  selector: 'app-produits',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="page">
      <div class="page-header">
        <div>
          <h1>🍕 Produits</h1>
          <p>Articles du menu — prix, calories, ingrédients et disponibilité.</p>
        </div>
        <button class="btn btn-primary" (click)="openCreateModal()" [disabled]="!selectedMenuId">➕ Nouveau produit</button>
      </div>

      <div class="filters">
        <select [(ngModel)]="selectedRestaurantId" (change)="onRestaurantChange()">
          <option [ngValue]="null">— Restaurant —</option>
          <option *ngFor="let r of restaurants" [ngValue]="r.id">{{ r.nom }}</option>
        </select>
        <select [(ngModel)]="selectedMenuId" (change)="loadProduits()" [disabled]="!selectedRestaurantId">
          <option [ngValue]="null">— Menu —</option>
          <option *ngFor="let m of menus" [ngValue]="m.id">{{ m.nom }}</option>
        </select>
        <label class="checkbox-inline">
          <input type="checkbox" [(ngModel)]="disponiblesOnly" (change)="loadProduits()" [disabled]="!selectedMenuId" />
          Disponibles uniquement
        </label>
      </div>

      <div *ngIf="message" class="toast" [class.toast-error]="messageType === 'error'">{{ message }}</div>

      <div class="table-container">
        <table class="data-table" *ngIf="produits.length > 0; else empty">
          <thead>
            <tr>
              <th>ID</th>
              <th>Nom</th>
              <th>Prix</th>
              <th>Calories</th>
              <th>Disponible</th>
              <th>Ingrédients</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let p of produits">
              <td>{{ p.id }}</td>
              <td>{{ p.nom }}</td>
              <td>{{ p.prix | number:'1.2-2' }} €</td>
              <td>{{ p.calories ?? '—' }}</td>
              <td>
                <span class="badge" [class.badge-success]="p.disponible" [class.badge-danger]="!p.disponible">
                  {{ p.disponible ? 'Oui' : 'Non' }}
                </span>
              </td>
              <td class="ingredients-cell">{{ (p.ingredients || []).join(', ') || '—' }}</td>
              <td class="actions-cell">
                <button class="btn-edit" title="Modifier" (click)="openEditModal(p)">✏️</button>
                <button class="btn-toggle" title="Disponibilité" (click)="toggleDisponibilite(p)">🔄</button>
                <button class="btn-price" title="Changer prix" (click)="openPrixModal(p)">💰</button>
                <button class="btn-delete" title="Supprimer" (click)="confirmDelete(p)">🗑️</button>
              </td>
            </tr>
          </tbody>
        </table>
        <ng-template #empty>
          <div class="empty-state">
            {{ selectedMenuId ? 'Aucun produit dans ce menu.' : 'Sélectionnez un restaurant puis un menu.' }}
          </div>
        </ng-template>
      </div>
    </div>

    <!-- Create / Edit -->
    <div class="modal-overlay" *ngIf="showModal" (click)="closeModal()">
      <div class="modal modal-lg" (click)="$event.stopPropagation()">
        <h2>{{ editing ? 'Modifier le produit' : 'Créer un produit' }}</h2>
        <div class="grid-2-col">
          <div class="form-group">
            <label>Nom *</label>
            <input [(ngModel)]="form.nom" placeholder="Pizza Margherita" />
          </div>
          <div class="form-group">
            <label>Prix (€) *</label>
            <input [(ngModel)]="form.prix" type="number" min="0.01" step="0.01" />
          </div>
        </div>
        <div class="form-group">
          <label>Description</label>
          <textarea [(ngModel)]="form.description" rows="2"></textarea>
        </div>
        <div class="grid-2-col">
          <div class="form-group">
            <label>Calories</label>
            <input [(ngModel)]="form.calories" type="number" min="0" />
          </div>
          <div class="form-group">
            <label>URL image</label>
            <input [(ngModel)]="form.imageUrl" placeholder="https://…" />
          </div>
        </div>
        <div class="form-group">
          <label>Ingrédients</label>
          <div class="ingredient-checkboxes">
            <label *ngFor="let ing of allIngredients" class="ing-label">
              <input type="checkbox"
                [checked]="isIngredientSelected(ing.id!)"
                (change)="toggleIngredient(ing.id!)" />
              {{ ing.nom }}
              <span *ngIf="ing.allergene" class="allergene-tag">⚠️</span>
            </label>
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

    <!-- Prix rapide -->
    <div class="modal-overlay" *ngIf="showPrixModal" (click)="closePrixModal()">
      <div class="modal modal-sm" (click)="$event.stopPropagation()">
        <h2>Modifier le prix</h2>
        <p>{{ prixTarget?.nom }}</p>
        <div class="form-group">
          <label>Nouveau prix (€)</label>
          <input [(ngModel)]="newPrix" type="number" min="0.01" step="0.01" />
        </div>
        <div class="modal-actions">
          <button class="btn btn-secondary" (click)="closePrixModal()">Annuler</button>
          <button class="btn btn-primary" (click)="savePrix()" [disabled]="savingPrix">Enregistrer</button>
        </div>
      </div>
    </div>

    <!-- Delete -->
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
    .filters { display: flex; flex-wrap: wrap; gap: 0.75rem; margin-bottom: 1.25rem; align-items: center; }
    .filters select { padding: 0.55rem 0.85rem; border: 1px solid var(--glass-border);
      border-radius: var(--radius-sm); font-family: inherit; min-width: 180px; }
    .checkbox-inline { display: flex; align-items: center; gap: 0.4rem; font-size: 0.9rem; }
    .actions-cell { white-space: nowrap; }
    .ingredients-cell { max-width: 200px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
    .btn-toggle, .btn-price { background: none; border: none; cursor: pointer; font-size: 1.1rem; padding: 0.25rem; }
    .modal-lg { max-width: 640px; }
    .ingredient-checkboxes { display: flex; flex-wrap: wrap; gap: 0.5rem 1rem; max-height: 160px;
      overflow-y: auto; padding: 0.75rem; border: 1px solid var(--glass-border); border-radius: var(--radius-sm); }
    .ing-label { display: flex; align-items: center; gap: 0.35rem; font-size: 0.9rem; cursor: pointer; }
    .allergene-tag { font-size: 0.75rem; }
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
export class ProduitsComponent implements OnInit {
  restaurants: Restaurant[] = [];
  menus: Menu[] = [];
  produits: Produit[] = [];
  allIngredients: Ingredient[] = [];
  selectedRestaurantId: number | null = null;
  selectedMenuId: number | null = null;
  disponiblesOnly = false;
  selectedIngredientIds: number[] = [];
  message = '';
  messageType: 'success' | 'error' = 'success';
  saving = false;
  deleting = false;
  savingPrix = false;
  showModal = false;
  showDeleteModal = false;
  showPrixModal = false;
  editing: Produit | null = null;
  toDelete: Produit | null = null;
  prixTarget: Produit | null = null;
  newPrix = 0;
  form: Produit = this.emptyForm();

  constructor(private api: CatalogApiService, public auth: AuthService) {}

  ngOnInit(): void {
    this.api.getRestaurants().subscribe({
      next: (data) => {
        if (this.auth.isRestaurateur() && !this.auth.isAdmin()) {
          const myId = this.auth.getDbUserId();
          this.restaurants = data.filter(r => r.vendeurId === myId);
        } else {
          this.restaurants = data;
        }
      },
      error: () => {}
    });
    this.api.getIngredients().subscribe({
      next: (data) => (this.allIngredients = data),
      error: () => {}
    });
  }

  onRestaurantChange(): void {
    this.selectedMenuId = null;
    this.menus = [];
    this.produits = [];
    if (!this.selectedRestaurantId) return;
    this.api.getMenusByRestaurant(this.selectedRestaurantId).subscribe({
      next: (data) => (this.menus = data.filter(m => m.actif !== false)),
      error: () => this.showMsg('Erreur chargement menus', 'error')
    });
  }

  loadProduits(): void {
    if (!this.selectedMenuId) {
      this.produits = [];
      return;
    }
    const req = this.disponiblesOnly
      ? this.api.getProduitsDisponiblesByMenu(this.selectedMenuId)
      : this.api.getProduitsByMenu(this.selectedMenuId);
    req.subscribe({
      next: (data) => (this.produits = data),
      error: () => this.showMsg('Erreur chargement produits', 'error')
    });
  }

  openCreateModal(): void {
    this.editing = null;
    this.form = this.emptyForm();
    this.form.menuId = this.selectedMenuId!;
    this.selectedIngredientIds = [];
    this.showModal = true;
  }

  openEditModal(p: Produit): void {
    this.editing = p;
    this.form = {
      nom: p.nom,
      description: p.description,
      prix: p.prix,
      calories: p.calories,
      imageUrl: p.imageUrl,
      menuId: p.menuId
    };
    this.selectedIngredientIds = [...(p.ingredientIds || [])];
    this.showModal = true;
  }

  closeModal(): void { this.showModal = false; this.editing = null; }

  isIngredientSelected(id: number): boolean {
    return this.selectedIngredientIds.includes(id);
  }

  toggleIngredient(id: number): void {
    const idx = this.selectedIngredientIds.indexOf(id);
    if (idx >= 0) this.selectedIngredientIds.splice(idx, 1);
    else this.selectedIngredientIds.push(id);
  }

  save(): void {
    if (!this.form.nom?.trim() || !this.form.prix || this.form.prix <= 0) {
      this.showMsg('Nom et prix (> 0) sont obligatoires', 'error');
      return;
    }
    this.form.ingredientIds = [...this.selectedIngredientIds];
    if (!this.editing) this.form.menuId = this.selectedMenuId!;
    this.saving = true;
    const req = this.editing
      ? this.api.updateProduit(this.editing.id!, this.form)
      : this.api.createProduit(this.form);
    req.subscribe({
      next: () => {
        this.showMsg(this.editing ? 'Produit modifié' : 'Produit créé', 'success');
        this.closeModal();
        this.loadProduits();
        this.saving = false;
      },
      error: () => { this.showMsg('Erreur enregistrement', 'error'); this.saving = false; }
    });
  }

  toggleDisponibilite(p: Produit): void {
    if (!p.id) return;
    this.api.toggleProduitDisponibilite(p.id).subscribe({
      next: (updated) => {
        p.disponible = updated.disponible;
        this.showMsg(`Produit ${updated.disponible ? 'disponible' : 'indisponible'}`, 'success');
        if (this.disponiblesOnly && !updated.disponible) this.loadProduits();
      },
      error: () => this.showMsg('Erreur disponibilité', 'error')
    });
  }

  openPrixModal(p: Produit): void {
    this.prixTarget = p;
    this.newPrix = p.prix;
    this.showPrixModal = true;
  }

  closePrixModal(): void { this.showPrixModal = false; this.prixTarget = null; }

  savePrix(): void {
    if (!this.prixTarget?.id || this.newPrix <= 0) {
      this.showMsg('Prix invalide', 'error');
      return;
    }
    this.savingPrix = true;
    this.api.updateProduitPrix(this.prixTarget.id, this.newPrix).subscribe({
      next: (updated) => {
        if (this.prixTarget) this.prixTarget.prix = updated.prix;
        this.showMsg('Prix mis à jour', 'success');
        this.closePrixModal();
        this.loadProduits();
        this.savingPrix = false;
      },
      error: () => { this.showMsg('Erreur mise à jour prix', 'error'); this.savingPrix = false; }
    });
  }

  confirmDelete(p: Produit): void { this.toDelete = p; this.showDeleteModal = true; }
  cancelDelete(): void { this.showDeleteModal = false; this.toDelete = null; }

  executeDelete(): void {
    if (!this.toDelete?.id) return;
    this.deleting = true;
    const id = this.toDelete.id;
    this.cancelDelete();
    this.api.deleteProduit(id).subscribe({
      next: () => { this.showMsg('Produit supprimé', 'success'); this.loadProduits(); this.deleting = false; },
      error: (err) => {
        if (err.status === 204 || err.status === 200) { this.showMsg('Produit supprimé', 'success'); this.loadProduits(); }
        else { this.showMsg('Erreur suppression', 'error'); this.loadProduits(); }
        this.deleting = false;
      }
    });
  }

  private emptyForm(): Produit { return { nom: '', description: '', prix: 0, calories: undefined, imageUrl: '' }; }

  private showMsg(msg: string, type: 'success' | 'error'): void {
    this.message = msg;
    this.messageType = type;
    setTimeout(() => (this.message = ''), 3500);
  }
}
