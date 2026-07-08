import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface User {
  id?: number;
  nom: string;
  prenom: string;
  email: string;
  password?: string;
  role: 'CLIENT' | 'LIVREUR' | 'RESTAURATEUR' | 'ADMIN';
  dateCreation?: string;
}

export interface Profil {
  id?: number;
  telephone: string;
  photo: string;
  user?: User;
  adresse?: Adresse;
}

export interface Adresse {
  id?: number;
  rue: string;
  ville: string;
  codePostal: string;
  pays: string;
}

export interface StatusLivreur {
  id?: number;
  user?: User;
  status: 'DISPONIBLE' | 'OCCUPE' | 'HORS_LIGNE';
  dateModification?: string;
}

@Injectable({ providedIn: 'root' })
export class UserApiService {
  private base = 'http://localhost:8084';

  constructor(private http: HttpClient) {}

  getAllUsers(): Observable<User[]> {
    return this.http.get<User[]>(`${this.base}/api/users`);
  }
  getUserById(id: number): Observable<User> {
    return this.http.get<User>(`${this.base}/api/users/${id}`);
  }
  createUser(user: User): Observable<User> {
    return this.http.post<User>(`${this.base}/api/users`, user);
  }
  updateUser(id: number, user: User): Observable<User> {
    return this.http.put<User>(`${this.base}/api/users/${id}`, user);
  }
  deleteUser(id: number): Observable<void> {
    return this.http.delete<void>(`${this.base}/api/users/${id}`);
  }
  getProfilByUserId(userId: number): Observable<Profil> {
    return this.http.get<Profil>(`${this.base}/api/profils/user/${userId}`);
  }
  updateProfil(userId: number, profil: Profil): Observable<Profil> {
    return this.http.put<Profil>(`${this.base}/api/profils/user/${userId}`, profil);
  }
  getLivreurStatus(userId: number): Observable<StatusLivreur> {
    return this.http.get<StatusLivreur>(`${this.base}/api/livreurs/${userId}/status`);
  }
  updateLivreurStatus(userId: number, status: string): Observable<StatusLivreur> {
    return this.http.put<StatusLivreur>(`${this.base}/api/livreurs/${userId}/status?status=${status}`, {});
  }
}
