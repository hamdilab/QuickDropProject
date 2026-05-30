package com.catalogservice.controllers;

import com.catalogservice.dtos.MenuRequest;
import com.catalogservice.dtos.MenuResponse;
import com.catalogservice.services.MenuService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/menus")
@RequiredArgsConstructor
public class MenuController {

    private final MenuService menuService;

    @PostMapping
    public ResponseEntity<MenuResponse> creer(@Valid @RequestBody MenuRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(menuService.creer(request));
    }

    @GetMapping("/restaurant/{restaurantId}")
    public ResponseEntity<List<MenuResponse>> getByRestaurant(@PathVariable Long restaurantId) {
        return ResponseEntity.ok(menuService.getByRestaurant(restaurantId));
    }

    @GetMapping("/{id}")
    public ResponseEntity<MenuResponse> getById(@PathVariable Long id) {
        return ResponseEntity.ok(menuService.getById(id));
    }

    @PutMapping("/{id}")
    public ResponseEntity<MenuResponse> modifier(
            @PathVariable Long id,
            @Valid @RequestBody MenuRequest request) {
        return ResponseEntity.ok(menuService.modifier(id, request));
    }

    @PatchMapping("/{id}/toggle-actif")
    public ResponseEntity<MenuResponse> toggleActif(@PathVariable Long id) {
        return ResponseEntity.ok(menuService.toggleActif(id));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> supprimer(@PathVariable Long id) {
        menuService.supprimer(id);
        return ResponseEntity.noContent().build();
    }
}
