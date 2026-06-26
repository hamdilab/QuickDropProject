package org.example.user.Services;

import lombok.RequiredArgsConstructor;
import org.example.user.Entities.Adresse;
import org.example.user.repositories.AdresseRepository;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AdresseService {

    private final AdresseRepository adresseRepository;

    public Adresse creerAdresse(Adresse adresse) {
        return adresseRepository.save(adresse);
    }
}