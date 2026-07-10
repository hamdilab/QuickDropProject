import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface OrderItem {
  nom: string;
  quantite: number;
  prixUnitaire: number;
}

export interface Commande {
  id: number;
  numero: string;
  restaurant: string;
  emoji: string;
  date: string;
  statut: 'EN_ATTENTE' | 'EN_PREPARATION' | 'EN_LIVRAISON' | 'LIVREE' | 'ANNULEE';
  adresseLivraison: string;
  articles: OrderItem[];
  fraisLivraison: number;
  total: number;
}

@Component({
  selector: 'app-mes-commandes',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="page">
      <div class="page-header">
        <div>
          <h1>📦 Mes commandes</h1>
          <p>Retrouvez ici toutes vos commandes passées depuis votre panier.</p>
        </div>
        <div class="orders-counter">
          <span class="counter-value">{{ commandes.length }}</span>
          <span class="counter-label">commande(s)</span>
        </div>
      </div>

      <div class="stats-grid">
        <div class="stat-card">
          <div class="stat-icon">⏳</div>
          <div class="stat-info">
            <span class="stat-value">{{ countByStatus('EN_ATTENTE') + countByStatus('EN_PREPARATION') }}</span>
            <span class="stat-label">En cours</span>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon">🚴</div>
          <div class="stat-info">
            <span class="stat-value">{{ countByStatus('EN_LIVRAISON') }}</span>
            <span class="stat-label">En livraison</span>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon">✅</div>
          <div class="stat-info">
            <span class="stat-value">{{ countByStatus('LIVREE') }}</span>
            <span class="stat-label">Livrées</span>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon">💰</div>
          <div class="stat-info">
            <span class="stat-value">{{ totalDepense | number:'1.2-2' }} €</span>
            <span class="stat-label">Total dépensé</span>
          </div>
        </div>
      </div>

      <div class="orders-list">
        <div class="order-card" *ngFor="let cmd of commandes" (click)="openDetails(cmd)">
          <div class="order-card-header">
            <div class="restaurant-info">
              <span class="restaurant-emoji">{{ cmd.emoji }}</span>
              <div>
                <h3>{{ cmd.restaurant }}</h3>
                <span class="order-num">{{ cmd.numero }}</span>
              </div>
            </div>
            <span class="status-badge" [ngClass]="'status-' + cmd.statut.toLowerCase()">
              {{ getStatusLabel(cmd.statut) }}
            </span>
          </div>

          <div class="order-card-body">
            <div class="order-meta">
              <span>📅 {{ cmd.date | date:'dd/MM/yyyy à HH:mm' }}</span>
              <span>📍 {{ cmd.adresseLivraison }}</span>
            </div>
            <ul class="order-items-preview">
              <li *ngFor="let item of cmd.articles">
                {{ item.quantite }}× {{ item.nom }}
              </li>
            </ul>
          </div>

          <div class="order-card-footer">
            <span class="items-count">{{ cmd.articles.length }} article(s)</span>
            <span class="order-total">{{ cmd.total | number:'1.2-2' }} €</span>
          </div>
        </div>
      </div>
    </div>

    <div class="modal-overlay" *ngIf="selectedCommande" (click)="closeDetails()">
      <div class="modal modal-xl" (click)="$event.stopPropagation()">
        <button class="close-btn" (click)="closeDetails()">✕</button>
        <h2>{{ selectedCommande.emoji }} {{ selectedCommande.restaurant }}</h2>
        <p class="detail-meta">
          {{ selectedCommande.numero }} · {{ selectedCommande.date | date:'dd/MM/yyyy à HH:mm' }}
        </p>

        <div class="detail-section">
          <h3>Statut</h3>
          <span class="status-badge" [ngClass]="'status-' + selectedCommande.statut.toLowerCase()">
            {{ getStatusLabel(selectedCommande.statut) }}
          </span>
        </div>

        <div class="detail-section">
          <h3>Adresse de livraison</h3>
          <p>📍 {{ selectedCommande.adresseLivraison }}</p>
        </div>

        <div class="detail-section">
          <h3>Articles commandés</h3>
          <div class="table-container">
            <table class="data-table">
              <thead>
                <tr>
                  <th>Produit</th>
                  <th>Qté</th>
                  <th>Prix unit.</th>
                  <th>Total</th>
                </tr>
              </thead>
              <tbody>
                <tr *ngFor="let item of selectedCommande.articles">
                  <td>{{ item.nom }}</td>
                  <td>{{ item.quantite }}</td>
                  <td>{{ item.prixUnitaire | number:'1.2-2' }} €</td>
                  <td>{{ item.quantite * item.prixUnitaire | number:'1.2-2' }} €</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <div class="detail-totals">
          <div class="total-row">
            <span>Sous-total</span>
            <span>{{ getSousTotal(selectedCommande) | number:'1.2-2' }} €</span>
          </div>
          <div class="total-row">
            <span>Frais de livraison</span>
            <span>{{ selectedCommande.fraisLivraison | number:'1.2-2' }} €</span>
          </div>
          <div class="total-row total-final">
            <span>Total</span>
            <span>{{ selectedCommande.total | number:'1.2-2' }} €</span>
          </div>
        </div>

        <div class="modal-actions">
          <button class="btn btn-secondary" (click)="closeDetails()">Fermer</button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .orders-counter {
      display: flex;
      flex-direction: column;
      align-items: center;
      background: var(--glass-bg);
      border: 1px solid var(--glass-border);
      border-radius: var(--radius-lg);
      padding: 1rem 1.5rem;
      min-width: 120px;
    }

    .counter-value {
      font-size: 2rem;
      font-weight: 800;
      color: var(--primary-hover);
    }

    .counter-label {
      font-size: 0.8rem;
      color: var(--text-secondary);
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .orders-list {
      display: flex;
      flex-direction: column;
      gap: 1.25rem;
    }

    .order-card {
      background: var(--glass-bg);
      border: 1px solid var(--glass-border);
      border-radius: var(--radius-lg);
      padding: 1.5rem;
      cursor: pointer;
      transition: var(--transition);
      box-shadow: 0 2px 12px rgba(249, 115, 22, 0.06);
    }

    .order-card:hover {
      transform: translateY(-2px);
      border-color: rgba(249, 115, 22, 0.35);
      box-shadow: var(--shadow);
    }

    .order-card-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 1rem;
      gap: 1rem;
    }

    .restaurant-info {
      display: flex;
      align-items: center;
      gap: 1rem;
    }

    .restaurant-emoji {
      font-size: 2.5rem;
      width: 56px;
      height: 56px;
      display: flex;
      align-items: center;
      justify-content: center;
      background: rgba(249, 115, 22, 0.1);
      border-radius: var(--radius-md);
      border: 1px solid rgba(249, 115, 22, 0.15);
    }

    .restaurant-info h3 {
      font-size: 1.15rem;
      font-weight: 700;
      color: var(--text-primary);
      margin: 0;
    }

    .order-num {
      font-size: 0.8rem;
      color: var(--text-secondary);
    }

    .status-badge {
      display: inline-flex;
      padding: 0.35rem 0.85rem;
      font-size: 0.75rem;
      font-weight: 600;
      border-radius: 50px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      white-space: nowrap;
    }

    .status-en_attente {
      background: rgba(245, 158, 11, 0.15);
      color: #b45309;
      border: 1px solid rgba(245, 158, 11, 0.3);
    }

    .status-en_preparation {
      background: rgba(59, 130, 246, 0.12);
      color: #1d4ed8;
      border: 1px solid rgba(59, 130, 246, 0.25);
    }

    .status-en_livraison {
      background: rgba(16, 185, 129, 0.12);
      color: #047857;
      border: 1px solid rgba(16, 185, 129, 0.25);
    }

    .status-livree {
      background: rgba(34, 197, 94, 0.12);
      color: #15803d;
      border: 1px solid rgba(34, 197, 94, 0.25);
    }

    .status-annulee {
      background: rgba(239, 68, 68, 0.12);
      color: #dc2626;
      border: 1px solid rgba(239, 68, 68, 0.25);
    }

    .order-meta {
      display: flex;
      flex-wrap: wrap;
      gap: 1rem;
      font-size: 0.85rem;
      color: var(--text-secondary);
      margin-bottom: 0.75rem;
    }

    .order-items-preview {
      list-style: none;
      padding: 0;
      margin: 0;
      display: flex;
      flex-direction: column;
      gap: 0.25rem;
    }

    .order-items-preview li {
      font-size: 0.9rem;
      color: var(--text-primary);
    }

    .order-items-preview li::before {
      content: '• ';
      color: var(--primary);
    }

    .order-card-footer {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-top: 1rem;
      padding-top: 1rem;
      border-top: 1px solid rgba(249, 115, 22, 0.1);
    }

    .items-count {
      font-size: 0.85rem;
      color: var(--text-secondary);
    }

    .order-total {
      font-size: 1.25rem;
      font-weight: 800;
      color: var(--primary-hover);
    }

    .detail-section {
      margin: 1.5rem 0;
    }

    .detail-section h3 {
      font-size: 0.9rem;
      font-weight: 600;
      color: var(--text-secondary);
      text-transform: uppercase;
      letter-spacing: 0.5px;
      margin-bottom: 0.75rem;
    }

    .detail-meta {
      color: var(--text-secondary);
      margin-bottom: 0.5rem;
    }

    .detail-totals {
      margin-top: 1.5rem;
      padding-top: 1rem;
      border-top: 1px solid var(--glass-border);
    }

    .total-row {
      display: flex;
      justify-content: space-between;
      padding: 0.5rem 0;
      font-size: 0.9rem;
      color: var(--text-secondary);
    }

    .total-final {
      font-size: 1.15rem;
      font-weight: 800;
      color: var(--primary-hover);
      margin-top: 0.5rem;
      padding-top: 0.75rem;
      border-top: 1px solid rgba(249, 115, 22, 0.15);
    }

    .modal-actions {
      margin-top: 1.5rem;
      display: flex;
      justify-content: flex-end;
    }
  `]
})
export class MesCommandesComponent {
  selectedCommande: Commande | null = null;

  commandes: Commande[] = [
    {
      id: 1,
      numero: 'CMD-2026-0042',
      restaurant: 'Pizza Palace',
      emoji: '🍕',
      date: '2026-07-08T19:30:00',
      statut: 'EN_PREPARATION',
      adresseLivraison: '12 Rue de la Paix, Paris',
      articles: [
        { nom: 'Pizza Margherita', quantite: 2, prixUnitaire: 11.50 },
        { nom: 'Coca-Cola 33cl', quantite: 1, prixUnitaire: 2.50 },
      ],
      fraisLivraison: 2.99,
      total: 28.49,
    },
    {
      id: 2,
      numero: 'CMD-2026-0041',
      restaurant: 'Burger House',
      emoji: '🍔',
      date: '2026-07-08T12:15:00',
      statut: 'EN_LIVRAISON',
      adresseLivraison: '45 Avenue Victor Hugo, Lyon',
      articles: [
        { nom: 'Burger Classic', quantite: 1, prixUnitaire: 9.90 },
        { nom: 'Frites maison', quantite: 1, prixUnitaire: 3.50 },
        { nom: 'Milkshake Vanille', quantite: 1, prixUnitaire: 4.00 },
      ],
      fraisLivraison: 1.99,
      total: 19.39,
    },
    {
      id: 3,
      numero: 'CMD-2026-0038',
      restaurant: 'Sushi Zen',
      emoji: '🍣',
      date: '2026-07-07T20:00:00',
      statut: 'LIVREE',
      adresseLivraison: '8 Boulevard Haussmann, Paris',
      articles: [
        { nom: 'California Roll (8 pcs)', quantite: 2, prixUnitaire: 8.50 },
        { nom: 'Soupe Miso', quantite: 1, prixUnitaire: 3.00 },
        { nom: 'Thé vert', quantite: 1, prixUnitaire: 2.50 },
      ],
      fraisLivraison: 3.50,
      total: 26.50,
    },
    {
      id: 4,
      numero: 'CMD-2026-0043',
      restaurant: 'Taco Fiesta',
      emoji: '🌮',
      date: '2026-07-09T11:45:00',
      statut: 'EN_ATTENTE',
      adresseLivraison: '3 Place Bellecour, Lyon',
      articles: [
        { nom: 'Tacos Beef', quantite: 2, prixUnitaire: 7.50 },
        { nom: 'Nachos au fromage', quantite: 1, prixUnitaire: 5.00 },
      ],
      fraisLivraison: 2.49,
      total: 22.49,
    },
    {
      id: 5,
      numero: 'CMD-2026-0035',
      restaurant: 'Pasta Bella',
      emoji: '🍝',
      date: '2026-07-05T18:20:00',
      statut: 'LIVREE',
      adresseLivraison: '22 Rue du Commerce, Marseille',
      articles: [
        { nom: 'Penne Carbonara', quantite: 1, prixUnitaire: 12.00 },
        { nom: 'Tiramisu', quantite: 1, prixUnitaire: 5.50 },
        { nom: 'Eau minérale', quantite: 1, prixUnitaire: 1.50 },
      ],
      fraisLivraison: 2.99,
      total: 21.99,
    },
    {
      id: 6,
      numero: 'CMD-2026-0030',
      restaurant: 'Kebab Express',
      emoji: '🥙',
      date: '2026-07-03T22:10:00',
      statut: 'ANNULEE',
      adresseLivraison: '15 Rue Nationale, Lille',
      articles: [
        { nom: 'Kebab Mixte', quantite: 1, prixUnitaire: 8.00 },
        { nom: 'Frites', quantite: 1, prixUnitaire: 2.50 },
      ],
      fraisLivraison: 1.99,
      total: 12.49,
    },
  ];

  get totalDepense(): number {
    return this.commandes
      .filter(c => c.statut !== 'ANNULEE')
      .reduce((sum, c) => sum + c.total, 0);
  }

  countByStatus(statut: Commande['statut']): number {
    return this.commandes.filter(c => c.statut === statut).length;
  }

  getStatusLabel(statut: Commande['statut']): string {
    const labels: Record<Commande['statut'], string> = {
      EN_ATTENTE: 'En attente',
      EN_PREPARATION: 'En préparation',
      EN_LIVRAISON: 'En livraison',
      LIVREE: 'Livrée',
      ANNULEE: 'Annulée',
    };
    return labels[statut];
  }

  getSousTotal(cmd: Commande): number {
    return cmd.articles.reduce((sum, a) => sum + a.quantite * a.prixUnitaire, 0);
  }

  openDetails(cmd: Commande): void {
    this.selectedCommande = cmd;
  }

  closeDetails(): void {
    this.selectedCommande = null;
  }
}
