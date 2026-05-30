package com.catalogservice.services;

import com.catalogservice.dtos.ProduitRequest;
import com.catalogservice.dtos.ProduitResponse;
import com.catalogservice.entities.Ingredient;
import com.catalogservice.entities.Menu;
import com.catalogservice.entities.Produit;
import com.catalogservice.exceptions.ResourceNotFoundException;
import com.catalogservice.repositories.IngredientRepository;
import com.catalogservice.repositories.MenuRepository;
import com.catalogservice.repositories.ProduitRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ProduitService {

    private final ProduitRepository produitRepository;
    private final MenuRepository menuRepository;
    private final IngredientRepository ingredientRepository;

    // CREATE
    public ProduitResponse creer(ProduitRequest request) {
        Menu menu = menuRepository.findById(request.getMenuId())
                .orElseThrow(() -> new ResourceNotFoundException("Menu introuvable"));

        List<Ingredient> ingredients = ingredientRepository
                .findAllById(request.getIngredientIds());

        Produit produit = Produit.builder()
                .nom(request.getNom())
                .description(request.getDescription())
                .prix(request.getPrix())
                .imageUrl(request.getImageUrl())
                .calories(request.getCalories())
                .disponible(true)
                .menu(menu)
                .ingredients(ingredients)
                .build();

        return toResponse(produitRepository.save(produit));
    }

    // READ BY MENU
    public List<ProduitResponse> getByMenu(Long menuId) {
        return produitRepository.findByMenuId(menuId)
                .stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    // READ DISPONIBLES BY MENU
    public List<ProduitResponse> getDisponiblesByMenu(Long menuId) {
        return produitRepository.findByMenuIdAndDisponibleTrue(menuId)
                .stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    // READ BY ID
    public ProduitResponse getById(Long id) {
        return toResponse(produitRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Produit introuvable avec id : " + id)));
    }

    // UPDATE
    public ProduitResponse modifier(Long id, ProduitRequest request) {
        Produit produit = produitRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Produit introuvable avec id : " + id));

        List<Ingredient> ingredients = ingredientRepository
                .findAllById(request.getIngredientIds());

        produit.setNom(request.getNom());
        produit.setDescription(request.getDescription());
        produit.setPrix(request.getPrix());
        produit.setImageUrl(request.getImageUrl());
        produit.setCalories(request.getCalories());
        produit.setIngredients(ingredients);

        return toResponse(produitRepository.save(produit));
    }

    // CHANGER PRIX
    public ProduitResponse changerPrix(Long id, Double nouveauPrix) {
        Produit produit = produitRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Produit introuvable avec id : " + id));
        produit.setPrix(nouveauPrix);
        return toResponse(produitRepository.save(produit));
    }

    // TOGGLE DISPONIBILITE
    public ProduitResponse toggleDisponibilite(Long id) {
        Produit produit = produitRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Produit introuvable avec id : " + id));
        produit.setDisponible(!produit.isDisponible());
        return toResponse(produitRepository.save(produit));
    }

    // DELETE
    public void supprimer(Long id) {
        if (!produitRepository.existsById(id)) {
            throw new ResourceNotFoundException("Produit introuvable avec id : " + id);
        }
        produitRepository.deleteById(id);
    }

    // MAPPER
    private ProduitResponse toResponse(Produit p) {
        return ProduitResponse.builder()
                .id(p.getId())
                .nom(p.getNom())
                .description(p.getDescription())
                .prix(p.getPrix())
                .disponible(p.isDisponible())
                .imageUrl(p.getImageUrl())
                .calories(p.getCalories())
                .menuId(p.getMenu().getId())
                .menuNom(p.getMenu().getNom())
                .ingredients(p.getIngredients().stream()
                        .map(Ingredient::getNom)
                        .collect(Collectors.toList()))
                .createdAt(p.getCreatedAt())
                .updatedAt(p.getUpdatedAt())
                .build();
    }
}
