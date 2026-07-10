package com.quickdrop.tracking.controllers;

import com.quickdrop.tracking.dto.DriverLocationDTO;
import com.quickdrop.tracking.dto.OrderTrackingDTO;
import com.quickdrop.tracking.services.DriverLocationService;
import com.quickdrop.tracking.services.OrderTrackingService;
import com.quickdrop.tracking.repositories.OrderTrackingRepository;
import com.quickdrop.tracking.repositories.DriverLocationRepository;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * Demo controller for testing the tracking system with a complete flow.
 * Simulates a full order delivery scenario.
 */
@Slf4j
@RestController
@RequestMapping("/api/v1/demo")
@RequiredArgsConstructor
@Tag(name = "Demo", description = "Demo endpoints for testing complete delivery flow")
public class DemoController {

    private final OrderTrackingService orderTrackingService;
    private final DriverLocationService driverLocationService;
    private final OrderTrackingRepository orderTrackingRepository;
    private final DriverLocationRepository driverLocationRepository;

    /**
     * Initialize a complete demo scenario:
     * - Restaurant has an order ready
     * - Driver is assigned and picks up the order
     * - Driver delivers to customer
     */
    @PostMapping("/start-delivery")
    @Operation(summary = "Start demo delivery", description = "Initialize a complete delivery scenario")
    public ResponseEntity<String> startDemoDelivery() {
        try {
            log.info("=== Starting Demo Delivery Scenario ===");
            
            // Clean up existing demo data
            orderTrackingRepository.deleteAll();
            driverLocationRepository.deleteByDriverIdIn(List.of("driver1", "driver2", "driver3"));

            // Step 1: Create/assign driver at restaurant (Tunis Centre)
            DriverLocationDTO driver = new DriverLocationDTO();
            driver.setDriverId("driver1");
            driver.setStatus("DELIVERING");
            driver.setSpeed(0.0);
            driver.setHeading(0);
            driver.setAccuracy(10.0);
            driver.setCurrentOrderId("DEMO-ORDER-001");
            // Tunis coordinates
            driver.setCoordinates(new DriverLocationDTO.Coordinates(10.1815, 36.8065));

            driverLocationService.updateDriverLocation(driver);
            log.info("Driver assigned at restaurant");

            // Step 2: Create order tracking
            OrderTrackingDTO order = new OrderTrackingDTO();
            order.setOrderId("DEMO-ORDER-001");
            order.setDriverId("driver1");
            order.setCustomerId("customer1");
            
            OrderTrackingDTO.LocationDTO restaurantLocation = new OrderTrackingDTO.LocationDTO(10.1815, 36.8065); // Tunis
            order.setRestaurantLocation(restaurantLocation);
            
            OrderTrackingDTO.LocationDTO customerLocation = new OrderTrackingDTO.LocationDTO(10.3250, 36.8775); // La Marsa
            order.setCustomerLocation(customerLocation);
            
            order.setCurrentDriverLocation(restaurantLocation);
            order.setStatus("PICKING_UP");
            order.setEstimatedArrivalMinutes(25);

            orderTrackingService.createOrderTracking(order);
            log.info("Order created with status: PICKING_UP");

            // Step 3: Mark as picked up
            orderTrackingService.markOrderAsPickedUp("DEMO-ORDER-001");
            log.info("Order picked up from restaurant");

            log.info("=== Demo Delivery Started Successfully ===");
            return ResponseEntity.ok("Demo delivery started! Order ID: DEMO-ORDER-001");

        } catch (Exception e) {
            log.error("Error starting demo delivery: {}", e.getMessage(), e);
            return ResponseEntity.internalServerError().body("Error: " + e.getMessage());
        }
    }

    /**
     * Simulate driver moving towards customer
     */
    @PostMapping("/simulate-progress/{step}")
    @Operation(summary = "Simulate delivery progress", description = "Move driver to next position in delivery")
    public ResponseEntity<String> simulateDeliveryProgress(@PathVariable String step) {
        try {
            log.info("=== Simulating Step: {} ===", step);

            double[] positions;
            Integer eta;

            switch (step) {
                case "1" -> {
                    // Leaving restaurant - Avenue Habib Bourguiba towards Sfax road
                    positions = new double[]{10.1850, 36.8100};
                    eta = 20;
                }
                case "2" -> {
                    // Midway - Near Manar area
                    positions = new double[]{10.2000, 36.8300};
                    eta = 12;
                }
                case "3" -> {
                    // Approaching La Marsa
                    positions = new double[]{10.2800, 36.8600};
                    eta = 5;
                }
                case "4" -> {
                    // At customer location - La Marsa Beach area
                    positions = new double[]{10.3250, 36.8775};
                    eta = 0;
                }
                default -> {
                    return ResponseEntity.badRequest().body("Invalid step. Use 1, 2, 3, or 4");
                }
            }

            // Update driver location
            OrderTrackingDTO.LocationDTO location = new OrderTrackingDTO.LocationDTO(positions[0], positions[1]);

            DriverLocationDTO driver = new DriverLocationDTO();
            driver.setDriverId("driver1");
            driver.setStatus("DELIVERING");
            driver.setSpeed(35.0); // Tunis traffic speed
            driver.setHeading(45);
            driver.setAccuracy(10.0);
            driver.setCurrentOrderId("DEMO-ORDER-001");
            driver.setCoordinates(new DriverLocationDTO.Coordinates(positions[0], positions[1]));

            driverLocationService.updateDriverLocation(driver);

            log.info("Driver moved to [{}, {}], ETA: {} minutes", positions[0], positions[1], eta);
            return ResponseEntity.ok("Step " + step + " completed. Driver at [" + positions[0] + ", " + positions[1] + "]");

        } catch (Exception e) {
            log.error("Error simulating progress: {}", e.getMessage(), e);
            return ResponseEntity.internalServerError().body("Error: " + e.getMessage());
        }
    }

    /**
     * Complete the delivery
     */
    @PostMapping("/complete-delivery")
    @Operation(summary = "Complete demo delivery", description = "Mark order as delivered")
    public ResponseEntity<String> completeDemoDelivery() {
        try {
            log.info("=== Completing Demo Delivery ===");

            // Mark as delivered
            orderTrackingService.markOrderAsDelivered("DEMO-ORDER-001");

            // Update driver status
            DriverLocationDTO driver = new DriverLocationDTO();
            
            DriverLocationDTO.Coordinates location = new DriverLocationDTO.Coordinates(7.2800, 43.6950);

            driver.setDriverId("driver1");
            driver.setStatus("AVAILABLE");
            driver.setSpeed(0.0);
            driver.setHeading(0);
            driver.setAccuracy(10.0);
            driver.setCurrentOrderId(null);
            driver.setCoordinates(location);

            driverLocationService.updateDriverLocation(driver);

            log.info("=== Demo Delivery Completed Successfully ===");
            return ResponseEntity.ok("Delivery completed! Driver is now available.");

        } catch (Exception e) {
            log.error("Error completing delivery: {}", e.getMessage(), e);
            return ResponseEntity.internalServerError().body("Error: " + e.getMessage());
        }
    }
}
