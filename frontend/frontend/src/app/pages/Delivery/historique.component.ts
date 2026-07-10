import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';

export interface Delivery {
  id?: number;
  name?: string;
  location?: string;
  deliveryDate?: string;
  status?: string;
  description?: string;
  deliveryPerson?: string;
}

@Component({
  selector: 'app-historique',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="page">
      <div class="page-header">
        <div>
          <h1>📋 Historique des Livraisons</h1>
          <p>Suivi complet et orchestration de l'état des commandes.</p>
        </div>
        <div class="stats-counter" style="text-align: right;">
          <span style="font-size: 1.5rem; font-weight: bold; color: #4f46e5;">{{ deliveries().length }}</span>
          <p style="margin: 0; font-size: 0.85rem; color: #6b7280;">Total Commandes</p>
        </div>
      </div>

      <div *ngIf="message" class="toast" [class.toast-error]="messageType === 'error'">{{ message }}</div>

      <div class="table-container">
        <table class="data-table" *ngIf="deliveries().length > 0; else empty">
          <thead>
            <tr>
              <th>ID</th>
              <th>Client</th>
              <th>Adresse</th>
              <th>Date de livraison</th>
              <th>Livreur</th>
              <th>Statut</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let item of deliveries()">
              <td><strong>#{{ item.id }}</strong></td>
              <td>
                <a href="#" class="client-link" (click)="onOpenDetails(item, $event)" style="color: #4f46e5; font-weight: 600; text-decoration: none;">
                  {{ item.name }}
                </a>
              </td>
              <td>{{ item.location || '—' }}</td>
              <td>{{ item.deliveryDate | date:'dd/MM/yyyy HH:mm' }}</td>
              <td>
                <span style="font-style: italic;">{{ item.deliveryPerson || 'Non assigné' }}</span>
              </td>
              <td>
                <span class="status-pill" [ngClass]="item.status?.toLowerCase()">
                  {{ item.status }}
                </span>
              </td>
              <td>
                <button class="btn-edit" title="Voir les détails" (click)="onOpenDetails(item, $event)" style="background:none; border:none; cursor:pointer; font-size:1.1rem; margin-right:8px;">👁️</button>
                <button class="btn-delete" title="Annuler" (click)="confirmDelete(item)" style="background:none; border:none; cursor:pointer; font-size:1.1rem;">❌</button>
              </td>
            </tr>
          </tbody>
        </table>
        <ng-template #empty>
          <div class="empty-state">Aucune commande enregistrée dans l'historique.</div>
        </ng-template>
      </div>
    </div>

    <!-- MODAL : DÉTAILS DE LA LIVRAISON -->
    <div class="modal-overlay" *ngIf="selectedDelivery()" (click)="onCloseDetails()">
      <div class="modal" (click)="$event.stopPropagation()">
        <h2>📋 Détails de la livraison #{{ selectedDelivery()?.id }}</h2>
        
        <div class="form-group" style="margin-bottom: 1rem;">
          <label style="display:block; font-weight:600; margin-bottom:0.25rem;">👤 Client</label>
          <input [value]="selectedDelivery()?.name" readonly style="width:100%; padding:0.5rem; border:1px solid #e5e7eb; background:#f9fafb; border-radius:6px;" />
        </div>

        <div class="form-group" style="margin-bottom: 1rem;">
          <label style="display:block; font-weight:600; margin-bottom:0.25rem;">📍 Adresse de destination</label>
          <input [value]="selectedDelivery()?.location" readonly style="width:100%; padding:0.5rem; border:1px solid #e5e7eb; background:#f9fafb; border-radius:6px;" />
        </div>

        <div class="form-group" style="margin-bottom: 1rem;">
          <label style="display:block; font-weight:600; margin-bottom:0.25rem;">🏃‍♂️ Livreur Assigné</label>
          <input [value]="selectedDelivery()?.deliveryPerson || 'Aucun livreur pour le moment'" readonly style="width:100%; padding:0.5rem; border:1px solid #e5e7eb; background:#f9fafb; border-radius:6px;" />
        </div>

        <div class="form-group" style="margin-bottom: 1rem;" *ngIf="selectedDelivery()?.description">
          <label style="display:block; font-weight:600; margin-bottom:0.25rem;">💬 Instructions / Description</label>
          <textarea rows="3" readonly style="background:#f9fafb;">{{ selectedDelivery()?.description }}</textarea>
        </div>

        <div class="form-group" style="margin-bottom: 1.5rem;">
          <label style="display:block; font-weight:600; margin-bottom:0.5rem;">⚙️ Mettre à jour le statut</label>
          <div style="display: flex; gap: 8px;">
            <button class="btn" style="background:#6366f1; color:white; padding:5px 12px; border:none; border-radius:4px; cursor:pointer;" (click)="onUpdateStatus(selectedDelivery()?.id, 'ASSIGNED')">Assigner</button>
            <button class="btn" style="background:#10b981; color:white; padding:5px 12px; border:none; border-radius:4px; cursor:pointer;" (click)="onUpdateStatus(selectedDelivery()?.id, 'DELIVERED')">Livrée</button>
            <button class="btn" style="background:#ef4444; color:white; padding:5px 12px; border:none; border-radius:4px; cursor:pointer;" (click)="onUpdateStatus(selectedDelivery()?.id, 'CANCELLED')">Annuler</button>
          </div>
        </div>

        <div class="modal-actions">
          <button class="btn btn-secondary" (click)="onCloseDetails()">Fermer</button>
        </div>
      </div>
    </div>

    <!-- MODAL : CONFIRMATION ANNULATION (DELETE SIMULÉ) -->
    <div class="modal-overlay" *ngIf="showDeleteModal" (click)="cancelDelete()">
      <div class="modal modal-sm" (click)="$event.stopPropagation()">
        <div class="delete-icon">🗑️</div>
        <h2>Confirmer l'annulation</h2>
        <p class="delete-message">Voulez-vous vraiment rejeter ou supprimer la livraison pour <strong>{{ toDelete?.name }}</strong> ?</p>
        <div class="modal-actions">
          <button class="btn btn-secondary" (click)="cancelDelete()">Conserver</button>
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
  `]
})
export class HistoriqueComponent implements OnInit {
  private gatewayUrl = 'http://localhost:8084/delivery-service/Delivery';
  
  deliveries = signal<Delivery[]>([]);
  selectedDelivery = signal<Delivery | null>(null);

  // Propriétés de gestion des retours d'interface (Toast et Modals)
  message: string | null = null;
  messageType: 'success' | 'error' = 'success';
  showDeleteModal = false;
  toDelete: Delivery | null = null;
  deleting = false;

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.loadDeliveries();
  }

  loadDeliveries(): void {
    this.http.get<Delivery[]>(this.gatewayUrl).subscribe({
      next: (data: Delivery[]) => this.deliveries.set(data),
      error: (err: any) => {
        console.error('Erreur :', err);
        this.showToast('Impossible de charger l\'historique des livraisons.', 'error');
      }
    });
  }

  onOpenDetails(delivery: Delivery, event: Event): void {
    event.preventDefault();
    if (!delivery.id) return;
    this.http.get<Delivery>(`${this.gatewayUrl}/${delivery.id}`).subscribe({
      next: (data) => this.selectedDelivery.set(data),
      error: () => this.showToast('Erreur lors du chargement des détails.', 'error')
    });
  }

  onCloseDetails(): void {
    this.selectedDelivery.set(null);
  }

  onUpdateStatus(id: number | undefined, status: string): void {
    if (!id) return;
    this.http.put(`${this.gatewayUrl}/${id}/status?status=${status}`, {}).subscribe({
      next: () => {
        this.loadDeliveries();
        this.onCloseDetails();
        this.showToast(`Statut de la livraison mis à jour à : ${status}`, 'success');
      },
      error: () => this.showToast('Erreur lors du changement de statut.', 'error')
    });
  }

  // Fonctions de suppression adaptées du template de référence
  confirmDelete(delivery: Delivery): void {
    this.toDelete = delivery;
    this.showDeleteModal = true;
  }

  cancelDelete(): void {
    this.toDelete = null;
    this.showDeleteModal = false;
  }

  executeDelete(): void {
    if (!this.toDelete || !this.toDelete.id) return;
    this.deleting = true;

    // Simulation ou appel DELETE réel sur la passerelle
    this.http.put(`${this.gatewayUrl}/${this.toDelete.id}/status?status=CANCELLED`, {}).subscribe({
      next: () => {
        this.deleting = false;
        this.showDeleteModal = false;
        this.showToast(`La livraison #${this.toDelete?.id} a été marquée comme annulée.`, 'success');
        this.toDelete = null;
        this.loadDeliveries();
      },
      error: () => {
        this.deleting = false;
        this.showDeleteModal = false;
        this.showToast('Erreur lors de l\'annulation de la livraison.', 'error');
      }
    });
  }

  private showToast(msg: string, type: 'success' | 'error' = 'success'): void {
    this.message = msg;
    this.messageType = type;
    setTimeout(() => this.message = null, 4000); // Disparition automatique
  }
}