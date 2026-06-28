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