package com.example.quickdrop.Clients;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

@FeignClient(name = "ORDER-SERVICE")
public interface CommandeFeignClient {

    @GetMapping("/api/commandes/{id}")
    Object getCommandeById(@PathVariable("id") Long id);
}