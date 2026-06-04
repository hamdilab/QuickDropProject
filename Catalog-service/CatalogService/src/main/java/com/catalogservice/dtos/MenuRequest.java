package com.catalogservice.dtos;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MenuRequest {

    @NotBlank(message = "Le nom du menu est obligatoire")
    private String nom;

    private String description;
    private String imageUrl;

    @NotNull(message = "Le restaurant est obligatoire")
    private Long restaurantId;
}
