package com.catalogservice.controllers;

import com.catalogservice.dtos.IngredientRequest;
import com.catalogservice.dtos.IngredientResponse;
import com.catalogservice.services.IngredientService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/ingredients")
@RequiredArgsConstructor
public class IngredientController {

    private final IngredientService ingredientService;

    @PostMapping
    public ResponseEntity<IngredientResponse> creer(@Valid @RequestBody IngredientRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(ingredientService.creer(request));
    }

    @GetMapping
    public ResponseEntity<List<IngredientResponse>> listerTous() {
        return ResponseEntity.ok(ingredientService.listerTous());
    }

    @GetMapping("/allergenes")
    public ResponseEntity<List<IngredientResponse>> listerAllergenes() {
        return ResponseEntity.ok(ingredientService.listerAllergenes());
    }

    @GetMapping("/{id}")
    public ResponseEntity<IngredientResponse> getById(@PathVariable Long id) {
        return ResponseEntity.ok(ingredientService.getById(id));
    }

    @PutMapping("/{id}")
    public ResponseEntity<IngredientResponse> modifier(
            @PathVariable Long id,
            @Valid @RequestBody IngredientRequest request) {
        return ResponseEntity.ok(ingredientService.modifier(id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> supprimer(@PathVariable Long id) {
        ingredientService.supprimer(id);
        return ResponseEntity.noContent().build();
    }
}
