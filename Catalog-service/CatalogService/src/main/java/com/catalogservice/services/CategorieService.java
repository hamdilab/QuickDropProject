package com.catalogservice.services;

import com.catalogservice.dtos.CategorieRequest;
import com.catalogservice.dtos.CategorieResponse;
import com.catalogservice.entities.Categorie;
import com.catalogservice.exceptions.ResourceNotFoundException;
import com.catalogservice.repositories.CategorieRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CategorieService {

    private final CategorieRepository categorieRepository;

    public CategorieResponse creer(CategorieRequest request) {
        if (categorieRepository.existsByNom(request.getNom())) {
            throw new IllegalArgumentException("Cette catégorie existe déjà");
        }
        Categorie categorie = Categorie.builder()
                .nom(request.getNom())
                .description(request.getDescription())
                .imageUrl(request.getImageUrl())
                .build();
        return toResponse(categorieRepository.save(categorie));
    }

    public List<CategorieResponse> listerTous() {
        return categorieRepository.findAll()
                .stream().map(this::toResponse).collect(Collectors.toList());
    }

    public CategorieResponse getById(Long id) {
        return toResponse(categorieRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Catégorie introuvable")));
    }

    public CategorieResponse modifier(Long id, CategorieRequest request) {
        Categorie categorie = categorieRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Catégorie introuvable"));
        categorie.setNom(request.getNom());
        categorie.setDescription(request.getDescription());
        categorie.setImageUrl(request.getImageUrl());
        return toResponse(categorieRepository.save(categorie));
    }

    public void supprimer(Long id) {
        if (!categorieRepository.existsById(id)) {
            throw new ResourceNotFoundException("Catégorie introuvable");
        }
        categorieRepository.deleteById(id);
    }

    private CategorieResponse toResponse(Categorie c) {
        return CategorieResponse.builder()
                .id(c.getId()).nom(c.getNom())
                .description(c.getDescription()).imageUrl(c.getImageUrl())
                .build();
    }
}
