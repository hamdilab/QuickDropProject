package Service;

import Models.Delivery;
import Models.DeliveryStatus;
import Repositories.DeliveryRepository;
import org.springframework.stereotype.Service;
import java.time.LocalDateTime;
import java.util.List;

@Service
public class DeliveryService {

    private final DeliveryRepository deliveryRepository;

    public DeliveryService(DeliveryRepository deliveryRepository) {
        this.deliveryRepository = deliveryRepository;
    }
    public List<Delivery> findAll() {
        return deliveryRepository.findAll();
    }
    public Delivery createDelivery(Delivery delivery) {
        delivery.setStatus(DeliveryStatus.PENDING); // Commencer en attente
        delivery.setDeliveryDate(LocalDateTime.now());
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
}