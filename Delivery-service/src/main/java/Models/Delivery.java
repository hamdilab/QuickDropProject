package Models;

import Models.DeliveryStatus;
import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "deliveries") // Renomme la table au pluriel en base de données
public class Delivery {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY) // Auto-increment MySQL performant
    private Long id;

    private String name;

    @Column(length = 500) // Donne plus d'espace pour la description en BD
    private String description;

    private String location;

    private LocalDateTime deliveryDate; // Remplacement de java.util.Date par le standard moderne

    private String deliveryPerson;
    private String orderId;
    private String clientId;

    @Enumerated(EnumType.STRING) // Stocke le statut sous forme de texte (ex: "PENDING") en BD
    private DeliveryStatus status;

    // Constructeur sans argument (Obligatoire pour JPA)
    public Delivery() {
    }

    // Constructeur complet (Sans l'ID, car il est généré automatiquement par MySQL)
    public Delivery(String name, String description, String location, LocalDateTime deliveryDate,
                    String deliveryPerson, String orderId, String clientId, DeliveryStatus status) {
        this.name = name;
        this.description = description;
        this.location = location;
        this.deliveryDate = deliveryDate;
        this.deliveryPerson = deliveryPerson;
        this.orderId = orderId;
        this.clientId = clientId;
        this.status = status;
    }

    // Getters et Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getLocation() {
        return location;
    }

    public void setLocation(String location) {
        this.location = location;
    }

    public LocalDateTime getDeliveryDate() {
        return deliveryDate;
    }

    public void setDeliveryDate(LocalDateTime deliveryDate) {
        this.deliveryDate = deliveryDate;
    }

    public String getDeliveryPerson() {
        return deliveryPerson;
    }

    public void setDeliveryPerson(String deliveryPerson) {
        this.deliveryPerson = deliveryPerson;
    }

    public String getOrderId() {
        return orderId;
    }

    public void setOrderId(String orderId) {
        this.orderId = orderId;
    }

    public String getClientId() {
        return clientId;
    }

    public void setClientId(String clientId) {
        this.clientId = clientId;
    }

    public DeliveryStatus getStatus() {
        return status;
    }

    public void setStatus(DeliveryStatus status) {
        this.status = status;
    }
}