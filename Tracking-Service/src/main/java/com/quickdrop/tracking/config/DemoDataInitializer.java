package com.quickdrop.tracking.config;

import com.quickdrop.tracking.dto.DriverLocationDTO;
import com.quickdrop.tracking.dto.OrderTrackingDTO;
import com.quickdrop.tracking.services.DriverLocationService;
import com.quickdrop.tracking.services.OrderTrackingService;
import com.quickdrop.tracking.dto.OrderTrackingResponseDTO;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

/**
 * Initializes demo data for testing the tracking service.
 * Creates sample drivers and orders with static locations.
 * 
 * NOTE: This component is disabled to prevent auto-creation of test data.
 * Data is now loaded directly from existing MongoDB collections.
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class DemoDataInitializer implements CommandLineRunner {

    private final DriverLocationService driverLocationService;
    private final OrderTrackingService orderTrackingService;

    @Override
    public void run(String... args) {
        // DISABLED: No longer creating demo data automatically
        // Data will be loaded from existing MongoDB documents
        log.info("DemoDataInitializer is DISABLED. Using existing MongoDB data.");
        // log.info("=== Initializing Demo Data for Tracking Service ===");

        // try {
        //     // Create 3 demo drivers with known locations in Tunis, Tunisia
        //     createDemoDrivers();

        //     // Create a demo order
        //     createDemoOrder();

        //     log.info("=== Demo Data Initialization Complete ===");
        // } catch (Exception e) {
        //     log.error("Error initializing demo data: {}", e.getMessage(), e);
        // }
    }

    private void createDemoDrivers() {
        log.info("Creating demo drivers...");

        // Driver 1 - Available in Tunis Centre
        DriverLocationDTO driver1 = new DriverLocationDTO();
        driver1.setDriverId("driver1");
        driver1.setStatus("AVAILABLE");
        driver1.setSpeed(0.0);
        driver1.setHeading(0);
        driver1.setAccuracy(10.0);
        driver1.setCurrentOrderId(null);
        // Tunis coordinates: Longitude 10.1815, Latitude 36.8065
        driver1.setCoordinates(new DriverLocationDTO.Coordinates(10.1815, 36.8065));

        driverLocationService.updateDriverLocation(driver1);
        log.info("Created driver1 at Tunis Centre (10.1815, 36.8065)");

        // Driver 2 - Available near La Marsa
        DriverLocationDTO driver2 = new DriverLocationDTO();
        driver2.setDriverId("driver2");
        driver2.setStatus("AVAILABLE");
        driver2.setSpeed(0.0);
        driver2.setHeading(0);
        driver2.setAccuracy(10.0);
        driver2.setCurrentOrderId(null);
        // La Marsa coordinates
        driver2.setCoordinates(new DriverLocationDTO.Coordinates(10.3250, 36.8775));

        driverLocationService.updateDriverLocation(driver2);
        log.info("Created driver2 near La Marsa (10.3250, 36.8775)");

        // Driver 3 - Available near Manar
        DriverLocationDTO driver3 = new DriverLocationDTO();
        driver3.setDriverId("driver3");
        driver3.setStatus("AVAILABLE");
        driver3.setSpeed(0.0);
        driver3.setHeading(0);
        driver3.setAccuracy(10.0);
        driver3.setCurrentOrderId(null);
        // Manar coordinates
        driver3.setCoordinates(new DriverLocationDTO.Coordinates(10.1950, 36.8400));

        driverLocationService.updateDriverLocation(driver3);
        log.info("Created driver3 near Manar (10.1950, 36.8400)");
    }

    private void createDemoOrder() {
        log.info("Creating demo order...");

        OrderTrackingDTO order = new OrderTrackingDTO();
        order.setOrderId("DEMO-ORDER-001");
        order.setDriverId("driver1");
        order.setCustomerId("customer1");

        // Restaurant location in Tunis (e.g., Avenue Habib Bourguiba)
        OrderTrackingDTO.LocationDTO restaurantLocation = new OrderTrackingDTO.LocationDTO(10.1815, 36.8065);
        order.setRestaurantLocation(restaurantLocation);

        // Customer delivery address in La Marsa
        OrderTrackingDTO.LocationDTO customerLocation = new OrderTrackingDTO.LocationDTO(10.3250, 36.8775);
        order.setCustomerLocation(customerLocation);

        // Initial driver location (at restaurant)
        OrderTrackingDTO.LocationDTO driverLocation = new OrderTrackingDTO.LocationDTO(10.1815, 36.8065);
        order.setCurrentDriverLocation(driverLocation);

        order.setStatus("PENDING");
        order.setEstimatedArrivalMinutes(25);

        try {
            OrderTrackingResponseDTO created = orderTrackingService.createOrderTracking(order);
            log.info("Created demo order: {} - Status: {}", 
                created.getOrderId(), created.getStatus());
        } catch (Exception e) {
            log.warn("Demo order already exists or error creating: {}", e.getMessage());
        }
    }
}
