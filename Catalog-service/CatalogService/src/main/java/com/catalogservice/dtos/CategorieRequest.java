package com.catalogservice.dtos;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CategorieRequest {

    @NotBlank(message = "Le nom est obligatoire")
    private String nom;

    private String description;
    private String imageUrl;
}
