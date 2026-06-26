package org.example.user.controllers;

import lombok.RequiredArgsConstructor;
import org.example.user.Entities.User;
import org.example.user.Services.UserService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    @PostMapping
    public ResponseEntity<User> creer(@RequestBody User user) {
        return ResponseEntity.status(HttpStatus.CREATED).body(userService.creerUser(user));
    }

    @GetMapping
    public ResponseEntity<List<User>> listerTous() {
        return ResponseEntity.ok(userService.listerTous());
    }

    @GetMapping("/{id}")
    public ResponseEntity<User> trouverParId(@PathVariable Long id) {
        return ResponseEntity.ok(userService.trouverParId(id));
    }

    @PutMapping("/{id}")
    public ResponseEntity<User> modifier(@PathVariable Long id, @RequestBody User user) {
        return ResponseEntity.ok(userService.modifier(id, user));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> supprimer(@PathVariable Long id) {
        userService.supprimer(id);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/sync-keycloak")
    public ResponseEntity<String> syncKeycloak() {
        String result = userService.syncAllToKeycloak();
        return ResponseEntity.ok(result);
    }
}