package com.quickdrop.tracking.controllers;

import com.quickdrop.tracking.dto.ETAResquestDTO;
import com.quickdrop.tracking.dto.ETAResponseDTO;
import com.quickdrop.tracking.services.ETAService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

/**
 * REST Controller for ETA (Estimated Time of Arrival) calculations.
 */
@Slf4j
@RestController
@RequestMapping("/api/v1/eta")
@RequiredArgsConstructor
@Tag(name = "ETA Calculation", description = "APIs for calculating Estimated Time of Arrival")
public class ETAController {

    private final ETAService etaService;

    @PostMapping("/calculate")
    @Operation(summary = "Calculate ETA", description = "Calculate ETA between current location and destination")
    public ResponseEntity<ETAResponseDTO> calculateETA(@RequestBody ETAResquestDTO requestDTO) {

        ETAResponseDTO response = etaService.calculateETA(
                requestDTO.getCurrentLongitude(),
                requestDTO.getCurrentLatitude(),
                requestDTO.getDestinationLongitude(),
                requestDTO.getDestinationLatitude(),
                requestDTO.getDriverId()
        );

        return ResponseEntity.ok(response);
    }

    @GetMapping("/driver/{driverId}")
    @Operation(summary = "Calculate ETA from driver location", description = "Calculate ETA from driver's current location to destination")
    public ResponseEntity<ETAResponseDTO> calculateETAFromDriverLocation(
            @PathVariable String driverId,
            @RequestParam Double destinationLongitude,
            @RequestParam Double destinationLatitude) {

        try {
            ETAResponseDTO response = etaService.calculateETAFromCurrentLocation(
                    driverId,
                    destinationLongitude,
                    destinationLatitude
            );
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @GetMapping("/distance")
    @Operation(summary = "Calculate distance", description = "Calculate distance between two points")
    public ResponseEntity<Double> calculateDistance(
            @RequestParam Double originLongitude,
            @RequestParam Double originLatitude,
            @RequestParam Double destinationLongitude,
            @RequestParam Double destinationLatitude) {

        double distance = etaService.calculateDistance(
                originLongitude,
                originLatitude,
                destinationLongitude,
                destinationLatitude
        );

        return ResponseEntity.ok(distance);
    }
}
