package org.example.user.Services;

import lombok.RequiredArgsConstructor;
import org.example.user.Entities.Profil;
import org.example.user.Entities.User;
import org.example.user.repositories.ProfilRepository;
import org.example.user.repositories.StatusLivreurRepository;
import org.example.user.repositories.UserRepository;
import org.keycloak.admin.client.Keycloak;
import org.keycloak.admin.client.KeycloakBuilder;
import org.keycloak.representations.idm.CredentialRepresentation;
import org.keycloak.representations.idm.UserRepresentation;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import javax.ws.rs.core.Response;
import java.time.LocalDateTime;
import java.util.Collections;
import java.util.List;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final ProfilRepository profilRepository;
    private final StatusLivreurRepository statusLivreurRepository;

    @Value("${keycloak.server-url}")
    private String serverUrl;

    @Value("${keycloak.realm}")
    private String realm;

    @Value("${keycloak.admin-username}")
    private String adminUsername;

    @Value("${keycloak.admin-password}")
    private String adminPassword;

    @Value("${keycloak.client-id}")
    private String clientId;

    public User creerUser(User user) {
        try {
            Keycloak keycloak = buildKeycloak();
            UserRepresentation kcUser = buildKcUser(user);
            Response response = keycloak.realm(realm).users().create(kcUser);
            if (response.getStatus() != 201 && response.getStatus() != 409) {
                System.err.println("Keycloak status code was: " + response.getStatus());
            }
        } catch (Exception e) {
            System.err.println("Failed to register user in Keycloak, continuing with DB save: " + e.getMessage());
        }

        user.setDateCreation(LocalDateTime.now());
        return userRepository.save(user);
    }

    public String syncAllToKeycloak() {
        Keycloak keycloak = buildKeycloak();
        List<User> users = userRepository.findAll();
        int synced = 0;
        int skipped = 0;

        for (User user : users) {
            try {
                UserRepresentation kcUser = buildKcUser(user);
                Response response = keycloak.realm(realm).users().create(kcUser);
                if (response.getStatus() == 201) {
                    synced++;
                } else if (response.getStatus() == 409) {
                    // Already exists in Keycloak — skip
                    skipped++;
                }
            } catch (Exception e) {
                skipped++;
            }
        }
        return "Sync complete: " + synced + " created, " + skipped + " already existed.";
    }

    private Keycloak buildKeycloak() {
        return KeycloakBuilder.builder()
                .serverUrl(serverUrl)
                .realm("master")
                .clientId(clientId)
                .username(adminUsername)
                .password(adminPassword)
                .build();
    }

    private UserRepresentation buildKcUser(User user) {
        CredentialRepresentation credential = new CredentialRepresentation();
        credential.setType(CredentialRepresentation.PASSWORD);
        credential.setValue(user.getPassword() != null ? user.getPassword() : "changeme123");
        credential.setTemporary(false);

        UserRepresentation kcUser = new UserRepresentation();
        kcUser.setUsername(user.getEmail());
        kcUser.setEmail(user.getEmail());
        kcUser.setFirstName(user.getPrenom());
        kcUser.setLastName(user.getNom());
        kcUser.setEnabled(true);
        kcUser.setCredentials(Collections.singletonList(credential));
        return kcUser;
    }

    public List<User> listerTous() {
        return userRepository.findAll();
    }

    public User trouverParId(Long id) {
        return userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User non trouvé"));
    }

    public User modifier(Long id, User userModifie) {
        User user = trouverParId(id);
        user.setNom(userModifie.getNom());
        user.setPrenom(userModifie.getPrenom());
        user.setEmail(userModifie.getEmail());
        user.setRole(userModifie.getRole());
        return userRepository.save(user);
    }

    @Transactional
    public void supprimer(Long id) {
        // 1. Delete livreur status if exists (FK constraint: status_livreur.user_id)
        statusLivreurRepository.findByUserId(id)
                .ifPresent(statusLivreurRepository::delete);

        // 2. Delete profil if exists (FK constraint: profils.user_id)
        profilRepository.findByUserId(id).ifPresent(profil -> {
            // Null out the user reference first to avoid cascade issues
            profil.setUser(null);
            profilRepository.save(profil);
            profilRepository.delete(profil);
        });

        // 3. Now safely delete the user
        userRepository.deleteById(id);
    }
}