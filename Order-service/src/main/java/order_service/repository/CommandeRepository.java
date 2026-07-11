package order_service.repository;

import order_service.model.Commande;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface CommandeRepository extends JpaRepository<Commande, Long> {
    // Rien à écrire ici ! Spring Data JPA nous donne automatiquement
    // les méthodes : save(), findAll(), findById(), deleteById().
}