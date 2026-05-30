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
public class ProduitResponse {

    private Long id;
    private String nom;
    private String description;
    private Double prix;
    private boolean disponible;
    private String imageUrl;
    private Integer calories;
    private Long menuId;
    private String menuNom;
    private List<String> ingredients;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
