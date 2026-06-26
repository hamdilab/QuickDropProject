package org.example.user.Services;

import lombok.RequiredArgsConstructor;
import org.example.user.Entities.StatusLivreur;
import org.example.user.Entities.StatusLivreurEnum;
import org.example.user.Entities.User;
import org.example.user.repositories.StatusLivreurRepository;

import org.springframework.stereotype.Service;
import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class StatusLivreurService {

    private final StatusLivreurRepository statusLivreurRepository;
    private final UserService userService;

    public StatusLivreur mettreAJourStatus(Long userId, StatusLivreurEnum nouveauStatus) {
        StatusLivreur status = statusLivreurRepository.findByUserId(userId)
                .orElseGet(() -> {
                    User user = userService.trouverParId(userId);
                    return StatusLivreur.builder()
                            .user(user)
                            .build();
                });
        status.setStatus(nouveauStatus);
        status.setDateModification(LocalDateTime.now());
        return statusLivreurRepository.save(status);
    }

    public StatusLivreur getStatusLivreur(Long userId) {
        return statusLivreurRepository.findByUserId(userId)
                .orElseThrow(() -> new RuntimeException("Status non trouvé"));
    }
}