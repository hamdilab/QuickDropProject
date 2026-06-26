package org.example.user.Services;

import lombok.RequiredArgsConstructor;
import org.example.user.Entities.User;
import org.example.user.repositories.UserRepository;
import org.keycloak.admin.client.Keycloak;
import org.keycloak.admin.client.KeycloakBuilder;
import org.keycloak.representations.idm.CredentialRepresentation;
import org.keycloak.representations.idm.UserRepresentation;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import javax.ws.rs.core.Response;
import java.time.LocalDateTime;
import java.util.Collections;
import java.util.List;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;

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
        Keycloak keycloak = buildKeycloak();

        UserRepresentation kcUser = buildKcUser(user);
        Response response = keycloak.realm(realm).users().create(kcUser);

        if (response.getStatus() != 201 && response.getStatus() != 409) {
            throw new RuntimeException("Failed to create user in Keycloak, status: " + response.getStatus());
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

    public void supprimer(Long id) {
        userRepository.deleteById(id);
    }
}