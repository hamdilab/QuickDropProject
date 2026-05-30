package com.catalogservice.Repositories;

import com.catalogservice.Entities.Categorie;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CategorieRepository extends JpaRepository<Categorie, Long> {

    // Chercher par nom exact
    Optional<Categorie> findByNom(String nom);

    // Vérifier si une catégorie existe
    boolean existsByNom(String nom);

    // Recherche par nom (contient)
    List<Categorie> findByNomContainingIgnoreCase(String nom);
}
