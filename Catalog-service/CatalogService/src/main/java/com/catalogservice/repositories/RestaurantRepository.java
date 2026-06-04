package com.catalogservice.repositories;

import com.catalogservice.entities.Restaurant;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface RestaurantRepository extends JpaRepository<Restaurant, Long> {

    // Filtrer par ville
    List<Restaurant> findByVille(String ville);

    // Filtrer par catégorie
    List<Restaurant> findByCategorieId(Long categorieId);

    // Filtrer par ville ET catégorie
    List<Restaurant> findByVilleAndCategorieId(String ville, Long categorieId);

    // Seulement les restaurants actifs
    List<Restaurant> findByActifTrue();

    // Recherche par nom
    List<Restaurant> findByNomContainingIgnoreCase(String nom);

    // Restaurants actifs d'une ville
    List<Restaurant> findByVilleAndActifTrue(String ville);

    // Restaurants avec une note >= seuil
    @Query("SELECT r FROM Restaurant r WHERE r.note >= :note AND r.actif = true")
    List<Restaurant> findByNoteMinimumAndActif(@Param("note") double note);
}
