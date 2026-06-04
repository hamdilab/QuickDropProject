package com.catalogservice.controllers;

import com.catalogservice.dtos.ProduitRequest;
import com.catalogservice.dtos.ProduitResponse;
import com.catalogservice.services.ProduitService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/produits")
@RequiredArgsConstructor
public class ProduitController {

    private final ProduitService produitService;

    @PostMapping
    public ResponseEntity<ProduitResponse> creer(@Valid @RequestBody ProduitRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(produitService.creer(request));
    }

    @GetMapping("/menu/{menuId}")
    public ResponseEntity<List<ProduitResponse>> getByMenu(@PathVariable Long menuId) {
        return ResponseEntity.ok(produitService.getByMenu(menuId));
    }

    @GetMapping("/menu/{menuId}/disponibles")
    public ResponseEntity<List<ProduitResponse>> getDisponiblesByMenu(@PathVariable Long menuId) {
        return ResponseEntity.ok(produitService.getDisponiblesByMenu(menuId));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ProduitResponse> getById(@PathVariable Long id) {
        return ResponseEntity.ok(produitService.getById(id));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ProduitResponse> modifier(
            @PathVariable Long id,
            @Valid @RequestBody ProduitRequest request) {
        return ResponseEntity.ok(produitService.modifier(id, request));
    }

    @PatchMapping("/{id}/prix")
    public ResponseEntity<ProduitResponse> changerPrix(
            @PathVariable Long id,
            @RequestParam Double prix) {
        return ResponseEntity.ok(produitService.changerPrix(id, prix));
    }

    @PatchMapping("/{id}/toggle-disponibilite")
    public ResponseEntity<ProduitResponse> toggleDisponibilite(@PathVariable Long id) {
        return ResponseEntity.ok(produitService.toggleDisponibilite(id));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> supprimer(@PathVariable Long id) {
        produitService.supprimer(id);
        return ResponseEntity.noContent().build();
    }
}