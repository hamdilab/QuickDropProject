package order_service.service;

import order_service.model.Commande;
import order_service.repository.CommandeRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
public class CommandeService {

    @Autowired
    private CommandeRepository commandeRepository;

    // [CREATE] : Créer une commande
    public Commande creerCommande(Commande commande) {
        commande.setDateCommande(LocalDateTime.now()); // Date automatique à l'instant T
        commande.setStatut("EN_ATTENTE");             // Statut de départ par défaut
        return commandeRepository.save(commande);       // Enregistre en base H2
    }

    // [READ ALL] : Récupérer toutes les commandes de la base
    public List<Commande> obtenirToutesLesCommandes() {
        return commandeRepository.findAll();
    }

    // [READ ONE] : Trouver une commande spécifique par son ID
    public Optional<Commande> obtenirCommandeParId(Long id) {
        return commandeRepository.findById(id);
    }

    // [UPDATE] : Modifier le statut d'une commande (ex: la passer à "PREPAREE")
    public Commande modifierStatutCommande(Long id, String nouveauStatut) {
        Commande commande = commandeRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Commande introuvable avec l'id : " + id));
        commande.setStatut(nouveauStatut);
        return commandeRepository.save(commande);
    }

    // [DELETE] : Supprimer une commande
    public void supprimerCommande(Long id) {
        commandeRepository.deleteById(id);
    }
}