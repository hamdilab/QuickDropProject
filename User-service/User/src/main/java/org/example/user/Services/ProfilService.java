package org.example.user.Services;

import lombok.RequiredArgsConstructor;
import org.example.user.Entities.Adresse;
import org.example.user.Entities.Profil;
import org.example.user.Entities.User;
import org.example.user.repositories.AdresseRepository;
import org.example.user.repositories.ProfilRepository;
import org.example.user.repositories.UserRepository;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class ProfilService {

    private final ProfilRepository profilRepository;
    private final UserRepository userRepository;
    private final AdresseRepository adresseRepository;

    public Profil creerProfil(Profil profil) {
        if (profil.getUser() != null && profil.getUser().getId() != null) {
            User user = userRepository.findById(profil.getUser().getId())
                    .orElseThrow(() -> new RuntimeException("User non trouvé"));
            profil.setUser(user);
        }
        return profilRepository.save(profil);
    }

    public Profil getProfilParUserId(Long userId) {
        return profilRepository.findByUserId(userId)
                .orElseThrow(() -> new RuntimeException("Profil non trouvé"));
    }

    public Profil modifier(Long userId, Profil profilModifie) {
        Profil profil = getProfilParUserId(userId);
        profil.setTelephone(profilModifie.getTelephone());
        profil.setPhoto(profilModifie.getPhoto());
        if (profilModifie.getAdresse() != null) {
            Adresse adresse = profilModifie.getAdresse();
            if (adresse.getId() != null) {
                adresse = adresseRepository.findById(adresse.getId())
                        .orElseThrow(() -> new RuntimeException("Adresse non trouvée"));
            }
            profil.setAdresse(adresse);
        }
        return profilRepository.save(profil);
    }
}