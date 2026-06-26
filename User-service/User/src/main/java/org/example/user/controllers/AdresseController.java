package org.example.user.controllers;

import lombok.RequiredArgsConstructor;
import org.example.user.Entities.Adresse;
import org.example.user.Services.AdresseService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/adresses")
@RequiredArgsConstructor
public class AdresseController {

    private final AdresseService adresseService;

    @PostMapping
    public ResponseEntity<Adresse> creer(@RequestBody Adresse adresse) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(adresseService.creerAdresse(adresse));
    }
}