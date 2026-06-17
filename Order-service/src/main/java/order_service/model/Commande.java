package order_service.model;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "commandes")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Commande {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String clientId;
    private String restaurantId;
    private String produitId;
    private Integer quantite;
    private Double prixTotal;
    private LocalDateTime dateCommande;
    private String statut;
}