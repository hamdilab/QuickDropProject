package com.catalogservice.dtos;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MenuResponse {

    private Long id;
    private String nom;
    private String description;
    private String imageUrl;
    private boolean actif;
    private Long restaurantId;
    private String restaurantNom;
    private List<ProduitResponse> produits;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
