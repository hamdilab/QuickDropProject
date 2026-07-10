package com.quickdrop.tracking.controllers;

import com.quickdrop.tracking.dto.DriverLocationDTO;
import com.quickdrop.tracking.dto.DriverLocationResponseDTO;
import com.quickdrop.tracking.dto.NearbyDriversRequestDTO;
import com.quickdrop.tracking.dto.NearbyDriversResponseDTO;
import com.quickdrop.tracking.services.DriverLocationService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * REST Controller for driver location management.
 * Provides endpoints for real-time driver tracking.
 */
@Slf4j
@RestController
@RequestMapping("/api/v1/drivers")
@RequiredArgsConstructor
@Tag(name = "Driver Location", description = "APIs for managing driver locations")
public class DriverLocationController {

    private final DriverLocationService driverLocationService;

    @PostMapping("/location")
    @Operation(summary = "Update driver location", description = "Update or create a driver's current location")
    public ResponseEntity<DriverLocationResponseDTO> updateDriverLocation(
            @Valid @RequestBody DriverLocationDTO locationDTO) {

        DriverLocationResponseDTO response = driverLocationService.updateDriverLocation(locationDTO);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/{driverId}/location")
    @Operation(summary = "Get driver location", description = "Get the current location of a specific driver")
    public ResponseEntity<DriverLocationResponseDTO> getDriverLocation(@PathVariable String driverId) {

        try {
            DriverLocationResponseDTO response = driverLocationService.getDriverLocation(driverId);
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @PostMapping("/nearby")
    @Operation(summary = "Find nearby drivers", description = "Find all drivers within a specified radius")
    public ResponseEntity<NearbyDriversResponseDTO> findNearbyDrivers(
            @Valid @RequestBody NearbyDriversRequestDTO requestDTO) {

        List<DriverLocationResponseDTO> nearbyDrivers = driverLocationService.findNearbyDrivers(
                requestDTO.getLongitude(),
                requestDTO.getLatitude(),
                requestDTO.getRadiusMeters()
        );

        NearbyDriversResponseDTO response = new NearbyDriversResponseDTO();
        response.setNearbyDrivers(nearbyDrivers);
        response.setTotalFound(nearbyDrivers.size());
        response.setSearchRadiusKm(requestDTO.getRadiusMeters() / 1000.0);
        response.setCenterLongitude(requestDTO.getLongitude());
        response.setCenterLatitude(requestDTO.getLatitude());

        return ResponseEntity.ok(response);
    }

    @GetMapping("/status/{status}")
    @Operation(summary = "Get drivers by status", description = "Get all drivers with a specific status")
    public ResponseEntity<List<DriverLocationResponseDTO>> getDriversByStatus(@PathVariable String status) {

        List<DriverLocationResponseDTO> drivers = driverLocationService.getDriversByStatus(status);
        return ResponseEntity.ok(drivers);
    }

    @PutMapping("/{driverId}/status")
    @Operation(summary = "Update driver status", description = "Update the status of a driver")
    public ResponseEntity<DriverLocationResponseDTO> updateDriverStatus(
            @PathVariable String driverId,
            @RequestParam String status) {

        try {
            DriverLocationResponseDTO response = driverLocationService.updateDriverStatus(driverId, status);
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @GetMapping("/{driverId}/distance")
    @Operation(summary = "Calculate distance", description = "Calculate distance between two points")
    public ResponseEntity<Double> calculateDistance(
            @PathVariable String driverId,
            @RequestParam Double targetLongitude,
            @RequestParam Double targetLatitude) {

        try {
            DriverLocationResponseDTO driverLocation = driverLocationService.getDriverLocation(driverId);
            double distance = driverLocationService.calculateDistance(
                    driverLocation.getLongitude(),
                    driverLocation.getLatitude(),
                    targetLongitude,
                    targetLatitude
            );
            return ResponseEntity.ok(distance);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @GetMapping("/all")
    @Operation(summary = "Get all drivers", description = "Get current location of all drivers in the system")
    public ResponseEntity<List<DriverLocationResponseDTO>> getAllDrivers() {
        List<DriverLocationResponseDTO> allDrivers = driverLocationService.getAllDrivers();
        return ResponseEntity.ok(allDrivers);
    }
}
