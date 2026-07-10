import { Component, OnInit, signal, ViewEncapsulation } from '@angular/core';
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
<div class="app-container">
  <main class="history-area">
    <header class="history-header">
      <div class="header-titles">
        <h1>Historique des Commandes</h1>
      </div>
      <div class="stats-counter">
        <span class="counter-number">{{ deliveries().length }}</span>
        <span class="counter-label">Total Commandes</span>
      </div>
    </header>

    <div *ngIf="deliveries().length === 0" class="empty-timeline">
      <p>Aucune commande enregistrée dans l'historique.</p>
    </div>

    <div *ngIf="deliveries().length > 0" class="timeline">
      <div class="timeline-track"></div>
      <div *ngFor="let item of deliveries()" class="timeline-item" [ngClass]="'state-' + item.status?.toLowerCase()">
        <div class="timeline-badge"><span>#{{ item.id }}</span></div>
        <div class="timeline-card-simple" [ngClass]="item.status?.toLowerCase()">
          <div class="card-main-info">
            <div class="client-info-block">
              <a href="#" class="client-link" (click)="onOpenDetails(item, $event)">{{ item.name }}</a>
              <div class="order-date-sub">{{ item.deliveryDate | date:'dd/MM/yyyy HH:mm' }}</div>
            </div>
            <span class="status-pill" [ngClass]="item.status?.toLowerCase()">{{ item.status }}</span>
          </div>
        </div>
      </div>
    </div>
  </main>

  <div class="modal-overlay" *ngIf="selectedDelivery()" (click)="onCloseDetails()">
    <div class="modal-content" (click)="$event.stopPropagation()">
      <div class="modal-header">
        <h3>📋 Détails #{{ selectedDelivery()?.id }}</h3>
        <button class="close-icon-btn" (click)="onCloseDetails()">&times;</button>
      </div>
      <div class="modal-body">
        <div class="detail-item"><strong>👤 Client :</strong> <span>{{ selectedDelivery()?.name }}</span></div>
        <div class="detail-item"><strong>📍 Adresse :</strong> <span>{{ selectedDelivery()?.location }}</span></div>
        <div class="detail-item"><strong>📅 Date :</strong> <span>{{ selectedDelivery()?.deliveryDate | date:'dd/MM/yyyy HH:mm' }}</span></div>
        <div class="detail-item"><strong>📦 Statut :</strong> 
          <span class="status-badge" [ngClass]="selectedDelivery()?.status?.toLowerCase()">{{ selectedDelivery()?.status }}</span>
        </div>
        <div class="detail-item" *ngIf="selectedDelivery()?.description"><strong>💬 Instructions :</strong> <p><em>{{ selectedDelivery()?.description }}</em></p></div>
        <div class="detail-item"><strong>🏃‍♂️ Livreur :</strong> <span>{{ selectedDelivery()?.deliveryPerson || 'Aucun' }}</span></div>
      </div>
      <div class="modal-footer">
        <button class="btn-close-modal" (click)="onCloseDetails()">Fermer</button>
      </div>
    </div>
  </div>
</div>
  `,
  styleUrl: './historique.component.css',
  encapsulation: ViewEncapsulation.None
})
export class HistoriqueComponent implements OnInit {
  private gatewayUrl = 'http://localhost:8084/delivery-service/Delivery';
  
  deliveries = signal<Delivery[]>([]);
  selectedDelivery = signal<Delivery | null>(null);

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.loadDeliveries();
  }

  loadDeliveries(): void {
    this.http.get<Delivery[]>(this.gatewayUrl).subscribe({
      next: (data: Delivery[]) => this.deliveries.set(data),
      error: (err: any) => console.error('Erreur :', err)
    });
  }

  onOpenDetails(delivery: Delivery, event: Event): void {
    event.preventDefault();
    if (!delivery.id) return;
    this.http.get<Delivery>(`${this.gatewayUrl}/${delivery.id}`).subscribe({
      next: (data) => this.selectedDelivery.set(data)
    });
  }

  onCloseDetails(): void {
    this.selectedDelivery.set(null);
  }

  onUpdateStatus(id: number | undefined, status: string): void {
    if (!id) return;
    this.http.put(`${this.gatewayUrl}/${id}/status?status=${status}`, {}).subscribe({
      next: () => this.loadDeliveries()
    });
  }
}