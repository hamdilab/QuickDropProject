package Controllers;

import Models.Delivery;
import Models.DeliveryStatus;
import Service.DeliveryService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/Delivery")
public class DeliveryController {

    private final DeliveryService deliveryService;

    public DeliveryController(DeliveryService deliveryService) {
        this.deliveryService = deliveryService;
    }
    @GetMapping
    public ResponseEntity<List<Delivery>> getAllDeliveries() {
        return ResponseEntity.ok(deliveryService.findAll());
    }

    // POST : http://localhost:8080/Delivery/request
    @PostMapping("/request")
    public ResponseEntity<Delivery> requestDelivery(@RequestBody Delivery delivery) {
        return ResponseEntity.ok(deliveryService.createDelivery(delivery));
    }

    // PUT : http://localhost:8080/Delivery/{id}/assign?driver=MedAziz
    @PutMapping("/{id}/assign")
    public ResponseEntity<Delivery> assignDriver(@PathVariable Long id, @RequestParam String driver) {
        return ResponseEntity.ok(deliveryService.assignDriver(id, driver));
    }

    // PUT : http://localhost:8080/Delivery/{id}/status?status=DELIVERED
    @PutMapping("/{id}/status")
    public ResponseEntity<Delivery> updateStatus(@PathVariable Long id, @RequestParam DeliveryStatus status) {
        return ResponseEntity.ok(deliveryService.updateStatus(id, status));
    }
}