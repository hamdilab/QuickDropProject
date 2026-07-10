import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Categorie {
  id?: number;
  nom: string;
  description?: string;
  imageUrl?: string;
}

export interface Ingredient {
  id?: number;
  nom: string;
  description?: string;
  allergene?: boolean;
}

export interface Menu {
  id?: number;
  nom: string;
  description?: string;
  imageUrl?: string;
  actif?: boolean;
  restaurantId?: number;
  restaurantNom?: string;
  createdAt?: string;
}

export interface Produit {
  id?: number;
  nom: string;
  description?: string;
  prix: number;
  calories?: number;
  ingredients?: string[];
  ingredientIds?: number[];
  imageUrl?: string;
  disponible?: boolean;
  menuId?: number;
}

export interface Restaurant {
  id?: number;
  nom: string;
  description?: string;
  ville: string;
  adresse: string;
  telephone?: string;
  email?: string;
  vendeurId?: number;
  imageUrl?: string;
  note?: number;
  actif?: boolean;
  categorieId?: number;
  categorieNom?: string;
}

@Injectable({
  providedIn: 'root'
})
export class CatalogApiService {
  // Use gateway URL
  private baseUrl = 'http://localhost:8084/api/v1/catalog';

  constructor(private http: HttpClient) {}

  // --- CATEGORIES ---
  getCategories(): Observable<Categorie[]> {
    return this.http.get<Categorie[]>(`${this.baseUrl}/categories`);
  }
  createCategory(c: Categorie): Observable<Categorie> {
    return this.http.post<Categorie>(`${this.baseUrl}/categories`, c);
  }
  updateCategory(id: number, c: Categorie): Observable<Categorie> {
    return this.http.put<Categorie>(`${this.baseUrl}/categories/${id}`, c);
  }
  deleteCategory(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/categories/${id}`);
  }

  // --- INGREDIENTS ---
  getIngredients(): Observable<Ingredient[]> {
    return this.http.get<Ingredient[]>(`${this.baseUrl}/ingredients`);
  }
  getAllergenes(): Observable<Ingredient[]> {
    return this.http.get<Ingredient[]>(`${this.baseUrl}/ingredients/allergenes`);
  }
  createIngredient(i: Ingredient): Observable<Ingredient> {
    return this.http.post<Ingredient>(`${this.baseUrl}/ingredients`, i);
  }
  updateIngredient(id: number, i: Ingredient): Observable<Ingredient> {
    return this.http.put<Ingredient>(`${this.baseUrl}/ingredients/${id}`, i);
  }
  deleteIngredient(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/ingredients/${id}`);
  }

  // --- RESTAURANTS ---
  getRestaurants(): Observable<Restaurant[]> {
    return this.http.get<Restaurant[]>(`${this.baseUrl}/restaurants`);
  }
  searchRestaurants(nom: string): Observable<Restaurant[]> {
    let params = new HttpParams().set('nom', nom);
    return this.http.get<Restaurant[]>(`${this.baseUrl}/restaurants/search`, { params });
  }
  getRestaurantsByVille(ville: string): Observable<Restaurant[]> {
    let params = new HttpParams().set('ville', ville);
    return this.http.get<Restaurant[]>(`${this.baseUrl}/restaurants/ville`, { params });
  }
  getRestaurantsByCategorie(categorieId: number): Observable<Restaurant[]> {
    return this.http.get<Restaurant[]>(`${this.baseUrl}/restaurants/categorie/${categorieId}`);
  }
  createRestaurant(r: Restaurant): Observable<Restaurant> {
    return this.http.post<Restaurant>(`${this.baseUrl}/restaurants`, r);
  }
  updateRestaurant(id: number, r: Restaurant): Observable<Restaurant> {
    return this.http.put<Restaurant>(`${this.baseUrl}/restaurants/${id}`, r);
  }
  toggleRestaurantActif(id: number): Observable<Restaurant> {
    return this.http.patch<Restaurant>(`${this.baseUrl}/restaurants/${id}/toggle-actif`, {});
  }
  deleteRestaurant(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/restaurants/${id}`);
  }

  // --- MENUS ---
  getMenusByRestaurant(restaurantId: number): Observable<Menu[]> {
    return this.http.get<Menu[]>(`${this.baseUrl}/menus/restaurant/${restaurantId}`);
  }
  createMenu(m: Menu): Observable<Menu> {
    return this.http.post<Menu>(`${this.baseUrl}/menus`, m);
  }
  updateMenu(id: number, m: Menu): Observable<Menu> {
    return this.http.put<Menu>(`${this.baseUrl}/menus/${id}`, m);
  }
  toggleMenuActif(id: number): Observable<Menu> {
    return this.http.patch<Menu>(`${this.baseUrl}/menus/${id}/toggle-actif`, {});
  }
  deleteMenu(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/menus/${id}`);
  }

  // --- PRODUITS ---
  getProduitsByMenu(menuId: number): Observable<Produit[]> {
    return this.http.get<Produit[]>(`${this.baseUrl}/produits/menu/${menuId}`);
  }
  getProduitsDisponiblesByMenu(menuId: number): Observable<Produit[]> {
    return this.http.get<Produit[]>(`${this.baseUrl}/produits/menu/${menuId}/disponibles`);
  }
  createProduit(p: Produit): Observable<Produit> {
    return this.http.post<Produit>(`${this.baseUrl}/produits`, p);
  }
  updateProduit(id: number, p: Produit): Observable<Produit> {
    return this.http.put<Produit>(`${this.baseUrl}/produits/${id}`, p);
  }
  toggleProduitDisponibilite(id: number): Observable<Produit> {
    return this.http.patch<Produit>(`${this.baseUrl}/produits/${id}/toggle-disponibilite`, {});
  }
  updateProduitPrix(id: number, prix: number): Observable<Produit> {
    return this.http.patch<Produit>(`${this.baseUrl}/produits/${id}/prix`, { prix });
  }
  deleteProduit(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/produits/${id}`);
  }
}
