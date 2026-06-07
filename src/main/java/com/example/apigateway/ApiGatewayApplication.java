package com.example.apigateway;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.client.discovery.EnableDiscoveryClient;
import org.springframework.cloud.gateway.route.RouteLocator;
import org.springframework.cloud.gateway.route.builder.RouteLocatorBuilder;
import org.springframework.context.annotation.Bean;

@SpringBootApplication
@EnableDiscoveryClient
public class ApiGatewayApplication {

    public static void main(String[] args) {
        SpringApplication.run(ApiGatewayApplication.class, args);
    }

    @Bean
    public RouteLocator gatewayRoutes(RouteLocatorBuilder builder) {
        return builder.routes()
                // Route pour le Microservice Catalog
                .route("CatalogService", r -> r.path("/catalog/**")
                        .uri("lb://CatalogService"))

                // Route pour ton Microservice Delivery (ajuste le path et l'uri selon tes besoins exacts)
                .route("DeliveryService", r -> r.path("/deliveries/**", "/delivery/**")
                        .uri("lb://delivery-service"))

                .build();
    }
}