package org.example.user.repositories;

import org.example.user.Entities.StatusLivreur;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface StatusLivreurRepository extends JpaRepository<StatusLivreur, Long> {
    Optional<StatusLivreur> findByUserId(Long userId);
}