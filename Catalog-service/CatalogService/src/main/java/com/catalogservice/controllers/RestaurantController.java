package com.catalogservice.controllers;

import com.catalogservice.dtos.RestaurantRequest;
import com.catalogservice.dtos.RestaurantResponse;
import com.catalogservice.services.RestaurantService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/restaurants")
@RequiredArgsConstructor
public class RestaurantController {

    private final RestaurantService restaurantService;

    @PostMapping
    public ResponseEntity<RestaurantResponse> creer(@Valid @RequestBody RestaurantRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(restaurantService.creer(request));
    }

    @GetMapping
    public ResponseEntity<List<RestaurantResponse>> listerTous() {
        return ResponseEntity.ok(restaurantService.listerActifs());
    }

    @GetMapping("/{id}")
    public ResponseEntity<RestaurantResponse> getById(@PathVariable Long id) {
        return ResponseEntity.ok(restaurantService.getById(id));
    }

    @GetMapping("/ville/{ville}")
    public ResponseEntity<List<RestaurantResponse>> getByVille(@PathVariable String ville) {
        return ResponseEntity.ok(restaurantService.getByVille(ville));
    }

    @GetMapping("/categorie/{categorieId}")
    public ResponseEntity<List<RestaurantResponse>> getByCategorie(@PathVariable Long categorieId) {
        return ResponseEntity.ok(restaurantService.getByCategorie(categorieId));
    }

    @GetMapping("/recherche")
    public ResponseEntity<List<RestaurantResponse>> rechercher(@RequestParam String nom) {
        return ResponseEntity.ok(restaurantService.rechercher(nom));
    }

    @PutMapping("/{id}")
    public ResponseEntity<RestaurantResponse> modifier(
            @PathVariable Long id,
            @Valid @RequestBody RestaurantRequest request) {
        return ResponseEntity.ok(restaurantService.modifier(id, request));
    }

    @PatchMapping("/{id}/toggle-actif")
    public ResponseEntity<RestaurantResponse> toggleActif(@PathVariable Long id) {
        return ResponseEntity.ok(restaurantService.toggleActif(id));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> supprimer(@PathVariable Long id) {
        restaurantService.supprimer(id);
        return ResponseEntity.noContent().build();
    }
}