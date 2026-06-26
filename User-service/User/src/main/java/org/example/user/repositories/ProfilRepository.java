package org.example.user.repositories;

import org.example.user.Entities.Profil;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface ProfilRepository extends JpaRepository<Profil, Long> {
    Optional<Profil> findByUserId(Long userId);
}