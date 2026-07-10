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
                .route("catalog-service", r -> r.path("/api/v1/catalog/**")
                        .filters(f -> f.stripPrefix(2))
                        .uri("lb://CATALOG-SERVICE"))
                .route("delivery-service", r -> r.path("/api/v1/delivery/**")
                        .filters(f -> f.stripPrefix(2))
                        .uri("lb://DELIVERY-SERVICE"))
                .route("order-service", r -> r.path("/order-service/**")
                        .filters(f -> f.stripPrefix(1)) // Supprime uniquement "/order-service"
                        .uri("lb://ORDER-SERVICE"))
                .build();
    }
}