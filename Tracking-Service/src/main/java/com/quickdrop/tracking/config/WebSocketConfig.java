package com.quickdrop.tracking.config;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.socket.config.annotation.EnableWebSocketMessageBroker;
import org.springframework.web.socket.config.annotation.StompEndpointRegistry;
import org.springframework.web.socket.config.annotation.WebSocketMessageBrokerConfigurer;

/**
 * WebSocket configuration for real-time location updates.
 * Enables STOMP protocol for messaging.
 */
@Slf4j
@Configuration
@EnableWebSocketMessageBroker
@RequiredArgsConstructor
public class WebSocketConfig implements WebSocketMessageBrokerConfigurer {

    @Override
    public void registerStompEndpoints(StompEndpointRegistry registry) {
        // Endpoint for WebSocket connection with SockJS fallback
        registry
            .addEndpoint("/ws-tracking")
            .setAllowedOriginPatterns("http://localhost:4200", "http://localhost:8080", "*")
            .withSockJS()
            .setHeartbeatTime(10000);

        // Endpoint for WebSocket without SockJS (pure WebSocket)
        registry
            .addEndpoint("/ws-tracking")
            .setAllowedOriginPatterns("http://localhost:4200", "http://localhost:8080", "*");
    }
}
