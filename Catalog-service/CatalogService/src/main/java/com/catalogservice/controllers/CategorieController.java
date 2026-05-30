package com.catalogservice.controllers;

import com.catalogservice.dtos.CategorieRequest;
import com.catalogservice.dtos.CategorieResponse;
import com.catalogservice.services.CategorieService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/categories")
@RequiredArgsConstructor
public class CategorieController {

    private final CategorieService categorieService;

    @PostMapping
    public ResponseEntity<CategorieResponse> creer(@Valid @RequestBody CategorieRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(categorieService.creer(request));
    }

    @GetMapping
    public ResponseEntity<List<CategorieResponse>> listerTous() {
        return ResponseEntity.ok(categorieService.listerTous());
    }

    @GetMapping("/{id}")
    public ResponseEntity<CategorieResponse> getById(@PathVariable Long id) {
        return ResponseEntity.ok(categorieService.getById(id));
    }

    @PutMapping("/{id}")
    public ResponseEntity<CategorieResponse> modifier(
            @PathVariable Long id,
            @Valid @RequestBody CategorieRequest request) {
        return ResponseEntity.ok(categorieService.modifier(id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> supprimer(@PathVariable Long id) {
        categorieService.supprimer(id);
        return ResponseEntity.noContent().build();
    }
}
