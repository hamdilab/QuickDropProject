package org.example.user.controllers;

import lombok.RequiredArgsConstructor;
import org.example.user.Entities.StatusLivreur;
import org.example.user.Entities.StatusLivreurEnum;
import org.example.user.Services.StatusLivreurService;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/livreurs")
@RequiredArgsConstructor
public class StatusLivreurController {

    private final StatusLivreurService statusLivreurService;

    @PutMapping("/{userId}/status")
    public ResponseEntity<StatusLivreur> mettreAJourStatus(
            @PathVariable Long userId,
            @RequestParam StatusLivreurEnum status) {
        return ResponseEntity.ok(statusLivreurService.mettreAJourStatus(userId, status));
    }

    @GetMapping("/{userId}/status")
    public ResponseEntity<StatusLivreur> getStatus(@PathVariable Long userId) {
        return ResponseEntity.ok(statusLivreurService.getStatusLivreur(userId));
    }
}