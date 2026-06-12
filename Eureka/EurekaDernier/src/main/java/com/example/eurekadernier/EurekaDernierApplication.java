package com.example.eurekadernier;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.netflix.eureka.server.EnableEurekaServer;

@SpringBootApplication
@EnableEurekaServer
public class EurekaDernierApplication {

    public static void main(String[] args) {
        SpringApplication.run(EurekaDernierApplication.class, args);
    }

}
