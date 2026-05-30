package com.catalogservice.Repositories;

import com.catalogservice.Entities.Produit;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ProduitRepository extends JpaRepository<Produit, Long> {

    // Produits d'un menu
    List<Produit> findByMenuId(Long menuId);

    // Produits disponibles d'un menu
    List<Produit> findByMenuIdAndDisponibleTrue(Long menuId);

    // Produits par fourchette de prix
    List<Produit> findByPrixBetween(Double prixMin, Double prixMax);

    // Produits disponibles par fourchette de prix
    List<Produit> findByDisponibleTrueAndPrixBetween(Double prixMin, Double prixMax);

    // Recherche par nom
    List<Produit> findByNomContainingIgnoreCase(String nom);

    // Produits d'un restaurant via son menu
    @Query("SELECT p FROM Produit p WHERE p.menu.restaurant.id = :restaurantId AND p.disponible = true")
    List<Produit> findDisponiblesByRestaurantId(@Param("restaurantId") Long restaurantId);
}
