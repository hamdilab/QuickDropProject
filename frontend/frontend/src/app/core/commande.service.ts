import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
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
  private readonly apiUrl = `${environment.orderServiceUrl}/api/commandes`;
  private readonly httpOptions = {
    headers: new HttpHeaders({ 'Content-Type': 'application/json' })
  };

  getCommandes(): Observable<Commande[]> {
    return this.http.get<Commande[]>(this.apiUrl).pipe(
      catchError((error) => {
        console.error('Erreur récupération commandes:', error);
        return throwError(() => error);
      })
    );
  }

  createCommande(commande: Commande): Observable<Commande> {
    return this.http.post<Commande>(this.apiUrl, commande, this.httpOptions).pipe(
      catchError((error) => {
        console.error('Erreur création commande:', error);
        return throwError(() => error);
      })
    );
  }

  updateStatut(id: number, statut: string): Observable<Commande> {
    return this.http.put<Commande>(`${this.apiUrl}/${id}/statut`, { statut }, this.httpOptions).pipe(
      catchError((error) => {
        console.error('Erreur mise à jour statut:', error);
        return throwError(() => error);
      })
    );
  }

  getCommandeById(id: number): Observable<Commande> {
    return this.http.get<Commande>(`${this.apiUrl}/${id}`).pipe(
      catchError((error) => {
        console.error('Erreur récupération commande:', error);
        return throwError(() => error);
      })
    );
  }

  deleteCommande(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`, { responseType: 'text' }).pipe(
      catchError((error) => {
        console.error('Erreur suppression commande:', error);
        return throwError(() => error);
      })
    );
  }
}
