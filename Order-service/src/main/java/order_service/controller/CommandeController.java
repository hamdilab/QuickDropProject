package order_service.controller;

import order_service.model.Commande;
import order_service.service.CommandeService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/commandes")
public class CommandeController {

    @Autowired
    private CommandeService commandeService;

    // [POST] : http://localhost:8082/api/commandes (Créer une commande)
    @PostMapping
    public Commande ajouterCommande(@RequestBody Commande commande) {
        return commandeService.creerCommande(commande);
    }

    // [GET] : http://localhost:8082/api/commandes (Voir toutes les commandes)
    @GetMapping
    public List<Commande> recupererToutesLesCommandes() {
        return commandeService.obtenirToutesLesCommandes();
    }

    // [GET par ID] : http://localhost:8082/api/commandes/{id} (Voir une commande spécifique)
    @GetMapping("/{id}")
    public ResponseEntity<Commande> recupererParId(@PathVariable Long id) {
        return commandeService.obtenirCommandeParId(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    // [PUT] : http://localhost:8082/api/commandes/{id}/statut (Modifier le statut)
    @PutMapping("/{id}/statut")
    public Commande mettreAJourStatut(@PathVariable Long id, @RequestParam String statut) {
        return commandeService.modifierStatutCommande(id, statut);
    }

    // [DELETE] : http://localhost:8082/api/commandes/{id} (Supprimer une commande)
    @DeleteMapping("/{id}")
    public ResponseEntity<String> effacerCommande(@PathVariable Long id) {
        commandeService.supprimerCommande(id);
        return ResponseEntity.ok("Commande supprimée avec succès !");
    }
}