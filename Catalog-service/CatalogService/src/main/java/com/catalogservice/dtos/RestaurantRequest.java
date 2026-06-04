package com.catalogservice.dtos;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RestaurantRequest {

    @NotBlank(message = "Le nom est obligatoire")
    private String nom;

    @NotBlank(message = "L'adresse est obligatoire")
    private String adresse;

    @NotBlank(message = "La ville est obligatoire")
    private String ville;

    @Pattern(regexp = "^[0-9]{8}$", message = "Numéro invalide")
    private String telephone;

    @Email(message = "Email invalide")
    private String email;

    private String description;
    private String imageUrl;
    private Long categorieId;
    private Long vendeurId;
}
