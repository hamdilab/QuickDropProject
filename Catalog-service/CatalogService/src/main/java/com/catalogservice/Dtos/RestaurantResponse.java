package com.catalogservice.Dtos;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RestaurantResponse {

    private Long id;
    private String nom;
    private String adresse;
    private String ville;
    private String telephone;
    private String email;
    private String description;
    private String imageUrl;
    private boolean actif;
    private double note;
    private Long vendeurId;
    private String categorieNom;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
