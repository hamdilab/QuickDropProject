import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  CatalogApiService,
  Categorie,
  Menu,
  Produit,
  Restaurant
} from '../../../core/catalog-api.service';

@Component({
  selector: 'app-catalog-browse',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="page">
      <div class="page-header">
        <div>
          <h1>🛒 Découvrir les restaurants</h1>
          <p>Parcourez les établissements actifs et leurs menus.</p>
        </div>
      </div>

      <div class="filters">
        <input [(ngModel)]="searchNom" placeholder="Rechercher un restaurant…" (keyup.enter)="applySearch()" />
        <input [(ngModel)]="filterVille" placeholder="Ville…" (keyup.enter)="applyVilleFilter()" />
        <select [(ngModel)]="filterCategorieId" (change)="applyCategorieFilter()">
          <option [ngValue]="null">Toutes catégories</option>
          <option *ngFor="let c of categories" [ngValue]="c.id">{{ c.nom }}</option>
        </select>
        <button class="btn btn-secondary" (click)="resetFilters()">Tout afficher</button>
      </div>

      <div *ngIf="loading" class="empty-state">Chargement…</div>

      <div class="restaurant-grid" *ngIf="!loading && restaurants.length > 0">
        <div class="restaurant-card" *ngFor="let r of restaurants" (click)="openRestaurant(r)">
          <div class="card-image" [style.background-image]="r.imageUrl ? 'url(' + r.imageUrl + ')' : 'none'">
            <span *ngIf="!r.imageUrl" class="card-placeholder">🍽️</span>
          </div>
          <div class="card-body">
            <h3>{{ r.nom }}</h3>
            <p class="card-meta">{{ r.categorieNom || 'Restaurant' }} · {{ r.ville }}</p>
            <p class="card-desc">{{ r.description || 'Découvrez notre carte.' }}</p>
            <div class="card-footer">
              <span class="rating">⭐ {{ r.note ?? 0 | number:'1.1-1' }}</span>
              <span class="badge badge-success">Ouvert</span>
            </div>
          </div>
        </div>
      </div>

      <div class="empty-state" *ngIf="!loading && restaurants.length === 0">
        Aucun restaurant disponible pour le moment.
      </div>
    </div>

    <!-- Restaurant detail + menus -->
    <div class="modal-overlay" *ngIf="selectedRestaurant" (click)="closeDetail()">
      <div class="modal modal-xl" (click)="$event.stopPropagation()">
        <button class="close-btn" (click)="closeDetail()">✕</button>
        <h2>{{ selectedRestaurant.nom }}</h2>
        <p class="detail-meta">
          {{ selectedRestaurant.adresse }}, {{ selectedRestaurant.ville }}
          <span *ngIf="selectedRestaurant.telephone"> · {{ selectedRestaurant.telephone }}</span>
        </p>
        <p *ngIf="selectedRestaurant.description" class="detail-desc">{{ selectedRestaurant.description }}</p>

        <div *ngIf="loadingMenus" class="empty-state">Chargement des menus…</div>

        <div *ngFor="let menu of restaurantMenus" class="menu-section">
          <h3>📋 {{ menu.nom }}</h3>
          <p *ngIf="menu.description" class="menu-desc">{{ menu.description }}</p>
          <div class="produit-list">
            <div class="produit-item" *ngFor="let p of menuProduits[menu.id!] || []">
              <div class="produit-info">
                <strong>{{ p.nom }}</strong>
                <span class="produit-desc">{{ p.description }}</span>
                <span class="produit-ing" *ngIf="p.ingredients?.length">
                  {{ p.ingredients!.join(' · ') }}
                </span>
              </div>
              <div class="produit-price">
                {{ p.prix | number:'1.2-2' }} €
                <span class="calories" *ngIf="p.calories">{{ p.calories }} kcal</span>
              </div>
            </div>
            <div class="empty-inline" *ngIf="!(menuProduits[menu.id!]?.length)">
              Aucun produit disponible.
            </div>
          </div>
        </div>

        <div class="empty-state" *ngIf="!loadingMenus && restaurantMenus.length === 0">
          Ce restaurant n'a pas encore de menu actif.
        </div>
      </div>
    </div>
  `,
  styles: [`
    .filters { display: flex; flex-wrap: wrap; gap: 0.75rem; margin-bottom: 1.5rem; align-items: center; }
    .filters input, .filters select { padding: 0.55rem 0.85rem; border: 1px solid var(--glass-border);
      border-radius: var(--radius-sm); font-family: inherit; min-width: 160px; }
    .restaurant-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 1.25rem; }
    .restaurant-card {
      background: var(--glass-bg); border: 1px solid var(--glass-border); border-radius: var(--radius-lg);
      overflow: hidden; cursor: pointer; transition: var(--transition);
      box-shadow: var(--shadow);
    }
    .restaurant-card:hover { transform: translateY(-4px); box-shadow: 0 12px 40px rgba(249,115,22,0.15); }
    .card-image {
      height: 140px; background: linear-gradient(135deg, #ffedd5, #fed7aa);
      background-size: cover; background-position: center;
      display: flex; align-items: center; justify-content: center;
    }
    .card-placeholder { font-size: 3rem; }
    .card-body { padding: 1rem 1.25rem 1.25rem; }
    .card-body h3 { margin-bottom: 0.25rem; font-size: 1.1rem; }
    .card-meta { color: var(--text-secondary); font-size: 0.85rem; margin-bottom: 0.5rem; }
    .card-desc { color: var(--text-secondary); font-size: 0.9rem; line-height: 1.4;
      display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
    .card-footer { display: flex; justify-content: space-between; align-items: center; margin-top: 0.75rem; }
    .rating { font-weight: 600; color: var(--primary); }
    .modal-xl { max-width: 720px; max-height: 85vh; overflow-y: auto; position: relative; }
    .close-btn { position: absolute; top: 1rem; right: 1rem; background: none; border: none;
      font-size: 1.25rem; cursor: pointer; color: var(--text-secondary); }
    .detail-meta { color: var(--text-secondary); margin-bottom: 0.75rem; }
    .detail-desc { margin-bottom: 1.25rem; line-height: 1.5; }
    .menu-section { margin-top: 1.5rem; padding-top: 1.25rem; border-top: 1px solid var(--glass-border); }
    .menu-section h3 { margin-bottom: 0.35rem; }
    .menu-desc { color: var(--text-secondary); font-size: 0.9rem; margin-bottom: 0.75rem; }
    .produit-list { display: flex; flex-direction: column; gap: 0.65rem; }
    .produit-item {
      display: flex; justify-content: space-between; align-items: flex-start; gap: 1rem;
      padding: 0.75rem; background: var(--bg-secondary); border-radius: var(--radius-sm);
    }
    .produit-info { display: flex; flex-direction: column; gap: 0.15rem; }
    .produit-desc, .produit-ing { font-size: 0.85rem; color: var(--text-secondary); }
    .produit-price { text-align: right; font-weight: 700; color: var(--primary); white-space: nowrap; }
    .calories { display: block; font-size: 0.75rem; font-weight: 400; color: var(--text-muted); }
    .empty-inline { color: var(--text-muted); font-size: 0.9rem; padding: 0.5rem 0; }
    .badge-success { background: rgba(16,185,129,0.15); color: #047857; }
  `]
})
export class CatalogBrowseComponent implements OnInit {
  restaurants: Restaurant[] = [];
  categories: Categorie[] = [];
  searchNom = '';
  filterVille = '';
  filterCategorieId: number | null = null;
  loading = false;
  selectedRestaurant: Restaurant | null = null;
  restaurantMenus: Menu[] = [];
  menuProduits: Record<number, Produit[]> = {};
  loadingMenus = false;

  constructor(private api: CatalogApiService) {}

  ngOnInit(): void {
    this.api.getCategories().subscribe({ next: (d) => (this.categories = d), error: () => {} });
    this.loadRestaurants();
  }

  loadRestaurants(): void {
    this.loading = true;
    this.api.getRestaurants().subscribe({
      next: (data) => { this.restaurants = data; this.loading = false; },
      error: () => { this.loading = false; }
    });
  }

  applySearch(): void {
    if (!this.searchNom.trim()) { this.loadRestaurants(); return; }
    this.loading = true;
    this.api.searchRestaurants(this.searchNom.trim()).subscribe({
      next: (d) => { this.restaurants = d; this.loading = false; },
      error: () => { this.loading = false; }
    });
  }

  applyVilleFilter(): void {
    if (!this.filterVille.trim()) { this.loadRestaurants(); return; }
    this.loading = true;
    this.api.getRestaurantsByVille(this.filterVille.trim()).subscribe({
      next: (d) => { this.restaurants = d; this.loading = false; },
      error: () => { this.loading = false; }
    });
  }

  applyCategorieFilter(): void {
    if (!this.filterCategorieId) { this.loadRestaurants(); return; }
    this.loading = true;
    this.api.getRestaurantsByCategorie(this.filterCategorieId).subscribe({
      next: (d) => { this.restaurants = d; this.loading = false; },
      error: () => { this.loading = false; }
    });
  }

  resetFilters(): void {
    this.searchNom = '';
    this.filterVille = '';
    this.filterCategorieId = null;
    this.loadRestaurants();
  }

  openRestaurant(r: Restaurant): void {
    this.selectedRestaurant = r;
    this.restaurantMenus = [];
    this.menuProduits = {};
    if (!r.id) return;
    this.loadingMenus = true;
    this.api.getMenusByRestaurant(r.id).subscribe({
      next: (menus) => {
        this.restaurantMenus = menus.filter(m => m.actif !== false);
        this.loadingMenus = false;
        for (const menu of this.restaurantMenus) {
          if (menu.id) this.loadMenuProduits(menu.id);
        }
      },
      error: () => { this.loadingMenus = false; }
    });
  }

  loadMenuProduits(menuId: number): void {
    this.api.getProduitsDisponiblesByMenu(menuId).subscribe({
      next: (produits) => (this.menuProduits[menuId] = produits),
      error: () => (this.menuProduits[menuId] = [])
    });
  }

  closeDetail(): void {
    this.selectedRestaurant = null;
    this.restaurantMenus = [];
    this.menuProduits = {};
  }
}
