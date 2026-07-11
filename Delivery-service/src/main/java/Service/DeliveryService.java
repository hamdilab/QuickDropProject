package Service;

import Models.Delivery;
import Models.DeliveryStatus;
import Repositories.DeliveryRepository;
import com.example.quickdrop.Clients.CommandeFeignClient; // 👈 Ajout de l'import de ton client Feign
import org.springframework.stereotype.Service;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
public class DeliveryService {

    private final DeliveryRepository deliveryRepository;
    private final CommandeFeignClient commandeFeignClient; // 👈 1. Déclaration du client Feign

    // 2. Mise à jour du constructeur pour injecter les deux dépendances
    public DeliveryService(DeliveryRepository deliveryRepository, CommandeFeignClient commandeFeignClient) {
        this.deliveryRepository = deliveryRepository;
        this.commandeFeignClient = commandeFeignClient;
    }

    public List<Delivery> findAll() {
        return deliveryRepository.findAll();
    }

    public Delivery createDelivery(Delivery delivery) {
        // 1. Appel Feign
        if (delivery.getId() != null) {
            try {
                Object commandeAssociee = commandeFeignClient.getCommandeById(delivery.getId());
                System.out.println("👉 Succès OpenFeign ! Données reçues : " + commandeAssociee);

                // 2. ICI : Transfert des données de la réponse vers ton objet delivery
                if (commandeAssociee instanceof java.util.Map) {
                    java.util.Map<?, ?> data = (java.util.Map<?, ?>) commandeAssociee;

                    // On met à jour les champs de 'delivery' avec les données de la commande
                    if (data.containsKey("clientId")) {
                        delivery.setClientId(data.get("clientId").toString());
                    }
                    if (data.containsKey("produitId")) {
                        delivery.setDescription("Produit : " + data.get("produitId").toString());
                    }
                }
            } catch (Exception e) {
                System.err.println("❌ Échec Feign : " + e.getMessage());
            }
        }

        delivery.setStatus(DeliveryStatus.PENDING);
        delivery.setDeliveryDate(LocalDateTime.now());

        // 3. Maintenant, l'objet 'delivery' contient bien les infos du client et de la description
        return deliveryRepository.save(delivery);
    }

    public Delivery assignDriver(Long deliveryId, String deliveryPersonName) {
        Delivery delivery = deliveryRepository.findById(deliveryId)
                .orElseThrow(() -> new RuntimeException("Livraison introuvable avec l'ID : " + deliveryId));

        if (delivery.getStatus() != DeliveryStatus.PENDING) {
            throw new IllegalStateException("Cette livraison a déjà été acceptée ou annulée.");
        }

        delivery.setDeliveryPerson(deliveryPersonName);
        delivery.setStatus(DeliveryStatus.ASSIGNED);
        return deliveryRepository.save(delivery);
    }

    public Delivery updateStatus(Long deliveryId, DeliveryStatus newStatus) {
        Delivery delivery = deliveryRepository.findById(deliveryId)
                .orElseThrow(() -> new RuntimeException("Livraison introuvable"));

        delivery.setStatus(newStatus);
        if (newStatus == DeliveryStatus.DELIVERED) {
            System.out.println("Course terminée pour " + delivery.getDeliveryPerson() + ". Calcul des gains en cours...");
        }

        return deliveryRepository.save(delivery);
    }

    public Optional<Delivery> findById(Long id) {
        return deliveryRepository.findById(id);
    }
}