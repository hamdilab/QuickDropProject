import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface Commande {
  id?: number;
  clientId: string;
  restaurantId: string;
  produitId: string;
  quantite: number;
  prixTotal: number;
  statut: string;
}

@Injectable({
  providedIn: 'root'
})
export class CommandeService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.orderServiceUrl}/api/commandes`;

  getCommandes(): Observable<Commande[]> {
    return this.http.get<Commande[]>(this.apiUrl);
  }

  createCommande(commande: Commande): Observable<Commande> {
    return this.http.post<Commande>(this.apiUrl, commande);
  }

  updateStatut(id: number, statut: string): Observable<Commande> {
    return this.http.put<Commande>(`${this.apiUrl}/${id}/statut`, { statut });
  }

  getCommandeById(id: number): Observable<Commande> {
    return this.http.get<Commande>(`${this.apiUrl}/${id}`);
  }

  deleteCommande(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`, { responseType: 'text' });
  }
}
