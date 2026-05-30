package com.catalogservice.services;

import com.catalogservice.dtos.RestaurantRequest;
import com.catalogservice.dtos.RestaurantResponse;
import com.catalogservice.entities.Categorie;
import com.catalogservice.entities.Restaurant;
import com.catalogservice.exceptions.ResourceNotFoundException;
import com.catalogservice.repositories.CategorieRepository;
import com.catalogservice.repositories.RestaurantRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class RestaurantService {

    private final RestaurantRepository restaurantRepository;
    private final CategorieRepository categorieRepository;

    // CREATE
    public RestaurantResponse creer(RestaurantRequest request) {
        Categorie categorie = null;
        if (request.getCategorieId() != null) {
            categorie = categorieRepository.findById(request.getCategorieId())
                    .orElseThrow(() -> new ResourceNotFoundException("Catégorie introuvable"));
        }

        Restaurant restaurant = Restaurant.builder()
                .nom(request.getNom())
                .adresse(request.getAdresse())
                .ville(request.getVille())
                .telephone(request.getTelephone())
                .email(request.getEmail())
                .description(request.getDescription())
                .imageUrl(request.getImageUrl())
                .vendeurId(request.getVendeurId())
                .categorie(categorie)
                .actif(true)
                .note(0.0)
                .build();

        return toResponse(restaurantRepository.save(restaurant));
    }

    // READ ALL
    public List<RestaurantResponse> listerTous() {
        return restaurantRepository.findAll()
                .stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    // READ ALL ACTIFS
    public List<RestaurantResponse> listerActifs() {
        return restaurantRepository.findByActifTrue()
                .stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    // READ BY ID
    public RestaurantResponse getById(Long id) {
        Restaurant restaurant = restaurantRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Restaurant introuvable avec id : " + id));
        return toResponse(restaurant);
    }

    // READ BY VILLE
    public List<RestaurantResponse> getByVille(String ville) {
        return restaurantRepository.findByVilleAndActifTrue(ville)
                .stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    // READ BY CATEGORIE
    public List<RestaurantResponse> getByCategorie(Long categorieId) {
        return restaurantRepository.findByCategorieId(categorieId)
                .stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    // SEARCH BY NOM
    public List<RestaurantResponse> rechercher(String nom) {
        return restaurantRepository.findByNomContainingIgnoreCase(nom)
                .stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    // UPDATE
    public RestaurantResponse modifier(Long id, RestaurantRequest request) {
        Restaurant restaurant = restaurantRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Restaurant introuvable avec id : " + id));

        if (request.getCategorieId() != null) {
            Categorie categorie = categorieRepository.findById(request.getCategorieId())
                    .orElseThrow(() -> new ResourceNotFoundException("Catégorie introuvable"));
            restaurant.setCategorie(categorie);
        }

        restaurant.setNom(request.getNom());
        restaurant.setAdresse(request.getAdresse());
        restaurant.setVille(request.getVille());
        restaurant.setTelephone(request.getTelephone());
        restaurant.setEmail(request.getEmail());
        restaurant.setDescription(request.getDescription());
        restaurant.setImageUrl(request.getImageUrl());

        return toResponse(restaurantRepository.save(restaurant));
    }

    // ACTIVER / DESACTIVER
    public RestaurantResponse toggleActif(Long id) {
        Restaurant restaurant = restaurantRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Restaurant introuvable avec id : " + id));
        restaurant.setActif(!restaurant.isActif());
        return toResponse(restaurantRepository.save(restaurant));
    }

    // DELETE
    public void supprimer(Long id) {
        if (!restaurantRepository.existsById(id)) {
            throw new ResourceNotFoundException("Restaurant introuvable avec id : " + id);
        }
        restaurantRepository.deleteById(id);
    }

    // MAPPER entity -> DTO
    private RestaurantResponse toResponse(Restaurant r) {
        return RestaurantResponse.builder()
                .id(r.getId())
                .nom(r.getNom())
                .adresse(r.getAdresse())
                .ville(r.getVille())
                .telephone(r.getTelephone())
                .email(r.getEmail())
                .description(r.getDescription())
                .imageUrl(r.getImageUrl())
                .actif(r.isActif())
                .note(r.getNote())
                .vendeurId(r.getVendeurId())
                .categorieNom(r.getCategorie() != null ? r.getCategorie().getNom() : null)
                .createdAt(r.getCreatedAt())
                .updatedAt(r.getUpdatedAt())
                .build();
    }
}
