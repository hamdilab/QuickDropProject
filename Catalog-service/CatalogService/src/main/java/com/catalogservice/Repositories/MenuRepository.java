package com.catalogservice.Repositories;

import com.catalogservice.Entities.Menu;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface MenuRepository extends JpaRepository<Menu, Long> {

    // Tous les menus d'un restaurant
    List<Menu> findByRestaurantId(Long restaurantId);

    // Menus actifs d'un restaurant
    List<Menu> findByRestaurantIdAndActifTrue(Long restaurantId);

    // Vérifier si un menu existe pour un restaurant
    boolean existsByNomAndRestaurantId(String nom, Long restaurantId);
}
