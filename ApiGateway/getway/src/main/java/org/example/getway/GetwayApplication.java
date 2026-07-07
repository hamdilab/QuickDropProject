package org.example.getway;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.client.discovery.EnableDiscoveryClient;
import org.springframework.cloud.gateway.route.RouteLocator;
import org.springframework.cloud.gateway.route.builder.RouteLocatorBuilder;
import org.springframework.context.annotation.Bean;

@SpringBootApplication
@EnableDiscoveryClient
public class GetwayApplication {

    public static void main(String[] args) {
        SpringApplication.run(GetwayApplication.class, args);
    }

    @Bean
    public RouteLocator gatewayRoutes(RouteLocatorBuilder builder) {
        return builder.routes()
                .route("Candidat", r -> r.path("/candidats/**")
                        .uri("lb://Candidat"))
                .route("Job", r -> r.path("/jobs/**")
                        .uri("lb://Job"))
                .route("User", r -> r.path("/api/users/**")
                        .uri("lb://user"))
                .route("Profil", r -> r.path("/api/profils/**")
                        .uri("lb://user"))
                .route("Livreur", r -> r.path("/api/livreurs/**")
                        .uri("lb://user"))
                .route("catalog-service", r -> r.path("/api/v1/catalog/**")
                        .filters(f -> f.stripPrefix(2))
                        .uri("lb://CATALOG-SERVICE"))
                .route("delivery-service", r -> r.path("/delivery-service/**")
                        .filters(f -> f.stripPrefix(1)
                                .dedupeResponseHeader("Access-Control-Allow-Origin", "RETAIN_FIRST")
                                .dedupeResponseHeader("Access-Control-Allow-Credentials", "RETAIN_FIRST"))
                        .uri("lb://DELIVERY-SERVICE"))
                .build();
    }
}