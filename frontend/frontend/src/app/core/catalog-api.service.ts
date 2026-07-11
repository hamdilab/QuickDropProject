import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Categorie {
  id?: number;
  nom: string;
  description?: string;
  imageUrl?: string;
}

export interface Restaurant {
  id?: number;
  nom: string;
  adresse: string;
  ville: string;
  telephone?: string;
  email?: string;
  description?: string;
  imageUrl?: string;
  actif?: boolean;
  note?: number;
  vendeurId?: number;
  categorieId?: number;
  categorieNom?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface Menu {
  id?: number;
  nom: string;
  description?: string;
  imageUrl?: string;
  actif?: boolean;
  restaurantId?: number;
  restaurantNom?: string;
  produits?: Produit[];
  createdAt?: string;
  updatedAt?: string;
}

export interface Produit {
  id?: number;
  nom: string;
  description?: string;
  prix: number;
  disponible?: boolean;
  imageUrl?: string;
  calories?: number;
  menuId?: number;
  menuNom?: string;
  ingredientIds?: number[];
  ingredients?: string[];
  createdAt?: string;
  updatedAt?: string;
}

export interface Ingredient {
  id?: number;
  nom: string;
  description?: string;
  allergene: boolean;
}

@Injectable({ providedIn: 'root' })
export class CatalogApiService {
  private base = 'http://localhost:8084/catalog';

  constructor(private http: HttpClient) {}

  // ── Catégories ──
  getWelcomeMessage(): Observable<string> {
    return this.http.get(`${this.base}/categories/welcome`, { responseType: 'text' });
  }

  getCategories(): Observable<Categorie[]> {
    return this.http.get<Categorie[]>(`${this.base}/categories`);
  }

  getCategoryById(id: number): Observable<Categorie> {
    return this.http.get<Categorie>(`${this.base}/categories/${id}`);
  }

  createCategory(categorie: Categorie): Observable<Categorie> {
    return this.http.post<Categorie>(`${this.base}/categories`, categorie);
  }

  updateCategory(id: number, categorie: Categorie): Observable<Categorie> {
    return this.http.put<Categorie>(`${this.base}/categories/${id}`, categorie);
  }

  deleteCategory(id: number): Observable<void> {
    return this.http.delete<void>(`${this.base}/categories/${id}`);
  }

  // ── Restaurants ──
  getRestaurants(): Observable<Restaurant[]> {
    return this.http.get<Restaurant[]>(`${this.base}/restaurants`);
  }

  getRestaurantById(id: number): Observable<Restaurant> {
    return this.http.get<Restaurant>(`${this.base}/restaurants/${id}`);
  }

  getRestaurantsByVille(ville: string): Observable<Restaurant[]> {
    return this.http.get<Restaurant[]>(`${this.base}/restaurants/ville/${encodeURIComponent(ville)}`);
  }

  getRestaurantsByCategorie(categorieId: number): Observable<Restaurant[]> {
    return this.http.get<Restaurant[]>(`${this.base}/restaurants/categorie/${categorieId}`);
  }

  searchRestaurants(nom: string): Observable<Restaurant[]> {
    const params = new HttpParams().set('nom', nom);
    return this.http.get<Restaurant[]>(`${this.base}/restaurants/recherche`, { params });
  }

  createRestaurant(restaurant: Restaurant): Observable<Restaurant> {
    return this.http.post<Restaurant>(`${this.base}/restaurants`, restaurant);
  }

  updateRestaurant(id: number, restaurant: Restaurant): Observable<Restaurant> {
    return this.http.put<Restaurant>(`${this.base}/restaurants/${id}`, restaurant);
  }

  toggleRestaurantActif(id: number): Observable<Restaurant> {
    return this.http.patch<Restaurant>(`${this.base}/restaurants/${id}/toggle-actif`, {});
  }

  deleteRestaurant(id: number): Observable<void> {
    return this.http.delete<void>(`${this.base}/restaurants/${id}`);
  }

  // ── Menus ──
  getMenusByRestaurant(restaurantId: number): Observable<Menu[]> {
    return this.http.get<Menu[]>(`${this.base}/menus/restaurant/${restaurantId}`);
  }

  getMenuById(id: number): Observable<Menu> {
    return this.http.get<Menu>(`${this.base}/menus/${id}`);
  }

  createMenu(menu: Menu): Observable<Menu> {
    return this.http.post<Menu>(`${this.base}/menus`, menu);
  }

  updateMenu(id: number, menu: Menu): Observable<Menu> {
    return this.http.put<Menu>(`${this.base}/menus/${id}`, menu);
  }

  toggleMenuActif(id: number): Observable<Menu> {
    return this.http.patch<Menu>(`${this.base}/menus/${id}/toggle-actif`, {});
  }

  deleteMenu(id: number): Observable<void> {
    return this.http.delete<void>(`${this.base}/menus/${id}`);
  }

  // ── Produits ──
  getProduitsByMenu(menuId: number): Observable<Produit[]> {
    return this.http.get<Produit[]>(`${this.base}/produits/menu/${menuId}`);
  }

  getProduitsDisponiblesByMenu(menuId: number): Observable<Produit[]> {
    return this.http.get<Produit[]>(`${this.base}/produits/menu/${menuId}/disponibles`);
  }

  getProduitById(id: number): Observable<Produit> {
    return this.http.get<Produit>(`${this.base}/produits/${id}`);
  }

  createProduit(produit: Produit): Observable<Produit> {
    return this.http.post<Produit>(`${this.base}/produits`, produit);
  }

  updateProduit(id: number, produit: Produit): Observable<Produit> {
    return this.http.put<Produit>(`${this.base}/produits/${id}`, produit);
  }

  updateProduitPrix(id: number, prix: number): Observable<Produit> {
    const params = new HttpParams().set('prix', prix.toString());
    return this.http.patch<Produit>(`${this.base}/produits/${id}/prix`, {}, { params });
  }

  toggleProduitDisponibilite(id: number): Observable<Produit> {
    return this.http.patch<Produit>(`${this.base}/produits/${id}/toggle-disponibilite`, {});
  }

  deleteProduit(id: number): Observable<void> {
    return this.http.delete<void>(`${this.base}/produits/${id}`);
  }

  // ── Ingrédients ──
  getIngredients(): Observable<Ingredient[]> {
    return this.http.get<Ingredient[]>(`${this.base}/ingredients`);
  }

  getAllergenes(): Observable<Ingredient[]> {
    return this.http.get<Ingredient[]>(`${this.base}/ingredients/allergenes`);
  }

  getIngredientById(id: number): Observable<Ingredient> {
    return this.http.get<Ingredient>(`${this.base}/ingredients/${id}`);
  }

  createIngredient(ingredient: Ingredient): Observable<Ingredient> {
    return this.http.post<Ingredient>(`${this.base}/ingredients`, ingredient);
  }

  updateIngredient(id: number, ingredient: Ingredient): Observable<Ingredient> {
    return this.http.put<Ingredient>(`${this.base}/ingredients/${id}`, ingredient);
  }

  deleteIngredient(id: number): Observable<void> {
    return this.http.delete<void>(`${this.base}/ingredients/${id}`);
  }
}
