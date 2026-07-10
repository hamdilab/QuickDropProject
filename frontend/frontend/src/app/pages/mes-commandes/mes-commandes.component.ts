import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CommandeService } from '../../core/commande.service';

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
  imports: [CommonModule, FormsModule],
  templateUrl: './mes-commandes.component.html'
})
export class MesCommandesComponent implements OnInit {
  private commandeService = inject(CommandeService);
  selectedCommande: Commande | null = null;
  showCreateForm = false;
  commandes: Commande[] = [];
  loading = false;
  error: string | null = null;

  // Form data
  formData = {
    clientId: '',
    restaurantId: '',
    produitId: '',
    quantite: 1,
    prixTotal: 0,
    statut: 'EN_ATTENTE'
  };

  ngOnInit(): void {
    this.loadCommandes();
  }

  loadCommandes(): void {
    this.loading = true;
    this.error = null;
    this.commandeService.getCommandes().subscribe({
      next: (data) => {
        // Map Java entity to UI interface
        this.commandes = data.map(cmd => ({
          id: cmd.id || 0,
          numero: `CMD-${cmd.id}`,
          restaurant: cmd.restaurantId,
          emoji: '🍕',
          date: new Date().toISOString(),
          statut: (cmd.statut as any) || 'EN_ATTENTE',
          adresseLivraison: 'Adresse',
          articles: [
            {
              nom: cmd.produitId,
              quantite: cmd.quantite,
              prixUnitaire: cmd.prixTotal / cmd.quantite
            }
          ],
          fraisLivraison: 0,
          total: cmd.prixTotal
        }));
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Erreur au chargement des commandes depuis le backend';
        console.error('Erreur:', err);
        this.loading = false;
        this.loadMockData();
      }
    });
  }

  createTestCommande(): void {
    const newCommande = {
      clientId: 'USER_TUNIS_99',
      restaurantId: 'RESTO_CHILI_12',
      produitId: 'PIZZA_MEGA',
      quantite: 2,
      prixTotal: 45.5,
      statut: 'EN_ATTENTE'
    };

    this.commandeService.createCommande(newCommande).subscribe({
      next: () => {
        console.log('Commande créée avec succès');
        this.loadCommandes();
      },
      error: (err) => {
        console.error('Erreur création commande:', err);
        alert('Erreur création commande. Vérifiez que le serveur est en cours d\'exécution.');
      }
    });
  }

  openCreateForm(): void {
    this.showCreateForm = true;
    this.resetForm();
  }

  closeCreateForm(): void {
    this.showCreateForm = false;
    this.resetForm();
  }

  resetForm(): void {
    this.formData = {
      clientId: '',
      restaurantId: '',
      produitId: '',
      quantite: 1,
      prixTotal: 0,
      statut: 'EN_ATTENTE'
    };
  }

  submitCreateForm(): void {
    if (!this.formData.clientId || !this.formData.restaurantId || !this.formData.produitId) {
      alert('Veuillez remplir tous les champs requis');
      return;
    }

    if (this.formData.quantite <= 0 || this.formData.prixTotal <= 0) {
      alert('La quantité et le prix doivent être supérieurs à 0');
      return;
    }

    const newCommande = {
      clientId: this.formData.clientId,
      restaurantId: this.formData.restaurantId,
      produitId: this.formData.produitId,
      quantite: this.formData.quantite,
      prixTotal: this.formData.prixTotal,
      statut: this.formData.statut
    };

    this.commandeService.createCommande(newCommande).subscribe({
      next: () => {
        console.log('Commande créée avec succès');
        this.closeCreateForm();
        this.loadCommandes();
      },
      error: (err) => {
        console.error('Erreur création commande:', err);
        alert('Erreur lors de la création de la commande');
      }
    });
  }

  updateCommandeStatus(id: number, newStatus: string): void {
    this.commandeService.updateStatut(id, newStatus).subscribe({
      next: () => {
        console.log('Statut mis à jour');
        this.loadCommandes();
      },
      error: (err) => {
        console.error('Erreur mise à jour statut:', err);
      }
    });
  }

  private loadMockData(): void {
    this.commandes = [
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
    ];
  }

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

  deleteCommande(id: number): void {
    if (confirm('Êtes-vous sûr de vouloir supprimer cette commande ?')) {
      this.commandeService.deleteCommande(id).subscribe({
        next: (response) => {
          console.log('Commande supprimée avec succès', response);
          this.selectedCommande = null;
          this.loadCommandes();
          // Optionnel: afficher un toast/notification de succès
        },
        error: (err) => {
          // Vérifier si c'est vraiment une erreur ou juste un problème de parsing
          if (err.status === 200 || err.status === 204 || err.status === 0) {
            // La suppression a réussi même si on reçoit une erreur
            console.log('Commande supprimée avec succès (serveur)');
            this.selectedCommande = null;
            this.loadCommandes();
          } else {
            console.error('Erreur suppression commande:', err);
            alert('Erreur lors de la suppression. Code: ' + err.status);
          }
        }
      });
    }
  }
}
