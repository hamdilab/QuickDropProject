package com.quickdrop.tracking.client;

import com.quickdrop.tracking.client.dto.UserResponseDTO;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

/**
 * Feign Client for User Service communication.
 * Used to validate drivers and fetch user information.
 */
@FeignClient(name = "user", url = "http://localhost:8082")
public interface UserClient {

    /**
     * Get user by ID from User Service.
     * Used to validate if a driver exists.
     *
     * @param userId The user ID
     * @return UserResponseDTO if user exists
     */
    @GetMapping("/api/users/{id}")
    UserResponseDTO getUserById(@PathVariable("id") Long userId);

    /**
     * Check if user exists by ID.
     *
     * @param userId The user ID
     * @return true if user exists
     */
    @GetMapping("/api/users/{id}/exists")
    boolean userExists(@PathVariable("id") Long userId);
}
