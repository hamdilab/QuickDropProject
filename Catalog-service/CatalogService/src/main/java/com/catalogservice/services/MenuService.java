package com.catalogservice.services;

import com.catalogservice.dtos.MenuRequest;
import com.catalogservice.dtos.MenuResponse;
import com.catalogservice.entities.Menu;
import com.catalogservice.entities.Restaurant;
import com.catalogservice.exceptions.ResourceNotFoundException;
import com.catalogservice.repositories.MenuRepository;
import com.catalogservice.repositories.RestaurantRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class MenuService {

    private final MenuRepository menuRepository;
    private final RestaurantRepository restaurantRepository;

    // CREATE
    public MenuResponse creer(MenuRequest request) {
        Restaurant restaurant = restaurantRepository.findById(request.getRestaurantId())
                .orElseThrow(() -> new ResourceNotFoundException("Restaurant introuvable"));

        if (menuRepository.existsByNomAndRestaurantId(request.getNom(), request.getRestaurantId())) {
            throw new IllegalArgumentException("Ce menu existe déjà pour ce restaurant");
        }

        Menu menu = Menu.builder()
                .nom(request.getNom())
                .description(request.getDescription())
                .imageUrl(request.getImageUrl())
                .actif(true)
                .restaurant(restaurant)
                .build();

        return toResponse(menuRepository.save(menu));
    }

    // READ ALL BY RESTAURANT
    public List<MenuResponse> getByRestaurant(Long restaurantId) {
        return menuRepository.findByRestaurantIdAndActifTrue(restaurantId)
                .stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    // READ BY ID
    public MenuResponse getById(Long id) {
        Menu menu = menuRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Menu introuvable avec id : " + id));
        return toResponse(menu);
    }

    // UPDATE
    public MenuResponse modifier(Long id, MenuRequest request) {
        Menu menu = menuRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Menu introuvable avec id : " + id));

        menu.setNom(request.getNom());
        menu.setDescription(request.getDescription());
        menu.setImageUrl(request.getImageUrl());

        return toResponse(menuRepository.save(menu));
    }

    // ACTIVER / DESACTIVER
    public MenuResponse toggleActif(Long id) {
        Menu menu = menuRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Menu introuvable avec id : " + id));
        menu.setActif(!menu.isActif());
        return toResponse(menuRepository.save(menu));
    }

    // DELETE
    public void supprimer(Long id) {
        if (!menuRepository.existsById(id)) {
            throw new ResourceNotFoundException("Menu introuvable avec id : " + id);
        }
        menuRepository.deleteById(id);
    }

    // MAPPER
    private MenuResponse toResponse(Menu m) {
        return MenuResponse.builder()
                .id(m.getId())
                .nom(m.getNom())
                .description(m.getDescription())
                .imageUrl(m.getImageUrl())
                .actif(m.isActif())
                .restaurantId(m.getRestaurant().getId())
                .restaurantNom(m.getRestaurant().getNom())
                .createdAt(m.getCreatedAt())
                .updatedAt(m.getUpdatedAt())
                .build();
    }
}
