package org.example.user.controllers;

import lombok.RequiredArgsConstructor;
import org.example.user.Entities.Profil;
import org.example.user.Services.ProfilService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/profils")
@RequiredArgsConstructor
public class ProfilController {

    private final ProfilService profilService;

    @PostMapping
    public ResponseEntity<Profil> creer(@RequestBody Profil profil) {
        return ResponseEntity.status(HttpStatus.CREATED).body(profilService.creerProfil(profil));
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<Profil> getParUserId(@PathVariable Long userId) {
        return ResponseEntity.ok(profilService.getProfilParUserId(userId));
    }

    @PutMapping("/user/{userId}")
    public ResponseEntity<Profil> modifier(@PathVariable Long userId, @RequestBody Profil profil) {
        return ResponseEntity.ok(profilService.modifier(userId, profil));
    }
}
