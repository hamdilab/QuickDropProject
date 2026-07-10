import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CatalogApiService, Categorie, Restaurant } from '../../../core/catalog-api.service';

@Component({
  selector: 'app-restaurants',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="page">
      <div class="page-header">
        <div>
          <h1>🍽️ Restaurants</h1>
          <p>Gérer les établissements, leur statut et leurs informations.</p>
        </div>
        <button class="btn btn-primary" (click)="openCreateModal()">➕ Nouveau restaurant</button>
      </div>

      <div class="filters">
        <input [(ngModel)]="searchNom" placeholder="Rechercher par nom…" (keyup.enter)="applySearch()" />
        <input [(ngModel)]="filterVille" placeholder="Filtrer par ville…" (keyup.enter)="applyVilleFilter()" />
        <select [(ngModel)]="filterCategorieId" (change)="applyCategorieFilter()">
          <option [ngValue]="null">Toutes catégories</option>
          <option *ngFor="let c of categories" [ngValue]="c.id">{{ c.nom }}</option>
        </select>
        <button class="btn btn-secondary" (click)="resetFilters()">Réinitialiser</button>
      </div>

      <div *ngIf="message" class="toast" [class.toast-error]="messageType === 'error'">{{ message }}</div>

      <div class="table-container">
        <table class="data-table" *ngIf="restaurants.length > 0; else empty">
          <thead>
            <tr>
              <th>Image</th>
              <th>Nom</th>
              <th>Ville</th>
              <th>Catégorie</th>
              <th>Note</th>
              <th>Statut</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let r of restaurants">
              <td>
                <img
                  *ngIf="r.imageUrl; else noImage"
                  class="restaurant-thumb"
                  [src]="r.imageUrl"
                  [alt]="r.nom"
                />
                <ng-template #noImage>
                  <span class="restaurant-thumb restaurant-thumb-empty">--</span>
                </ng-template>
              </td>
              <td>{{ r.nom }}</td>
              <td>{{ r.ville }}</td>
              <td>{{ r.categorieNom || '—' }}</td>
              <td>⭐ {{ r.note ?? 0 | number:'1.1-1' }}</td>
              <td>
                <span class="badge" [class.badge-success]="r.actif" [class.badge-danger]="!r.actif">
                  {{ r.actif ? 'Actif' : 'Inactif' }}
                </span>
              </td>
              <td class="actions-cell">
                <button class="btn-edit" title="Modifier" (click)="openEditModal(r)">✏️</button>
                <button class="btn-toggle" title="Activer/Désactiver" (click)="toggleActif(r)">🔄</button>
                <button class="btn-delete" title="Supprimer" (click)="confirmDelete(r)">🗑️</button>
              </td>
            </tr>
          </tbody>
        </table>
        <ng-template #empty>
          <div class="empty-state">Aucun restaurant trouvé.</div>
        </ng-template>
      </div>
    </div>

    <div class="modal-overlay" *ngIf="showModal" (click)="closeModal()">
      <div class="modal modal-lg" (click)="$event.stopPropagation()">
        <h2>{{ editing ? 'Modifier le restaurant' : 'Créer un restaurant' }}</h2>
        <div class="grid-2-col">
          <div class="form-group">
            <label>Nom *</label>
            <input [(ngModel)]="form.nom" placeholder="Le Bon Resto" />
          </div>
          <div class="form-group">
            <label>Catégorie</label>
            <select [(ngModel)]="form.categorieId">
              <option [ngValue]="undefined">— Sélectionner —</option>
              <option *ngFor="let c of categories" [ngValue]="c.id">{{ c.nom }}</option>
            </select>
          </div>
        </div>
        <div class="form-group">
          <label>Adresse *</label>
          <input [(ngModel)]="form.adresse" placeholder="12 rue de la Paix" />
        </div>
        <div class="grid-2-col">
          <div class="form-group">
            <label>Ville *</label>
            <input [(ngModel)]="form.ville" placeholder="Paris" />
          </div>
          <div class="form-group">
            <label>Téléphone (8 chiffres)</label>
            <input [(ngModel)]="form.telephone" placeholder="01234567" maxlength="8" />
          </div>
        </div>
        <div class="grid-2-col">
          <div class="form-group">
            <label>Email</label>
            <input [(ngModel)]="form.email" type="email" placeholder="contact@resto.fr" />
          </div>
          <div class="form-group">
            <label>ID Vendeur</label>
            <input [(ngModel)]="form.vendeurId" type="number" min="1" placeholder="1" />
          </div>
        </div>
        <div class="form-group">
          <label>Description</label>
          <textarea [(ngModel)]="form.description" rows="2"></textarea>
        </div>
        <div class="form-group">
          <label>Image</label>
          <input type="file" accept="image/*" (change)="onImageSelected($event)" />
          <div class="image-preview" *ngIf="form.imageUrl">
            <img [src]="form.imageUrl" alt="Apercu du restaurant" />
            <button class="btn-clear-image" type="button" (click)="removeImage()">Retirer l'image</button>
          </div>
        </div>
        <div class="form-group" *ngIf="false">
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
    .filters { display: flex; flex-wrap: wrap; gap: 0.75rem; margin-bottom: 1.25rem; align-items: center; }
    .filters input, .filters select { padding: 0.55rem 0.85rem; border: 1px solid var(--glass-border);
      border-radius: var(--radius-sm); font-family: inherit; min-width: 160px; }
    .actions-cell { white-space: nowrap; }
    .btn-toggle { background: none; border: none; cursor: pointer; font-size: 1.1rem; padding: 0.25rem; }
    .restaurant-thumb { width: 52px; height: 52px; border-radius: 8px; object-fit: cover; border: 1px solid var(--glass-border);
      display: inline-flex; align-items: center; justify-content: center; background: rgba(148,163,184,0.12); color: var(--text-secondary);
      font-size: 0.8rem; font-weight: 700; }
    .modal-lg { max-width: 640px; }
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
    .image-preview { margin-top: 0.75rem; display: flex; align-items: center; gap: 1rem; }
    .image-preview img { width: 96px; height: 96px; border-radius: 12px; object-fit: cover; border: 1px solid var(--glass-border); }
    .btn-clear-image { border: 1px solid var(--glass-border); background: #fff; color: var(--text-secondary);
      padding: 0.55rem 0.85rem; border-radius: var(--radius-sm); cursor: pointer; font-weight: 600; }
    .badge-success { background: rgba(16,185,129,0.15); color: #047857; }
    .badge-danger { background: rgba(239,68,68,0.15); color: #dc2626; }
  `]
})
export class RestaurantsComponent implements OnInit {
  restaurants: Restaurant[] = [];
  categories: Categorie[] = [];
  searchNom = '';
  filterVille = '';
  filterCategorieId: number | null = null;
  message = '';
  messageType: 'success' | 'error' = 'success';
  saving = false;
  deleting = false;
  showModal = false;
  showDeleteModal = false;
  editing: Restaurant | null = null;
  toDelete: Restaurant | null = null;
  form: Restaurant = this.emptyForm();

  constructor(private api: CatalogApiService) {}

  ngOnInit(): void {
    this.loadCategories();
  }

  loadCategories(): void {
    this.api.getCategories().subscribe({
      next: (data) => {
        this.categories = data;
        this.loadRestaurants();
      },
      error: () => this.loadRestaurants()
    });
  }

  loadRestaurants(): void {
    this.api.getRestaurants().subscribe({
      next: (data) => this.loadRestaurantsWithCategories(data),
      error: () => this.showMsg('Erreur lors du chargement', 'error')
    });
  }

  applySearch(): void {
    if (!this.searchNom.trim()) { this.loadRestaurants(); return; }
    this.api.searchRestaurants(this.searchNom.trim()).subscribe({
      next: (data) => (this.restaurants = data),
      error: () => this.showMsg('Erreur lors de la recherche', 'error')
    });
  }

  applyVilleFilter(): void {
    if (!this.filterVille.trim()) { this.loadRestaurants(); return; }
    this.api.getRestaurantsByVille(this.filterVille.trim()).subscribe({
      next: (data) => (this.restaurants = data),
      error: () => this.showMsg('Erreur lors du filtrage', 'error')
    });
  }

  applyCategorieFilter(): void {
    if (!this.filterCategorieId) { this.loadRestaurants(); return; }
    this.api.getRestaurantsByCategorie(this.filterCategorieId).subscribe({
      next: (data) => (this.restaurants = data),
      error: () => this.showMsg('Erreur lors du filtrage', 'error')
    });
  }

  resetFilters(): void {
    this.searchNom = '';
    this.filterVille = '';
    this.filterCategorieId = null;
    this.loadRestaurants();
  }

  openCreateModal(): void {
    this.editing = null;
    this.form = this.emptyForm();
    this.showModal = true;
  }

  openEditModal(r: Restaurant): void {
    this.editing = r;
    const cat = this.categories.find(c => c.nom === r.categorieNom);
    this.form = {
      nom: r.nom,
      adresse: r.adresse,
      ville: r.ville,
      telephone: r.telephone,
      email: r.email,
      description: r.description,
      imageUrl: r.imageUrl,
      vendeurId: r.vendeurId,
      categorieId: cat?.id
    };
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
    if (!this.form.nom?.trim() || !this.form.adresse?.trim() || !this.form.ville?.trim()) {
      this.showMsg('Nom, adresse et ville sont obligatoires', 'error');
      return;
    }
    if (this.form.telephone && !/^[0-9]{8}$/.test(this.form.telephone)) {
      this.showMsg('Le téléphone doit contenir exactement 8 chiffres', 'error');
      return;
    }
    this.saving = true;
    const req = this.editing
      ? this.api.updateRestaurant(this.editing.id!, this.form)
      : this.api.createRestaurant(this.form);
    req.subscribe({
      next: () => {
        this.showMsg(this.editing ? 'Restaurant modifié' : 'Restaurant créé', 'success');
        this.closeModal();
        this.loadRestaurants();
        this.saving = false;
      },
      error: () => { this.showMsg('Erreur lors de l\'enregistrement', 'error'); this.saving = false; }
    });
  }

  toggleActif(r: Restaurant): void {
    if (!r.id) return;
    this.api.toggleRestaurantActif(r.id).subscribe({
      next: (updated) => {
        r.actif = updated.actif;
        this.showMsg(`Restaurant ${updated.actif ? 'activé' : 'désactivé'}`, 'success');
      },
      error: () => this.showMsg('Erreur lors du changement de statut', 'error')
    });
  }

  confirmDelete(r: Restaurant): void { this.toDelete = r; this.showDeleteModal = true; }
  cancelDelete(): void { this.showDeleteModal = false; this.toDelete = null; }

  executeDelete(): void {
    if (!this.toDelete?.id) return;
    this.deleting = true;
    const id = this.toDelete.id;
    this.cancelDelete();
    this.api.deleteRestaurant(id).subscribe({
      next: () => { this.showMsg('Restaurant supprimé', 'success'); this.loadRestaurants(); this.deleting = false; },
      error: (err) => {
        if (err.status === 204 || err.status === 200) { this.showMsg('Restaurant supprimé', 'success'); this.loadRestaurants(); }
        else { this.showMsg('Erreur lors de la suppression', 'error'); this.loadRestaurants(); }
        this.deleting = false;
      }
    });
  }

  private emptyForm(): Restaurant {
    return { nom: '', adresse: '', ville: '', telephone: '', email: '', description: '', imageUrl: '' };
  }

  private loadRestaurantsWithCategories(baseRestaurants: Restaurant[]): void {
    if (!this.categories.length) {
      this.restaurants = baseRestaurants;
      return;
    }

    let remaining = this.categories.length;
    const byId = new Map<number, Restaurant>();
    const withoutId: Restaurant[] = [];

    const addRestaurants = (items: Restaurant[]) => {
      items.forEach((restaurant) => {
        if (restaurant.id) byId.set(restaurant.id, restaurant);
        else withoutId.push(restaurant);
      });
    };

    addRestaurants(baseRestaurants);
    const finishCategoryLoad = () => {
      remaining--;
      if (remaining === 0) {
        this.restaurants = [...byId.values(), ...withoutId];
      }
    };

    this.categories.forEach((categorie) => {
      if (!categorie.id) {
        finishCategoryLoad();
        return;
      }

      this.api.getRestaurantsByCategorie(categorie.id).subscribe({
        next: (data) => addRestaurants(data),
        error: () => {},
        complete: finishCategoryLoad
      });
    });
  }

  private showMsg(msg: string, type: 'success' | 'error'): void {
    this.message = msg;
    this.messageType = type;
    setTimeout(() => (this.message = ''), 3500);
  }
}
