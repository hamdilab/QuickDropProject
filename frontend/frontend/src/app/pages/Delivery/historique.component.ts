import { Component, OnInit, signal, ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';

// 👇 ON DÉCLARE LE MODÈLE DIRECTEMENT ICI PUISQU'IL N'EST PAS DANS UN FICHIER SÉPARÉ
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
  templateUrl: './historique.component.html',
  styleUrl: './historique.component.css',
  encapsulation: ViewEncapsulation.None
})
export class HistoriqueComponent implements OnInit {
  connectionStatus = 'Connexion via API Gateway...';
  isServerUp = false;
  
  deliveries = signal<Delivery[]>([]);
  selectedDelivery = signal<Delivery | null>(null);

// Modifie la ligne ainsi dans historique.component.ts :
private gatewayUrl = 'http://localhost:8084/delivery-service/Delivery';
constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.loadDeliveries();
  }

  loadDeliveries(): void {
    this.http.get<Delivery[]>(this.gatewayUrl).subscribe({
      next: (data: Delivery[]) => {
        this.deliveries.set(data); 
        this.isServerUp = true;
        this.connectionStatus = 'Succès : Connecté via l\'API Gateway';
      },
      error: (err: any) => {
        console.error('Erreur de liaison API Gateway :', err);
        this.isServerUp = false;
      }
    });
  }

  onOpenDetails(delivery: Delivery, event: Event): void {
    event.preventDefault();
    if (!delivery.id) return;

    this.http.get<Delivery>(`${this.gatewayUrl}/${delivery.id}`).subscribe({
      next: (detailedData: Delivery) => {
        this.selectedDelivery.set(detailedData);
      },
      error: (err: any) => console.error("Erreur détails :", err)
    });
  }

  onCloseDetails(): void {
    this.selectedDelivery.set(null);
  }

  onAssignDriver(id: number | undefined, driverName: string): void {
    if (!id) return;
    this.http.put(`${this.gatewayUrl}/${id}/assign?driver=${driverName}`, {}).subscribe({
      next: () => this.loadDeliveries()
    });
  }

  onUpdateStatus(id: number | undefined, status: string): void {
    if (!id) return;
    this.http.put(`${this.gatewayUrl}/${id}/status?status=${status}`, {}).subscribe({
      next: () => this.loadDeliveries()
    });
  }
}