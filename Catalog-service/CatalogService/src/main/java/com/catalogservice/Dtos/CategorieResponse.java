package com.catalogservice.Dtos;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CategorieResponse {

    private Long id;
    private String nom;
    private String description;
    private String imageUrl;
}
