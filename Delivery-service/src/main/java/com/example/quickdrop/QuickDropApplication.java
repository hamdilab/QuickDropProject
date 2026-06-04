package com.example.quickdrop;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.persistence.autoconfigure.EntityScan;
import org.springframework.cloud.client.discovery.EnableDiscoveryClient;
import org.springframework.context.annotation.ComponentScan;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;

@SpringBootApplication
@EntityScan(basePackages = {"Models"})
@EnableJpaRepositories(basePackages = {"Repositories"})
@ComponentScan(basePackages = {"com.example.quickdrop", "Controllers", "Service", "Repositories"})
@EnableDiscoveryClient
public class QuickDropApplication {

    public static void main(String[] args) {
        SpringApplication.run(QuickDropApplication.class, args);
    }

}
