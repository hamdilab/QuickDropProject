package com.catalogservice.services;

import com.catalogservice.dtos.IngredientRequest;
import com.catalogservice.dtos.IngredientResponse;
import com.catalogservice.entities.Ingredient;
import com.catalogservice.exceptions.ResourceNotFoundException;
import com.catalogservice.repositories.IngredientRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class IngredientService {

    private final IngredientRepository ingredientRepository;

    public IngredientResponse creer(IngredientRequest request) {
        if (ingredientRepository.existsByNom(request.getNom())) {
            throw new IllegalArgumentException("Cet ingrédient existe déjà");
        }
        Ingredient ingredient = Ingredient.builder()
                .nom(request.getNom())
                .description(request.getDescription())
                .allergene(request.isAllergene())
                .build();
        return toResponse(ingredientRepository.save(ingredient));
    }

    public List<IngredientResponse> listerTous() {
        return ingredientRepository.findAll()
                .stream().map(this::toResponse).collect(Collectors.toList());
    }

    public List<IngredientResponse> listerAllergenes() {
        return ingredientRepository.findByAllergeneTrue()
                .stream().map(this::toResponse).collect(Collectors.toList());
    }

    public IngredientResponse getById(Long id) {
        return toResponse(ingredientRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Ingrédient introuvable")));
    }

    public IngredientResponse modifier(Long id, IngredientRequest request) {
        Ingredient ingredient = ingredientRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Ingrédient introuvable"));
        ingredient.setNom(request.getNom());
        ingredient.setDescription(request.getDescription());
        ingredient.setAllergene(request.isAllergene());
        return toResponse(ingredientRepository.save(ingredient));
    }

    public void supprimer(Long id) {
        if (!ingredientRepository.existsById(id)) {
            throw new ResourceNotFoundException("Ingrédient introuvable");
        }
        ingredientRepository.deleteById(id);
    }

    private IngredientResponse toResponse(Ingredient i) {
        return IngredientResponse.builder()
                .id(i.getId()).nom(i.getNom())
                .description(i.getDescription()).allergene(i.isAllergene())
                .build();
    }
}
