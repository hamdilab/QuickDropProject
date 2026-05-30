package com.catalogservice.Repositories;

import com.catalogservice.Entities.Ingredient;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface IngredientRepository extends JpaRepository<Ingredient, Long> {

    // Chercher par nom exact
    Optional<Ingredient> findByNom(String nom);

    // Vérifier si un ingrédient existe
    boolean existsByNom(String nom);

    // Tous les allergènes
    List<Ingredient> findByAllergeneTrue();

    // Recherche par nom
    List<Ingredient> findByNomContainingIgnoreCase(String nom);
}
